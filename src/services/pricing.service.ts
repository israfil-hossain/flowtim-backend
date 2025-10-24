import SubscriptionPlanModel from "../models/subscription-plan.model";
import SubscriptionModel from "../models/subscription.model";
import PaymentModel from "../models/payment.model";
import { NotFoundException } from "../utils/appError";

// Get all active pricing plans
export const getAllPricingPlansService = async () => {
  const plans = await SubscriptionPlanModel.find({ isActive: true })
    .sort({ priority: 1 })
    .lean();

  return { plans };
};

// Get single pricing plan by ID
export const getPricingPlanByIdService = async (planId: string) => {
  const plan = await SubscriptionPlanModel.findById(planId).lean();

  if (!plan) {
    throw new NotFoundException("Pricing plan not found");
  }

  return { plan };
};

// Get plan by name
export const getPricingPlanByNameService = async (name: string) => {
  const plan = await SubscriptionPlanModel.findOne({ name, isActive: true }).lean();

  if (!plan) {
    throw new NotFoundException("Pricing plan not found");
  }

  return { plan };
};

// Create pricing plan (Admin only)
export const createPricingPlanService = async (planData: {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  limitations: string[];
  maxUsers: number;
  maxProjects: number;
  maxStorage: number;
  isPopular?: boolean;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
}) => {
  const plan = await SubscriptionPlanModel.create(planData);

  return { plan };
};

// Update pricing plan (Admin only)
export const updatePricingPlanService = async (
  planId: string,
  updates: Partial<{
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
    limitations: string[];
    maxUsers: number;
    maxProjects: number;
    maxStorage: number;
    isPopular: boolean;
    isActive: boolean;
    stripePriceIdMonthly: string;
    stripePriceIdYearly: string;
  }>
) => {
  const plan = await SubscriptionPlanModel.findByIdAndUpdate(
    planId,
    { $set: updates },
    { new: true }
  );

  if (!plan) {
    throw new NotFoundException("Pricing plan not found");
  }

  return { plan };
};

// Delete pricing plan (Admin only - soft delete by setting isActive: false)
export const deletePricingPlanService = async (planId: string) => {
  const plan = await SubscriptionPlanModel.findByIdAndUpdate(
    planId,
    { isActive: false },
    { new: true }
  );

  if (!plan) {
    throw new NotFoundException("Pricing plan not found");
  }

  return { message: "Pricing plan deactivated successfully" };
};

// Get pricing comparison data
export const getPricingComparisonService = async () => {
  const plans = await SubscriptionPlanModel.find({ isActive: true })
    .sort({ priority: 1 })
    .select("name description monthlyPrice yearlyPrice features limitations maxUsers maxProjects maxStorage isPopular")
    .lean();

  return { plans };
};
