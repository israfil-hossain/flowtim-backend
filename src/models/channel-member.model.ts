import mongoose, { Document, Schema } from "mongoose";

export type ChannelRole = 'admin' | 'member';

export interface ChannelMemberDocument extends Document {
  channelId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: ChannelRole;
  joinedAt: Date;
  lastReadAt?: Date;
  isActive: boolean;
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const channelMemberSchema = new Schema<ChannelMemberDocument>(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      required: true,
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate memberships
channelMemberSchema.index({ channelId: 1, userId: 1 }, { unique: true });
channelMemberSchema.index({ userId: 1, isActive: 1 });
channelMemberSchema.index({ channelId: 1, role: 1, isActive: 1 });

const ChannelMemberModel = mongoose.model<ChannelMemberDocument>(
  "ChannelMember",
  channelMemberSchema
);

export default ChannelMemberModel;