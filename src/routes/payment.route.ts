/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment and billing history endpoints
 */

import { Router } from "express";
import {
  getPaymentHistoryController,
  getPaymentController,
  getPaymentStatsController,
  getSubscriptionPaymentsController,
  requestRefundController,
  downloadInvoiceController,
  getUpcomingInvoiceController,
} from "../controllers/payment.controller";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";

const router = Router();

// All routes require authentication
router.use(isAuthenticated);

/**
 * @swagger
 * /api/payment/history:
 *   get:
 *     tags: [Payment]
 *     summary: Get user payment history
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 */
router.get("/history", getPaymentHistoryController);

/**
 * @swagger
 * /api/payment/stats:
 *   get:
 *     tags: [Payment]
 *     summary: Get payment statistics
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Payment statistics retrieved successfully
 */
router.get("/stats", getPaymentStatsController);

/**
 * @swagger
 * /api/payment/{paymentId}:
 *   get:
 *     tags: [Payment]
 *     summary: Get single payment details
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 *       404:
 *         description: Payment not found
 */
router.get("/:paymentId", getPaymentController);

/**
 * @swagger
 * /api/payment/subscription/{subscriptionId}:
 *   get:
 *     tags: [Payment]
 *     summary: Get payments for a specific subscription
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
 *         description: Subscription payments retrieved successfully
 */
router.get("/subscription/:subscriptionId", getSubscriptionPaymentsController);

/**
 * @swagger
 * /api/payment/{paymentId}/refund:
 *   post:
 *     tags: [Payment]
 *     summary: Request a refund for a payment
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refundAmount:
 *                 type: number
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Refund processed successfully
 *       400:
 *         description: Invalid refund amount
 */
router.post("/:paymentId/refund", requestRefundController);

/**
 * @swagger
 * /api/payment/{paymentId}/invoice:
 *   get:
 *     tags: [Payment]
 *     summary: Download invoice/receipt for a payment
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice URL retrieved successfully
 *       404:
 *         description: Payment not found or no receipt available
 */
router.get("/:paymentId/invoice", downloadInvoiceController);

/**
 * @swagger
 * /api/payment/workspace/{workspaceId}/upcoming-invoice:
 *   get:
 *     tags: [Payment]
 *     summary: Get upcoming invoice information
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
 *         description: Upcoming invoice retrieved successfully
 *       404:
 *         description: No active subscription found
 */
router.get("/workspace/:workspaceId/upcoming-invoice", getUpcomingInvoiceController);

export default router;
