import mongoose, { Document, Schema } from "mongoose";

export type ChannelType = 'public' | 'private' | 'direct';

export interface ChannelDocument extends Document {
  name: string;
  description?: string;
  type: ChannelType;
  workspaceId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  isArchived: boolean;
  lastMessageAt?: Date;
  membersCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new Schema<ChannelDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    type: {
      type: String,
      enum: ['public', 'private', 'direct'],
      required: true,
      default: 'public',
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    membersCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
channelSchema.index({ workspaceId: 1, type: 1, isArchived: 1 });
channelSchema.index({ workspaceId: 1, lastMessageAt: -1 });
channelSchema.index({ name: "text", description: "text" }); // Full-text search

const ChannelModel = mongoose.model<ChannelDocument>(
  "Channel",
  channelSchema
);

export default ChannelModel;