import { Request, Response, NextFunction } from "express";
import { ForbiddenException } from "../utils/appError";
import UserModel from "../models/user.model";

interface AuthenticatedRequest extends Request {
  user?: any;
}

const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user._id) {
      throw new ForbiddenException("Authentication required");
    }

    // Fetch fresh user data to ensure isAdmin status is current
    const user = await UserModel.findById(req.user._id).select("isAdmin");

    if (!user) {
      throw new ForbiddenException("User not found");
    }

    if (!user.isAdmin) {
      throw new ForbiddenException("Admin access required");
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default requireAdmin;
