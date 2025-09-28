import mongoose, { Document, Schema } from "mongoose";

export interface ProjectTemplateDocument extends Document {
  name: string;
  description: string;
  category: string;
  createdBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  tags: string[];
  estimatedDuration: number; // in days
  version: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const projectTemplateSchema = new Schema<ProjectTemplateDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "web-development",
        "mobile-development",
        "marketing",
        "design",
        "research",
        "event-planning",
        "product-launch",
        "other",
      ],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    estimatedDuration: {
      type: Number,
      required: true,
      min: 1,
    },
    version: {
      type: String,
      default: "1.0.0",
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search and filtering
projectTemplateSchema.index({ name: "text", description: "text", tags: "text" });
projectTemplateSchema.index({ category: 1, isPublic: 1 });

const ProjectTemplateModel = mongoose.model<ProjectTemplateDocument>("ProjectTemplate", projectTemplateSchema);

export default ProjectTemplateModel;