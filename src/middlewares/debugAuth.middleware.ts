import { NextFunction, Request, Response } from "express";

const debugAuth = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === "development") {
    console.log("🔐 Authentication Debug:");
    console.log("- Session ID:", req.sessionID || "none");
    console.log("- Session exists:", !!req.session);
    console.log("- User exists:", !!req.user);
    console.log("- User ID:", req.user?._id || "undefined");
    console.log("- Authenticated:", req.isAuthenticated ? req.isAuthenticated() : false);
    console.log("- Cookies:", req.headers.cookie ? "present" : "missing");
  }
  next();
};

export default debugAuth;