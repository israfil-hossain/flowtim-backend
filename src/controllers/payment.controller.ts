import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { getAuthenticatedUserId } from "../utils/auth-helpers";
import {
  getUserPaymentHistoryService,
  getPaymentByIdService,
  getUserPaymentStatsService,
  getSubscriptionPaymentsService,
  processRefundService,
} from "../services/payment.service";
import { NotFoundException, BadRequestException } from "../utils/appError";

// Get user payment history
export const getPaymentHistoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getUserPaymentHistoryService(userId, page, limit);

    return res.status(HTTPSTATUS.OK).json({
      message: "Payment history retrieved successfully",
      ...result,
    });
  }
);

// Get single payment
export const getPaymentController = asyncHandler(
  async (req: Request, res: Response) => {
    const { paymentId } = req.params;

    const { payment } = await getPaymentByIdService(paymentId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Payment retrieved successfully",
      payment,
    });
  }
);

// Get payment statistics
export const getPaymentStatsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);

    const result = await getUserPaymentStatsService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Payment statistics retrieved successfully",
      ...result,
    });
  }
);

// Get payments for a specific subscription
export const getSubscriptionPaymentsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { subscriptionId } = req.params;
    const userId = getAuthenticatedUserId(req);

    // Verify the subscription belongs to the user
    const { payments } = await getSubscriptionPaymentsService(subscriptionId);

    // Double check that all payments belong to the authenticated user
    const userPayments = payments.filter(payment =>
      payment.userId.toString() === userId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Subscription payments retrieved successfully",
      payments: userPayments,
    });
  }
);

// Request a refund (admin only in real implementation)
export const requestRefundController = asyncHandler(
  async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    const { refundAmount, reason } = req.body;

    if (!refundAmount || refundAmount <= 0) {
      throw new BadRequestException("Invalid refund amount");
    }

    const result = await processRefundService(paymentId, refundAmount, reason);

    return res.status(HTTPSTATUS.OK).json(result);
  }
);

// Download invoice/receipt
export const downloadInvoiceController = asyncHandler(
  async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    const userId = getAuthenticatedUserId(req);

    const { payment } = await getPaymentByIdService(paymentId);

    // Verify payment belongs to user
    if (payment.userId.toString() !== userId) {
      throw new NotFoundException("Payment not found");
    }

    if (!payment.receiptUrl) {
      throw new NotFoundException("No receipt available for this payment");
    }

    return res.status(HTTPSTATUS.OK).json({
      message: "Invoice URL retrieved successfully",
      invoiceUrl: payment.receiptUrl,
      receiptUrl: payment.receiptUrl,
    });
  }
);

// Get upcoming invoice information
export const getUpcomingInvoiceController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const userId = getAuthenticatedUserId(req);

    // Get user's subscription
    const SubscriptionModel = await import("../models/subscription.model").then(m => m.default);
    const subscription = await SubscriptionModel.findOne({
      userId,
      workspaceId,
      status: { $in: ["active", "trial"] },
    }).populate("planId");

    if (!subscription || !subscription.stripeCustomerId) {
      throw new NotFoundException("No active subscription found");
    }

    // This would typically involve Stripe's API to get upcoming invoice
    // For now, return subscription billing info
    const plan = subscription.planId as any;
    const nextBillingDate = subscription.currentPeriodEnd;
    const nextAmount = subscription.billingCycle === "yearly"
      ? plan.yearlyPrice
      : plan.monthlyPrice;

    return res.status(HTTPSTATUS.OK).json({
      message: "Upcoming invoice retrieved successfully",
      nextBillingDate,
      amount: nextAmount,
      currency: "USD",
      billingCycle: subscription.billingCycle,
      planName: plan.name,
    });
  }
);
