/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management endpoints
 */

import { Router } from "express";
import { getCurrentUserController } from "../controllers/user.controller";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";

const router = Router();

/**
 * @swagger
 * /api/user/current:
 *   get:
 *     tags: [User]
 *     summary: Get current authenticated user
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/current", isAuthenticated, getCurrentUserController);

export default router;
