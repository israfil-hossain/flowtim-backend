import express from "express";
import {
  getKanbanBoard,
  moveTask,
  getKanbanColumns,
  createKanbanColumn,
  updateKanbanColumn,
  deleteKanbanColumn,
} from "../controllers/kanban.controller";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";

const router = express.Router();

// Kanban board routes
router.get(
  "/workspaces/:workspaceId/tasks/kanban",
  isAuthenticated,
  asyncHandler(getKanbanBoard)
);

router.put(
  "/workspaces/:workspaceId/tasks/:taskId/move",
  isAuthenticated,
  asyncHandler(moveTask)
);

// Kanban columns routes
router.get(
  "/workspaces/:workspaceId/kanban/columns",
  isAuthenticated,
  asyncHandler(getKanbanColumns)
);

router.post(
  "/workspaces/:workspaceId/kanban/columns",
  isAuthenticated,
  asyncHandler(createKanbanColumn)
);

router.put(
  "/workspaces/:workspaceId/kanban/columns/:columnId",
  isAuthenticated,
  asyncHandler(updateKanbanColumn)
);

router.delete(
  "/workspaces/:workspaceId/kanban/columns/:columnId",
  isAuthenticated,
  asyncHandler(deleteKanbanColumn)
);

export default router;