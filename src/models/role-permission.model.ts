import mongoose, { Document, Schema } from "mongoose";

export interface IRolePermission extends Document {
  name: string;
  displayName: string;
  description?: string;
  level: number; // Hierarchy level (0 = highest, 100 = lowest)
  permissions: {
    // Admin permissions
    admin: {
      dashboard: boolean;
      users: {
        read: boolean;
        create: boolean;
        update: boolean;
        delete: boolean;
        manageRoles: boolean;
      };
      workspaces: {
        read: boolean;
        create: boolean;
        update: boolean;
        delete: boolean;
        manageMembers: boolean;
      };
      billing: {
        read: boolean;
        manage: boolean;
        refunds: boolean;
        discounts: boolean;
      };
      analytics: {
        read: boolean;
        export: boolean;
        configureReports: boolean;
      };
      settings: {
        read: boolean;
        update: boolean;
        systemConfig: boolean;
      };
    };
    // Workspace permissions
    workspace: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      manageMembers: boolean;
      changeRoles: boolean;
      viewAnalytics: boolean;
      manageSettings: boolean;
    };
    // Project permissions
    project: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      manageMembers: boolean;
      duplicate: boolean;
      viewAnalytics: boolean;
    };
    // Task permissions
    task: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      assign: boolean;
      trackTime: boolean;
      addComments: boolean;
      manageDependencies: boolean;
    };
    // File permissions
    file: {
      upload: boolean;
      download: boolean;
      delete: boolean;
      share: boolean;
      manageStorage: boolean;
    };
    // Chat permissions
    chat: {
      read: boolean;
      write: boolean;
      createChannels: boolean;
      manageChannels: boolean;
      deleteMessages: boolean;
    };
    // Subscription permissions
    subscription: {
      view: boolean;
      upgrade: boolean;
      downgrade: boolean;
      cancel: boolean;
      manageBilling: boolean;
    };
    // Referral permissions
    referral: {
      view: boolean;
      create: boolean;
      manage: boolean;
      viewStats: boolean;
    };
  };
  isDefault: boolean;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const rolePermissionSchema = new Schema<IRolePermission>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[a-z_]+$/
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  level: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  permissions: {
    admin: {
      dashboard: { type: Boolean, default: false },
      users: {
        read: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        manageRoles: { type: Boolean, default: false }
      },
      workspaces: {
        read: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        manageMembers: { type: Boolean, default: false }
      },
      billing: {
        read: { type: Boolean, default: false },
        manage: { type: Boolean, default: false },
        refunds: { type: Boolean, default: false },
        discounts: { type: Boolean, default: false }
      },
      analytics: {
        read: { type: Boolean, default: false },
        export: { type: Boolean, default: false },
        configureReports: { type: Boolean, default: false }
      },
      settings: {
        read: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        systemConfig: { type: Boolean, default: false }
      }
    },
    workspace: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      manageMembers: { type: Boolean, default: false },
      changeRoles: { type: Boolean, default: false },
      viewAnalytics: { type: Boolean, default: false },
      manageSettings: { type: Boolean, default: false }
    },
    project: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      manageMembers: { type: Boolean, default: false },
      duplicate: { type: Boolean, default: false },
      viewAnalytics: { type: Boolean, default: false }
    },
    task: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      assign: { type: Boolean, default: false },
      trackTime: { type: Boolean, default: false },
      addComments: { type: Boolean, default: false },
      manageDependencies: { type: Boolean, default: false }
    },
    file: {
      upload: { type: Boolean, default: false },
      download: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      share: { type: Boolean, default: false },
      manageStorage: { type: Boolean, default: false }
    },
    chat: {
      read: { type: Boolean, default: false },
      write: { type: Boolean, default: false },
      createChannels: { type: Boolean, default: false },
      manageChannels: { type: Boolean, default: false },
      deleteMessages: { type: Boolean, default: false }
    },
    subscription: {
      view: { type: Boolean, default: false },
      upgrade: { type: Boolean, default: false },
      downgrade: { type: Boolean, default: false },
      cancel: { type: Boolean, default: false },
      manageBilling: { type: Boolean, default: false }
    },
    referral: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      manage: { type: Boolean, default: false },
      viewStats: { type: Boolean, default: false }
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
rolePermissionSchema.index({ name: 1 }, { unique: true });
rolePermissionSchema.index({ level: 1 });
rolePermissionSchema.index({ isActive: 1 });

// Methods
rolePermissionSchema.methods.hasPermission = function(permissionPath: string): boolean {
  const path = permissionPath.split('.');
  let current: any = this.permissions;

  for (const segment of path) {
    if (current[segment] === undefined) {
      return false;
    }
    current = current[segment];
  }

  return Boolean(current);
};

rolePermissionSchema.methods.canAccess = function(feature: string, action: string): boolean {
  return this.hasPermission(`${feature}.${action}`);
};

rolePermissionSchema.methods.getPermissionLevel = function(): number {
  return this.level;
};

rolePermissionSchema.methods.isHigherThan = function(otherRole: IRolePermission): boolean {
  return this.level < otherRole.level; // Lower level number = higher privilege
};

// Static methods
rolePermissionSchema.statics.getDefaultRole = function() {
  return this.findOne({ isDefault: true, isActive: true });
};

rolePermissionSchema.statics.getRoleByName = function(name: string) {
  return this.findOne({ name: name.toLowerCase(), isActive: true });
};

rolePermissionSchema.statics.getAllRoles = function() {
  return this.find({ isActive: true }).sort({ level: 1 });
};

rolePermissionSchema.statics.createDefaultRoles = async function(adminUserId: string) {
  const defaultRoles = [
    {
      name: 'super_admin',
      displayName: 'Super Admin',
      description: 'Full system access with all privileges',
      level: 0,
      permissions: {
        admin: {
          dashboard: true,
          users: { read: true, create: true, update: true, delete: true, manageRoles: true },
          workspaces: { read: true, create: true, update: true, delete: true, manageMembers: true },
          billing: { read: true, manage: true, refunds: true, discounts: true },
          analytics: { read: true, export: true, configureReports: true },
          settings: { read: true, update: true, systemConfig: true }
        },
        workspace: { create: true, read: true, update: true, delete: true, manageMembers: true, changeRoles: true, viewAnalytics: true, manageSettings: true },
        project: { create: true, read: true, update: true, delete: true, manageMembers: true, duplicate: true, viewAnalytics: true },
        task: { create: true, read: true, update: true, delete: true, assign: true, trackTime: true, addComments: true, manageDependencies: true },
        file: { upload: true, download: true, delete: true, share: true, manageStorage: true },
        chat: { read: true, write: true, createChannels: true, manageChannels: true, deleteMessages: true },
        subscription: { view: true, upgrade: true, downgrade: true, cancel: true, manageBilling: true },
        referral: { view: true, create: true, manage: true, viewStats: true }
      },
      isDefault: false,
      createdBy: adminUserId
    },
    {
      name: 'admin',
      displayName: 'Admin',
      description: 'Administrative access to most system features',
      level: 10,
      permissions: {
        admin: {
          dashboard: true,
          users: { read: true, create: true, update: true, delete: false, manageRoles: false },
          workspaces: { read: true, create: true, update: true, delete: false, manageMembers: true },
          billing: { read: true, manage: true, refunds: false, discounts: true },
          analytics: { read: true, export: true, configureReports: false },
          settings: { read: true, update: false, systemConfig: false }
        },
        workspace: { create: true, read: true, update: true, delete: true, manageMembers: true, changeRoles: true, viewAnalytics: true, manageSettings: true },
        project: { create: true, read: true, update: true, delete: true, manageMembers: true, duplicate: true, viewAnalytics: true },
        task: { create: true, read: true, update: true, delete: true, assign: true, trackTime: true, addComments: true, manageDependencies: true },
        file: { upload: true, download: true, delete: true, share: true, manageStorage: false },
        chat: { read: true, write: true, createChannels: true, manageChannels: true, deleteMessages: true },
        subscription: { view: true, upgrade: true, downgrade: true, cancel: true, manageBilling: true },
        referral: { view: true, create: true, manage: false, viewStats: true }
      },
      isDefault: false,
      createdBy: adminUserId
    },
    {
      name: 'workspace_manager',
      displayName: 'Workspace Manager',
      description: 'Can manage workspaces and projects',
      level: 30,
      permissions: {
        admin: {
          dashboard: false,
          users: { read: false, create: false, update: false, delete: false, manageRoles: false },
          workspaces: { read: true, create: true, update: true, delete: false, manageMembers: true },
          billing: { read: false, manage: false, refunds: false, discounts: false },
          analytics: { read: true, export: false, configureReports: false },
          settings: { read: false, update: false, systemConfig: false }
        },
        workspace: { create: true, read: true, update: true, delete: false, manageMembers: true, changeRoles: true, viewAnalytics: true, manageSettings: true },
        project: { create: true, read: true, update: true, delete: true, manageMembers: true, duplicate: true, viewAnalytics: true },
        task: { create: true, read: true, update: true, delete: true, assign: true, trackTime: true, addComments: true, manageDependencies: true },
        file: { upload: true, download: true, delete: true, share: true, manageStorage: false },
        chat: { read: true, write: true, createChannels: true, manageChannels: true, deleteMessages: false },
        subscription: { view: true, upgrade: true, downgrade: true, cancel: false, manageBilling: false },
        referral: { view: true, create: true, manage: false, viewStats: true }
      },
      isDefault: false,
      createdBy: adminUserId
    },
    {
      name: 'user',
      displayName: 'User',
      description: 'Standard user with basic permissions',
      level: 50,
      permissions: {
        admin: {
          dashboard: false,
          users: { read: false, create: false, update: false, delete: false, manageRoles: false },
          workspaces: { read: false, create: false, update: false, delete: false, manageMembers: false },
          billing: { read: false, manage: false, refunds: false, discounts: false },
          analytics: { read: false, export: false, configureReports: false },
          settings: { read: false, update: false, systemConfig: false }
        },
        workspace: { create: false, read: true, update: false, delete: false, manageMembers: false, changeRoles: false, viewAnalytics: true, manageSettings: false },
        project: { create: true, read: true, update: true, delete: false, manageMembers: false, duplicate: true, viewAnalytics: true },
        task: { create: true, read: true, update: true, delete: false, assign: true, trackTime: true, addComments: true, manageDependencies: false },
        file: { upload: true, download: true, delete: true, share: true, manageStorage: false },
        chat: { read: true, write: true, createChannels: false, manageChannels: false, deleteMessages: false },
        subscription: { view: true, upgrade: true, downgrade: true, cancel: false, manageBilling: false },
        referral: { view: true, create: true, manage: false, viewStats: true }
      },
      isDefault: true,
      createdBy: adminUserId
    },
    {
      name: 'guest',
      displayName: 'Guest',
      description: 'Limited read-only access',
      level: 80,
      permissions: {
        admin: {
          dashboard: false,
          users: { read: false, create: false, update: false, delete: false, manageRoles: false },
          workspaces: { read: false, create: false, update: false, delete: false, manageMembers: false },
          billing: { read: false, manage: false, refunds: false, discounts: false },
          analytics: { read: false, export: false, configureReports: false },
          settings: { read: false, update: false, systemConfig: false }
        },
        workspace: { create: false, read: true, update: false, delete: false, manageMembers: false, changeRoles: false, viewAnalytics: false, manageSettings: false },
        project: { create: false, read: true, update: false, delete: false, manageMembers: false, duplicate: false, viewAnalytics: false },
        task: { create: false, read: true, update: false, delete: false, assign: false, trackTime: false, addComments: false, manageDependencies: false },
        file: { upload: false, download: true, delete: false, share: false, manageStorage: false },
        chat: { read: true, write: false, createChannels: false, manageChannels: false, deleteMessages: false },
        subscription: { view: false, upgrade: false, downgrade: false, cancel: false, manageBilling: false },
        referral: { view: false, create: false, manage: false, viewStats: false }
      },
      isDefault: false,
      createdBy: adminUserId
    }
  ];

  for (const roleData of defaultRoles) {
    const existingRole = await this.findOne({ name: roleData.name });
    if (!existingRole) {
      await this.create(roleData);
    }
  }

  return (this.constructor as any).getAllRoles();
};

// Define model interface
interface IRolePermissionModel extends mongoose.Model<IRolePermission> {
  getDefaultRole(): Promise<IRolePermission | null>;
  getRoleByName(name: string): Promise<IRolePermission | null>;
  getAllRoles(): Promise<IRolePermission[]>;
  createDefaultRoles(adminUserId: string): Promise<IRolePermission[]>;
}

export const RolePermission = mongoose.model<IRolePermission, IRolePermissionModel>('RolePermission', rolePermissionSchema);

export default RolePermission;