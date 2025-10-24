import mongoose, { Document, Schema } from "mongoose";

export interface DocumentCollaboratorDocument extends Document {
  documentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  isActive: boolean;
  lastSeenAt: Date;
  cursorPosition?: number;
  createdAt: Date;
  updatedAt: Date;
}

const documentCollaboratorSchema = new Schema<DocumentCollaboratorDocument>(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    cursorPosition: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate collaborators
documentCollaboratorSchema.index({ documentId: 1, userId: 1 }, { unique: true });
documentCollaboratorSchema.index({ documentId: 1, isActive: 1, lastSeenAt: -1 });

const DocumentCollaboratorModel = mongoose.model<DocumentCollaboratorDocument>(
  "DocumentCollaborator",
  documentCollaboratorSchema
);

export default DocumentCollaboratorModel;