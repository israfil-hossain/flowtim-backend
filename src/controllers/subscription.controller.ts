import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { getAuthenticatedUserId } from "../utils/auth-helpers";
import { createCheckoutSession, createBillingPortalSession } from "../config/stripe.config";
import {
  getUserSubscriptionService,
  getAllUserSubscriptionsService,
  createSubscriptionService,
  updateSubscriptionService,
  cancelSubscriptionService,
  reactivateSubscriptionService,
  getWorkspaceSubscriptionLimitsService,
  checkCanAddUsersService,
  checkCanAddProjectsService,
} from "../services/subscription.service";
import SubscriptionPlanModel from "../models/subscription-plan.model";
import { NotFoundException, BadRequestException } from "../utils/appError";

// Get user's current subscription for a workspace
export const getCurrentSubscriptionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    const { workspaceId } = req.params;

    const { subscription } = await getUserSubscriptionService(
      userId,
      workspaceId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Subscription retrieved successfully",
      subscription,
    });
  }
);

// Get all user subscriptions
export const getAllSubscriptionsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);

    const { subscriptions } = await getAllUserSubscriptionsService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Subscriptions retrieved successfully",
      subscriptions,
    });
  }
);

// Create subscription
export const createSubscriptionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    const { workspaceId, planId, billingCycle, isTrial } = req.body;

    const { subscription } = await createSubscriptionService({
      userId,
      workspaceId,
      planId,
      billingCycle: billingCycle || "monthly",
      isTrial: isTrial || false,
    });

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Subscription created successfully",
      subscription,
    });
  }
);

// Update subscription (upgrade/downgrade)
export const updateSubscriptionController = asyncHandler(
  async (req: Request, res: Response) => {
    const { subscriptionId } = req.params;
    const updates = req.body;

    const { subscription } = await updateSubscriptionService(
      subscriptionId,
      updates
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Subscription updated successfully",
      subscription,
    });
  }
);

// Cancel subscription
export const cancelSubscriptionController = asyncHandler(
  async (req: Request, res: Response) => {
    const { subscriptionId } = req.params;
    const { cancelAtPeriodEnd } = req.body;

    const result = await cancelSubscriptionService(
      subscriptionId,
      cancelAtPeriodEnd !== false
    );

    return res.status(HTTPSTATUS.OK).json(result);
  }
);

// Reactivate subscription
export const reactivateSubscriptionController = asyncHandler(
  async (req: Request, res: Response) => {
    const { subscriptionId } = req.params;

    const result = await reactivateSubscriptionService(subscriptionId);

    return res.status(HTTPSTATUS.OK).json(result);
  }
);

// Get workspace subscription limits
export const getWorkspaceLimitsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;

    const result = await getWorkspaceSubscriptionLimitsService(workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Workspace limits retrieved successfully",
      ...result,
    });
  }
);

// Check if can add users
export const checkCanAddUsersController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const { currentUserCount } = req.body;

    const result = await checkCanAddUsersService(
      workspaceId,
      currentUserCount || 0
    );

    return res.status(HTTPSTATUS.OK).json(result);
  }
);

// Check if can add projects
export const checkCanAddProjectsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const { currentProjectCount } = req.body;

    const result = await checkCanAddProjectsService(
      workspaceId,
      currentProjectCount || 0
    );

    return res.status(HTTPSTATUS.OK).json(result);
  }
);

// Create checkout session for subscription
export const createCheckoutSessionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    const { workspaceId, planId, billingCycle, successUrl, cancelUrl } = req.body;

    if (!workspaceId || !planId || !successUrl || !cancelUrl) {
      throw new BadRequestException("Missing required fields");
    }

    // Verify plan exists
    const plan = await SubscriptionPlanModel.findById(planId);
    if (!plan) {
      throw new NotFoundException("Subscription plan not found");
    }

    // Get user's existing subscription or create a new one to get Stripe customer ID
    let subscription = await getUserSubscriptionService(userId, workspaceId)
      .then(result => result.subscription)
      .catch(() => null);

    let stripeCustomerId = subscription?.stripeCustomerId;

    // If no existing subscription, create a temporary one to get customer ID
    if (!stripeCustomerId) {
      const tempSubscription = await createSubscriptionService({
        userId,
        workspaceId,
        planId,
        billingCycle: billingCycle || "monthly",
        isTrial: true,
      });
      stripeCustomerId = tempSubscription.subscription?.stripeCustomerId;
    }

    if (!stripeCustomerId) {
      throw new BadRequestException("Unable to create or find Stripe customer");
    }

    // Determine price ID based on billing cycle
    const priceId = billingCycle === "yearly"
      ? plan.stripePriceIdYearly
      : plan.stripePriceIdMonthly;

    if (!priceId) {
      throw new BadRequestException(`No Stripe price ID configured for ${billingCycle} billing`);
    }

    const session = await createCheckoutSession({
      customerId: stripeCustomerId,
      priceId,
      successUrl,
      cancelUrl,
      metadata: {
        userId,
        workspaceId,
        planId,
        billingCycle: billingCycle || "monthly",
      },
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Checkout session created successfully",
      sessionId: session.id,
      url: session.url,
    });
  }
);

// Create billing portal session
export const createBillingPortalSessionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    const { workspaceId, returnUrl } = req.body;

    if (!workspaceId || !returnUrl) {
      throw new BadRequestException("Missing required fields");
    }

    // Get user's subscription
    const { subscription } = await getUserSubscriptionService(userId, workspaceId);

    if (!subscription || !subscription.stripeCustomerId) {
      throw new NotFoundException("No active subscription found or Stripe customer not available");
    }

    const session = await createBillingPortalSession({
      customerId: subscription.stripeCustomerId,
      returnUrl,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Billing portal session created successfully",
      url: session.url,
    });
  }
);

// Get subscription usage statistics
export const getSubscriptionUsageController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;

    const result = await getWorkspaceSubscriptionLimitsService(workspaceId);

    // In a real implementation, you would calculate actual usage here
    // For now, we'll return mock data
    const actualUsage = {
      users: 3, // This would come from your workspace service
      projects: 2, // This would come from your project service
      storage: 1.2, // This would come from your storage service in GB
    };

    return res.status(HTTPSTATUS.OK).json({
      message: "Subscription usage retrieved successfully",
      limits: result.limits,
      usage: actualUsage,
      remaining: {
        users: Math.max(0, result.limits.maxUsers - actualUsage.users),
        projects: Math.max(0, result.limits.maxProjects - actualUsage.projects),
        storage: Math.max(0, result.limits.maxStorage - actualUsage.storage),
      },
      usagePercentage: {
        users: (actualUsage.users / result.limits.maxUsers) * 100,
        projects: (actualUsage.projects / result.limits.maxProjects) * 100,
        storage: (actualUsage.storage / result.limits.maxStorage) * 100,
      },
    });
  }
);
