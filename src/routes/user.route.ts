/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management endpoints
 */

import { Router } from "express";
import { getCurrentUserController } from "../controllers/user.controller";
import combinedAuth from "../middlewares/combinedAuth.middleware";

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
router.get("/current", combinedAuth, getCurrentUserController);

export default router;
