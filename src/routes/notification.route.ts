import express from "express";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../controllers/notification.controller";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";

const router = express.Router();

// Notification routes
router.get(
  "/users/:userId/notifications",
  isAuthenticated,
  asyncHandler(getNotifications)
);

router.put(
  "/users/:userId/notifications/:notificationId/read",
  isAuthenticated,
  asyncHandler(markNotificationAsRead)
);

router.put(
  "/users/:userId/notifications/mark-all-read",
  isAuthenticated,
  asyncHandler(markAllNotificationsAsRead)
);

router.delete(
  "/users/:userId/notifications/:notificationId",
  isAuthenticated,
  asyncHandler(deleteNotification)
);

// Notification preferences routes
router.get(
  "/users/:userId/notification-preferences",
  isAuthenticated,
  asyncHandler(getNotificationPreferences)
);

router.put(
  "/users/:userId/notification-preferences",
  isAuthenticated,
  asyncHandler(updateNotificationPreferences)
);

export default router;