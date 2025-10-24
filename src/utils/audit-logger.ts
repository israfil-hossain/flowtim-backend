import { Request } from "express";
import AuditLogModel from "../models/audit-log.model";

interface AuditLogParams {
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  req?: Request;
}

export const logAdminAction = async ({
  userId,
  action,
  resourceType,
  resourceId,
  details = {},
  req,
}: AuditLogParams): Promise<void> => {
  try {
    const auditLog = new AuditLogModel({
      userId,
      action,
      resourceType,
      resourceId: resourceId || null,
      details,
      ipAddress: req?.ip || req?.socket?.remoteAddress || null,
      userAgent: req?.get("user-agent") || null,
    });

    await auditLog.save();
    console.log(`[AUDIT] ${action} by user ${userId} on ${resourceType}${resourceId ? ` (${resourceId})` : ""}`);
  } catch (error) {
    console.error("Error logging admin action:", error);
    // Don't throw error to prevent blocking the main action
  }
};

export default logAdminAction;
