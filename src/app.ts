import "dotenv/config";
import cors from "cors";
import express from "express";
import passport from "passport";
import "./config/passport.config";
import compression from "compression";
import session from "express-session";
import MongoStore from "connect-mongo";
import swaggerUi from "swagger-ui-express";
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import appRoutes from "./routes/index.route";
import { HTTPSTATUS } from "./config/http.config";
import loggerMiddleware from "./middlewares/logger.middleware";
import { getSessionConfig, getCorsConfig, config } from "./config/app.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { swaggerSpec } from "./config/swagger.config";

const app = express();

// define middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Security middleware to block sensitive files
app.use((req, res, next) => {
  const sensitiveFiles = ['.env', '.env.local', '.env.production', '.env.development', 
                         'package.json', 'package-lock.json', 'yarn.lock', 'tsconfig.json',
                         '.gitignore', 'Dockerfile', 'docker-compose.yml', 'README.md'];
  
  const requestedPath = req.path.toLowerCase();
  
  // Check if request is for a sensitive file
  if (sensitiveFiles.some(file => requestedPath.includes(file.toLowerCase())) ||
      requestedPath.startsWith('/.') ||
      requestedPath.includes('/node_modules/') ||
      requestedPath.includes('/src/')) {
    return res.status(404).json({
      error: "NOT_FOUND",
      message: "Resource not found",
      timestamp: new Date().toISOString(),
    });
  }
  
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "TOO_MANY_REQUESTS",
    message: "Too many requests from this IP, please try again later.",
    timestamp: new Date().toISOString(),
  },
});
app.use(limiter);

app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// Security: Create public directory if it doesn't exist to prevent serving from root

const publicDir = path.join(__dirname, '../public');
const uploadsDir = path.join(__dirname, '../uploads');

if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

// Serve static files only from specific directories with security headers
app.use('/public', express.static(publicDir, {
  dotfiles: 'deny', // Deny access to dotfiles like .env
  index: false // Disable directory listing
}));

app.use('/uploads', express.static(uploadsDir, {
  dotfiles: 'deny',
  index: false
}));

app.use(cors(getCorsConfig()));
app.use(
  session(
    getSessionConfig({
      store: MongoStore.create({
        mongoUrl: config.MONGO_URI,
        collectionName: "sessions",
      }),
    })
  )
);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(loggerMiddleware);

// Debug auth middleware (development only)
if (config.NODE_ENV === "development") {
  const debugAuth = require("./middlewares/debugAuth.middleware").default;
  app.use(debugAuth);
}

// Swagger documentation
if (config.NODE_ENV === "development") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
    },
  }));
  
  // Swagger JSON endpoint
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}

app.use("/api", appRoutes);

// handle not found
app.use("*", (req, res) => {
  return res.status(HTTPSTATUS.NOT_FOUND).json({
    error: "NOT_FOUND",
    message: "Not found!",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// global error handler
app.use(errorHandler);

export default app;
