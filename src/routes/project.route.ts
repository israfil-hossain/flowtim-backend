import { Router } from "express";
import {
  createProjectController,
  deleteProjectController,
  getAllProjectsInWorkspaceController,
  getProjectAnalyticsController,
  getProjectByIdAndWorkspaceIdController,
  updateProjectController,
} from "../controllers/project.controller";

const router = Router();

router.post("/workspace/:workspaceId/create", createProjectController);

router.put("/:id/workspace/:workspaceId/update", updateProjectController);

router.delete("/:id/workspace/:workspaceId/delete", deleteProjectController);

router.get("/workspace/:workspaceId/all", getAllProjectsInWorkspaceController);

router.get(
  "/:id/workspace/:workspaceId/analytics",
  getProjectAnalyticsController
);

router.get(
  "/:id/workspace/:workspaceId",
  getProjectByIdAndWorkspaceIdController
);

export default router;
