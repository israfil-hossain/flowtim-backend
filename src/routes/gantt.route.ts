import express from "express";
import {
  getGanttData,
  updateTaskTimeline,
  getProjectTimeline,
  addTaskDependency,
  removeTaskDependency,
} from "../controllers/gantt.controller";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";

const router = express.Router();

// Gantt chart routes
router.get(
  "/workspaces/:workspaceId/tasks/gantt",
  isAuthenticated,
  asyncHandler(getGanttData)
);

router.put(
  "/workspaces/:workspaceId/tasks/:taskId/timeline",
  isAuthenticated,
  asyncHandler(updateTaskTimeline)
);

router.get(
  "/workspaces/:workspaceId/projects/:projectId/timeline",
  isAuthenticated,
  asyncHandler(getProjectTimeline)
);

// Task dependencies routes
router.post(
  "/workspaces/:workspaceId/tasks/:taskId/dependencies",
  isAuthenticated,
  asyncHandler(addTaskDependency)
);

router.delete(
  "/workspaces/:workspaceId/tasks/:taskId/dependencies/:dependencyId",
  isAuthenticated,
  asyncHandler(removeTaskDependency)
);

export default router;