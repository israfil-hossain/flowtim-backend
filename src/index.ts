import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import session from "cookie-session";
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { BadRequestException } from "./utils/appError";
import { ErrorCodeEnum } from "./enums/error-code.enum";

import "./config/passport.config";
import passport from "passport";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import isAuthenticated from "./middlewares/isAuthenticated.middleware";
import workspaceRoutes from "./routes/workspace.route";
import memberRoutes from "./routes/member.route";
import projectRoutes from "./routes/project.route";
import taskRoutes from "./routes/task.route";
import RoleModel from "./models/roles-permission.model";
import { RolePermissions } from "./utils/role-permission";

const app = express();
const BASE_PATH = config.BASE_PATH;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Handle preflight requests
app.options('*', cors());

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

app.use(
  session({
    name: "session",
    keys: [config.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    domain: config.NODE_ENV === "production" ? "flowtim.com" : undefined,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// CORS configuration for production
const allowedOrigins = [
  'https://flowtim.com',
  'https://www.flowtim.com',
  'http://localhost:3000', // for local development
  'http://localhost:3001'  // for local development
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.get(
  `/`,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return res.status(HTTPSTATUS.OK).json({
      message: "FlowTim API is running",
      session: req.session,
      user: req.user,
    });
  })
);

app.get(
  `/api/test-session`,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return res.status(HTTPSTATUS.OK).json({
      message: "Session test",
      session: req.session,
      user: req.user,
      cookies: req.headers.cookie,
    });
  })
);

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, isAuthenticated, userRoutes);
app.use(`${BASE_PATH}/workspace`, isAuthenticated, workspaceRoutes);
app.use(`${BASE_PATH}/member`, isAuthenticated, memberRoutes);
app.use(`${BASE_PATH}/project`, isAuthenticated, projectRoutes);
app.use(`${BASE_PATH}/task`, isAuthenticated, taskRoutes);

app.use(errorHandler);

const seedRoles = async () => {
  try {
    const existingRolesCount = await RoleModel.countDocuments();
    if (existingRolesCount === 0) {
      console.log("Seeding roles...");
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
      console.log("Roles seeding completed successfully.");
    } else {
      console.log("Roles already exist, skipping seeding.");
    }
  } catch (error) {
    console.error("Error during role seeding:", error);
  }
};

const startServer = async () => {
  try {
    // Connect to database first
    await connectDatabase();
    
    // Seed roles if they don't exist
    await seedRoles();
    
    // Start the server
    app.listen(config.PORT, () => {
      console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();


