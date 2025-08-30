import { Router } from "express";
import { getCurrentUserController } from "../controllers/user.controller";

const router = Router();

router.get("/current", getCurrentUserController);

export default router;
