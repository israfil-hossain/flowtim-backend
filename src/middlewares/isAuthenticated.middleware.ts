import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../utils/appError";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  console.log("🔐 Authentication Check Started");
  console.log("Session ID:", req.sessionID || "none");
  console.log("Session exists:", !!req.session);
  console.log("User exists:", !!req.user);
  console.log("User ID:", req.user?._id || "undefined");
  console.log("Cookies:", req.headers.cookie ? "present" : "missing");

  // Check if session exists
  if (!req.session) {
    console.log("❌ No session found");
    throw new UnauthorizedException("No session found. Please log in.");
  }

  // Check session passport data
  const passportData = (req.session as any).passport;
  console.log("Passport data in session:", !!passportData);
  
  if (passportData) {
    console.log("Passport user ID in session:", passportData.user);
  }

  // Check if user is properly authenticated
  if (!req.user || !req.user._id) {
    console.log("❌ User not authenticated - no req.user");
    throw new UnauthorizedException("Authentication required. Please log in.");
  }

  // Additional check using Passport's built-in method
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    console.log("❌ Passport authentication check failed");
    throw new UnauthorizedException("Invalid authentication state. Please log in.");
  }

  console.log("✅ Authentication successful for user:", req.user._id);
  next();
};

export default isAuthenticated;