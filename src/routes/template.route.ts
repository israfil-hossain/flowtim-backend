import express from "express";
import {
  getPublicTemplates,
  getWorkspaceTemplates,
  createTemplate,
  getTemplateDetails,
  createProjectFromTemplate,
  updateTemplate,
  deleteTemplate,
  getPopularTemplates,
  getTemplateCategories,
} from "../controllers/template.controller";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";

const router = express.Router();

// Public template routes
router.get("/templates", asyncHandler(getPublicTemplates));
router.get("/templates/popular", asyncHandler(getPopularTemplates));
router.get("/templates/categories", asyncHandler(getTemplateCategories));
router.get("/templates/:templateId", asyncHandler(getTemplateDetails));

// Workspace template routes
router.get(
  "/workspaces/:workspaceId/templates",
  isAuthenticated,
  asyncHandler(getWorkspaceTemplates)
);

router.post(
  "/workspaces/:workspaceId/templates",
  isAuthenticated,
  asyncHandler(createTemplate)
);

router.put(
  "/workspaces/:workspaceId/templates/:templateId",
  isAuthenticated,
  asyncHandler(updateTemplate)
);

router.delete(
  "/workspaces/:workspaceId/templates/:templateId",
  isAuthenticated,
  asyncHandler(deleteTemplate)
);

// Project creation from template
router.post(
  "/workspaces/:workspaceId/projects/from-template/:templateId",
  isAuthenticated,
  asyncHandler(createProjectFromTemplate)
);

export default router;