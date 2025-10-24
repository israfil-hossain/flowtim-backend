
/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin panel endpoints
 */

import { Router } from "express";
import combinedAuth from "../middlewares/combinedAuth.middleware";
import requireAdmin from "../middlewares/admin.middleware";
import {
  getAllUsersController,
  getAllWorkspacesController,
  getAnalyticsController,
  getSystemSettingsController,
  updateSystemSettingsController,
  getBillingOverviewController,
  updateUserController,
  deleteUserController,
  updateWorkspaceController,
  deleteWorkspaceController,
} from "../controllers/admin.controller";

const router = Router();

// Apply authentication and admin middleware to all routes
router.use(combinedAuth);
router.use(requireAdmin);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users with pagination
 *     security:
 *       - bearerAuth: []
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       403:
 *         description: Admin access required
 */
router.get("/users", getAllUsersController);

/**
 * @swagger
 * /api/admin/workspaces:
 *   get:
 *     tags: [Admin]
 *     summary: Get all workspaces with pagination
 *     security:
 *       - bearerAuth: []
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workspaces retrieved successfully
 *       403:
 *         description: Admin access required
 */
router.get("/workspaces", getAllWorkspacesController);

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     tags: [Admin]
 *     summary: Get platform-wide analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *       403:
 *         description: Admin access required
 */
router.get("/analytics", getAnalyticsController);

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     tags: [Admin]
 *     summary: Get system configuration settings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *       403:
 *         description: Admin access required
 */
router.get("/settings", getSystemSettingsController);

/**
 * @swagger
 * /api/admin/settings:
 *   put:
 *     tags: [Admin]
 *     summary: Update system configuration
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       403:
 *         description: Admin access required
 */
router.put("/settings", updateSystemSettingsController);

/**
 * @swagger
 * /api/admin/billing:
 *   get:
 *     tags: [Admin]
 *     summary: Get billing overview and subscription stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Billing data retrieved successfully
 *       403:
 *         description: Admin access required
 */
router.get("/billing", getBillingOverviewController);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   patch:
 *     tags: [Admin]
 *     summary: Update user (activate/deactivate, toggle admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.patch("/users/:userId", updateUserController);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   delete:
 *     tags: [Admin]
 *     summary: Soft delete or deactivate user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.delete("/users/:userId", deleteUserController);

/**
 * @swagger
 * /api/admin/workspaces/{workspaceId}:
 *   patch:
 *     tags: [Admin]
 *     summary: Update workspace settings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workspace updated successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Workspace not found
 */
router.patch("/workspaces/:workspaceId", updateWorkspaceController);

/**
 * @swagger
 * /api/admin/workspaces/{workspaceId}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete workspace
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workspace deleted successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Workspace not found
 */
router.delete("/workspaces/:workspaceId", deleteWorkspaceController);

export default router;
