import mongoose, { Document, Schema } from "mongoose";

export interface KanbanColumnDocument extends Document {
  name: string;
  color: string;
  position: number;
  statusMapping: string[];
  workspaceId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  isDefault: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const kanbanColumnSchema = new Schema<KanbanColumnDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      default: "#6366f1",
    },
    position: {
      type: Number,
      required: true,
    },
    statusMapping: [{
      type: String,
      enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"],
      required: true,
    }],
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
kanbanColumnSchema.index({ workspaceId: 1, position: 1 });
kanbanColumnSchema.index({ projectId: 1, position: 1 });

const KanbanColumnModel = mongoose.model<KanbanColumnDocument>("KanbanColumn", kanbanColumnSchema);

export default KanbanColumnModel;