import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../utils/appError";
import { verifyAccessToken, extractTokenFromHeader, extractTokenFromCookies } from "../utils/auth.utils";
import UserModel from "../models/user.model";

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const combinedAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // First check if user is already authenticated via session
    if (req.user && req.user._id) {
      return next();
    }

    // If not authenticated via session, try JWT authentication
    let accessToken = extractTokenFromHeader(req.headers.authorization);
    
    // If not in header, try to get from cookies
    if (!accessToken) {
      const { accessToken: cookieToken } = extractTokenFromCookies(req.cookies);
      accessToken = cookieToken;
    }
    
    if (!accessToken) {
      throw new UnauthorizedException("Authentication required");
    }

    // Verify the access token
    const payload = verifyAccessToken(accessToken);
    
    if (!payload) {
      throw new UnauthorizedException("Invalid or expired access token");
    }

    // Get user from database to ensure they still exist and get latest data
    const user = await UserModel.findById(payload.userId).select('-password');
    
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Attach user to request
    req.user = {
      _id: (user._id as any).toString(),
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
      currentWorkspace: user.currentWorkspace,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedException) {
      return next(error);
    }
    return next(new UnauthorizedException("Authentication failed"));
  }
};

export default combinedAuth;