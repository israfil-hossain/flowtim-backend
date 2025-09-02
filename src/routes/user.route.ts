import { Router } from "express";
import { getCurrentUserController } from "../controllers/user.controller";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";

const router = Router();

router.get("/current", isAuthenticated, getCurrentUserController);

export default router;
