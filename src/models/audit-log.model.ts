import mongoose, { Document, Schema } from "mongoose";

export interface AuditLogDocument extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  resourceType: string;
  resourceId: string | null;
  details: Record<string, any>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

const auditLogSchema = new Schema<AuditLogDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      // Examples: 'USER_UPDATE', 'USER_DELETE', 'WORKSPACE_UPDATE', 'WORKSPACE_DELETE', 'SETTINGS_UPDATE'
    },
    resourceType: {
      type: String,
      required: true,
      // Examples: 'user', 'workspace', 'settings'
    },
    resourceId: {
      type: String,
      default: null,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
      // Can store any additional information about the action
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for better query performance
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });
auditLogSchema.index({ action: 1 });

const AuditLogModel = mongoose.model<AuditLogDocument>(
  "AuditLog",
  auditLogSchema
);

export default AuditLogModel;
