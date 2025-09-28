import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import TaskModel from "../models/task.model";

export const getSubtasks = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    const subtasks = await TaskModel.find({
      parentTask: taskId,
    })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ subtaskOrder: 1, createdAt: 1 });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: subtasks,
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch subtasks",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createSubtask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { title, description, priority, assignedTo, dueDate } = req.body;
    const userId = req.user?.id;

    // Get parent task to inherit workspace and project
    const parentTask = await TaskModel.findById(taskId);
    if (!parentTask) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Parent task not found",
      });
    }

    // Get the next subtask order
    const lastSubtask = await TaskModel.findOne({
      parentTask: taskId,
    }).sort({ subtaskOrder: -1 });

    const subtaskOrder = lastSubtask ? lastSubtask.subtaskOrder! + 1 : 1;

    const subtask = new TaskModel({
      title,
      description,
      project: parentTask.project,
      workspace: parentTask.workspace,
      priority,
      assignedTo: assignedTo || null,
      createdBy: userId,
      dueDate: dueDate || null,
      parentTask: taskId,
      subtaskOrder,
    });

    await subtask.save();

    // Update parent task subtask count
    await TaskModel.findByIdAndUpdate(taskId, {
      $inc: { subtaskCount: 1 },
    });

    // Recalculate parent task completion percentage
    await updateParentTaskProgress(taskId);

    await subtask.populate("assignedTo", "name email");
    await subtask.populate("createdBy", "name email");

    return res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: "Subtask created successfully",
      data: subtask,
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create subtask",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateSubtask = async (req: Request, res: Response) => {
  try {
    const { subtaskId } = req.params;
    const updateData = req.body;

    const subtask = await TaskModel.findById(subtaskId);
    if (!subtask) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Subtask not found",
      });
    }

    const oldStatus = subtask.status;
    const updatedSubtask = await TaskModel.findByIdAndUpdate(
      subtaskId,
      updateData,
      { new: true }
    )
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    // If status changed, update parent task progress
    if (updateData.status && updateData.status !== oldStatus && subtask.parentTask) {
      await updateParentTaskProgress(subtask.parentTask.toString());
    }

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Subtask updated successfully",
      data: updatedSubtask,
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update subtask",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteSubtask = async (req: Request, res: Response) => {
  try {
    const { subtaskId } = req.params;

    const subtask = await TaskModel.findById(subtaskId);
    if (!subtask) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Subtask not found",
      });
    }

    const parentTaskId = subtask.parentTask;

    await TaskModel.findByIdAndDelete(subtaskId);

    // Update parent task subtask count
    if (parentTaskId) {
      await TaskModel.findByIdAndUpdate(parentTaskId, {
        $inc: { subtaskCount: -1 },
      });

      // Recalculate parent task completion percentage
      await updateParentTaskProgress(parentTaskId.toString());
    }

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Subtask deleted successfully",
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete subtask",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const reorderSubtasks = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { subtaskIds } = req.body; // Array of subtask IDs in new order

    // Update subtask order
    const updatePromises = subtaskIds.map((subtaskId: string, index: number) =>
      TaskModel.findByIdAndUpdate(subtaskId, { subtaskOrder: index + 1 })
    );

    await Promise.all(updatePromises);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Subtasks reordered successfully",
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to reorder subtasks",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getTaskProgress = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Task not found",
      });
    }

    const subtasks = await TaskModel.find({ parentTask: taskId });
    const completedSubtasks = subtasks.filter(
      (subtask) => subtask.status === "DONE"
    ).length;

    const progress = {
      totalSubtasks: subtasks.length,
      completedSubtasks,
      completionPercentage: task.completionPercentage,
      taskStatus: task.status,
    };

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to get task progress",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Helper function to update parent task progress
async function updateParentTaskProgress(parentTaskId: string) {
  try {
    const subtasks = await TaskModel.find({ parentTask: parentTaskId });
    const completedSubtasks = subtasks.filter(
      (subtask) => subtask.status === "DONE"
    ).length;

    const completionPercentage = subtasks.length > 0 
      ? Math.round((completedSubtasks / subtasks.length) * 100)
      : 0;

    // Update parent task
    const updateData: any = { completionPercentage };

    // Auto-complete parent task if all subtasks are completed
    if (completionPercentage === 100 && subtasks.length > 0) {
      updateData.status = "DONE";
    }

    await TaskModel.findByIdAndUpdate(parentTaskId, updateData);
  } catch (error) {
    console.error("Error updating parent task progress:", error);
  }
}