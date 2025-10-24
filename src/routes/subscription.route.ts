/**
 * @swagger
 * tags:
 *   name: Subscription
 *   description: Subscription management endpoints
 */

import { Router } from "express";
import {
  getCurrentSubscriptionController,
  getAllSubscriptionsController,
  createSubscriptionController,
  updateSubscriptionController,
  cancelSubscriptionController,
  reactivateSubscriptionController,
  getWorkspaceLimitsController,
  checkCanAddUsersController,
  checkCanAddProjectsController,
  createCheckoutSessionController,
  createBillingPortalSessionController,
  getSubscriptionUsageController,
} from "../controllers/subscription.controller";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";

const router = Router();

// All routes require authentication
router.use(isAuthenticated);

/**
 * @swagger
 * /api/subscription/workspace/{workspaceId}:
 *   get:
 *     tags: [Subscription]
 *     summary: Get current subscription for workspace
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription retrieved successfully
 *       404:
 *         description: No active subscription found
 */
router.get("/workspace/:workspaceId", getCurrentSubscriptionController);

/**
 * @swagger
 * /api/subscription/all:
 *   get:
 *     tags: [Subscription]
 *     summary: Get all user subscriptions
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Subscriptions retrieved successfully
 */
router.get("/all", getAllSubscriptionsController);

/**
 * @swagger
 * /api/subscription/create:
 *   post:
 *     tags: [Subscription]
 *     summary: Create new subscription
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workspaceId
 *               - planId
 *             properties:
 *               workspaceId:
 *                 type: string
 *               planId:
 *                 type: string
 *               billingCycle:
 *                 type: string
 *                 enum: [monthly, yearly]
 *               isTrial:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Subscription created successfully
 *       400:
 *         description: Workspace already has active subscription
 */
router.post("/create", createSubscriptionController);

/**
 * @swagger
 * /api/subscription/{subscriptionId}:
 *   put:
 *     tags: [Subscription]
 *     summary: Update subscription (upgrade/downgrade)
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planId:
 *                 type: string
 *               billingCycle:
 *                 type: string
 *                 enum: [monthly, yearly]
 *     responses:
 *       200:
 *         description: Subscription updated successfully
 *       404:
 *         description: Subscription not found
 */
router.put("/:subscriptionId", updateSubscriptionController);

/**
 * @swagger
 * /api/subscription/{subscriptionId}/cancel:
 *   post:
 *     tags: [Subscription]
 *     summary: Cancel subscription
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancelAtPeriodEnd:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *       404:
 *         description: Subscription not found
 */
router.post("/:subscriptionId/cancel", cancelSubscriptionController);

/**
 * @swagger
 * /api/subscription/{subscriptionId}/reactivate:
 *   post:
 *     tags: [Subscription]
 *     summary: Reactivate cancelled subscription
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription reactivated successfully
 *       400:
 *         description: Subscription is not cancelled
 *       404:
 *         description: Subscription not found
 */
router.post("/:subscriptionId/reactivate", reactivateSubscriptionController);

/**
 * @swagger
 * /api/subscription/workspace/{workspaceId}/limits:
 *   get:
 *     tags: [Subscription]
 *     summary: Get workspace subscription limits
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workspace limits retrieved successfully
 */
router.get("/workspace/:workspaceId/limits", getWorkspaceLimitsController);

/**
 * @swagger
 * /api/subscription/workspace/{workspaceId}/check-users:
 *   post:
 *     tags: [Subscription]
 *     summary: Check if workspace can add more users
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentUserCount:
 *                 type: number
 *     responses:
 *       200:
 *         description: User limit check completed
 */
router.post("/workspace/:workspaceId/check-users", checkCanAddUsersController);

/**
 * @swagger
 * /api/subscription/workspace/{workspaceId}/check-projects:
 *   post:
 *     tags: [Subscription]
 *     summary: Check if workspace can add more projects
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentProjectCount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Project limit check completed
 */
router.post("/workspace/:workspaceId/check-projects", checkCanAddProjectsController);

/**
 * @swagger
 * /api/subscription/create-checkout-session:
 *   post:
 *     tags: [Subscription]
 *     summary: Create Stripe checkout session for subscription
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workspaceId
 *               - planId
 *               - successUrl
 *               - cancelUrl
 *             properties:
 *               workspaceId:
 *                 type: string
 *               planId:
 *                 type: string
 *               billingCycle:
 *                 type: string
 *                 enum: [monthly, yearly]
 *                 default: monthly
 *               successUrl:
 *                 type: string
 *               cancelUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 sessionId:
 *                   type: string
 *                 url:
 *                   type: string
 */
router.post("/create-checkout-session", createCheckoutSessionController);

/**
 * @swagger
 * /api/subscription/create-billing-portal-session:
 *   post:
 *     tags: [Subscription]
 *     summary: Create Stripe billing portal session
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workspaceId
 *               - returnUrl
 *             properties:
 *               workspaceId:
 *                 type: string
 *               returnUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Billing portal session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 url:
 *                   type: string
 */
router.post("/create-billing-portal-session", createBillingPortalSessionController);

/**
 * @swagger
 * /api/subscription/workspace/{workspaceId}/usage:
 *   get:
 *     tags: [Subscription]
 *     summary: Get subscription usage statistics for workspace
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription usage retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 limits:
 *                   type: object
 *                 usage:
 *                   type: object
 *                 remaining:
 *                   type: object
 *                 usagePercentage:
 *                   type: object
 */
router.get("/workspace/:workspaceId/usage", getSubscriptionUsageController);

export default router;
