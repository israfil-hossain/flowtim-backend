import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/database.config";
import RoleModel from "../models/roles-permission.model";
import { RolePermissions } from "../utils/role-permission";

const seedRoles = async () => {
  console.log("Seeding roles started...");

  try {
    await connectDatabase();

    // Check if roles already exist
    const existingRolesCount = await RoleModel.countDocuments();
    if (existingRolesCount > 0) {
      console.log("Roles already exist, skipping seeding.");
      return;
    }

    // Remove transaction session for standalone MongoDB
    for (const roleName in RolePermissions) {
      const role = roleName as keyof typeof RolePermissions;
      const permissions = RolePermissions[role];

      const newRole = new RoleModel({
        name: role,
        permissions: permissions,
      });
      await newRole.save();
      console.log(`Role ${role} added with permissions.`);
    }

    console.log("Seeding completed successfully.");
  } catch (error) {
    console.error("Error during seeding:", error);
  }
};

seedRoles().catch((error) =>
  console.error("Error running seed script:", error)
);
