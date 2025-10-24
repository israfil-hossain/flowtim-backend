import mongoose, { Document, Schema } from "mongoose";

export enum NotificationType {
  TASK_ASSIGNED = "TASK_ASSIGNED",
  TASK_DUE = "TASK_DUE",
  MENTION = "MENTION",
  COMMENT = "COMMENT",
  PROJECT_UPDATE = "PROJECT_UPDATE",
  SYSTEM = "SYSTEM",
  REMINDER = "REMINDER",
}

export enum NotificationPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export interface NotificationDocument extends Document {
  type: NotificationType;
  title: string;
  message: string;
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  isRead: boolean;
  priority: NotificationPriority;
  actionUrl?: string;
  relatedTask?: mongoose.Types.ObjectId;
  relatedProject?: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: Object.values(NotificationPriority),
      default: NotificationPriority.MEDIUM,
    },
    actionUrl: {
      type: String,
    },
    relatedTask: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
    relatedProject: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const NotificationModel = mongoose.model<NotificationDocument>("Notification", notificationSchema);

export default NotificationModel;