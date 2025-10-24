import mongoose, { Document, Schema } from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt";
import { RolePermission } from "./role-permission.model";

export interface UserDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  profilePicture: string | null;
  isActive: boolean;
  isAdmin: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  currentWorkspace: mongoose.Types.ObjectId | null;
  rolePermissions: mongoose.Types.ObjectId;
  referralCode?: string;
  referredBy?: mongoose.Types.ObjectId;
  referralRewardClaimed: boolean;
  comparePassword(value: string): Promise<boolean>;
  omitPassword(): Omit<UserDocument, "password">;
  hasPermission(permissionPath: string): Promise<boolean>;
  canAccess(feature: string, action: string): Promise<boolean>;
  getRoleLevel(): Promise<number>;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, select: true },
    profilePicture: {
      type: String,
      default: null,
    },
    currentWorkspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },
    rolePermissions: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RolePermission",
      required: false
    },
    isActive: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      match: /^[A-Z0-9]{8,12}$/
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    referralRewardClaimed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (this: any, next) {
  if (this.isModified("password")) {
    if (this.password) {
      this.password = await hashValue(this.password);
    }
  }
  next();
});

userSchema.methods.omitPassword = function (): Omit<UserDocument, "password"> {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.methods.comparePassword = async function (value: string) {
  return compareValue(value, this.password);
};

// Permission methods
userSchema.methods.hasPermission = async function(permissionPath: string): Promise<boolean> {
  const RolePermission = mongoose.model('RolePermission');
  const role = await RolePermission.findById(this.rolePermissions);
  return role ? role.hasPermission(permissionPath) : false;
};

userSchema.methods.canAccess = async function(feature: string, action: string): Promise<boolean> {
  const RolePermission = mongoose.model('RolePermission');
  const role = await RolePermission.findById(this.rolePermissions);
  return role ? role.canAccess(feature, action) : false;
};

userSchema.methods.getRoleLevel = async function(): Promise<number> {
  const RolePermission = mongoose.model('RolePermission');
  const role = await RolePermission.findById(this.rolePermissions);
  return role ? role.getPermissionLevel() : 100; // Default to lowest level if no role found
};

// Generate referral code before saving if not present
userSchema.pre("save", async function(this: any, next) {
  if (this.isModified("password")) {
    if (this.password) {
      this.password = await hashValue(this.password);
    }
  }

  // Generate referral code if not present
  // Set default role if not present
  if (!this.rolePermissions && this.isNew) {
    const defaultRole = await RolePermission.getDefaultRole();
    if (defaultRole) {
      this.rolePermissions = defaultRole._id;
    }
  }

  if (!this.referralCode && this.isNew) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = Array.from({ length: 8 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
      attempts++;

      if (attempts > maxAttempts) {
        throw new Error('Failed to generate unique referral code after multiple attempts');
      }
    } while (await UserModel.findOne({ referralCode: code }));

    this.referralCode = code;
  }

  next();
});

const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;
