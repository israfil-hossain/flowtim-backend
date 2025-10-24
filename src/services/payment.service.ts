import PaymentModel from "../models/payment.model";
import SubscriptionModel from "../models/subscription.model";
import { NotFoundException } from "../utils/appError";
import mongoose from "mongoose";

// Get user payment history
export const getUserPaymentHistoryService = async (
  userId: string,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    PaymentModel.find({ userId })
      .populate("subscriptionId", "planId billingCycle")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    PaymentModel.countDocuments({ userId }),
  ]);

  return {
    payments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get payment by ID
export const getPaymentByIdService = async (paymentId: string) => {
  const payment = await PaymentModel.findById(paymentId)
    .populate("userId", "name email")
    .populate("subscriptionId")
    .lean();

  if (!payment) {
    throw new NotFoundException("Payment not found");
  }

  return { payment };
};

// Create payment record
export const createPaymentService = async (data: {
  userId: string;
  subscriptionId: string;
  amount: number;
  currency?: string;
  status?: "pending" | "succeeded" | "failed";
  paymentMethod?: string;
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  description?: string;
}) => {
  const payment = await PaymentModel.create({
    ...data,
    currency: data.currency || "USD",
    status: data.status || "pending",
    paymentMethod: data.paymentMethod || "card",
  });

  return { payment };
};

// Update payment status
export const updatePaymentStatusService = async (
  paymentId: string,
  status: "pending" | "succeeded" | "failed" | "refunded",
  additionalData?: {
    failureReason?: string;
    receiptUrl?: string;
    invoiceUrl?: string;
  }
) => {
  const payment = await PaymentModel.findByIdAndUpdate(
    paymentId,
    {
      status,
      ...additionalData,
    },
    { new: true }
  );

  if (!payment) {
    throw new NotFoundException("Payment not found");
  }

  return { payment };
};

// Get subscription payments
export const getSubscriptionPaymentsService = async (subscriptionId: string) => {
  const payments = await PaymentModel.find({ subscriptionId })
    .sort({ createdAt: -1 })
    .lean();

  return { payments };
};

// Get payment statistics for user
export const getUserPaymentStatsService = async (userId: string) => {
  const stats = await PaymentModel.aggregate([
    { $match: { userId: userId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const totalPaid = stats
    .filter((s) => s._id === "succeeded")
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const totalPayments = stats.reduce((sum, s) => sum + s.count, 0);

  return {
    stats,
    summary: {
      totalPaid,
      totalPayments,
      successRate:
        totalPayments > 0
          ? ((stats.find((s) => s._id === "succeeded")?.count || 0) /
              totalPayments) *
            100
          : 0,
    },
  };
};

// Process refund
export const processRefundService = async (
  paymentId: string,
  refundAmount: number,
  reason?: string
) => {
  const payment = await PaymentModel.findById(paymentId);

  if (!payment) {
    throw new NotFoundException("Payment not found");
  }

  payment.status = "refunded";
  payment.refundedAmount = refundAmount;
  payment.refundedAt = new Date();
  payment.failureReason = reason;

  await payment.save();

  return { payment, message: "Refund processed successfully" };
};

// Get payments by status
export const getPaymentsByStatusService = async (
  userId: string,
  status: "pending" | "succeeded" | "failed" | "refunded"
) => {
  const payments = await PaymentModel.find({ userId, status })
    .populate("subscriptionId", "planId billingCycle")
    .sort({ createdAt: -1 })
    .lean();

  return { payments };
};

// Get payments by date range
export const getPaymentsByDateRangeService = async (
  userId: string,
  startDate: Date,
  endDate: Date
) => {
  const payments = await PaymentModel.find({
    userId,
    createdAt: { $gte: startDate, $lte: endDate },
  })
    .populate("subscriptionId", "planId billingCycle")
    .sort({ createdAt: -1 })
    .lean();

  return { payments };
};

// Calculate total revenue (admin function)
export const calculateTotalRevenueService = async (
  startDate?: Date,
  endDate?: Date
) => {
  const matchStage: any = { status: "succeeded" };

  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = startDate;
    if (endDate) matchStage.createdAt.$lte = endDate;
  }

  const revenueData = await PaymentModel.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalRevenue: { $sum: "$amount" },
        paymentCount: { $sum: 1 },
        averagePayment: { $avg: "$amount" },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
  ]);

  return { revenueData };
};

// Get failed payments for retry (admin function)
export const getFailedPaymentsService = async (days: number = 7) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const payments = await PaymentModel.find({
    status: "failed",
    createdAt: { $gte: cutoffDate },
  })
    .populate("userId", "name email")
    .populate("subscriptionId", "planId billingCycle")
    .sort({ createdAt: -1 })
    .lean();

  return { payments };
};

// Create payment from Stripe webhook
export const createPaymentFromWebhookService = async (data: {
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  status: "succeeded" | "failed";
  failureReason?: string;
}) => {
  const payment = await PaymentModel.create({
    ...data,
    paymentMethod: "card",
    description: `Payment for subscription`,
  });

  return { payment };
};

// Update payment from Stripe webhook
export const updatePaymentFromWebhookService = async (
  stripePaymentIntentId: string,
  updateData: {
    status: "succeeded" | "failed" | "refunded";
    receiptUrl?: string;
    invoiceUrl?: string;
    failureReason?: string;
  }
) => {
  const payment = await PaymentModel.findOneAndUpdate(
    { stripePaymentIntentId },
    updateData,
    { new: true }
  );

  if (!payment) {
    // Create new payment if not found
    return await createPaymentFromWebhookService({
      userId: updateData.status === "succeeded" ? "unknown" : "unknown",
      subscriptionId: "unknown",
      amount: 0,
      currency: "USD",
      stripePaymentIntentId,
      status: updateData.status as "succeeded" | "failed",
    });
  }

  return { payment };
};

// Get payment analytics for a user
export const getUserPaymentAnalyticsService = async (
  userId: string,
  months: number = 12
) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const analytics = await PaymentModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          status: "$status",
        },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
  ]);

  return { analytics };
};
