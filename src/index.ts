import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import session from "cookie-session";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";

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

// Security middleware - should be early in the chain
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.NODE_ENV === "production" ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const allowedOrigins = [
  'https://flowtim.com',
  'https://www.flowtim.com',
  ...(config.NODE_ENV === "development" ? [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ] : [])
];

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // 24 hours - cache preflight response
  optionsSuccessStatus: 200, // For legacy browser support
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Request logging middleware (only in development)
if (config.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
    next();
  });
}

// Session configuration
const sessionConfig = {
  name: "flowtim_session",
  keys: [config.SESSION_SECRET, config.SESSION_SECRET + "_backup"], // Multiple keys for rotation
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  secure: config.NODE_ENV === "production",
  httpOnly: true,
  sameSite: (config.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  rolling: true, // Reset expiration on activity
};

app.use(session(sessionConfig));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoints
app.get(
  '/health',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return res.status(HTTPSTATUS.OK).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.NODE_ENV,
    });
  })
);

app.get(
  '/',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return res.status(HTTPSTATUS.OK).json({
      message: "FlowTim API is running",
      version: "1.0.0",
      environment: config.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  })
);

// Session test endpoint (development only)
if (config.NODE_ENV === "development") {
  app.get(
    '/api/test-session',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      return res.status(HTTPSTATUS.OK).json({
        message: "Session test",
        sessionId: req.session?.id,
        user: req.user ? { id: req.user.id, email: req.user.email } : null,
        cookies: req.headers.cookie,
        timestamp: new Date().toISOString(),
      });
    })
  );
}

// API Routes
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, isAuthenticated, userRoutes);
app.use(`${BASE_PATH}/workspace`, isAuthenticated, workspaceRoutes);
app.use(`${BASE_PATH}/member`, isAuthenticated, memberRoutes);
app.use(`${BASE_PATH}/project`, isAuthenticated, projectRoutes);
app.use(`${BASE_PATH}/task`, isAuthenticated, taskRoutes);

// 404 handler for unmatched routes
app.use('*', (req: Request, res: Response) => {
  return res.status(HTTPSTATUS.NOT_FOUND).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler (should be last)
app.use(errorHandler);

const seedRoles = async (): Promise<void> => {
  try {
    const existingRolesCount = await RoleModel.countDocuments();
    if (existingRolesCount === 0) {
      console.log("🌱 Seeding roles...");
      
      const rolePromises = Object.entries(RolePermissions).map(async ([roleName, permissions]) => {
        const newRole = new RoleModel({
          name: roleName,
          permissions: permissions,
        });
        await newRole.save();
        console.log(`✅ Role ${roleName} added with permissions.`);
      });
      
      await Promise.all(rolePromises);
      console.log("🎉 Roles seeding completed successfully.");
    } else {
      console.log("ℹ️ Roles already exist, skipping seeding.");
    }
  } catch (error) {
    console.error("❌ Error during role seeding:", error);
    throw error;
  }
};

let server: any;

const gracefulShutdown = (signal: string) => {
  console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);
  
  // Close server
  if (server) {
    server.close(() => {
      console.log('🔌 HTTP server closed.');
      
      // Close database connections, cleanup resources, etc.
      process.exit(0);
    });
  }
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.log('⏰ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

const startServer = async (): Promise<void> => {
  try {
    console.log("🚀 Starting FlowTim API server...");
    
    // Connect to database first
    console.log("📊 Connecting to database...");
    await connectDatabase();
    console.log("✅ Database connected successfully.");
    
    // Seed roles if they don't exist
    await seedRoles();
    
    // Start the server
    server = app.listen(config.PORT, () => {
      console.log(`🌟 Server listening on port ${config.PORT} in ${config.NODE_ENV} mode`);
      console.log(`📍 API Base URL: http://localhost:${config.PORT}${BASE_PATH}`);
      console.log(`🔗 Health Check: http://localhost:${config.PORT}/health`);
    });
    
    // Graceful shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });
    
  } catch (error) {
    console.error("💥 Failed to start server:", error);
    process.exit(1);
  }
};

// Export app for testing
export default app;

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}