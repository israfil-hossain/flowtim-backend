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

router.post("/create/new", createWorkspaceController);
router.put("/update/:id", updateWorkspaceByIdController);

router.put("/change/member/role/:id", changeWorkspaceMemberRoleController);

router.delete("/delete/:id", deleteWorkspaceByIdController);

router.get("/all", getAllWorkspacesUserIsMemberController);

router.get("/members/:id", getWorkspaceMembersController);
router.get("/analytics/:id", getWorkspaceAnalyticsController);

router.get("/:id", getWorkspaceByIdController);

export default router;
