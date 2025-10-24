import express, { Response, Request } from "express";
import { HTTPSTATUS } from "../config/http.config";
import workspaceRoutes from "./workspace.route";
import { config } from "../config/app.config";
import projectRoutes from "./project.route";
import memberRoutes from "./member.route";
import taskRoutes from "./task.route";
import authRoutes from "./auth.route";
import userRoutes from "./user.route";
import documentRoutes from "./document.route";
import chatRoutes from "./chat.route";
import fileRoutes from "./file.route";
import subtaskRoutes from "./subtask.route";
import notificationRoutes from "./notification.route";
import analyticsRoutes from "./analytics.route";
import templateRoutes from "./template.route";
import kanbanRoutes from "./kanban.route";
import ganttRoutes from "./gantt.route";
import automationRoutes from "./automation.route";
import adminRoutes from "./admin.route";
import pricingRoutes from "./pricing.route";
import subscriptionRoutes from "./subscription.route";
import paymentRoutes from "./payment.route";
import stripeWebhookRoutes from "./stripe-webhook.route";
import discountRoutes from "./discount.route";
import referralRoutes from "./referral.route";

const router = express.Router();

router.use("/workspace", workspaceRoutes);
router.use("/member", memberRoutes);
router.use("/project", projectRoutes);
router.use("/task", taskRoutes);
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/document", documentRoutes);
router.use("/chat", chatRoutes);
router.use("/files", fileRoutes);
router.use("/subtasks", subtaskRoutes);
router.use("/notifications", notificationRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/templates", templateRoutes);
router.use("/kanban", kanbanRoutes);
router.use("/gantt", ganttRoutes);
router.use("/automations", automationRoutes);
router.use("/admin", adminRoutes);
router.use("/pricing", pricingRoutes);
router.use("/subscription", subscriptionRoutes);
router.use("/payment", paymentRoutes);
router.use("/stripe", stripeWebhookRoutes);
router.use("/discount", discountRoutes);
router.use("/referral", referralRoutes);

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
