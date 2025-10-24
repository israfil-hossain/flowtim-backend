import { UserDocument } from "../models/user.model";

declare global {
  namespace Express {
    interface User extends UserDocument {
      _id: string; // Override to be string for easier use in controllers
    }
  }
}
