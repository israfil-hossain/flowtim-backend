import { Request, Response, NextFunction } from "express";
import { Referral, ReferralSettings } from "../models/referral.model";
import User from "../models/user.model";
import SubscriptionPlan from "../models/subscription-plan.model";
import Discount from "../models/discount.model";
import { BadRequestException, ForbiddenException, NotFoundException } from "../utils/appError";
import mongoose from "mongoose";

// @desc   Create referral (logged in user)
// @route  POST /api/referral/create
// @access Private
export const createReferralController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { referredEmail, metadata } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      throw new ForbiddenException("User authentication required");
    }

    // Check referral settings
    const settings = await ReferralSettings.getSettings();
    if (!settings || !settings.isActive) {
      throw new BadRequestException("Referral system is currently disabled");
    }

    // Check if user has reached max referrals
    const userReferralCount = await Referral.countDocuments({
      referrerId: userId,
      status: { $in: ['pending', 'completed', 'rewarded'] }
    });

    if (userReferralCount >= settings.maxReferralsPerUser) {
      throw new BadRequestException(`Maximum referral limit (${settings.maxReferralsPerUser}) reached`);
    }

    // Check if self-referral is disabled
    if (!settings.allowSelfReferral && referredEmail) {
      const currentUser = await User.findById(userId);
      if (currentUser && currentUser.email === referredEmail.toLowerCase()) {
        throw new BadRequestException("Self-referral is not allowed");
      }
    }

    // Check if referral already exists for this email
    if (referredEmail) {
      const existingReferral = await Referral.findOne({
        referrerId: userId,
        referredEmail: referredEmail.toLowerCase(),
        status: { $in: ['pending', 'completed'] }
      });

      if (existingReferral) {
        throw new BadRequestException("Referral already exists for this email");
      }
    }

    // Generate referral code
    const referralCode = await Referral.generateReferralCode(settings.customReferralCodePrefix);

    // Create referral
    const referral = new Referral({
      referrerId: userId,
      referredEmail: referredEmail ? referredEmail.toLowerCase() : undefined,
      referralCode,
      status: 'pending',
      rewardType: settings.rewardType,
      rewardValue: settings.rewardValue,
      expiresAt: new Date(Date.now() + settings.referralLinkExpiryDays * 24 * 60 * 60 * 1000),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      utmSource: req.query.utm_source as string,
      utmMedium: req.query.utm_medium as string,
      utmCampaign: req.query.utm_campaign as string,
      metadata: {
        ...metadata,
        referrerPage: req.get('Referer'),
        landingPage: req.body.landingPage
      }
    });

    await referral.save();

    res.status(201).json({
      status: "success",
      message: "Referral created successfully",
      data: {
        referral: {
          _id: referral._id,
          referralCode: referral.referralCode,
          referredEmail: referral.referredEmail,
          status: referral.status,
          rewardType: referral.rewardType,
          rewardDescription: referral.getRewardDescription(),
          expiresAt: referral.expiresAt,
          referralUrl: `${req.get('origin')}/signup?ref=${referral.referralCode}`
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Complete referral (when referred user signs up)
// @route  POST /api/referral/complete
// @access Public (during signup)
export const completeReferralController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { referralCode, referredUserId } = req.body;

    if (!referralCode) {
      throw new BadRequestException("Referral code is required");
    }

    const referral = await Referral.findByCode(referralCode);
    if (!referral) {
      throw new NotFoundException("Invalid or expired referral code");
    }

    if (!referral.canBeCompleted()) {
      throw new BadRequestException(`Referral cannot be completed: ${referral.isExpired() ? 'Expired' : 'Invalid status'}`);
    }

    if (referredUserId) {
      // Complete the referral
      await referral.completeReferral(referredUserId);

      // Check if referrer can claim reward
      const settings = await ReferralSettings.getSettings();
      if (settings) {
        const referrerStats = await Referral.getUserReferralStats(referral.referrerId.toString());

        if (referrerStats.canClaimReward) {
          // Create reward automatically or mark as claimable
          const referralCount = referrerStats.completed;
          const rewardsToClaim = Math.floor(referralCount / settings.referralRewardThreshold) -
                                  Math.floor((referrerStats.completed - 1) / settings.referralRewardThreshold);

          // Here you would implement the reward distribution logic
          // For now, we'll just mark it as claimable
        }
      }
    }

    res.status(200).json({
      status: "success",
      message: "Referral completed successfully",
      data: {
        referral: {
          _id: referral._id,
          status: referral.status,
          completedAt: referral.completedAt,
          rewardType: referral.rewardType,
          rewardDescription: referral.getRewardDescription()
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get user's referrals
// @route  GET /api/referral/my-referrals
// @access Private
export const getUserReferralsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;
    const { status, page = 1, limit = 10 } = req.query;

    if (!userId) {
      throw new ForbiddenException("User authentication required");
    }

    const query: any = { referrerId: userId };
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [referrals, total] = await Promise.all([
      Referral.find(query)
        .populate('referredUserId', 'name email createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Referral.countDocuments(query)
    ]);

    // Get referral stats
    const stats = await Referral.getUserReferralStats(userId.toString());
    const settings = await ReferralSettings.getSettings();

    res.status(200).json({
      status: "success",
      message: "User referrals retrieved successfully",
      data: {
        referrals,
        stats,
        settings: {
          referralRewardThreshold: settings?.referralRewardThreshold || 3,
          rewardType: settings?.rewardType || '1_month_premium',
          referralLinkExpiryDays: settings?.referralLinkExpiryDays || 30,
          maxReferralsPerUser: settings?.maxReferralsPerUser || 100
        },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get referral stats
// @route  GET /api/referral/stats
// @access Private
export const getReferralStatsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;
    const { period = 'all' } = req.query;

    if (!userId) {
      throw new ForbiddenException("User authentication required");
    }

    const userStats = await Referral.getUserReferralStats(userId.toString());
    const settings = await ReferralSettings.getSettings();

    // Get referral analytics for the period
    let dateFilter: any = {};
    if (period !== 'all') {
      const now = new Date();
      switch (period) {
        case '7d':
          dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
          break;
        case '30d':
          dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
          break;
        case '90d':
          dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
          break;
      }
    }

    const userReferrals = await Referral.find({
      referrerId: userId,
      ...dateFilter
    });

    const recentReferrals = userReferrals.slice(0, 5).map((referral: any) => ({
      _id: referral._id,
      referredEmail: referral.referredEmail,
      status: referral.status,
      createdAt: referral.createdAt,
      completedAt: referral.completedAt,
      rewardClaimed: referral.rewardClaimed
    }));

    // Calculate conversion rate
    const completedInPeriod = userReferrals.filter((r: any) =>
      ['completed', 'rewarded'].includes(r.status)
    ).length;
    const conversionRate = userReferrals.length > 0
      ? (completedInPeriod / userReferrals.length) * 100
      : 0;

    res.status(200).json({
      status: "success",
      message: "Referral statistics retrieved successfully",
      data: {
        overview: userStats,
        periodStats: {
          totalReferrals: userReferrals.length,
          completedReferrals: completedInPeriod,
          conversionRate: Math.round(conversionRate * 100) / 100,
          rewardsClaimed: userReferrals.filter((r: any) => r.rewardClaimed).length
        },
        recentReferrals,
        settings: {
          referralRewardThreshold: settings?.referralRewardThreshold || 3,
          rewardType: settings?.rewardType || '1_month_premium',
          rewardDescription: settings?.rewardType === '1_month_premium'
            ? '1 month premium subscription'
            : settings?.rewardType === 'credits'
              ? `${settings?.rewardValue?.credits || 0} credits`
              : 'Custom reward'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Claim referral reward
// @route  POST /api/referral/claim-reward
// @access Private
export const claimReferralRewardController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw new ForbiddenException("User authentication required");
    }

    const settings = await ReferralSettings.getSettings();
    if (!settings) {
      throw new BadRequestException("Referral system is not configured");
    }

    // Check if user can claim reward
    const stats = await Referral.getUserReferralStats(userId.toString());
    if (!stats.canClaimReward) {
      throw new BadRequestException(`You need ${settings.referralRewardThreshold} successful referrals to claim a reward`);
    }

    // Get the oldest unclaimed completed referral
    const referral = await Referral.findOne({
      referrerId: userId,
      status: 'completed',
      rewardClaimed: false
    }).sort({ completedAt: 1 });

    if (!referral) {
      throw new NotFoundException("No eligible referrals found for reward claim");
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Claim the reward
      await referral.claimReward();

      // Create the reward based on type
      let reward;
      if (settings.rewardType === '1_month_premium') {
        // Create a discount for 1 month free
        const plan = settings.rewardValue.planId
          ? await SubscriptionPlan.findById(settings.rewardValue.planId)
          : await SubscriptionPlan.findOne({ name: 'Professional' });

        if (plan) {
          const discount = new Discount({
            name: 'Referral Reward - 1 Month Free',
            description: `1 month free subscription reward for ${settings.referralRewardThreshold} successful referrals`,
            type: 'fixed_amount',
            value: plan.monthlyPrice || 0,
            appliesTo: 'specific_plans',
            applicablePlans: [plan._id],
            maxUses: 1,
            isActive: true,
            createdBy: userId,
            metadata: {
              category: 'referral_reward',
              referralId: referral._id,
              referrerId: userId
            }
          });

          reward = await discount.save({ session });
        }
      } else if (settings.rewardType === 'custom_discount') {
        // Use the specified discount
        const discount = settings.rewardValue.discountId
          ? await Discount.findById(settings.rewardValue.discountId)
          : null;

        if (discount) {
          reward = discount;
        }
      }

      await session.commitTransaction();

      res.status(200).json({
        status: "success",
        message: "Referral reward claimed successfully",
        data: {
          referral: {
            _id: referral._id,
            rewardClaimed: true,
            rewardClaimedAt: referral.rewardClaimedAt
          },
          reward: reward ? {
            type: settings.rewardType,
            description: referral.getRewardDescription(),
            ...(settings.rewardType === '1_month_premium' && reward._id ? {
              discountId: reward._id,
              discountCode: reward.code
            } : {})
          } : null,
          nextRewardThreshold: {
            referralsNeeded: (Math.floor(stats.completed / settings.referralRewardThreshold) + 1) * settings.referralRewardThreshold,
            completedReferrals: stats.completed,
            progress: `${stats.completed}/${(Math.floor(stats.completed / settings.referralRewardThreshold) + 1) * settings.referralRewardThreshold}`
          }
        }
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    next(error);
  }
};

// @desc   Get referral by code (public lookup)
// @route  GET /api/referral/lookup/:code
// @access Public
export const lookupReferralController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.params;

    if (!code) {
      throw new BadRequestException("Referral code is required");
    }

    const referral = await Referral.findByCode(code);

    if (!referral) {
      return res.status(404).json({
        status: "error",
        message: "Referral code not found or expired",
        data: null
      });
    }

    // Don't expose sensitive information
    const publicReferral = {
      referrerName: "A friend", // Don't expose actual referrer name for privacy
      rewardDescription: referral.getRewardDescription(),
      expiresAt: referral.expiresAt,
      isValid: referral.canBeCompleted()
    };

    res.status(200).json({
      status: "success",
      message: "Referral lookup successful",
      data: { referral: publicReferral }
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Admin: Get all referrals
// @route  GET /api/referral/admin/all
// @access Private/Admin
export const getAllReferralsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      referrerId,
      startDate,
      endDate
    } = req.query;

    const query: any = {};

    // Apply filters
    if (status) {
      query.status = status;
    }

    if (referrerId) {
      query.referrerId = referrerId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [referrals, total] = await Promise.all([
      Referral.find(query)
        .populate([
          { path: 'referrerId', select: 'name email' },
          { path: 'referredUserId', select: 'name email' }
        ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Referral.countDocuments(query)
    ]);

    res.status(200).json({
      status: "success",
      message: "All referrals retrieved successfully",
      data: {
        referrals,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Admin: Get referral statistics
// @route  GET /api/referral/admin/stats
// @access Private/Admin
export const getAdminReferralStatsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { period = 'all' } = req.query;

    let dateFilter: any = {};
    if (period !== 'all') {
      const now = new Date();
      switch (period) {
        case '7d':
          dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
          break;
        case '30d':
          dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
          break;
        case '90d':
          dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
          break;
      }
    }

    const stats = await Referral.getReferralAnalytics(
      dateFilter.createdAt?.$gte,
      dateFilter.createdAt?.$lte
    );

    const topReferrers = await Referral.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$referrerId',
          totalReferrals: { $sum: 1 },
          completedReferrals: { $sum: { $cond: [{ $in: ['$status', ['completed', 'rewarded']] }, 1, 0] } },
          rewardedReferrals: { $sum: { $cond: [{ $eq: ['$status', 'rewarded'] }, 1, 0] } }
        }
      },
      { $sort: { completedReferrals: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          name: '$user.name',
          email: '$user.email',
          totalReferrals: 1,
          completedReferrals: 1,
          rewardedReferrals: 1,
          conversionRate: { $multiply: [{ $divide: ['$completedReferrals', '$totalReferrals'] }, 100] }
        }
      }
    ]);

    const statusBreakdown = await Referral.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const settings = await ReferralSettings.getSettings();

    res.status(200).json({
      status: "success",
      message: "Admin referral statistics retrieved successfully",
      data: {
        overview: stats[0] || {
          totalReferrals: 0,
          completedReferrals: 0,
          rewardedReferrals: 0,
          expiredReferrals: 0,
          conversionRate: 0
        },
        topReferrers,
        statusBreakdown,
        settings
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Admin: Update referral settings
// @route  PUT /api/referral/admin/settings
// @access Private/Admin
export const updateReferralSettingsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updates = req.body;
    const userId = req.user?._id;

    if (!userId) {
      throw new ForbiddenException("User authentication required");
    }

    let settings = await ReferralSettings.getSettings();

    if (settings) {
      // Update existing settings
      Object.keys(updates).forEach((key: string) => {
        if (updates[key] !== undefined && settings) {
          (settings as any)[key] = updates[key];
        }
      });
      settings.updatedBy = new mongoose.Types.ObjectId(userId);
      await settings.save();
    } else {
      // Create new settings
      settings = new ReferralSettings({
        referralRewardThreshold: 3,
        rewardType: '1_month_premium',
        rewardValue: {
          duration: 1
        },
        referralLinkExpiryDays: 30,
        allowSelfReferral: false,
        maxReferralsPerUser: 100,
        customReferralCodePrefix: '',
        isActive: true,
        updatedBy: userId,
        ...updates
      });
      await settings.save();
    }

    res.status(200).json({
      status: "success",
      message: "Referral settings updated successfully",
      data: { settings }
    });
  } catch (error) {
    next(error);
  }
};