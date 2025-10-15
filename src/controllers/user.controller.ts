import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { getAuthenticatedUserId } from "../utils/auth-helpers";
import { HTTPSTATUS } from "../config/http.config";
import { getCurrentUserService } from "../services/user.service";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("User:", req.user);
    const userId = getAuthenticatedUserId(req);

    const { user } = await getCurrentUserService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User fetch successfully",
      user,
    });
  }
);
