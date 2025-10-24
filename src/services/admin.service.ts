import UserModel from "../models/user.model";
import WorkspaceModel from "../models/workspace.model";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import MemberModel from "../models/member.model";
import { NotFoundException, BadRequestException } from "../utils/appError";
import mongoose from "mongoose";

// Get all users with pagination and search
export const getAllUsersService = async (
  page: number = 1,
  limit: number = 10,
  search: string = ""
) => {
  const skip = (page - 1) * limit;

  const searchQuery = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    UserModel.find(searchQuery)
      .select("_id name email isActive isAdmin createdAt lastLogin")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    UserModel.countDocuments(searchQuery),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get all workspaces with pagination and search
export const getAllWorkspacesService = async (
  page: number = 1,
  limit: number = 10,
  search: string = ""
) => {
  const skip = (page - 1) * limit;

  const searchQuery = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const [workspaces, total] = await Promise.all([
    WorkspaceModel.find(searchQuery)
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    WorkspaceModel.countDocuments(searchQuery),
  ]);

  // Get member count for each workspace
  const workspacesWithMemberCount = await Promise.all(
    workspaces.map(async (workspace) => {
      const memberCount = await MemberModel.countDocuments({
        workspaceId: workspace._id,
      });
      return {
        ...workspace,
        memberCount,
      };
    })
  );

  return {
    workspaces: workspacesWithMemberCount,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get platform-wide analytics
export const getAnalyticsService = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers,
    activeUsers,
    newUsers,
    totalWorkspaces,
    activeWorkspaces,
    totalProjects,
    totalTasks,
  ] = await Promise.all([
    UserModel.countDocuments(),
    UserModel.countDocuments({ isActive: true }),
    UserModel.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    WorkspaceModel.countDocuments(),
    WorkspaceModel.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    ProjectModel.countDocuments(),
    TaskModel.countDocuments(),
  ]);

  // System health metrics
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      new: newUsers,
    },
    workspaces: {
      total: totalWorkspaces,
      active: activeWorkspaces,
    },
    projects: {
      total: totalProjects,
    },
    tasks: {
      total: totalTasks,
    },
    system: {
      uptime: uptime,
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      },
      nodeVersion: process.version,
    },
  };
};

// Get system settings (placeholder - you can customize this)
export const getSystemSettingsService = async () => {
  return {
    maintenance: {
      enabled: false,
      message: "",
    },
    registration: {
      enabled: true,
      requireEmailVerification: false,
    },
    features: {
      workspaces: true,
      projects: true,
      tasks: true,
      chat: true,
      documents: true,
    },
  };
};

// Update system settings (placeholder - you can customize this)
export const updateSystemSettingsService = async (settings: any) => {
  // In a real implementation, you'd store these settings in a database
  // For now, we'll just return the settings that were passed in
  return settings;
};

// Get billing overview (placeholder - you can customize this)
export const getBillingOverviewService = async () => {
  return {
    totalRevenue: 0,
    activeSubscriptions: 0,
    trialUsers: 0,
    churnRate: 0,
    plans: [],
  };
};

// Update user (activate/deactivate, toggle admin)
export const updateUserService = async (
  userId: string,
  updates: { isActive?: boolean; isAdmin?: boolean }
) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new BadRequestException("Invalid user ID");
  }

  const user = await UserModel.findById(userId);

  if (!user) {
    throw new NotFoundException("User not found");
  }

  if (updates.isActive !== undefined) {
    user.isActive = updates.isActive;
  }

  if (updates.isAdmin !== undefined) {
    user.isAdmin = updates.isAdmin;
  }

  await user.save();

  return {
    user: user.omitPassword(),
  };
};

// Delete/deactivate user
export const deleteUserService = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new BadRequestException("Invalid user ID");
  }

  const user = await UserModel.findById(userId);

  if (!user) {
    throw new NotFoundException("User not found");
  }

  // Soft delete by deactivating
  user.isActive = false;
  await user.save();

  return {
    message: "User deactivated successfully",
  };
};

// Update workspace
export const updateWorkspaceService = async (
  workspaceId: string,
  updates: { name?: string; description?: string }
) => {
  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    throw new BadRequestException("Invalid workspace ID");
  }

  const workspace = await WorkspaceModel.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  if (updates.name) {
    workspace.name = updates.name;
  }

  if (updates.description !== undefined) {
    workspace.description = updates.description;
  }

  await workspace.save();

  return {
    workspace,
  };
};

// Delete workspace
export const deleteWorkspaceService = async (workspaceId: string) => {
  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    throw new BadRequestException("Invalid workspace ID");
  }

  const workspace = await WorkspaceModel.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  // Delete all related data
  await Promise.all([
    MemberModel.deleteMany({ workspaceId }),
    ProjectModel.deleteMany({ workspace: workspaceId }),
    TaskModel.deleteMany({ workspace: workspaceId }),
    WorkspaceModel.findByIdAndDelete(workspaceId),
  ]);

  return {
    message: "Workspace and all related data deleted successfully",
  };
};
