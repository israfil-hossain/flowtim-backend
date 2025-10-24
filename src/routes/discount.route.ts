/**
 * @swagger
 * tags:
 *   name: Discount Management
 *   description: Discount and promo code management endpoints (Admin only)
 */

import { Router } from "express";
import {
  createDiscountController,
  getAllDiscountsController,
  getDiscountByIdController,
  updateDiscountController,
  deleteDiscountController,
  validateDiscountController,
  getDiscountStatsController,
  getPublicDiscountsController
} from "../controllers/discount.controller";
import { requireDiscountManagement } from "../middlewares/rbac.middleware";
import { combinedAuth } from "../middlewares/combinedAuth.middleware";

const router = Router();

/**
 * @swagger
 * /api/discount/create:
 *   post:
 *     tags: [Discount Management]
 *     summary: Create a new discount (Admin only)
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - value
 *             properties:
 *               name:
 *                 type: string
 *                 description: Discount name
 *               description:
 *                 type: string
 *                 description: Discount description
 *               type:
 *                 type: string
 *                 enum: [percentage, fixed_amount]
 *                 description: Discount type
 *               value:
 *                 type: number
 *                 description: Discount value (percentage 0-100 or fixed amount)
 *               code:
 *                 type: string
 *                 description: Promo code (for public discounts)
 *               appliesTo:
 *                 type: string
 *                 enum: [all_plans, specific_plans, first_billing, referral_reward]
 *                 description: What this discount applies to
 *               applicablePlans:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Plan IDs this discount applies to
 *               maxUses:
 *                 type: number
 *                 description: Maximum number of uses
 *               minAmount:
 *                 type: number
 *                 description: Minimum order amount
 *               maxDiscountAmount:
 *                 type: number
 *                 description: Maximum discount amount for percentage discounts
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: When discount becomes active
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: When discount expires
 *               metadata:
 *                 type: object
 *                 description: Additional metadata
 *     responses:
 *       201:
 *         description: Discount created successfully
 *       400:
 *         description: Bad request - validation error
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.post("/create", combinedAuth, requireDiscountManagement, createDiscountController);

/**
 * @swagger
 * /api/discount/all:
 *   get:
 *     tags: [Discount Management]
 *     summary: Get all discounts (Admin only)
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
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [percentage, fixed_amount]
 *         description: Filter by discount type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or description
 *     responses:
 *       200:
 *         description: Discounts retrieved successfully
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get("/all", combinedAuth, requireDiscountManagement, getAllDiscountsController);

/**
 * @swagger
 * /api/discount/{id}:
 *   get:
 *     tags: [Discount Management]
 *     summary: Get discount by ID (Admin only)
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Discount ID
 *     responses:
 *       200:
 *         description: Discount retrieved successfully
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Discount not found
 */
router.get("/:id", combinedAuth, requireDiscountManagement, getDiscountByIdController);

/**
 * @swagger
 * /api/discount/{id}:
 *   put:
 *     tags: [Discount Management]
 *     summary: Update discount (Admin only)
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Discount ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [percentage, fixed_amount]
 *               value:
 *                 type: number
 *               code:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               maxUses:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Discount updated successfully
 *       400:
 *         description: Bad request - validation error
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Discount not found
 */
router.put("/:id", combinedAuth, requireDiscountManagement, updateDiscountController);

/**
 * @swagger
 * /api/discount/{id}:
 *   delete:
 *     tags: [Discount Management]
 *     summary: Delete or deactivate discount (Admin only)
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Discount ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hardDelete:
 *                 type: boolean
 *                 default: false
 *                 description: Permanently delete discount (only if unused)
 *     responses:
 *       200:
 *         description: Discount deleted/deactivated successfully
 *       400:
 *         description: Bad request - cannot delete used discount
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Discount not found
 */
router.delete("/:id", combinedAuth, requireDiscountManagement, deleteDiscountController);

/**
 * @swagger
 * /api/discount/validate:
 *   post:
 *     tags: [Discount Management]
 *     summary: Validate discount code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: Discount code to validate
 *               planId:
 *                 type: string
 *                 description: Plan ID to check applicability
 *               amount:
 *                 type: number
 *                 description: Order amount to check minimum requirements
 *     responses:
 *       200:
 *         description: Discount validation result
 *       400:
 *         description: Bad request - invalid code
 */
router.post("/validate", validateDiscountController);

/**
 * @swagger
 * /api/discount/stats:
 *   get:
 *     tags: [Discount Management]
 *     summary: Get discount statistics (Admin only)
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
 *         description: Discount statistics retrieved successfully
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get("/stats", combinedAuth, requireDiscountManagement, getDiscountStatsController);

/**
 * @swagger
 * /api/discount/public:
 *   get:
 *     tags: [Discount Management]
 *     summary: Get active public discounts
 *     description: Returns all active public discounts that users can apply
 *     responses:
 *       200:
 *         description: Public discounts retrieved successfully
 */
router.get("/public", getPublicDiscountsController);

export default router;