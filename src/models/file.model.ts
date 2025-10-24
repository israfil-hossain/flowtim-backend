import mongoose, { Document, Schema } from "mongoose";

export interface FileDocument extends Document {
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  category: string;
  uploadedBy: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  project?: mongoose.Types.ObjectId;
  parentFolder?: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new Schema<FileDocument>(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    filePath: {
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
    category: {
      type: String,
      enum: ["image", "video", "document", "audio", "other"],
      default: "other",
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    parentFolder: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const FileModel = mongoose.model<FileDocument>("File", fileSchema);

export default FileModel;