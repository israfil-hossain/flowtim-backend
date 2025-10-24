import mongoose, { Document, Schema } from "mongoose";

export enum DependencyType {
  FINISH_TO_START = "FINISH_TO_START",
  START_TO_START = "START_TO_START",
  FINISH_TO_FINISH = "FINISH_TO_FINISH",
  START_TO_FINISH = "START_TO_FINISH",
}

export interface TaskDependencyDocument extends Document {
  taskId: mongoose.Types.ObjectId;
  dependsOnTaskId: mongoose.Types.ObjectId;
  dependencyType: DependencyType;
  workspaceId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskDependencySchema = new Schema<TaskDependencyDocument>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    dependsOnTaskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    dependencyType: {
      type: String,
      enum: Object.values(DependencyType),
      default: DependencyType.FINISH_TO_START,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
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

// Indexes for performance
taskDependencySchema.index({ taskId: 1 });
taskDependencySchema.index({ dependsOnTaskId: 1 });
taskDependencySchema.index({ workspaceId: 1 });

// Prevent circular dependencies
taskDependencySchema.index({ taskId: 1, dependsOnTaskId: 1 }, { unique: true });

const TaskDependencyModel = mongoose.model<TaskDependencyDocument>("TaskDependency", taskDependencySchema);

export default TaskDependencyModel;