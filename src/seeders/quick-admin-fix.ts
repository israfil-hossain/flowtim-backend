import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/database.config";
import UserModel from "../models/user.model";
import AccountModel from "../models/account.model";

const quickFix = async () => {
  console.log("Quick admin fix started...");

  try {
    await connectDatabase();

    // Delete existing admin records
    await UserModel.deleteMany({ isAdmin: true });
    await AccountModel.deleteMany({ providerId: "admin@flowtim.com" });

    console.log("Existing admin records deleted.");

    // Create admin user directly without pre-save hook issues
    const adminUser = new UserModel({
      name: "Admin User",
      email: "admin@flowtim.com",
      password: "Admin@123",
      isAdmin: true,
      isActive: true,
    });

    await adminUser.save();

    // Verify password works immediately
    const isMatch = await adminUser.comparePassword("Admin@123");
    console.log("Password verification:", isMatch);

    if (!isMatch) {
      throw new Error("Password verification failed immediately after creation");
    }

    // Create account record
    const adminAccount = new AccountModel({
      userId: adminUser._id,
      provider: "EMAIL",
      providerId: "admin@flowtim.com",
    });

    await adminAccount.save();

    console.log("✅ Admin setup complete!");
    console.log("Email: admin@flowtim.com");
    console.log("Password: Admin@123");
    console.log("Password verification:", isMatch);

  } catch (error) {
    console.error("Error during quick fix:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

quickFix().catch((error) => {
  console.error("Error running quick fix:", error);
  process.exit(1);
});