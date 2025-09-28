import mongoose, { Document, Schema } from "mongoose";

export enum TriggerType {
  TASK_STATUS_CHANGED = "TASK_STATUS_CHANGED",
  TASK_ASSIGNED = "TASK_ASSIGNED",
  DUE_DATE_APPROACHING = "DUE_DATE_APPROACHING",
  TASK_COMPLETED = "TASK_COMPLETED",
  COMMENT_ADDED = "COMMENT_ADDED",
  TIME_TRACKED = "TIME_TRACKED",
  CUSTOM_FIELD_UPDATED = "CUSTOM_FIELD_UPDATED",
}

export enum ActionType {
  ASSIGN_TASK = "ASSIGN_TASK",
  CHANGE_STATUS = "CHANGE_STATUS",
  SET_DUE_DATE = "SET_DUE_DATE",
  ADD_COMMENT = "ADD_COMMENT",
  SEND_NOTIFICATION = "SEND_NOTIFICATION",
  CREATE_SUBTASK = "CREATE_SUBTASK",
  MOVE_TO_PROJECT = "MOVE_TO_PROJECT",
  SEND_WEBHOOK = "SEND_WEBHOOK",
  SEND_EMAIL = "SEND_EMAIL",
}

export interface AutomationRuleDocument extends Document {
  name: string;
  workspaceId: mongoose.Types.ObjectId;
  triggerType: TriggerType;
  triggerConditions: Record<string, any>;
  actions: Array<{
    type: ActionType;
    config: Record<string, any>;
    order: number;
  }>;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  lastTriggered?: Date;
  triggerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const automationRuleSchema = new Schema<AutomationRuleDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    triggerType: {
      type: String,
      enum: Object.values(TriggerType),
      required: true,
    },
    triggerConditions: {
      type: Schema.Types.Mixed,
      default: {},
    },
    actions: [{
      type: {
        type: String,
        enum: Object.values(ActionType),
        required: true,
      },
      config: {
        type: Schema.Types.Mixed,
        default: {},
      },
      order: {
        type: Number,
        required: true,
      },
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastTriggered: {
      type: Date,
    },
    triggerCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
automationRuleSchema.index({ workspaceId: 1, isActive: 1 });
automationRuleSchema.index({ triggerType: 1, isActive: 1 });

const AutomationRuleModel = mongoose.model<AutomationRuleDocument>("AutomationRule", automationRuleSchema);

export default AutomationRuleModel;