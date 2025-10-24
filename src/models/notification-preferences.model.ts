import mongoose, { Document, Schema } from "mongoose";
import { NotificationType } from "./notification.model";

export interface NotificationPreferencesDocument extends Document {
  user: mongoose.Types.ObjectId;
  notificationType: NotificationType;
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationPreferencesSchema = new Schema<NotificationPreferencesDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notificationType: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    emailEnabled: {
      type: Boolean,
      default: true,
    },
    pushEnabled: {
      type: Boolean,
      default: true,
    },
    inAppEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one preference per user per notification type
notificationPreferencesSchema.index({ user: 1, notificationType: 1 }, { unique: true });

const NotificationPreferencesModel = mongoose.model<NotificationPreferencesDocument>(
  "NotificationPreferences",
  notificationPreferencesSchema
);

export default NotificationPreferencesModel;