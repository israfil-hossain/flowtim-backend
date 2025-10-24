/**
 * @swagger
 * tags:
 *   name: Referral System
 *   description: Referral management and reward system endpoints
 */

import { Router } from "express";
import {
  createReferralController,
  completeReferralController,
  getUserReferralsController,
  getReferralStatsController,
  claimReferralRewardController,
  lookupReferralController,
  getAllReferralsController,
  getAdminReferralStatsController,
  updateReferralSettingsController
} from "../controllers/referral.controller";
import { combinedAuth } from "../middlewares/combinedAuth.middleware";
import { requireReferralAccess, requireAdmin } from "../middlewares/rbac.middleware";

const router = Router();

// User referral endpoints
/**
 * @swagger
 * /api/referral/create:
 *   post:
 *     tags: [Referral System]
 *     summary: Create a new referral
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               referredEmail:
 *                 type: string
 *                 format: email
 *                 description: Email of person to refer (optional)
 *               metadata:
 *                 type: object
 *                 description: Additional metadata
 *     responses:
 *       201:
 *         description: Referral created successfully
 *       400:
 *         description: Bad request - referral system disabled or limit reached
 *       401:
 *         description: Unauthorized - authentication required
 */
router.post("/create", combinedAuth, createReferralController);

/**
 * @swagger
 * /api/referral/my-referrals:
 *   get:
 *     tags: [Referral System]
 *     summary: Get current user's referrals
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, rewarded, expired]
 *         description: Filter by referral status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: User referrals retrieved successfully
 *       401:
 *         description: Unauthorized - authentication required
 */
router.get("/my-referrals", combinedAuth, getUserReferralsController);

/**
 * @swagger
 * /api/referral/stats:
 *   get:
 *     tags: [Referral System]
 *     summary: Get user's referral statistics
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [all, 7d, 30d, 90d]
 *           default: all
 *         description: Time period for statistics
 *     responses:
 *       200:
 *         description: Referral statistics retrieved successfully
 *       401:
 *         description: Unauthorized - authentication required
 */
router.get("/stats", combinedAuth, getReferralStatsController);

/**
 * @swagger
 * /api/referral/claim-reward:
 *   post:
 *     tags: [Referral System]
 *     summary: Claim referral reward
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Reward claimed successfully
 *       400:
 *         description: Bad request - not enough referrals or already claimed
 *       401:
 *         description: Unauthorized - authentication required
 */
router.post("/claim-reward", combinedAuth, claimReferralRewardController);

// Public endpoints
/**
 * @swagger
 * /api/referral/complete:
 *   post:
 *     tags: [Referral System]
 *     summary: Complete a referral (when referred user signs up)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - referralCode
 *             properties:
 *               referralCode:
 *                 type: string
 *                 description: The referral code
 *               referredUserId:
 *                 type: string
 *                 description: ID of the referred user (after signup)
 *     responses:
 *       200:
 *         description: Referral completed successfully
 *       400:
 *         description: Bad request - invalid or expired referral code
 */
router.post("/complete", completeReferralController);

/**
 * @swagger
 * /api/referral/lookup/{code}:
 *   get:
 *     tags: [Referral System]
 *     summary: Lookup referral code (public)
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Referral code to lookup
 *     responses:
 *       200:
 *         description: Referral lookup successful
 *       404:
 *         description: Referral code not found or expired
 */
router.get("/lookup/:code", lookupReferralController);

// Admin endpoints
/**
 * @swagger
 * /api/referral/admin/all:
 *   get:
 *     tags: [Referral System]
 *     summary: Get all referrals (Admin only)
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, rewarded, expired]
 *         description: Filter by status
 *       - in: query
 *         name: referrerId
 *         schema:
 *           type: string
 *         description: Filter by referrer ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter end date
 *     responses:
 *       200:
 *         description: All referrals retrieved successfully
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - admin access required
 */
router.get("/admin/all", combinedAuth, requireAdmin, getAllReferralsController);

/**
 * @swagger
 * /api/referral/admin/stats:
 *   get:
 *     tags: [Referral System]
 *     summary: Get referral statistics (Admin only)
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [all, 7d, 30d, 90d]
 *           default: all
 *         description: Time period for statistics
 *     responses:
 *       200:
 *         description: Admin referral statistics retrieved successfully
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - admin access required
 */
router.get("/admin/stats", combinedAuth, requireAdmin, getAdminReferralStatsController);

/**
 * @swagger
 * /api/referral/admin/settings:
 *   put:
 *     tags: [Referral System]
 *     summary: Update referral system settings (Admin only)
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               referralRewardThreshold:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 description: Number of successful referrals needed for reward
 *               rewardType:
 *                 type: string
 *                 enum: [1_month_premium, custom_discount, credits]
 *                 description: Type of reward to give
 *               rewardValue:
 *                 type: object
 *                 description: Reward configuration
 *                 properties:
 *                   planId:
 *                   type: string
 *                   description: Plan ID for subscription rewards
 *                   discountId:
 *                   type: string
 *                   description: Discount ID for discount rewards
 *                   credits:
 *                   type: integer
 *                   description: Number of credits for credit rewards
 *                   duration:
 *                   type: integer
 *                   description: Duration in months for subscription rewards
 *               referralLinkExpiryDays:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 365
 *                 description: Days until referral link expires
 *               allowSelfReferral:
 *                 type: boolean
 *                 description: Allow users to refer themselves
 *               maxReferralsPerUser:
 *                 type: integer
 *                 minimum: 1
 *                 description: Maximum referrals per user
 *               customReferralCodePrefix:
 *                 type: string
 *                 maxLength: 10
 *                 description: Custom prefix for referral codes
 *               isActive:
 *                 type: boolean
 *                 description: Whether referral system is active
 *               customMessages:
 *                 type: object
 *                 properties:
 *                   referralSuccess:
 *                     type: string
 *                   rewardClaimed:
 *                     type: string
 *                   referralExpired:
 *                     type: string
 *     responses:
 *       200:
 *         description: Referral settings updated successfully
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - admin access required
 */
router.put("/admin/settings", combinedAuth, requireAdmin, updateReferralSettingsController);

export default router;