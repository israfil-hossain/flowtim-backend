import express from "express";
import {
  getWorkspaceAnalytics,
  getProductivityMetrics,
  getTeamPerformance,
  getProjectInsights,
} from "../controllers/analytics.controller";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";

const router = express.Router();

// Analytics routes
router.get(
  "/dashboard/:workspaceId",
  isAuthenticated,
  asyncHandler(getWorkspaceAnalytics)
);

router.get(
  "/productivity/:workspaceId",
  isAuthenticated,
  asyncHandler(getProductivityMetrics)
);

router.get(
  "/team-performance/:workspaceId",
  isAuthenticated,
  asyncHandler(getTeamPerformance)
);

router.get(
  "/project-insights/:projectId",
  isAuthenticated,
  asyncHandler(getProjectInsights)
);

export default router;