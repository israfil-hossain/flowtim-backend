import mongoose, { Document, Schema } from "mongoose";

export interface IDiscount extends Document {
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount';
  value: number; // Percentage (0-100) or fixed amount
  code?: string; // Promo code for public discounts
  isActive: boolean;
  appliesTo: 'all_plans' | 'specific_plans' | 'first_billing' | 'referral_reward';
  applicablePlans?: mongoose.Types.ObjectId[]; // Plan IDs this discount applies to
  maxUses?: number; // Maximum number of times this discount can be used
  usedCount: number; // Number of times this discount has been used
  minAmount?: number; // Minimum order amount for discount to apply
  maxDiscountAmount?: number; // Maximum discount amount for percentage discounts
  startDate?: Date; // When discount becomes active
  endDate?: Date; // When discount expires
  createdBy: mongoose.Types.ObjectId; // Admin who created this discount
  metadata?: {
    category?: string;
    targetAudience?: string;
    internalNotes?: string;
  };
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  isValid(): boolean;
  canBeUsed(): { canUse: boolean; reason?: string };
  calculateDiscount(originalAmount: number): number;
  incrementUsage(): Promise<IDiscount>;
}

const discountSchema = new Schema<IDiscount>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed_amount'],
    default: 'percentage'
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  code: {
    type: String,
    trim: true,
    uppercase: true,
    unique: true,
    sparse: true,
    match: /^[A-Z0-9-_]{3,20}$/,
    validate: {
      validator: function(this: any, v: string): boolean {
        // Code is required for public discounts
        return (this.appliesTo !== 'all_plans' && this.appliesTo !== 'specific_plans') ? v.length > 0 : true;
      },
      message: 'Promo code is required for public discounts'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  appliesTo: {
    type: String,
    required: true,
    enum: ['all_plans', 'specific_plans', 'first_billing', 'referral_reward'],
    default: 'all_plans'
  },
  applicablePlans: [{
    type: Schema.Types.ObjectId,
    ref: 'SubscriptionPlan'
  }],
  maxUses: {
    type: Number,
    min: 1,
    validate: {
      validator: function(v: number) {
        return !v || v >= this.usedCount;
      },
      message: 'Maximum uses cannot be less than current used count'
    }
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  minAmount: {
    type: Number,
    min: 0
  },
  maxDiscountAmount: {
    type: Number,
    min: 0,
    validate: {
      validator: function(v: number) {
        // Max discount amount only applies to percentage discounts
        return this.type !== 'percentage' || !v || v > 0;
      },
      message: 'Max discount amount only applies to percentage discounts'
    }
  },
  startDate: {
    type: Date,
    validate: {
      validator: function(v: Date) {
        return !v || !this.endDate || v <= this.endDate;
      },
      message: 'Start date must be before end date'
    }
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(v: Date) {
        return !v || !this.startDate || v >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    category: String,
    targetAudience: String,
    internalNotes: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
discountSchema.index({ code: 1 }, { unique: true, sparse: true });
discountSchema.index({ isActive: 1, appliesTo: 1 });
discountSchema.index({ createdBy: 1 });
discountSchema.index({ startDate: 1, endDate: 1 });

// Validation methods
discountSchema.methods.isValid = function(): boolean {
  if (!this.isActive) return false;

  const now = new Date();
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  if (this.maxUses && this.usedCount >= this.maxUses) return false;

  return true;
};

discountSchema.methods.canBeUsed = function(): { canUse: boolean; reason?: string } {
  if (!this.isActive) return { canUse: false, reason: 'Discount is inactive' };

  const now = new Date();
  if (this.startDate && now < this.startDate) {
    return { canUse: false, reason: 'Discount has not started yet' };
  }
  if (this.endDate && now > this.endDate) {
    return { canUse: false, reason: 'Discount has expired' };
  }
  if (this.maxUses && this.usedCount >= this.maxUses) {
    return { canUse: false, reason: 'Discount has reached maximum uses' };
  }

  return { canUse: true };
};

discountSchema.methods.calculateDiscount = function(originalAmount: number): number {
  let discount = 0;

  if (this.type === 'percentage') {
    discount = (originalAmount * this.value) / 100;
    if (this.maxDiscountAmount) {
      discount = Math.min(discount, this.maxDiscountAmount);
    }
  } else if (this.type === 'fixed_amount') {
    discount = Math.min(this.value, originalAmount);
  }

  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

discountSchema.methods.incrementUsage = async function() {
  this.usedCount += 1;
  return this.save();
};

// Static methods
discountSchema.statics.findActiveDiscounts = function(filters: any = {}) {
  const query = {
    isActive: true,
    ...filters
  };

  return this.find(query)
    .populate('applicablePlans', 'name monthlyPrice yearlyPrice')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
};

discountSchema.statics.findByCode = function(code: string) {
  return this.findOne({
    code: code.toUpperCase(),
    isActive: true
  })
  .populate('applicablePlans');
};

discountSchema.statics.findApplicableDiscounts = function(
  this: any,
  planId: string,
  amount: number,
  isFirstBilling: boolean = false
) {
  const now = new Date();
  const query: any = {
    isActive: true,
    $or: [
      { appliesTo: 'all_plans' },
      { appliesTo: 'specific_plans', applicablePlans: planId },
      { appliesTo: 'first_billing', ...(isFirstBilling && { appliesTo: 'first_billing' }) }
    ],
    $and: [
      { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $gte: now } }] }
    ]
  };

  if (this.minAmount) {
    query.$and.push({ minAmount: { $lte: amount } });
  }

  return this.find(query).populate('applicablePlans');
};

// Define model interface
interface IDiscountModel extends mongoose.Model<IDiscount> {
  findByCode(code: string): Promise<IDiscount | null>;
  findActiveDiscounts(filters?: any): Promise<IDiscount[]>;
  findApplicableDiscounts(planId: string, amount: number, isFirstBilling?: boolean): Promise<IDiscount[]>;
}

export const Discount = mongoose.model<IDiscount, IDiscountModel>('Discount', discountSchema);

export default Discount;