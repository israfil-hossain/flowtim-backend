import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  subscriptionId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  paymentMethod: string;
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  description?: string;
  metadata?: Record<string, any>;
  failureReason?: string;
  refundedAmount?: number;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "usd",
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      default: "card",
    },
    stripePaymentIntentId: {
      type: String,
      default: null,
      index: true,
    },
    stripeInvoiceId: {
      type: String,
      default: null,
      index: true,
    },
    invoiceUrl: {
      type: String,
      default: null,
    },
    receiptUrl: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    failureReason: {
      type: String,
      default: null,
    },
    refundedAmount: {
      type: Number,
      default: 0,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

const PaymentModel = mongoose.model<IPayment>("Payment", paymentSchema);

export default PaymentModel;
