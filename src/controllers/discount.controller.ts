import { Request, Response, NextFunction } from "express";
import { Discount } from "../models/discount.model";
import SubscriptionPlan from "../models/subscription-plan.model";
import { BadRequestException, ForbiddenException, NotFoundException } from "../utils/appError";
import mongoose from "mongoose";

// @desc   Create new discount (Admin only)
// @route  POST /api/discount/create
// @access Private/Admin
export const createDiscountController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      type,
      value,
      code,
      appliesTo,
      applicablePlans,
      maxUses,
      minAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      metadata
    } = req.body;

    // Validate discount value
    if (type === 'percentage' && (value < 0 || value > 100)) {
      throw new BadRequestException("Percentage discount must be between 0 and 100");
    }

    if (type === 'fixed_amount' && value < 0) {
      throw new BadRequestException("Fixed amount discount must be positive");
    }

    // Check if code is unique (if provided)
    if (code) {
      const existingDiscount = await Discount.findOne({ code: code.toUpperCase() });
      if (existingDiscount) {
        throw new BadRequestException("Discount code already exists");
      }
    }

    // Validate applicable plans
    if (appliesTo === 'specific_plans' && applicablePlans) {
      const plans = await SubscriptionPlan.find({
        _id: { $in: applicablePlans },
        isActive: true
      });

      if (plans.length !== applicablePlans.length) {
        throw new BadRequestException("One or more specified plans are invalid or inactive");
      }
    }

    const discount = new Discount({
      name,
      description,
      type,
      value,
      code: code ? code.toUpperCase() : undefined,
      appliesTo,
      applicablePlans: appliesTo === 'specific_plans' ? applicablePlans : [],
      maxUses,
      minAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      metadata,
      createdBy: req.user?._id
    });

    await discount.save();

    res.status(201).json({
      status: "success",
      message: "Discount created successfully",
      data: {
        discount: await discount.populate([
          { path: 'applicablePlans', select: 'name monthlyPrice yearlyPrice' },
          { path: 'createdBy', select: 'name email' }
        ])
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get all discounts (Admin only)
// @route  GET /api/discount/all
// @access Private/Admin
export const getAllDiscountsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      appliesTo,
      search
    } = req.query;

    const query: any = {};

    // Apply filters
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (type) {
      query.type = type;
    }

    if (appliesTo) {
      query.appliesTo = appliesTo;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [discounts, total] = await Promise.all([
      Discount.find(query)
        .populate([
          { path: 'applicablePlans', select: 'name monthlyPrice yearlyPrice' },
          { path: 'createdBy', select: 'name email' }
        ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Discount.countDocuments(query)
    ]);

    res.status(200).json({
      status: "success",
      message: "Discounts retrieved successfully",
      data: {
        discounts,
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

// @desc   Get discount by ID (Admin only)
// @route  GET /api/discount/:id
// @access Private/Admin
export const getDiscountByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid discount ID");
    }

    const discount = await Discount.findById(id)
      .populate([
        { path: 'applicablePlans', select: 'name monthlyPrice yearlyPrice features' },
        { path: 'createdBy', select: 'name email' }
      ]);

    if (!discount) {
      throw new NotFoundException("Discount not found");
    }

    res.status(200).json({
      status: "success",
      message: "Discount retrieved successfully",
      data: { discount }
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Update discount (Admin only)
// @route  PUT /api/discount/:id
// @access Private/Admin
export const updateDiscountController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid discount ID");
    }

    const discount = await Discount.findById(id);
    if (!discount) {
      throw new NotFoundException("Discount not found");
    }

    // Validate updates
    if (updates.type === 'percentage' && (updates.value < 0 || updates.value > 100)) {
      throw new BadRequestException("Percentage discount must be between 0 and 100");
    }

    if (updates.type === 'fixed_amount' && updates.value < 0) {
      throw new BadRequestException("Fixed amount discount must be positive");
    }

    // Check code uniqueness if updating
    if (updates.code && updates.code !== discount.code) {
      const existingDiscount = await Discount.findOne({
        code: updates.code.toUpperCase(),
        _id: { $ne: id }
      });
      if (existingDiscount) {
        throw new BadRequestException("Discount code already exists");
      }
    }

    // Validate maxUses against current usage
    if (updates.maxUses && updates.maxUses < discount.usedCount) {
      throw new BadRequestException(`Maximum uses cannot be less than current usage (${discount.usedCount})`);
    }

    // Update discount
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        if (key === 'code') {
          (discount as any)[key] = updates[key].toUpperCase();
        } else {
          (discount as any)[key] = updates[key];
        }
      }
    });

    (discount as any).updatedBy = req.user?._id;
    await discount.save();

    res.status(200).json({
      status: "success",
      message: "Discount updated successfully",
      data: {
        discount: await discount.populate([
          { path: 'applicablePlans', select: 'name monthlyPrice yearlyPrice' },
          { path: 'createdBy', select: 'name email' }
        ])
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete/Deactivate discount (Admin only)
// @route  DELETE /api/discount/:id
// @access Private/Admin
export const deleteDiscountController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { hardDelete = false } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid discount ID");
    }

    const discount = await Discount.findById(id);
    if (!discount) {
      throw new NotFoundException("Discount not found");
    }

    if (hardDelete) {
      // Hard delete - only if no usage
      if (discount.usedCount > 0) {
        throw new BadRequestException("Cannot delete discount that has been used. Deactivate it instead.");
      }
      await Discount.findByIdAndDelete(id);
    } else {
      // Soft delete - deactivate
      discount.isActive = false;
      await discount.save();
    }

    res.status(200).json({
      status: "success",
      message: hardDelete ? "Discount deleted permanently" : "Discount deactivated successfully",
      data: {
        deletedDiscount: {
          _id: discount._id,
          name: discount.name,
          isActive: hardDelete ? false : discount.isActive
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Validate discount code
// @route  POST /api/discount/validate
// @access Public
export const validateDiscountController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, planId, amount } = req.body;

    if (!code) {
      throw new BadRequestException("Discount code is required");
    }

    const discount = await Discount.findByCode(code);
    if (!discount) {
      return res.status(200).json({
        status: "success",
        message: "Discount code validated",
        data: {
          valid: false,
          reason: "Invalid discount code"
        }
      });
    }

    const canBeUsed = discount.canBeUsed();
    if (!canBeUsed.canUse) {
      return res.status(200).json({
        status: "success",
        message: "Discount code validated",
        data: {
          valid: false,
          reason: canBeUsed.reason
        }
      });
    }

    // Check plan applicability
    let isApplicable = false;
    if (discount.appliesTo === 'all_plans') {
      isApplicable = true;
    } else if (discount.appliesTo === 'specific_plans' && planId) {
      isApplicable = discount.applicablePlans?.some((plan: any) =>
        plan._id.toString() === planId.toString()
      ) || false;
    } else if (discount.appliesTo === 'first_billing') {
      // This would need to be checked in the subscription creation context
      isApplicable = true;
    }

    if (!isApplicable) {
      return res.status(200).json({
        status: "success",
        message: "Discount code validated",
        data: {
          valid: false,
          reason: "Discount not applicable to this plan"
        }
      });
    }

    // Check minimum amount
    if (discount.minAmount && amount && amount < discount.minAmount) {
      return res.status(200).json({
        status: "success",
        message: "Discount code validated",
        data: {
          valid: false,
          reason: `Minimum amount of $${discount.minAmount} required`
        }
      });
    }

    // Calculate discount
    const discountAmount = discount.calculateDiscount(amount || 0);

    res.status(200).json({
      status: "success",
      message: "Discount code validated successfully",
      data: {
        valid: true,
        discount: {
          id: discount._id,
          name: discount.name,
          type: discount.type,
          value: discount.value,
          discountAmount,
          finalAmount: amount ? amount - discountAmount : undefined
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get discount statistics (Admin only)
// @route  GET /api/discount/stats
// @access Private/Admin
export const getDiscountStatsController = async (
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

    const stats = await Discount.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalDiscounts: { $sum: 1 },
          activeDiscounts: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          totalUsedCount: { $sum: '$usedCount' },
          percentageDiscounts: { $sum: { $cond: [{ $eq: ['$type', 'percentage'] }, 1, 0] } },
          fixedDiscounts: { $sum: { $cond: [{ $eq: ['$type', 'fixed_amount'] }, 1, 0] } },
          avgUsageRate: { $avg: { $cond: [{ $gt: ['$maxUses', 0] }, { $divide: ['$usedCount', '$maxUses'] }, 0] } }
        }
      }
    ]);

    const typeBreakdown = await Discount.aggregate([
      { $match: { ...dateFilter, isActive: true } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalUsed: { $sum: '$usedCount' }
        }
      }
    ]);

    const appliesToBreakdown = await Discount.aggregate([
      { $match: { ...dateFilter, isActive: true } },
      {
        $group: {
          _id: '$appliesTo',
          count: { $sum: 1 },
          totalUsed: { $sum: '$usedCount' }
        }
      }
    ]);

    res.status(200).json({
      status: "success",
      message: "Discount statistics retrieved successfully",
      data: {
        overview: stats[0] || {
          totalDiscounts: 0,
          activeDiscounts: 0,
          totalUsedCount: 0,
          percentageDiscounts: 0,
          fixedDiscounts: 0,
          avgUsageRate: 0
        },
        typeBreakdown,
        appliesToBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get active public discounts
// @route  GET /api/discount/public
// @access Public
export const getPublicDiscountsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const discounts = await Discount.findActiveDiscounts({
      appliesTo: { $in: ['all_plans', 'specific_plans'] }
    });

    // Only return safe public information
    const publicDiscounts = discounts.map((discount: any) => ({
      _id: discount._id,
      name: discount.name,
      description: discount.description,
      type: discount.type,
      value: discount.value,
      code: discount.code,
      maxUses: discount.maxUses,
      usedCount: discount.usedCount,
      minAmount: discount.minAmount,
      maxDiscountAmount: discount.maxDiscountAmount,
      startDate: discount.startDate,
      endDate: discount.endDate,
      applicablePlans: discount.applicablePlans?.map((plan: any) => ({
        _id: plan._id,
        name: plan.name,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice
      }))
    }));

    res.status(200).json({
      status: "success",
      message: "Public discounts retrieved successfully",
      data: { discounts: publicDiscounts }
    });
  } catch (error) {
    next(error);
  }
};