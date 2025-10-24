import { Request, Response, NextFunction } from "express";
import { ForbiddenException, UnauthorizedException, BadRequestException, NotFoundException } from "../utils/appError";
import User, { UserDocument } from "../models/user.model";
import RolePermission from "../models/role-permission.model";

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: any; // Use any to avoid type conflicts with Express's built-in types
}

/**
 * Middleware to check if user has specific permission
 */
export const requirePermission = (permissionPath: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedException("Authentication required");
      }

      const hasPermission = await req.user.hasPermission(permissionPath);
      if (!hasPermission) {
        throw new ForbiddenException(`Insufficient permissions: ${permissionPath} required`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user can access specific feature action
 */
export const requireAccess = (feature: string, action: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedException("Authentication required");
      }

      const canAccess = await req.user.canAccess(feature, action);
      if (!canAccess) {
        throw new ForbiddenException(`Insufficient permissions: Cannot ${action} ${feature}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has minimum role level
 */
export const requireMinimumRoleLevel = (maxLevel: number) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedException("Authentication required");
      }

      const userRoleLevel = await req.user.getRoleLevel();
      if (userRoleLevel > maxLevel) {
        throw new ForbiddenException(`Insufficient permissions: Role level too high (required: ${maxLevel}, user: ${userRoleLevel})`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user is admin (legacy support)
 */
export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedException("Authentication required");
    }

    // Check both legacy isAdmin flag and role permissions
    const hasAdminPermission = await req.user.hasPermission('admin.dashboard');
    if (!req.user.isAdmin && !hasAdminPermission) {
      throw new ForbiddenException("Admin access required");
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user is super admin
 */
export const requireSuperAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedException("Authentication required");
    }

    const userRoleLevel = await req.user.getRoleLevel();
    if (userRoleLevel > 0) {
      throw new ForbiddenException("Super admin access required");
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user can access admin panel
 */
export const requireAdminPanel = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedException("Authentication required");
    }

    // Check if user has any admin permissions
    const hasAdminPermissions = await req.user.hasPermission('admin.dashboard') ||
                                 await req.user.hasPermission('admin.users.read') ||
                                 await req.user.hasPermission('admin.workspaces.read') ||
                                 await req.user.hasPermission('admin.billing.read');

    if (!hasAdminPermissions && !req.user.isAdmin) {
      throw new ForbiddenException("Admin panel access required");
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user is workspace owner or admin
 */
export const requireWorkspaceOwnerOrAdmin = (workspaceId?: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedException("Authentication required");
      }

      const targetWorkspaceId = workspaceId || req.params.workspaceId || req.body.workspaceId;

      if (!targetWorkspaceId) {
        throw new BadRequestException("Workspace ID is required");
      }

      // Check if user has workspace admin permissions
      const hasWorkspaceAdminPermission = await req.user.hasPermission('workspace.manageMembers') ||
                                           await req.user.hasPermission('workspace.delete');

      if (hasWorkspaceAdminPermission) {
        return next();
      }

      // Otherwise, check specific workspace ownership (implementation depends on your workspace model)
      // This is a simplified version - you might need to query your workspace membership model
      const Member = require('../models/member.model').default;
      const membership = await Member.findOne({
        workspaceId: targetWorkspaceId,
        userId: req.user._id,
        role: { $in: ['owner', 'admin'] }
      });

      if (!membership) {
        throw new ForbiddenException("Workspace owner or admin access required");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user is project owner or workspace admin
 */
export const requireProjectOwnerOrWorkspaceAdmin = () => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedException("Authentication required");
      }

      const projectId = req.params.projectId || req.body.projectId;
      const workspaceId = req.params.workspaceId || req.body.workspaceId;

      if (!projectId || !workspaceId) {
        throw new BadRequestException("Project ID and workspace ID are required");
      }

      // Check if user has project admin permissions
      const hasProjectAdminPermission = await req.user.hasPermission('project.manageMembers') ||
                                      await req.user.hasPermission('project.delete');

      const hasWorkspaceAdminPermission = await req.user.hasPermission('workspace.manageMembers') ||
                                           await req.user.hasPermission('workspace.delete');

      if (hasProjectAdminPermission || hasWorkspaceAdminPermission) {
        return next();
      }

      // Otherwise, check specific project ownership
      const Project = require('../models/project.model').default;
      const project = await Project.findById(projectId);

      if (!project) {
        throw new NotFoundException("Project not found");
      }

      if (project.owner.toString() === req.user._id.toString()) {
        return next();
      }

      // Check if user is workspace admin
      const Member = require('../models/member.model').default;
      const membership = await Member.findOne({
        workspaceId: project.workspace,
        userId: req.user._id,
        role: { $in: ['owner', 'admin'] }
      });

      if (!membership) {
        throw new ForbiddenException("Project owner or workspace admin access required");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user can manage subscriptions
 */
export const requireSubscriptionManagement = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedException("Authentication required");
    }

    const hasSubscriptionPermission = await req.user.hasPermission('subscription.manageBilling') ||
                                       await req.user.hasPermission('subscription.upgrade') ||
                                       await req.user.hasPermission('subscription.downgrade') ||
                                       await req.user.hasPermission('subscription.cancel');

    if (!hasSubscriptionPermission) {
      throw new ForbiddenException("Subscription management access required");
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user can access discount management
 */
export const requireDiscountManagement = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedException("Authentication required");
    }

    const hasDiscountPermission = await req.user.hasPermission('admin.billing.discounts');

    if (!hasDiscountPermission) {
      throw new ForbiddenException("Discount management access required");
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user can access referral system
 */
export const requireReferralAccess = (action: 'view' | 'create' | 'manage' = 'view') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedException("Authentication required");
      }

      let hasPermission = false;

      switch (action) {
        case 'view':
          hasPermission = await req.user.hasPermission('referral.view');
          break;
        case 'create':
          hasPermission = await req.user.hasPermission('referral.create');
          break;
        case 'manage':
          hasPermission = await req.user.hasPermission('referral.manage');
          break;
      }

      if (!hasPermission) {
        throw new ForbiddenException(`Referral ${action} access required`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user can access file management
 */
export const requireFileAccess = (action: 'upload' | 'download' | 'delete' | 'manage') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedException("Authentication required");
      }

      let hasPermission = false;

      switch (action) {
        case 'upload':
          hasPermission = await req.user.hasPermission('file.upload');
          break;
        case 'download':
          hasPermission = await req.user.hasPermission('file.download');
          break;
        case 'delete':
          hasPermission = await req.user.hasPermission('file.delete');
          break;
        case 'manage':
          hasPermission = await req.user.hasPermission('file.manageStorage');
          break;
      }

      if (!hasPermission) {
        throw new ForbiddenException(`File ${action} access required`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user can access analytics
 */
export const requireAnalyticsAccess = (level: 'read' | 'export' | 'configure' = 'read') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedException("Authentication required");
      }

      let hasPermission = false;

      switch (level) {
        case 'read':
          hasPermission = await req.user.hasPermission('admin.analytics.read') ||
                       await req.user.hasPermission('workspace.viewAnalytics') ||
                       await req.user.hasPermission('project.viewAnalytics');
          break;
        case 'export':
          hasPermission = await req.user.hasPermission('admin.analytics.export');
          break;
        case 'configure':
          hasPermission = await req.user.hasPermission('admin.analytics.configureReports');
          break;
      }

      if (!hasPermission) {
        throw new ForbiddenException(`Analytics ${level} access required`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Custom permission checker middleware factory
 */
export const requireCustomPermission = (permissionChecker: (user: UserDocument) => Promise<boolean>) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedException("Authentication required");
      }

      const hasPermission = await permissionChecker(req.user);
      if (!hasPermission) {
        throw new ForbiddenException("Insufficient permissions for this action");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to add user permissions to response headers (for debugging)
 */
export const addPermissionsToHeaders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user) {
      const userRoleLevel = await req.user.getRoleLevel();
      res.setHeader('X-User-Role-Level', userRoleLevel.toString());

      // Add specific permission headers if needed
      const hasAdminAccess = await req.user.hasPermission('admin.dashboard');
      res.setHeader('X-User-Is-Admin', hasAdminAccess.toString());
    }

    next();
  } catch (error) {
    // Don't block the request if permission checking fails
    next();
  }
};

export default {
  requirePermission,
  requireAccess,
  requireMinimumRoleLevel,
  requireAdmin,
  requireSuperAdmin,
  requireAdminPanel,
  requireWorkspaceOwnerOrAdmin,
  requireProjectOwnerOrWorkspaceAdmin,
  requireSubscriptionManagement,
  requireDiscountManagement,
  requireReferralAccess,
  requireFileAccess,
  requireAnalyticsAccess,
  requireCustomPermission,
  addPermissionsToHeaders
};