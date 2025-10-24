import mongoose, { Document, Schema } from "mongoose";

export interface DocumentVersionDocument extends Document {
  documentId: mongoose.Types.ObjectId;
  version: number;
  title: string;
  content: string;
  changes: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const documentVersionSchema = new Schema<DocumentVersionDocument>(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    version: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    changes: {
      type: String,
      required: false,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for efficient version queries
documentVersionSchema.index({ documentId: 1, version: -1 });

const DocumentVersionModel = mongoose.model<DocumentVersionDocument>(
  "DocumentVersion",
  documentVersionSchema
);

export default DocumentVersionModel;