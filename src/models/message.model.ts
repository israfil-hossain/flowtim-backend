import mongoose, { Document, Schema } from "mongoose";

export type MessageType = 'text' | 'file' | 'image' | 'system';

export interface MessageDocument extends Document {
  content: string;
  type: MessageType;
  channelId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  replyToId?: mongoose.Types.ObjectId;
  threadCount: number;
  isEdited: boolean;
  isDeleted: boolean;
  editedAt?: Date;
  deletedAt?: Date;
  attachments: {
    _id?: mongoose.Types.ObjectId;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
  }[];
  mentions: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<MessageDocument>(
  {
    content: {
      type: String,
      required: true,
      maxlength: 4000,
    },
    type: {
      type: String,
      enum: ['text', 'file', 'image', 'system'],
      required: true,
      default: 'text',
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    replyToId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: false,
    },
    threadCount: {
      type: Number,
      default: 0,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      required: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
    attachments: [{
      fileName: {
        type: String,
        required: true,
      },
      fileUrl: {
        type: String,
        required: true,
      },
      fileSize: {
        type: Number,
        required: true,
      },
      mimeType: {
        type: String,
        required: true,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
messageSchema.index({ channelId: 1, createdAt: -1 });
messageSchema.index({ channelId: 1, isDeleted: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ replyToId: 1 });
messageSchema.index({ mentions: 1 });
messageSchema.index({ content: "text" }); // Full-text search

const MessageModel = mongoose.model<MessageDocument>(
  "Message",
  messageSchema
);

export default MessageModel;