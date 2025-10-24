import mongoose, { Document, Schema } from "mongoose";

export interface IReferral extends Document {
  referrerId: mongoose.Types.ObjectId; // User who made the referral
  referredUserId?: mongoose.Types.ObjectId; // User who was referred (null until signup)
  referralCode: string; // Unique referral code
  referredEmail?: string; // Email of person being referred
  status: 'pending' | 'completed' | 'rewarded' | 'expired';
  rewardType: '1_month_premium' | 'custom_discount' | 'credits';
  rewardValue?: any; // Details about the reward (plan ID, discount amount, etc.)
  rewardClaimed: boolean;
  rewardClaimedAt?: Date;
  completedAt?: Date;
  expiresAt: Date; // When referral link expires
  ipAddress?: string; // IP address of referrer for fraud prevention
  userAgent?: string; // User agent for tracking
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  metadata?: {
    referrerPage?: string;
    landingPage?: string;
    conversionPage?: string;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  isExpired(): boolean;
  canBeCompleted(): boolean;
  completeReferral(referredUserId: string): Promise<void>;
  claimReward(): Promise<void>;
  getRewardDescription(): string;
}

export interface IReferralSettings extends Document {
  referralRewardThreshold: number; // Number of successful referrals needed for reward
  rewardType: '1_month_premium' | 'custom_discount' | 'credits';
  rewardValue: {
    planId?: mongoose.Types.ObjectId; // For subscription rewards
    discountId?: mongoose.Types.ObjectId; // For discount rewards
    credits?: number; // For credit rewards
    duration?: number; // Duration in months for subscription rewards
  };
  referralLinkExpiryDays: number; // Days until referral link expires
  allowSelfReferral: boolean;
  maxReferralsPerUser: number;
  customReferralCodePrefix: string;
  isActive: boolean;
  trackingPixels?: string[];
  customMessages?: {
    referralSuccess?: string;
    rewardClaimed?: string;
    referralExpired?: string;
  };
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const referralSchema = new Schema<IReferral>({
  referrerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  referredUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  referralCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    match: /^[A-Z0-9]{8,12}$/,
    index: true
  },
  referredEmail: {
    type: String,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'rewarded', 'expired'],
    default: 'pending',
    index: true
  },
  rewardType: {
    type: String,
    enum: ['1_month_premium', 'custom_discount', 'credits'],
    default: '1_month_premium'
  },
  rewardValue: {
    // Flexible reward configuration
    planId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
    discountId: { type: Schema.Types.ObjectId, ref: 'Discount' },
    credits: Number,
    duration: { type: Number, default: 1 } // Duration in months
  },
  rewardClaimed: {
    type: Boolean,
    default: false,
    index: true
  },
  rewardClaimedAt: Date,
  completedAt: Date,
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  ipAddress: String,
  userAgent: String,
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  metadata: {
    referrerPage: String,
    landingPage: String,
    conversionPage: String,
    notes: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
referralSchema.index({ referralCode: 1 }, { unique: true });
referralSchema.index({ referrerId: 1, status: 1 });
referralSchema.index({ referredUserId: 1 });
referralSchema.index({ expiresAt: 1 });
referralSchema.index({ createdAt: -1 });

// Methods
referralSchema.methods.isExpired = function(): boolean {
  return new Date() > this.expiresAt;
};

referralSchema.methods.canBeCompleted = function(): boolean {
  return this.status === 'pending' && !this.isExpired();
};

referralSchema.methods.completeReferral = async function(referredUserId: string) {
  this.status = 'completed';
  this.referredUserId = referredUserId;
  this.completedAt = new Date();
  return this.save();
};

referralSchema.methods.claimReward = async function() {
  if (this.status !== 'completed') {
    throw new Error('Referral must be completed before claiming reward');
  }

  this.rewardClaimed = true;
  this.rewardClaimedAt = new Date();
  this.status = 'rewarded';
  return this.save();
};

referralSchema.methods.getRewardDescription = function(): string {
  switch (this.rewardType) {
    case '1_month_premium':
      return `1 month ${this.rewardValue?.planId ? 'premium' : 'subscription'}`;
    case 'custom_discount':
      return `Custom discount reward`;
    case 'credits':
      return `${this.rewardValue?.credits || 0} credits`;
    default:
      return 'Special reward';
  }
};

// Static methods
referralSchema.statics.generateReferralCode = async function(prefix: string = ''): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code: string;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    code = prefix + Array.from({ length: 8 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    attempts++;

    if (attempts > maxAttempts) {
      throw new Error('Failed to generate unique referral code after multiple attempts');
    }
  } while (await this.findOne({ referralCode: code }));

  return code;
};

referralSchema.statics.findByCode = function(code: string) {
  return this.findOne({
    referralCode: code.toUpperCase(),
    status: { $in: ['pending', 'completed'] }
  }).populate('referrerId', 'name email').populate('referredUserId', 'name email');
};

referralSchema.statics.findUserReferrals = function(userId: string, status?: string) {
  const query: any = { referrerId: userId };
  if (status) {
    query.status = status;
  }

  return this.find(query)
    .populate('referredUserId', 'name email createdAt')
    .sort({ createdAt: -1 });
};

referralSchema.statics.getUserReferralStats = async function(userId: string) {
  const stats = await this.aggregate([
    { $match: { referrerId: userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result: any = {
    total: 0,
    pending: 0,
    completed: 0,
    rewarded: 0,
    expired: 0
  };

  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  // Check if user can claim reward
  const completedCount = result.completed || 0;
  const rewardedCount = result.rewarded || 0;
  const settings = await mongoose.model('ReferralSettings').findOne({ isActive: true });

  if (settings && completedCount >= settings.referralRewardThreshold) {
    result.canClaimReward = completedCount - rewardedCount >= settings.referralRewardThreshold;
  } else {
    result.canClaimReward = false;
  }

  return result;
};

referralSchema.statics.getReferralAnalytics = function(startDate?: Date, endDate?: Date) {
  const matchStage: any = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = startDate;
    if (endDate) matchStage.createdAt.$lte = endDate;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalReferrals: { $sum: 1 },
        completedReferrals: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        rewardedReferrals: { $sum: { $cond: [{ $eq: ['$status', 'rewarded'] }, 1, 0] } },
        expiredReferrals: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] } },
        conversionRate: {
          $avg: { $cond: [{ $in: ['$status', ['completed', 'rewarded']] }, 1, 0] }
        }
      }
    }
  ]);
};

// Referral Settings Schema
const referralSettingsSchema = new Schema<IReferralSettings>({
  referralRewardThreshold: {
    type: Number,
    required: true,
    default: 3,
    min: 1,
    max: 100
  },
  rewardType: {
    type: String,
    required: true,
    enum: ['1_month_premium', 'custom_discount', 'credits'],
    default: '1_month_premium'
  },
  rewardValue: {
    planId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
    discountId: { type: Schema.Types.ObjectId, ref: 'Discount' },
    credits: { type: Number, default: 0 },
    duration: { type: Number, default: 1 }
  },
  referralLinkExpiryDays: {
    type: Number,
    required: true,
    default: 30,
    min: 1,
    max: 365
  },
  allowSelfReferral: {
    type: Boolean,
    default: false
  },
  maxReferralsPerUser: {
    type: Number,
    default: 100,
    min: 1
  },
  customReferralCodePrefix: {
    type: String,
    default: '',
    maxlength: 10,
    match: /^[A-Z]*$/
  },
  isActive: {
    type: Boolean,
    default: true
  },
  trackingPixels: [String],
  customMessages: {
    referralSuccess: String,
    rewardClaimed: String,
    referralExpired: String
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

referralSettingsSchema.statics.getSettings = function() {
  return this.findOne({ isActive: true }).sort({ updatedAt: -1 });
};

// Define model interfaces
interface IReferralModel extends mongoose.Model<IReferral> {
  generateReferralCode(prefix?: string): Promise<string>;
  findByCode(code: string): Promise<IReferral | null>;
  findUserReferrals(userId: string, status?: string): Promise<IReferral[]>;
  getUserReferralStats(userId: string): Promise<any>;
  getReferralAnalytics(startDate?: Date, endDate?: Date): Promise<any>;
}

interface IReferralSettingsModel extends mongoose.Model<IReferralSettings> {
  getSettings(): Promise<IReferralSettings | null>;
}

export const ReferralSettings = mongoose.model<IReferralSettings, IReferralSettingsModel>('ReferralSettings', referralSettingsSchema);
export const Referral = mongoose.model<IReferral, IReferralModel>('Referral', referralSchema);

export default Referral;