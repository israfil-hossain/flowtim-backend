import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import {
  getAllUsersService,
  getAllWorkspacesService,
  getAnalyticsService,
  getSystemSettingsService,
  updateSystemSettingsService,
  getBillingOverviewService,
  updateUserService,
  deleteUserService,
  updateWorkspaceService,
  deleteWorkspaceService,
} from "../services/admin.service";
import { getAuthenticatedUserId } from "../utils/auth-helpers";
import { logAdminAction } from "../utils/audit-logger";

// Get all users
export const getAllUsersController = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const result = await getAllUsersService(page, limit, search);

    return res.status(HTTPSTATUS.OK).json({
      message: "Users fetched successfully",
      ...result,
    });
  }
);

// Get all workspaces
export const getAllWorkspacesController = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const result = await getAllWorkspacesService(page, limit, search);

    return res.status(HTTPSTATUS.OK).json({
      message: "Workspaces fetched successfully",
      ...result,
    });
  }
);

// Get analytics
export const getAnalyticsController = asyncHandler(
  async (req: Request, res: Response) => {
    const analytics = await getAnalyticsService();

    return res.status(HTTPSTATUS.OK).json({
      message: "Analytics fetched successfully",
      analytics,
    });
  }
);

// Get system settings
export const getSystemSettingsController = asyncHandler(
  async (req: Request, res: Response) => {
    const settings = await getSystemSettingsService();

    return res.status(HTTPSTATUS.OK).json({
      message: "Settings fetched successfully",
      settings,
    });
  }
);

// Update system settings
export const updateSystemSettingsController = asyncHandler(
  async (req: Request, res: Response) => {
    const adminUserId = getAuthenticatedUserId(req);
    const settings = await updateSystemSettingsService(req.body);

    // Log admin action
    await logAdminAction({
      userId: adminUserId,
      action: "SETTINGS_UPDATE",
      resourceType: "settings",
      details: { updates: req.body },
      req,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Settings updated successfully",
      settings,
    });
  }
);

// Get billing overview
export const getBillingOverviewController = asyncHandler(
  async (req: Request, res: Response) => {
    const billing = await getBillingOverviewService();

    return res.status(HTTPSTATUS.OK).json({
      message: "Billing data fetched successfully",
      billing,
    });
  }
);

// Update user
export const updateUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { isActive, isAdmin } = req.body;
    const adminUserId = getAuthenticatedUserId(req);

    const result = await updateUserService(userId, { isActive, isAdmin });

    // Log admin action
    await logAdminAction({
      userId: adminUserId,
      action: "USER_UPDATE",
      resourceType: "user",
      resourceId: userId,
      details: { isActive, isAdmin },
      req,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "User updated successfully",
      ...result,
    });
  }
);

// Delete user
export const deleteUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const adminUserId = getAuthenticatedUserId(req);

    const result = await deleteUserService(userId);

    // Log admin action
    await logAdminAction({
      userId: adminUserId,
      action: "USER_DELETE",
      resourceType: "user",
      resourceId: userId,
      req,
    });

    return res.status(HTTPSTATUS.OK).json(result);
  }
);

// Update workspace
export const updateWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const { name, description } = req.body;
    const adminUserId = getAuthenticatedUserId(req);

    const result = await updateWorkspaceService(workspaceId, {
      name,
      description,
    });

    // Log admin action
    await logAdminAction({
      userId: adminUserId,
      action: "WORKSPACE_UPDATE",
      resourceType: "workspace",
      resourceId: workspaceId,
      details: { name, description },
      req,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Workspace updated successfully",
      ...result,
    });
  }
);

// Delete workspace
export const deleteWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const adminUserId = getAuthenticatedUserId(req);

    const result = await deleteWorkspaceService(workspaceId);

    // Log admin action
    await logAdminAction({
      userId: adminUserId,
      action: "WORKSPACE_DELETE",
      resourceType: "workspace",
      resourceId: workspaceId,
      req,
    });

    return res.status(HTTPSTATUS.OK).json(result);
  }
);
