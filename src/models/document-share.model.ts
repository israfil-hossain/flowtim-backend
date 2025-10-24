import mongoose, { Document, Schema } from "mongoose";

export type PermissionLevel = 'view' | 'comment' | 'edit' | 'admin';

export interface DocumentShareDocument extends Document {
  documentId: mongoose.Types.ObjectId;
  sharedWith: mongoose.Types.ObjectId;
  sharedBy: mongoose.Types.ObjectId;
  permission: PermissionLevel;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const documentShareSchema = new Schema<DocumentShareDocument>(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    sharedWith: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    permission: {
      type: String,
      enum: ['view', 'comment', 'edit', 'admin'],
      required: true,
      default: 'view',
    },
    expiresAt: {
      type: Date,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate shares
documentShareSchema.index({ documentId: 1, sharedWith: 1 }, { unique: true });
documentShareSchema.index({ documentId: 1, isActive: 1 });

const DocumentShareModel = mongoose.model<DocumentShareDocument>(
  "DocumentShare",
  documentShareSchema
);

export default DocumentShareModel;