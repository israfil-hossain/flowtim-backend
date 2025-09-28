import dotenv from "dotenv";
import { CorsOptions } from "cors";
import { CookieOptions } from "express";
import { SessionOptions } from "express-session";

dotenv.config();

export const config = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: process.env.PORT ?? "8000",

  BASE_URL: process.env.BASE_URL ?? "http://localhost:8000",
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:5173",

  MONGO_URI: process.env.MONGO_URI ?? "",

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL ?? "",

  SESSION_SECRET: process.env.SESSION_SECRET ?? "",
  SESSION_EXPIRES_IN: process.env.SESSION_EXPIRES_IN ?? "",

  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,

  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(",").map((item) =>
    item.trim()
  ),
};

export const isProd = config.NODE_ENV === "production";
export const isDev = config.NODE_ENV === "development";

export const getCookieConfig = (
  options?: Partial<CookieOptions>
): CookieOptions => {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  // For cross-domain cookies, we need secure: true and sameSite: "none"
  // Domain should be set to allow subdomain access
  const cookieConfig: CookieOptions = {
    httpOnly: true,
    secure: isProd, // Must be true in production for sameSite: "none"
    path: "/",
    maxAge: maxAge,
    expires: new Date(Date.now() + maxAge),
    ...options,
  };

  if (isProd) {
    // Production settings for cross-domain
    cookieConfig.sameSite = "none";
    // Set domain for cross-subdomain sharing
    if (config.COOKIE_DOMAIN) {
      cookieConfig.domain = config.COOKIE_DOMAIN;
    }
  } else {
    // Development settings
    cookieConfig.sameSite = "lax";
    // No domain for localhost
  }

  return cookieConfig;
};

export const getSessionConfig = (
  options: Partial<SessionOptions>
): SessionOptions => {
  return {
    name: isProd ? "__Secure-flowtim" : "flowtim",
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiration on activity
    cookie: getCookieConfig(),
    ...options,
  };
};

export const getCorsConfig = (options?: Partial<CorsOptions>): CorsOptions => {
  return {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-request-id"],
    exposedHeaders: ["Content-Type", "Authorization", "x-request-id"],
    maxAge: 86400,
    ...options,
  };
};
