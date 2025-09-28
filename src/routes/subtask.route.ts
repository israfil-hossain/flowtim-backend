import express from "express";
import {
  getSubtasks,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  reorderSubtasks,
  getTaskProgress,
} from "../controllers/subtask.controller";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";

const router = express.Router();

// Subtask routes
router.get(
  "/workspaces/:workspaceId/tasks/:taskId/subtasks",
  isAuthenticated,
  asyncHandler(getSubtasks)
);

router.post(
  "/workspaces/:workspaceId/tasks/:taskId/subtasks",
  isAuthenticated,
  asyncHandler(createSubtask)
);

router.put(
  "/workspaces/:workspaceId/subtasks/:subtaskId",
  isAuthenticated,
  asyncHandler(updateSubtask)
);

router.delete(
  "/workspaces/:workspaceId/subtasks/:subtaskId",
  isAuthenticated,
  asyncHandler(deleteSubtask)
);

router.put(
  "/workspaces/:workspaceId/subtasks/:taskId/reorder",
  isAuthenticated,
  asyncHandler(reorderSubtasks)
);

router.get(
  "/workspaces/:workspaceId/tasks/:taskId/progress",
  isAuthenticated,
  asyncHandler(getTaskProgress)
);

export default router;