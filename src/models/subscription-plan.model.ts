import mongoose, { Schema, Document } from "mongoose";

export interface ISubscriptionPlan extends Document {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
  features: string[];
  limitations: string[];
  maxUsers: number;
  maxProjects: number;
  maxStorage: number; // in GB
  isActive: boolean;
  isPopular: boolean;
  priority: number; // for ordering
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ["Starter", "Professional", "Enterprise"],
    },
    description: {
      type: String,
      required: true,
    },
    monthlyPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    yearlyPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    stripePriceIdMonthly: {
      type: String,
      default: null,
    },
    stripePriceIdYearly: {
      type: String,
      default: null,
    },
    features: {
      type: [String],
      default: [],
    },
    limitations: {
      type: [String],
      default: [],
    },
    maxUsers: {
      type: Number,
      required: true,
      default: 5,
    },
    maxProjects: {
      type: Number,
      required: true,
      default: 3,
    },
    maxStorage: {
      type: Number,
      required: true,
      default: 2, // 2GB
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const SubscriptionPlanModel = mongoose.model<ISubscriptionPlan>(
  "SubscriptionPlan",
  subscriptionPlanSchema
);

export default SubscriptionPlanModel;
