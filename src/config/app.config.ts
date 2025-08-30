import "dotenv/config";
import { getEnv } from "../utils/get-env";
import { CorsOptions } from "cors";
import { CookieOptions } from "express";

const appConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnv("PORT", "8000"),

  BASE_URL: getEnv("BASE_URL", "http://localhost:8000"),
  FRONTEND_URL: getEnv("FRONTEND_URL", "http://localhost:3000"),

  BASE_PATH: getEnv("BASE_PATH", "/api"),
  MONGO_URI: getEnv("MONGO_URI", ""),

  GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CALLBACK_URL: getEnv("GOOGLE_CALLBACK_URL"),

  SESSION_SECRET: getEnv("SESSION_SECRET"),
  SESSION_EXPIRES_IN: getEnv("SESSION_EXPIRES_IN"),

  COOKIE_DOMAIN: getEnv("COOKIE_DOMAIN"),

  ALLOWED_ORIGINS: getEnv("ALLOWED_ORIGINS")
    .split(",")
    .map((item) => item.trim()),
});

export const config = appConfig();

export const isProd = process.env.NODE_ENV === "production";
export const isDev = process.env.NODE_ENV === "development";

export const getCookieConfig = (
  options?: Partial<CookieOptions>
): CookieOptions => {
  return {
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    domain: config.COOKIE_DOMAIN ?? config.COOKIE_DOMAIN,
    ...options,
  };
};

export const getSessionConfig = () => {
  return {
    name: "flowtim",
    secret: "flowtim-secret",
    resave: false,
    saveUninitialized: false,
    cookie: getCookieConfig(),
  };
};

export const getCorsConfig = (options?: Partial<CorsOptions>): CorsOptions => {
  return {
    origin: config.ALLOWED_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
    ...options,
  };
};
