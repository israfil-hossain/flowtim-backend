import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/database.config";
import UserModel from "../models/user.model";
import AccountModel from "../models/account.model";
import { ProviderEnum } from "../enums/account-provider.enum";

const seedAdmin = async () => {
  console.log("Seeding admin user started...");

  try {
    await connectDatabase();

    // Check if admin user already exists
    const existingAdmin = await UserModel.findOne({ isAdmin: true });

    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.email);
      console.log("Skipping admin user creation.");
    } else {
      // Create admin user with default credentials
      // IMPORTANT: Change these credentials in production!
      const adminUser = new UserModel({
        name: "Admin User",
        email: "admin@flowtim.com",
        password: "Admin@123", // This will be hashed by the pre-save hook
        isAdmin: true,
        isActive: true,
      });

      await adminUser.save();

      // Create corresponding account record for authentication
      const adminAccount = new AccountModel({
        userId: adminUser._id,
        provider: ProviderEnum.EMAIL,
        providerId: "admin@flowtim.com",
      });

      await adminAccount.save();

      console.log("Admin user created successfully!");
      console.log("Email: admin@flowtim.com");
      console.log("Password: Admin@123");
      console.log("IMPORTANT: Please change these credentials immediately!");
    }
  } catch (error) {
    console.error("Error during admin seeding:", error);
  } finally {
    // Disconnect from MongoDB and exit process
    await mongoose.disconnect();
    console.log("Database disconnected, exiting seeder.");
    process.exit(0);
  }
};

seedAdmin().catch((error) => {
  console.error("Error running admin seed script:", error);
  process.exit(1);
});
