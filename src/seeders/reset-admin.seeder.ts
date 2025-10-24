import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/database.config";
import UserModel from "../models/user.model";
import AccountModel from "../models/account.model";
import { hashValue } from "../utils/bcrypt";

const resetAdmin = async () => {
  console.log("Resetting admin user started...");

  try {
    await connectDatabase();

    // Delete existing admin user and account
    await UserModel.deleteMany({ isAdmin: true });
    await AccountModel.deleteMany({ providerId: "admin@flowtim.com" });

    console.log("Existing admin user and account deleted.");

    // Create admin user with default credentials
    // IMPORTANT: Change these credentials in production!
    const adminUser = new UserModel({
      name: "Admin User",
      email: "admin@flowtim.com",
      password: "Admin@123", // Let the pre-save hook handle hashing
      isAdmin: true,
      isActive: true,
    });

    await adminUser.save();

    // Test password
    const isMatch = await adminUser.comparePassword("Admin@123");
    console.log("Password verification test:", isMatch);

    // Create corresponding account record for authentication
    const adminAccount = new AccountModel({
      userId: adminUser._id,
      provider: "EMAIL",
      providerId: "admin@flowtim.com",
    });

    await adminAccount.save();

    console.log("Admin user created successfully!");
    console.log("Email: admin@flowtim.com");
    console.log("Password: Admin@123");
    console.log("IMPORTANT: Please change these credentials immediately!");
  } catch (error) {
    console.error("Error during admin reset:", error);
  } finally {
    // Disconnect from MongoDB and exit process
    await mongoose.disconnect();
    console.log("Database disconnected, exiting reset script.");
    process.exit(0);
  }
};

resetAdmin().catch((error) => {
  console.error("Error running admin reset:", error);
  process.exit(1);
});