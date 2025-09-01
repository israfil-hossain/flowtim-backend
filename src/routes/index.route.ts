import express, { Response, Request } from "express";
import { HTTPSTATUS } from "../config/http.config";
import workspaceRoutes from "./workspace.route";
import { config } from "../config/app.config";
import projectRoutes from "./project.route";
import memberRoutes from "./member.route";
import taskRoutes from "./task.route";
import authRoutes from "./auth.route";
import userRoutes from "./user.route";

const router = express.Router();

router.use("/workspace", workspaceRoutes);
router.use("/member", memberRoutes);
router.use("/project", projectRoutes);
router.use("/task", taskRoutes);
router.use("/auth", authRoutes);
router.use("/user", userRoutes);

// health check route
router.get("/health", (req: Request, res: Response) => {
  return res.status(HTTPSTATUS.OK).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV,
  });
});

// root route
router.get("/", (req: Request, res: Response) => {
  return res.status(HTTPSTATUS.OK).json({
    message: "FlowTim API is running",
    version: "1.0.0",
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

export default router;
