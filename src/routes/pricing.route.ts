/**
 * @swagger
 * tags:
 *   name: Pricing
 *   description: Pricing plans and comparison endpoints
 */

import { Router } from "express";
import {
  getAllPricingPlansController,
  getPricingPlanController,
  getPricingComparisonController,
  createPricingPlanController,
  updatePricingPlanController,
  deletePricingPlanController,
} from "../controllers/pricing.controller";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";
import requireAdmin from "../middlewares/admin.middleware";

const router = Router();

/**
 * @swagger
 * /api/pricing/plans:
 *   get:
 *     tags: [Pricing]
 *     summary: Get all active pricing plans
 *     responses:
 *       200:
 *         description: Pricing plans retrieved successfully
 */
router.get("/plans", getAllPricingPlansController);

/**
 * @swagger
 * /api/pricing/plans/{planId}:
 *   get:
 *     tags: [Pricing]
 *     summary: Get single pricing plan
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pricing plan retrieved successfully
 *       404:
 *         description: Plan not found
 */
router.get("/plans/:planId", getPricingPlanController);

/**
 * @swagger
 * /api/pricing/comparison:
 *   get:
 *     tags: [Pricing]
 *     summary: Get pricing comparison data
 *     responses:
 *       200:
 *         description: Pricing comparison retrieved successfully
 */
router.get("/comparison", getPricingComparisonController);

// Admin routes
/**
 * @swagger
 * /api/pricing/plans:
 *   post:
 *     tags: [Pricing]
 *     summary: Create new pricing plan (Admin only)
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
 *               - description
 *               - monthlyPrice
 *               - yearlyPrice
 *               - maxUsers
 *               - maxProjects
 *               - maxStorage
 *             properties:
 *               name:
 *                 type: string
 *                 enum: [Starter, Professional, Enterprise]
 *               description:
 *                 type: string
 *               monthlyPrice:
 *                 type: number
 *               yearlyPrice:
 *                 type: number
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               limitations:
 *                 type: array
 *                 items:
 *                   type: string
 *               maxUsers:
 *                 type: number
 *               maxProjects:
 *                 type: number
 *               maxStorage:
 *                 type: number
 *     responses:
 *       201:
 *         description: Pricing plan created successfully
 *       403:
 *         description: Admin access required
 */
router.post("/plans", isAuthenticated, requireAdmin, createPricingPlanController);

/**
 * @swagger
 * /api/pricing/plans/{planId}:
 *   put:
 *     tags: [Pricing]
 *     summary: Update pricing plan (Admin only)
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pricing plan updated successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Plan not found
 */
router.put("/plans/:planId", isAuthenticated, requireAdmin, updatePricingPlanController);

/**
 * @swagger
 * /api/pricing/plans/{planId}:
 *   delete:
 *     tags: [Pricing]
 *     summary: Deactivate pricing plan (Admin only)
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pricing plan deactivated successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Plan not found
 */
router.delete("/plans/:planId", isAuthenticated, requireAdmin, deletePricingPlanController);

export default router;
