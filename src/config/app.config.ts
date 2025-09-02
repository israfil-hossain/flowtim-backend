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
  return {
    httpOnly: true,
    secure: isProd,
    path: "/",
    sameSite: isProd ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    domain: isProd ? config.COOKIE_DOMAIN : undefined,
    ...options,
  };
};

export const getSessionConfig = (
  options: Partial<SessionOptions>
): SessionOptions => {
  return {
    name: isProd ? "__Secure-flowtim" : "flowtim",
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: getCookieConfig(),
    ...options,
  };
};

export const getCorsConfig = (options?: Partial<CorsOptions>): CorsOptions => {
  const allowedOrigins = config.ALLOWED_ORIGINS?.length 
    ? config.ALLOWED_ORIGINS 
    : [config.FRONTEND_URL];

  return {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
    ...options,
  };
};
