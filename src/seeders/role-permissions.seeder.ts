import mongoose from "mongoose";
import { RolePermission, IRolePermission } from "../models/role-permission.model";
import User from "../models/user.model";
import dotenv from "dotenv";

dotenv.config();

/**
 * Seeder script to create default role permissions and assign to existing users
 */

const createDefaultRoles = async () => {
  try {
    console.log("📋 Creating default role permissions...");

    // Get admin user (assuming first admin user or a specific admin)
    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      console.log("⚠️  No admin user found. Skipping role creation.");
      return;
    }

    // Create default roles
    const roles = await RolePermission.createDefaultRoles(adminUser._id.toString());

    console.log(`✅ Created ${roles.length} default roles:`);
    roles.forEach((role: IRolePermission) => {
      console.log(`   - ${role.displayName} (${role.name}) - Level ${role.level}`);
    });

    // Update existing users without roles to have default role
    const defaultRole = await RolePermission.getDefaultRole();
    if (defaultRole) {
      const result = await User.updateMany(
        { rolePermissions: { $exists: false } },
        { $set: { rolePermissions: defaultRole._id } }
      );

      if (result.modifiedCount > 0) {
        console.log(`✅ Assigned default role to ${result.modifiedCount} existing users`);
      }
    }

    console.log("🎉 Role permissions seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error creating role permissions:", error);
    throw error;
  }
};

// Update admin users to have super admin role
const assignAdminRoles = async () => {
  try {
    console.log("👑 Assigning admin roles...");

    const superAdminRole = await RolePermission.getRoleByName('super_admin');
    const adminRole = await RolePermission.getRoleByName('admin');

    if (!superAdminRole) {
      console.log("⚠️  Super admin role not found. Please run the default roles seeder first.");
      return;
    }

    // Update all admin users to have super admin role
    const adminResult = await User.updateMany(
      { isAdmin: true },
      { $set: { rolePermissions: superAdminRole._id } }
    );

    console.log(`✅ Assigned super admin role to ${adminResult.modifiedCount} admin users`);

    console.log("🎉 Admin role assignment completed!");
  } catch (error) {
    console.error("❌ Error assigning admin roles:", error);
    throw error;
  }
};

// Display current role statistics
const displayRoleStats = async () => {
  try {
    console.log("\n📊 Current Role Statistics:");

    const roles = await RolePermission.getAllRoles();
    console.log(`Total roles: ${roles.length}`);

    const roleStats = await User.aggregate([
      {
        $lookup: {
          from: 'rolepermissions',
          localField: 'rolePermissions',
          foreignField: '_id',
          as: 'role'
        }
      },
      {
        $group: {
          _id: '$role.displayName',
          count: { $sum: 1 },
          role: { $first: '$role' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log("\nUser distribution by role:");
    roleStats.forEach((stat: any) => {
      console.log(`   ${stat._id}: ${stat.count} users (Level ${stat.role.level})`);
    });

    console.log("\nRole hierarchy (lower number = higher privilege):");
    roles.forEach((role: IRolePermission) => {
      const adminPerms = Object.keys(role.permissions.admin).filter(
        (key: string) => typeof (role.permissions.admin as any)[key] === 'object' ?
          Object.values((role.permissions.admin as any)[key]).some(Boolean) :
          (role.permissions.admin as any)[key]
      ).length;

      console.log(`   Level ${role.level}: ${role.displayName} - ${adminPerms} admin permissions`);
    });

  } catch (error) {
    console.error("❌ Error displaying role stats:", error);
  }
};

// Main function
const seedRoles = async () => {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is required in environment variables");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🔗 Connected to MongoDB");

    // Run seeding functions
    await createDefaultRoles();
    await assignAdminRoles();
    await displayRoleStats();

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  seedRoles();
}

export { seedRoles, createDefaultRoles, assignAdminRoles, displayRoleStats };