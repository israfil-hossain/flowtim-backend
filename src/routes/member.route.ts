import { Router } from "express";
import { joinWorkspaceController } from "../controllers/member.controller";

const router = Router();

router.post("/workspace/:inviteCode/join", joinWorkspaceController);

export default router;
