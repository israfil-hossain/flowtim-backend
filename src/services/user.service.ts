import UserModel from "../models/user.model";
import SubscriptionModel from "../models/subscription.model";
import { BadRequestException } from "../utils/appError";

export const getCurrentUserService = async (userId: string) => {
  const user = await UserModel.findById(userId)
    .populate("currentWorkspace")
    .select("-password");

  if (!user) {
    throw new BadRequestException("User not found");
  }

  // Get subscription info if user has a current workspace
  let subscription = null;
  if (user.currentWorkspace) {
    subscription = await SubscriptionModel.findOne({
      workspace: user.currentWorkspace,
      status: { $in: ["active", "trial"] },
    }).populate("plan");
  }

  return {
    user,
    subscription,
  };
};
