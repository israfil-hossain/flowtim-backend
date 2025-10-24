import mongoose, { Document, Schema } from "mongoose";

export interface MessageReactionDocument extends Document {
  messageId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  emoji: string;
  createdAt: Date;
}

const messageReactionSchema = new Schema<MessageReactionDocument>(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    emoji: {
      type: String,
      required: true,
      maxlength: 10, // Support for Unicode emojis
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound unique index to prevent duplicate reactions
messageReactionSchema.index({ messageId: 1, userId: 1, emoji: 1 }, { unique: true });
messageReactionSchema.index({ messageId: 1 });
messageReactionSchema.index({ userId: 1, createdAt: -1 });

const MessageReactionModel = mongoose.model<MessageReactionDocument>(
  "MessageReaction",
  messageReactionSchema
);

export default MessageReactionModel;