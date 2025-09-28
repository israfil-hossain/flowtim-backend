import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import TaskModel from "../models/task.model";
import ProjectModel from "../models/project.model";
import MemberModel from "../models/member.model";
import { TaskStatusEnum } from "../enums/task.enum";

export const getWorkspaceAnalytics = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    // Basic metrics
    const [totalTasks, totalProjects, totalMembers, completedTasks] = await Promise.all([
      TaskModel.countDocuments({ workspace: workspaceId, ...dateFilter }),
      ProjectModel.countDocuments({ workspace: workspaceId, ...dateFilter }),
      MemberModel.countDocuments({ workspace: workspaceId }),
      TaskModel.countDocuments({
        workspace: workspaceId,
        status: TaskStatusEnum.DONE,
        ...dateFilter,
      }),
    ]);

    // Task status distribution
    const taskStatusDistribution = await TaskModel.aggregate([
      { $match: { workspace: workspaceId, ...dateFilter } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Task priority distribution
    const taskPriorityDistribution = await TaskModel.aggregate([
      { $match: { workspace: workspaceId, ...dateFilter } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    // Tasks created over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const tasksOverTime = await TaskModel.aggregate([
      {
        $match: {
          workspace: workspaceId,
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: {
        overview: {
          totalTasks,
          totalProjects,
          totalMembers,
          completedTasks,
          completionRate: Math.round(completionRate * 100) / 100,
        },
        taskStatusDistribution,
        taskPriorityDistribution,
        tasksOverTime,
      },
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch workspace analytics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getProductivityMetrics = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.updatedAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    // Average task completion time
    const completedTasks = await TaskModel.find({
      workspace: workspaceId,
      status: TaskStatusEnum.DONE,
      ...dateFilter,
    });

    const completionTimes = completedTasks.map(task => {
      const createdAt = new Date(task.createdAt);
      const updatedAt = new Date(task.updatedAt);
      return (updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24); // days
    });

    const avgCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
      : 0;

    // Tasks by assignee
    const tasksByAssignee = await TaskModel.aggregate([
      { $match: { workspace: workspaceId, assignedTo: { $ne: null }, ...dateFilter } },
      {
        $group: {
          _id: "$assignedTo",
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$status", TaskStatusEnum.DONE] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          userId: "$_id",
          userName: "$user.name",
          userEmail: "$user.email",
          totalTasks: 1,
          completedTasks: 1,
          completionRate: {
            $cond: [
              { $gt: ["$totalTasks", 0] },
              { $multiply: [{ $divide: ["$completedTasks", "$totalTasks"] }, 100] },
              0,
            ],
          },
        },
      },
    ]);

    // Overdue tasks
    const overdueTasks = await TaskModel.countDocuments({
      workspace: workspaceId,
      dueDate: { $lt: new Date() },
      status: { $ne: TaskStatusEnum.DONE },
    });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: {
        avgCompletionTime: Math.round(avgCompletionTime * 100) / 100,
        tasksByAssignee,
        overdueTasks,
        totalCompletedTasks: completedTasks.length,
      },
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch productivity metrics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getTeamPerformance = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;

    // Team member performance
    const teamPerformance = await MemberModel.aggregate([
      { $match: { workspace: workspaceId } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $lookup: {
          from: "tasks",
          let: { userId: "$user", workspaceId: "$workspace" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$assignedTo", "$$userId"] },
                    { $eq: ["$workspace", "$$workspaceId"] },
                  ],
                },
              },
            },
          ],
          as: "assignedTasks",
        },
      },
      {
        $lookup: {
          from: "tasks",
          let: { userId: "$user", workspaceId: "$workspace" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$assignedTo", "$$userId"] },
                    { $eq: ["$workspace", "$$workspaceId"] },
                    { $eq: ["$status", TaskStatusEnum.DONE] },
                  ],
                },
              },
            },
          ],
          as: "completedTasks",
        },
      },
      {
        $project: {
          userId: "$user",
          userName: "$userInfo.name",
          userEmail: "$userInfo.email",
          role: "$role",
          totalAssignedTasks: { $size: "$assignedTasks" },
          completedTasks: { $size: "$completedTasks" },
          completionRate: {
            $cond: [
              { $gt: [{ $size: "$assignedTasks" }, 0] },
              {
                $multiply: [
                  { $divide: [{ $size: "$completedTasks" }, { $size: "$assignedTasks" }] },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      { $sort: { completionRate: -1 } },
    ]);

    // Active vs inactive members (based on recent task activity)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeMembers = await TaskModel.distinct("assignedTo", {
      workspace: workspaceId,
      updatedAt: { $gte: thirtyDaysAgo },
      assignedTo: { $ne: null },
    });

    const totalMembers = await MemberModel.countDocuments({ workspace: workspaceId });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: {
        teamPerformance,
        activeMembers: activeMembers.length,
        totalMembers,
        activityRate: totalMembers > 0 ? (activeMembers.length / totalMembers) * 100 : 0,
      },
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch team performance",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getProjectInsights = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Project not found",
      });
    }

    // Project task statistics
    const [totalTasks, completedTasks, inProgressTasks, todoTasks] = await Promise.all([
      TaskModel.countDocuments({ project: projectId }),
      TaskModel.countDocuments({ project: projectId, status: TaskStatusEnum.DONE }),
      TaskModel.countDocuments({ project: projectId, status: TaskStatusEnum.IN_PROGRESS }),
      TaskModel.countDocuments({ project: projectId, status: TaskStatusEnum.TODO }),
    ]);

    // Task completion over time
    const taskCompletionOverTime = await TaskModel.aggregate([
      {
        $match: {
          project: projectId,
          status: TaskStatusEnum.DONE,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Project progress
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Estimated completion date (simple calculation based on current velocity)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const recentCompletions = await TaskModel.countDocuments({
      project: projectId,
      status: TaskStatusEnum.DONE,
      updatedAt: { $gte: last7Days },
    });

    const remainingTasks = totalTasks - completedTasks;
    const weeklyVelocity = recentCompletions;
    const estimatedWeeksToComplete = weeklyVelocity > 0 ? remainingTasks / weeklyVelocity : null;

    let estimatedCompletionDate = null;
    if (estimatedWeeksToComplete) {
      estimatedCompletionDate = new Date();
      estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + (estimatedWeeksToComplete * 7));
    }

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: {
        projectInfo: {
          id: project._id,
          name: project.name,
          description: project.description,
        },
        taskStatistics: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          todoTasks,
          progress: Math.round(progress * 100) / 100,
        },
        taskCompletionOverTime,
        velocity: {
          weeklyVelocity,
          estimatedWeeksToComplete,
          estimatedCompletionDate,
        },
      },
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch project insights",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};