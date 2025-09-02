import { Response } from "express";
import { config, getCookieConfig } from "../config/app.config";

export const setSecureAuthCookie = (res: Response, sessionId: string) => {
  const cookieName = config.NODE_ENV === "production" ? "__Secure-flowtim" : "flowtim";
  const cookieOptions = getCookieConfig();
  
  res.cookie(cookieName, sessionId, cookieOptions);
  
  console.log(`🍪 Set secure auth cookie: ${cookieName}`);
};

export const clearAuthCookie = (res: Response) => {
  const cookieName = config.NODE_ENV === "production" ? "__Secure-flowtim" : "flowtim";
  const cookieOptions = getCookieConfig();
  
  res.clearCookie(cookieName, cookieOptions);
  
  console.log(`🗑️ Cleared auth cookie: ${cookieName}`);
};

export const isValidSession = (req: any): boolean => {
  const hasSession = !!(req.session && req.sessionID);
  const hasUser = !!(req.user && req.user._id);
  const isAuthenticated = !!(req.isAuthenticated && req.isAuthenticated());
  
  console.log("Session validation:", {
    hasSession,
    hasUser,
    isAuthenticated,
    sessionId: req.sessionID || "none",
    userId: req.user?._id || "none"
  });
  
  return hasSession && hasUser && isAuthenticated;
};