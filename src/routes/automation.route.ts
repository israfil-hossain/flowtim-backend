import express from "express";
import {
  getAutomationRules,
  createAutomationRule,
  updateAutomationRule,
  deleteAutomationRule,
  testAutomationRule,
  getAutomationLogs,
  getAutomationTemplates,
} from "../controllers/automation.controller";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";

const router = express.Router();

// Automation rules routes
router.get(
  "/workspaces/:workspaceId/automations",
  isAuthenticated,
  asyncHandler(getAutomationRules)
);

router.post(
  "/workspaces/:workspaceId/automations",
  isAuthenticated,
  asyncHandler(createAutomationRule)
);

router.put(
  "/workspaces/:workspaceId/automations/:ruleId",
  isAuthenticated,
  asyncHandler(updateAutomationRule)
);

router.delete(
  "/workspaces/:workspaceId/automations/:ruleId",
  isAuthenticated,
  asyncHandler(deleteAutomationRule)
);

router.post(
  "/workspaces/:workspaceId/automations/:ruleId/test",
  isAuthenticated,
  asyncHandler(testAutomationRule)
);

// Automation logs routes
router.get(
  "/workspaces/:workspaceId/automations/:ruleId/logs",
  isAuthenticated,
  asyncHandler(getAutomationLogs)
);

// Automation templates routes
router.get(
  "/workspaces/:workspaceId/automation-templates",
  isAuthenticated,
  asyncHandler(getAutomationTemplates)
);

export default router;