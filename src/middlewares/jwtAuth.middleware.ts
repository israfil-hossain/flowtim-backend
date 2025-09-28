import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../utils/appError";
import { verifyAccessToken, extractTokenFromHeader, extractTokenFromCookies } from "../utils/auth.utils";
import UserModel from "../models/user.model";

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const jwtAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Try to get token from Authorization header first
    let accessToken = extractTokenFromHeader(req.headers.authorization);
    
    // If not in header, try to get from cookies
    if (!accessToken) {
      const { accessToken: cookieToken } = extractTokenFromCookies(req.cookies);
      accessToken = cookieToken;
    }
    
    if (!accessToken) {
      throw new UnauthorizedException("Access token is required");
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
      throw error;
    }
    throw new UnauthorizedException("Authentication failed");
  }
};

// Optional middleware that doesn't throw errors but just sets user if token is valid
export const optionalJwtAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Try to get token from Authorization header first
    let accessToken = extractTokenFromHeader(req.headers.authorization);
    
    // If not in header, try to get from cookies
    if (!accessToken) {
      const { accessToken: cookieToken } = extractTokenFromCookies(req.cookies);
      accessToken = cookieToken;
    }
    
    if (accessToken) {
      // Verify the access token
      const payload = verifyAccessToken(accessToken);
      
      if (payload) {
        // Get user from database
        const user = await UserModel.findById(payload.userId).select('-password');
        
        if (user) {
          // Attach user to request
          req.user = {
            _id: (user._id as any).toString(),
            email: user.email,
            name: user.name,
            profilePicture: user.profilePicture,
            currentWorkspace: user.currentWorkspace,
          };
        }
      }
    }

    next();
  } catch (error) {
    // Don't throw errors in optional auth, just continue without user
    console.error("Optional JWT auth error:", error);
    next();
  }
};

export default jwtAuth;