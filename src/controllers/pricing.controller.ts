import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import {
  getAllPricingPlansService,
  getPricingPlanByIdService,
  getPricingComparisonService,
  createPricingPlanService,
  updatePricingPlanService,
  deletePricingPlanService,
} from "../services/pricing.service";

// Get all pricing plans
export const getAllPricingPlansController = asyncHandler(
  async (req: Request, res: Response) => {
    const { plans } = await getAllPricingPlansService();

    return res.status(HTTPSTATUS.OK).json({
      message: "Pricing plans retrieved successfully",
      plans,
    });
  }
);

// Get single pricing plan
export const getPricingPlanController = asyncHandler(
  async (req: Request, res: Response) => {
    const { planId } = req.params;
    const { plan } = await getPricingPlanByIdService(planId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Pricing plan retrieved successfully",
      plan,
    });
  }
);

// Get pricing comparison
export const getPricingComparisonController = asyncHandler(
  async (req: Request, res: Response) => {
    const { plans } = await getPricingComparisonService();

    return res.status(HTTPSTATUS.OK).json({
      message: "Pricing comparison retrieved successfully",
      plans,
    });
  }
);

// Create pricing plan (Admin only)
export const createPricingPlanController = asyncHandler(
  async (req: Request, res: Response) => {
    const { plan } = await createPricingPlanService(req.body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Pricing plan created successfully",
      plan,
    });
  }
);

// Update pricing plan (Admin only)
export const updatePricingPlanController = asyncHandler(
  async (req: Request, res: Response) => {
    const { planId } = req.params;
    const { plan } = await updatePricingPlanService(planId, req.body);

    return res.status(HTTPSTATUS.OK).json({
      message: "Pricing plan updated successfully",
      plan,
    });
  }
);

// Delete pricing plan (Admin only)
export const deletePricingPlanController = asyncHandler(
  async (req: Request, res: Response) => {
    const { planId } = req.params;
    const result = await deletePricingPlanService(planId);

    return res.status(HTTPSTATUS.OK).json(result);
  }
);
