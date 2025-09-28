/**
 * @swagger
 * tags:
 *   name: Workspace
 *   description: Workspace management endpoints
 */

import { Router } from "express";
import {
  changeWorkspaceMemberRoleController,
  createWorkspaceController,
  deleteWorkspaceByIdController,
  getAllWorkspacesUserIsMemberController,
  getWorkspaceAnalyticsController,
  getWorkspaceByIdController,
  getWorkspaceMembersController,
  updateWorkspaceByIdController,
} from "../controllers/workspace.controller";

const router = Router();

/**
 * @swagger
 * /api/workspace/create/new:
 *   post:
 *     tags: [Workspace]
 *     summary: Create a new workspace
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Workspace name
 *               description:
 *                 type: string
 *                 description: Workspace description
 *     responses:
 *       201:
 *         description: Workspace created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 workspace:
 *                   $ref: '#/components/schemas/Workspace'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/create/new", createWorkspaceController);
/**
 * @swagger
 * /api/workspace/update/{id}:
 *   put:
 *     tags: [Workspace]
 *     summary: Update workspace by ID
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
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
 *     responses:
 *       200:
 *         description: Workspace updated successfully
 *       404:
 *         description: Workspace not found
 */
router.put("/update/:id", updateWorkspaceByIdController);

router.put("/change/member/role/:id", changeWorkspaceMemberRoleController);

router.delete("/delete/:id", deleteWorkspaceByIdController);

/**
 * @swagger
 * /api/workspace/all:
 *   get:
 *     tags: [Workspace]
 *     summary: Get all workspaces where user is a member
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: List of user workspaces
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 workspaces:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Workspace'
 */
router.get("/all", getAllWorkspacesUserIsMemberController);

router.get("/members/:id", getWorkspaceMembersController);
router.get("/analytics/:id", getWorkspaceAnalyticsController);

/**
 * @swagger
 * /api/workspace/{id}:
 *   get:
 *     tags: [Workspace]
 *     summary: Get workspace by ID
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *     responses:
 *       200:
 *         description: Workspace details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 workspace:
 *                   $ref: '#/components/schemas/Workspace'
 *       404:
 *         description: Workspace not found
 */
router.get("/:id", getWorkspaceByIdController);

export default router;
