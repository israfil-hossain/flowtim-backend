import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import TaskModel from "../models/task.model";
import TaskDependencyModel, { DependencyType } from "../models/task-dependency.model";

// Get tasks with timeline data for Gantt chart
export const getGanttData = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { projectId } = req.query;

    const filter: any = {
      workspace: workspaceId,
      parentTask: { $exists: false }, // Only get parent tasks for Gantt
    };

    if (projectId) {
      filter.project = projectId;
    }

    const tasks = await TaskModel.find(filter)
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email")
      .populate("project", "name")
      .sort({ createdAt: 1 });

    // Get dependencies for all tasks
    const taskIds = tasks.map(task => task._id);
    const dependencies = await TaskDependencyModel.find({
      taskId: { $in: taskIds }
    })
      .populate("taskId", "title")
      .populate("dependsOnTaskId", "title");

    // Calculate timeline data
    const ganttData = tasks.map(task => {
      const taskDependencies = dependencies.filter(
        dep => dep.taskId._id.toString() === (task._id as any).toString()
      );

      // Calculate start and end dates
      let startDate = task.createdAt;
      let endDate = task.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days from now

      // Calculate progress based on subtasks or status
      let progress = 0;
      if (task.status === "DONE") {
        progress = 100;
      } else if (task.status === "IN_PROGRESS") {
        progress = task.completionPercentage || 25;
      } else if (task.status === "IN_REVIEW") {
        progress = 75;
      }

      return {
        id: task._id,
        name: task.title,
        start: startDate,
        end: endDate,
        progress,
        dependencies: taskDependencies.map(dep => ({
          id: dep._id,
          dependsOn: dep.dependsOnTaskId._id,
          type: dep.dependencyType,
        })),
        assignedTo: task.assignedTo,
        priority: task.priority,
        status: task.status,
        project: task.project,
      };
    });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: {
        tasks: ganttData,
        dependencies,
      },
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch Gantt data",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update task timeline
export const updateTaskTimeline = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { startDate, endDate, progress } = req.body;

    const updateData: any = {};
    if (startDate) updateData.createdAt = new Date(startDate);
    if (endDate) updateData.dueDate = new Date(endDate);
    if (progress !== undefined) updateData.completionPercentage = progress;

    const task = await TaskModel.findByIdAndUpdate(
      taskId,
      updateData,
      { new: true }
    )
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email")
      .populate("project", "name");

    if (!task) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Task timeline updated successfully",
      data: { task },
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update task timeline",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get project timeline
export const getProjectTimeline = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const tasks = await TaskModel.find({
      project: projectId,
      parentTask: { $exists: false },
    })
      .populate("assignedTo", "name email avatar")
      .sort({ createdAt: 1 });

    if (tasks.length === 0) {
      return res.status(HTTPSTATUS.OK).json({
        success: true,
        data: {
          startDate: null,
          endDate: null,
          totalTasks: 0,
          completedTasks: 0,
          progress: 0,
        },
      });
    }

    // Calculate project timeline
    const startDate = new Date(Math.min(...tasks.map(t => new Date(t.createdAt).getTime())));
    const endDates = tasks.filter(t => t.dueDate).map(t => new Date(t.dueDate!).getTime());
    const endDate = endDates.length > 0 ? new Date(Math.max(...endDates)) : null;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "DONE").length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: {
        startDate,
        endDate,
        totalTasks,
        completedTasks,
        progress,
        tasks: tasks.map(task => ({
          id: task._id,
          title: task.title,
          status: task.status,
          assignedTo: task.assignedTo,
          dueDate: task.dueDate,
          completionPercentage: task.completionPercentage,
        })),
      },
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch project timeline",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Add task dependency
export const addTaskDependency = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { dependsOnTaskId, dependencyType = DependencyType.FINISH_TO_START } = req.body;
    const userId = req.user?.id;

    // Verify both tasks exist
    const [task, dependsOnTask] = await Promise.all([
      TaskModel.findById(taskId),
      TaskModel.findById(dependsOnTaskId),
    ]);

    if (!task || !dependsOnTask) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "One or both tasks not found",
      });
    }

    // Check for circular dependency
    const existingDependency = await TaskDependencyModel.findOne({
      taskId: dependsOnTaskId,
      dependsOnTaskId: taskId,
    });

    if (existingDependency) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Circular dependency detected",
      });
    }

    // Create dependency
    const dependency = new TaskDependencyModel({
      taskId,
      dependsOnTaskId,
      dependencyType,
      workspaceId: task.workspace,
      createdBy: userId,
    });

    await dependency.save();
    await dependency.populate([
      { path: "taskId", select: "title" },
      { path: "dependsOnTaskId", select: "title" },
    ]);

    return res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: "Task dependency added successfully",
      data: { dependency },
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to add task dependency",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Remove task dependency
export const removeTaskDependency = async (req: Request, res: Response) => {
  try {
    const { dependencyId } = req.params;

    const dependency = await TaskDependencyModel.findByIdAndDelete(dependencyId);

    if (!dependency) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Dependency not found",
      });
    }

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Task dependency removed successfully",
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to remove task dependency",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};