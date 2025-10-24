import mongoose, { Document, Schema } from "mongoose";

export type UserStatusType = 'online' | 'offline' | 'away' | 'busy';

export interface UserStatusDocument extends Document {
  userId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  status: UserStatusType;
  lastSeenAt: Date;
  isTyping: boolean;
  typingInChannel?: mongoose.Types.ObjectId;
  statusMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userStatusSchema = new Schema<UserStatusDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'away', 'busy'],
      required: true,
      default: 'offline',
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    isTyping: {
      type: Boolean,
      default: false,
    },
    typingInChannel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: false,
    },
    statusMessage: {
      type: String,
      maxlength: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate status records
userStatusSchema.index({ userId: 1, workspaceId: 1 }, { unique: true });
userStatusSchema.index({ workspaceId: 1, status: 1, lastSeenAt: -1 });
userStatusSchema.index({ typingInChannel: 1, isTyping: 1 });

const UserStatusModel = mongoose.model<UserStatusDocument>(
  "UserStatus",
  userStatusSchema
);

export default UserStatusModel;