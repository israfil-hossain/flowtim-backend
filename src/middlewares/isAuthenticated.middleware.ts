import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../utils/appError";
import { isValidSession } from "../utils/auth.utils";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  console.log("Auth check - Session ID:", req.sessionID);
  console.log("Auth check - User:", req.user?._id || "undefined");
  console.log("Auth check - Session exists:", !!req.session);
  console.log("Auth check - Cookies:", req.headers.cookie ? "present" : "missing");

  // Use utility function to validate session
  if (!isValidSession(req)) {
    console.log("Authentication failed - invalid session");
    throw new UnauthorizedException("Authentication required. Please log in.");
  }

  console.log("Authentication successful for user:", req.user._id);
  next();
};

export default isAuthenticated;
