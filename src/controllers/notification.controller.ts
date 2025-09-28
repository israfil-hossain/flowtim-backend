import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import NotificationModel, { NotificationType, NotificationPriority } from "../models/notification.model";
import NotificationPreferencesModel from "../models/notification-preferences.model";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, isRead } = req.query;

    const filter: any = { recipient: userId };
    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }

    const notifications = await NotificationModel.find(filter)
      .populate("sender", "name email")
      .populate("relatedTask", "title taskCode")
      .populate("relatedProject", "name")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await NotificationModel.countDocuments(filter);
    const unreadCount = await NotificationModel.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    const notification = await NotificationModel.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    await NotificationModel.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to mark all notifications as read",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    const notification = await NotificationModel.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete notification",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const preferences = await NotificationPreferencesModel.find({ user: userId });

    // If no preferences exist, create default ones
    if (preferences.length === 0) {
      const defaultPreferences = Object.values(NotificationType).map(type => ({
        user: userId,
        notificationType: type,
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
      }));

      await NotificationPreferencesModel.insertMany(defaultPreferences);
      const newPreferences = await NotificationPreferencesModel.find({ user: userId });

      return res.status(HTTPSTATUS.OK).json({
        success: true,
        data: newPreferences,
      });
    }

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch notification preferences",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { preferences } = req.body; // Array of preference objects

    const updatePromises = preferences.map((pref: any) =>
      NotificationPreferencesModel.findOneAndUpdate(
        { user: userId, notificationType: pref.notificationType },
        {
          emailEnabled: pref.emailEnabled,
          pushEnabled: pref.pushEnabled,
          inAppEnabled: pref.inAppEnabled,
        },
        { upsert: true, new: true }
      )
    );

    const updatedPreferences = await Promise.all(updatePromises);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Notification preferences updated successfully",
      data: updatedPreferences,
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update notification preferences",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Helper function to create notifications (used by other controllers)
export const createNotification = async (data: {
  type: NotificationType;
  title: string;
  message: string;
  recipient: string;
  sender?: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  relatedTask?: string;
  relatedProject?: string;
  workspace: string;
}) => {
  try {
    const notification = new NotificationModel(data);
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};