import mongoose, { Document, Schema } from "mongoose";
import { TaskPriorityEnum, TaskPriorityEnumType } from "../enums/task.enum";

export interface TemplateTaskDocument extends Document {
  template: mongoose.Types.ObjectId;
  title: string;
  description: string;
  priority: TaskPriorityEnumType;
  estimatedHours: number;
  order: number;
  dependencies: mongoose.Types.ObjectId[]; // Other template tasks this depends on
  daysFromStart: number; // Days from project start when this task should begin
  createdAt: Date;
  updatedAt: Date;
}

const templateTaskSchema = new Schema<TemplateTaskDocument>(
  {
    template: {
      type: Schema.Types.ObjectId,
      ref: "ProjectTemplate",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriorityEnum),
      default: TaskPriorityEnum.MEDIUM,
    },
    estimatedHours: {
      type: Number,
      default: 1,
      min: 0.5,
    },
    order: {
      type: Number,
      required: true,
    },
    dependencies: [{
      type: Schema.Types.ObjectId,
      ref: "TemplateTask",
    }],
    daysFromStart: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const TemplateTaskModel = mongoose.model<TemplateTaskDocument>("TemplateTask", templateTaskSchema);

export default TemplateTaskModel;