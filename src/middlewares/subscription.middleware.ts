import { Request, Response, NextFunction } from "express";
import { ForbiddenException, BadRequestException } from "../utils/appError";
import SubscriptionModel from "../models/subscription.model";
import SubscriptionPlanModel from "../models/subscription-plan.model";
import MemberModel from "../models/member.model";
import ProjectModel from "../models/project.model";
import mongoose from "mongoose";
import { getWorkspaceSubscriptionLimitsService } from "../services/subscription.service";

interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * Middleware to check if workspace has an active subscription
 */
export const requireActiveSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;

    if (!workspaceId) {
      throw new BadRequestException("Workspace ID is required");
    }

    const subscription = await SubscriptionModel.findOne({
      workspaceId: workspaceId,
      status: { $in: ["active", "trial"] },
    });

    if (!subscription) {
      throw new ForbiddenException(
        "No active subscription found for this workspace"
      );
    }

    // Check if trial has expired
    if (subscription.status === "trial" && subscription.trialEnd) {
      if (new Date() > subscription.trialEnd) {
        subscription.status = "expired";
        await subscription.save();
        throw new ForbiddenException("Trial period has expired");
      }
    }

    // Attach subscription to request for use in controllers
    (req as any).subscription = subscription;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if workspace can add more users
 */
export const checkUserLimit = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;

    if (!workspaceId) {
      throw new BadRequestException("Workspace ID is required");
    }

    const subscription = await SubscriptionModel.findOne({
      workspaceId: workspaceId,
      status: { $in: ["active", "trial"] },
    }).populate("planId");

    if (!subscription) {
      throw new ForbiddenException(
        "No active subscription found for this workspace"
      );
    }

    const plan = subscription.planId as any;
    const currentUserCount = await MemberModel.countDocuments({
      workspaceId: workspaceId,
    });

    if (currentUserCount >= plan.maxUsers) {
      throw new ForbiddenException(
        `User limit reached. Your current plan allows ${plan.maxUsers} users. Please upgrade to add more users.`
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if workspace can add more projects
 */
export const checkProjectLimit = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspace;

    if (!workspaceId) {
      throw new BadRequestException("Workspace ID is required");
    }

    const subscription = await SubscriptionModel.findOne({
      workspaceId: workspaceId,
      status: { $in: ["active", "trial"] },
    }).populate("planId");

    if (!subscription) {
      throw new ForbiddenException(
        "No active subscription found for this workspace"
      );
    }

    const plan = subscription.planId as any;

    // Unlimited projects check
    if (plan.maxProjects === -1) {
      return next();
    }

    const currentProjectCount = await ProjectModel.countDocuments({
      workspaceId: workspaceId,
    });

    if (currentProjectCount >= plan.maxProjects) {
      throw new ForbiddenException(
        `Project limit reached. Your current plan allows ${plan.maxProjects} projects. Please upgrade to add more projects.`
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if workspace can access premium features
 */
export const requirePremiumFeatures = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;

    if (!workspaceId) {
      throw new BadRequestException("Workspace ID is required");
    }

    const subscription = await SubscriptionModel.findOne({
      workspaceId: workspaceId,
      status: { $in: ["active", "trial"] },
    }).populate("planId");

    if (!subscription) {
      throw new ForbiddenException(
        "No active subscription found for this workspace"
      );
    }

    const plan = subscription.planId as any;

    if (plan.name === "Starter") {
      throw new ForbiddenException(
        "This feature requires a premium subscription. Please upgrade your plan."
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to get workspace subscription limits
 */
export const getWorkspaceLimits = async (workspaceId: string) => {
  const subscription = await SubscriptionModel.findOne({
    workspaceId: workspaceId,
    status: { $in: ["active", "trial"] },
  }).populate("planId");

  if (!subscription) {
    return null;
  }

  const plan = subscription.planId as any;

  return {
    maxUsers: plan.maxUsers,
    maxProjects: plan.maxProjects,
    maxStorage: plan.maxStorage,
    canAccessAdvancedFeatures: plan.name !== "Starter",
    planName: plan.name,
  };
};

// Middleware to check if subscription is not expired
export const checkSubscriptionNotExpired = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;

    if (!workspaceId) {
      throw new BadRequestException("Workspace ID is required");
    }

    const subscription = await SubscriptionModel.findOne({
      workspaceId,
      status: { $in: ["active", "trial"] },
    });

    if (!subscription) {
      throw new ForbiddenException("No active subscription found");
    }

    // Check if subscription has expired
    if (subscription.currentPeriodEnd && new Date() > subscription.currentPeriodEnd) {
      // Update status to expired
      subscription.status = "expired";
      await subscription.save();

      throw new ForbiddenException("Subscription has expired. Please renew to continue.");
    }

    // Check if trial has expired
    if (subscription.status === "trial" && subscription.trialEnd) {
      if (new Date() > subscription.trialEnd) {
        subscription.status = "expired";
        await subscription.save();

        throw new ForbiddenException("Trial period has expired. Please subscribe to continue.");
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check specific feature access based on subscription limits
export const requireFeatureAccess = (feature: "users" | "projects" | "storage" | "advanced") => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params.workspaceId || req.body.workspaceId;

      if (!workspaceId) {
        throw new BadRequestException("Workspace ID is required");
      }

      const { limits } = await getWorkspaceSubscriptionLimitsService(workspaceId);

      switch (feature) {
        case "advanced":
          if (!limits.canAccessAdvancedFeatures) {
            throw new ForbiddenException("This feature requires a premium subscription");
          }
          break;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to add subscription info to request object
export const attachSubscriptionInfo = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;

    if (workspaceId) {
      const { limits, subscription } = await getWorkspaceSubscriptionLimitsService(workspaceId);
      (req as any).workspaceLimits = limits;
      (req as any).subscription = subscription;
    }

    next();
  } catch (error) {
    // Don't throw error here, just continue without subscription info
    next();
  }
};

export default {
  requireActiveSubscription,
  checkUserLimit,
  checkProjectLimit,
  requirePremiumFeatures,
  getWorkspaceLimits,
  checkSubscriptionNotExpired,
  requireFeatureAccess,
  attachSubscriptionInfo,
};
