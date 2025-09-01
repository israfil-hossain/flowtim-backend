import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../utils/appError";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  console.log("Auth check - Session:", req.session);
  console.log("Auth check - User:", req.user);
  console.log("Auth check - Cookies:", req.headers.cookie);

  if (!req.user || !req.user._id) {
    console.log("Authentication failed - no user or user._id");
    throw new UnauthorizedException("Unauthorized. Please log in.");
  }

  console.log("Authentication successful for user:", req.user._id);
  next();
};

export default isAuthenticated;
