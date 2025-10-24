import { NextFunction, Request, Response } from "express";

const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} - ${req.path}`);
  console.log(`🆔 Session ID: ${req.sessionID || 'none'}`);
  console.log(`🍪 Cookies: ${req.headers.cookie ? 'present' : 'missing'}`);
  if (req.headers.cookie) {
    console.log(`🍪 Cookie header: ${req.headers.cookie}`);
  }
  console.log(`👤 User: ${req.user ? req.user._id : 'none'}`);
  console.log('---');
  next();
};

export default loggerMiddleware;
