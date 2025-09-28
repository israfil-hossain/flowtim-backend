import mongoose, { Document, Schema } from "mongoose";

export enum ExecutionStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  PARTIAL = "PARTIAL",
}

export interface AutomationLogDocument extends Document {
  ruleId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  triggeredAt: Date;
  triggerData: Record<string, any>;
  actionsExecuted: Array<{
    actionType: string;
    status: ExecutionStatus;
    result?: any;
    error?: string;
    executedAt: Date;
  }>;
  overallStatus: ExecutionStatus;
  executionTime: number; // in milliseconds
  relatedTaskId?: mongoose.Types.ObjectId;
  relatedProjectId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const automationLogSchema = new Schema<AutomationLogDocument>(
  {
    ruleId: {
      type: Schema.Types.ObjectId,
      ref: "AutomationRule",
      required: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    triggeredAt: {
      type: Date,
      required: true,
    },
    triggerData: {
      type: Schema.Types.Mixed,
      default: {},
    },
    actionsExecuted: [{
      actionType: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: Object.values(ExecutionStatus),
        required: true,
      },
      result: {
        type: Schema.Types.Mixed,
      },
      error: {
        type: String,
      },
      executedAt: {
        type: Date,
        required: true,
      },
    }],
    overallStatus: {
      type: String,
      enum: Object.values(ExecutionStatus),
      required: true,
    },
    executionTime: {
      type: Number,
      required: true,
    },
    relatedTaskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
    relatedProjectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance and cleanup
automationLogSchema.index({ workspaceId: 1, createdAt: -1 });
automationLogSchema.index({ ruleId: 1, createdAt: -1 });
automationLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // Auto-delete after 30 days

const AutomationLogModel = mongoose.model<AutomationLogDocument>("AutomationLog", automationLogSchema);

export default AutomationLogModel;