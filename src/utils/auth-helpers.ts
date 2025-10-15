import { Request } from "express";
import { AppError } from "./appError";
import { HTTPSTATUS } from "../config/http.config";

/**
 * Get authenticated user ID from request
 * Throws error if user is not authenticated
 */
export const getAuthenticatedUserId = (req: Request): string => {
  const userId = req.user?._id;
  
  if (!userId) {
    throw new AppError("Authentication required", HTTPSTATUS.UNAUTHORIZED);
  }
  
  return userId.toString();
};

/**
 * Get current workspace from authenticated user
 * Throws error if user is not authenticated or no current workspace
 */
export const getCurrentWorkspaceId = (req: Request): string => {
  const user = req.user;
  
  if (!user) {
    throw new AppError("Authentication required", HTTPSTATUS.UNAUTHORIZED);
  }
  
  if (!user.currentWorkspace) {
    throw new AppError("No active workspace found", HTTPSTATUS.BAD_REQUEST);
  }
  
  return user.currentWorkspace.toString();
};