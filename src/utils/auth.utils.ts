import { Response } from "express";
import { config, getCookieConfig } from "../config/app.config";

export const setSecureAuthCookie = (res: Response, sessionId: string) => {
  const cookieName = config.NODE_ENV === "production" ? "__Secure-flowtim" : "flowtim";
  const cookieOptions = getCookieConfig();
  
  res.cookie(cookieName, sessionId, cookieOptions);
  
  console.log(`Set secure auth cookie: ${cookieName}`);
};

export const clearAuthCookie = (res: Response) => {
  const cookieName = config.NODE_ENV === "production" ? "__Secure-flowtim" : "flowtim";
  const cookieOptions = getCookieConfig();
  
  res.clearCookie(cookieName, cookieOptions);
  
  console.log(`Cleared auth cookie: ${cookieName}`);
};

export const isValidSession = (req: any): boolean => {
  return !!(
    req.session && 
    req.sessionID && 
    req.user && 
    req.user._id &&
    req.isAuthenticated &&
    req.isAuthenticated()
  );
};