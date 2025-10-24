import SubscriptionModel from "../models/subscription.model";
import SubscriptionPlanModel from "../models/subscription-plan.model";
import PaymentModel from "../models/payment.model";
import WorkspaceModel from "../models/workspace.model";
import { NotFoundException, BadRequestException } from "../utils/appError";
import mongoose from "mongoose";

// Get user's active subscription for a workspace
export const getUserSubscriptionService = async (
  userId: string,
  workspaceId: string
) => {
  const subscription = await SubscriptionModel.findOne({
    userId,
    workspaceId,
    status: { $in: ["active", "trial"] },
  })
    .populate("planId", "name description monthlyPrice yearlyPrice features maxUsers maxProjects maxStorage")
    .lean();

  if (!subscription) {
    throw new NotFoundException("No active subscription found");
  }

  return { subscription };
};

// Get all user subscriptions
export const getAllUserSubscriptionsService = async (userId: string) => {
  const subscriptions = await SubscriptionModel.find({ userId })
    .populate("planId", "name description monthlyPrice yearlyPrice features")
    .populate("workspaceId", "name description")
    .sort({ createdAt: -1 })
    .lean();

  return { subscriptions };
};

// Create subscription (typically called after successful payment)
export const createSubscriptionService = async (data: {
  userId: string;
  workspaceId: string;
  planId: string;
  billingCycle: "monthly" | "yearly";
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  isTrial?: boolean;
}) => {
  const { userId, workspaceId, planId, billingCycle, stripeSubscriptionId, stripeCustomerId, isTrial } = data;

  // Verify plan exists
  const plan = await SubscriptionPlanModel.findById(planId);
  if (!plan) {
    throw new NotFoundException("Subscription plan not found");
  }

  // Verify workspace exists
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  // Check if active subscription already exists
  const existingSubscription = await SubscriptionModel.findOne({
    workspaceId,
    status: { $in: ["active", "trial"] },
  });

  if (existingSubscription) {
    throw new BadRequestException("Workspace already has an active subscription");
  }

  // Calculate period dates
  const now = new Date();
  const periodEnd = new Date();

  if (isTrial) {
    periodEnd.setDate(now.getDate() + 14); // 14-day trial
  } else {
    if (billingCycle === "monthly") {
      periodEnd.setMonth(now.getMonth() + 1);
    } else {
      periodEnd.setFullYear(now.getFullYear() + 1);
    }
  }

  const subscription = await SubscriptionModel.create({
    userId,
    workspaceId,
    planId,
    status: isTrial ? "trial" : "active",
    billingCycle,
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    trialStart: isTrial ? now : null,
    trialEnd: isTrial ? periodEnd : null,
    stripeSubscriptionId,
    stripeCustomerId,
  });

  const populatedSubscription = await SubscriptionModel.findById(subscription._id)
    .populate("planId")
    .populate("workspaceId", "name")
    .lean();

  return { subscription: populatedSubscription };
};

// Update subscription (upgrade/downgrade)
export const updateSubscriptionService = async (
  subscriptionId: string,
  updates: {
    planId?: string;
    billingCycle?: "monthly" | "yearly";
    status?: "active" | "cancelled" | "expired" | "trial" | "past_due";
  }
) => {
  const subscription = await SubscriptionModel.findById(subscriptionId);

  if (!subscription) {
    throw new NotFoundException("Subscription not found");
  }

  if (updates.planId) {
    const plan = await SubscriptionPlanModel.findById(updates.planId);
    if (!plan) {
      throw new NotFoundException("Subscription plan not found");
    }
    subscription.planId = new mongoose.Types.ObjectId(updates.planId);
  }

  if (updates.billingCycle) {
    subscription.billingCycle = updates.billingCycle;
  }

  if (updates.status) {
    subscription.status = updates.status;
  }

  await subscription.save();

  const updatedSubscription = await SubscriptionModel.findById(subscription._id)
    .populate("planId")
    .populate("workspaceId", "name")
    .lean();

  return { subscription: updatedSubscription };
};

// Cancel subscription
export const cancelSubscriptionService = async (
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
) => {
  const subscription = await SubscriptionModel.findById(subscriptionId);

  if (!subscription) {
    throw new NotFoundException("Subscription not found");
  }

  if (cancelAtPeriodEnd) {
    subscription.cancelAtPeriodEnd = true;
    subscription.cancelledAt = new Date();
  } else {
    subscription.status = "cancelled";
    subscription.cancelledAt = new Date();
  }

  await subscription.save();

  return {
    message: cancelAtPeriodEnd
      ? "Subscription will be cancelled at the end of the billing period"
      : "Subscription cancelled immediately",
    subscription,
  };
};

// Reactivate cancelled subscription
export const reactivateSubscriptionService = async (subscriptionId: string) => {
  const subscription = await SubscriptionModel.findById(subscriptionId);

  if (!subscription) {
    throw new NotFoundException("Subscription not found");
  }

  if (subscription.status !== "cancelled" && !subscription.cancelAtPeriodEnd) {
    throw new BadRequestException("Subscription is not cancelled");
  }

  subscription.cancelAtPeriodEnd = false;
  subscription.cancelledAt = undefined;
  subscription.status = "active";

  await subscription.save();

  return { message: "Subscription reactivated successfully", subscription };
};

// Get workspace subscription limits
export const getWorkspaceSubscriptionLimitsService = async (workspaceId: string) => {
  const subscription = await SubscriptionModel.findOne({
    workspaceId,
    status: { $in: ["active", "trial"] },
  }).populate("planId");

  if (!subscription) {
    // Return default/free tier limits
    return {
      limits: {
        maxUsers: 5,
        maxProjects: 3,
        maxStorage: 2,
        canAccessAdvancedFeatures: false,
      },
      subscription: null,
    };
  }

  const plan = subscription.planId as any;

  return {
    limits: {
      maxUsers: plan.maxUsers,
      maxProjects: plan.maxProjects,
      maxStorage: plan.maxStorage,
      canAccessAdvancedFeatures: plan.name !== "Starter",
    },
    subscription,
  };
};

// Check if workspace can add more users
export const checkCanAddUsersService = async (
  workspaceId: string,
  currentUserCount: number
) => {
  const { limits } = await getWorkspaceSubscriptionLimitsService(workspaceId);

  return {
    canAdd: currentUserCount < limits.maxUsers,
    currentCount: currentUserCount,
    maxAllowed: limits.maxUsers,
    remaining: Math.max(0, limits.maxUsers - currentUserCount),
  };
};

// Check if workspace can add more projects
export const checkCanAddProjectsService = async (
  workspaceId: string,
  currentProjectCount: number
) => {
  const { limits } = await getWorkspaceSubscriptionLimitsService(workspaceId);

  return {
    canAdd: currentProjectCount < limits.maxProjects,
    currentCount: currentProjectCount,
    maxAllowed: limits.maxProjects,
    remaining: Math.max(0, limits.maxProjects - currentProjectCount),
  };
};

// Check if workspace can access advanced features
export const checkCanAccessAdvancedFeaturesService = async (workspaceId: string) => {
  const { limits } = await getWorkspaceSubscriptionLimitsService(workspaceId);

  return {
    canAccess: limits.canAccessAdvancedFeatures,
    limits,
  };
};

// Get subscription by Stripe ID
export const getSubscriptionByStripeIdService = async (stripeSubscriptionId: string) => {
  const subscription = await SubscriptionModel.findOne({
    stripeSubscriptionId,
  })
    .populate("planId")
    .populate("workspaceId", "name")
    .populate("userId", "name email")
    .lean();

  if (!subscription) {
    throw new NotFoundException("Subscription not found");
  }

  return { subscription };
};

// Update subscription status from Stripe webhook
export const updateSubscriptionStatusFromStripeService = async (
  stripeSubscriptionId: string,
  status: "active" | "cancelled" | "expired" | "trial" | "past_due",
  periodStart?: Date,
  periodEnd?: Date,
  cancelAtPeriodEnd?: boolean
) => {
  const subscription = await SubscriptionModel.findOneAndUpdate(
    { stripeSubscriptionId },
    {
      status,
      ...(periodStart && { currentPeriodStart: periodStart }),
      ...(periodEnd && { currentPeriodEnd: periodEnd }),
      ...(cancelAtPeriodEnd !== undefined && { cancelAtPeriodEnd }),
      ...(status === "cancelled" && { cancelledAt: new Date() }),
    },
    { new: true }
  ).populate("planId");

  if (!subscription) {
    throw new NotFoundException("Subscription not found");
  }

  return { subscription };
};

// Handle subscription upgrade/downgrade
export const changeSubscriptionPlanService = async (
  subscriptionId: string,
  newPlanId: string,
  newBillingCycle?: "monthly" | "yearly"
) => {
  const subscription = await SubscriptionModel.findById(subscriptionId);
  if (!subscription) {
    throw new NotFoundException("Subscription not found");
  }

  const newPlan = await SubscriptionPlanModel.findById(newPlanId);
  if (!newPlan) {
    throw new NotFoundException("New subscription plan not found");
  }

  // Update the subscription
  subscription.planId = new mongoose.Types.ObjectId(newPlanId);
  if (newBillingCycle) {
    subscription.billingCycle = newBillingCycle;
  }

  await subscription.save();

  const updatedSubscription = await SubscriptionModel.findById(subscription._id)
    .populate("planId")
    .populate("workspaceId", "name")
    .lean();

  return { subscription: updatedSubscription };
};

// Get all subscriptions that need to be renewed
export const getSubscriptionsDueForRenewalService = async (daysAhead: number = 7) => {
  const renewalDate = new Date();
  renewalDate.setDate(renewalDate.getDate() + daysAhead);

  const subscriptions = await SubscriptionModel.find({
    status: { $in: ["active", "trial"] },
    currentPeriodEnd: { $lte: renewalDate },
    cancelAtPeriodEnd: false,
  })
    .populate("planId", "name billingCycle")
    .populate("workspaceId", "name")
    .populate("userId", "name email")
    .lean();

  return { subscriptions };
};

// Get all expired subscriptions
export const getExpiredSubscriptionsService = async () => {
  const now = new Date();

  const subscriptions = await SubscriptionModel.find({
    status: { $in: ["active", "trial"] },
    currentPeriodEnd: { $lt: now },
  })
    .populate("planId", "name billingCycle")
    .populate("workspaceId", "name")
    .populate("userId", "name email")
    .lean();

  return { subscriptions };
};

// Process expired subscriptions (typically called by a cron job)
export const processExpiredSubscriptionsService = async () => {
  const { subscriptions } = await getExpiredSubscriptionsService();

  const updatePromises = subscriptions.map(async (subscription) => {
    await SubscriptionModel.findByIdAndUpdate(subscription._id, {
      status: "expired",
    });

    // Create a payment record for the failed renewal if needed
    // This would typically be handled by Stripe webhooks
  });

  await Promise.all(updatePromises);

  return {
    message: `Processed ${subscriptions.length} expired subscriptions`,
    count: subscriptions.length,
  };
};
