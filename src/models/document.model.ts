import mongoose, { Document, Schema } from "mongoose";

export interface DocumentDocument extends Document {
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  isPublic: boolean;
  attachments: {
    name: string;
    url: string;
    size: number;
    mimeType: string;
    uploadedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<DocumentDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['general', 'meeting-notes', 'specification', 'manual', 'report', 'other'],
      default: 'general',
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    attachments: [{
      name: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      size: {
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
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
documentSchema.index({ workspaceId: 1, createdAt: -1 });
documentSchema.index({ workspaceId: 1, projectId: 1 });
documentSchema.index({ workspaceId: 1, category: 1 });
documentSchema.index({ workspaceId: 1, tags: 1 });
documentSchema.index({ title: "text", content: "text" }); // Full-text search

const DocumentModel = mongoose.model<DocumentDocument>(
  "Document",
  documentSchema
);

export default DocumentModel;