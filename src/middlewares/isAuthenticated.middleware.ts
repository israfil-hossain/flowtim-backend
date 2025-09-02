import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../utils/appError";
import { isValidSession } from "../utils/auth.utils";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  console.log("=== AUTH CHECK DEBUG ===");
  console.log("Session ID:", req.sessionID);
  console.log("Session exists:", !!req.session);
  console.log("User exists:", !!req.user);
  console.log("User ID:", req.user?._id || "undefined");
  console.log("Cookies present:", req.headers.cookie ? "YES" : "NO");
  console.log("Cookie header:", req.headers.cookie);
  console.log("Is authenticated (passport):", req.isAuthenticated ? req.isAuthenticated() : "no isAuthenticated method");
  
  if (req.session) {
    console.log("Session data:", JSON.stringify(req.session, null, 2));
  }

  // Use utility function to validate session
  if (!isValidSession(req)) {
    console.log("Authentication failed - invalid session");
    console.log("=== AUTH CHECK END ===");
    throw new UnauthorizedException("Authentication required. Please log in.");
  }

  console.log("Authentication successful for user:", req.user!._id);
  console.log("=== AUTH CHECK END ===");
  next();
};

export default isAuthenticated;
