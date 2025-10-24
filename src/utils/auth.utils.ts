import { Response } from "express";
import jwt from "jsonwebtoken";
import { config, getCookieConfig } from "../config/app.config";

interface JWTPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-super-secret-jwt-refresh-key";
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

export const generateTokens = (userId: string, email: string): TokenPair => {
  const accessToken = jwt.sign(
    { userId, email, type: 'access' },
    JWT_SECRET,
    { 
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: 'flowtim-backend',
      audience: 'flowtim-frontend'
    } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { userId, email, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { 
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'flowtim-backend',
      audience: 'flowtim-frontend'
    } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      issuer: 'flowtim-backend',
      audience: 'flowtim-frontend'
    } as jwt.VerifyOptions) as JWTPayload;
    
    if (payload.type !== 'access') {
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error("Access token verification failed:", error);
    return null;
  }
};

export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'flowtim-backend',
      audience: 'flowtim-frontend'
    } as jwt.VerifyOptions) as JWTPayload;
    
    if (payload.type !== 'refresh') {
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error("Refresh token verification failed:", error);
    return null;
  }
};

export const setSecureAuthCookie = (res: Response, sessionId: string) => {
  const cookieName = config.NODE_ENV === "production" ? "__Secure-flowtim" : "flowtim";
  const cookieOptions = getCookieConfig();
  
  res.cookie(cookieName, sessionId, cookieOptions);
  
  console.log(`🍪 Set secure auth cookie: ${cookieName}`);
};

export const setTokenCookies = (res: Response, tokens: TokenPair) => {
  const isProduction = config.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    domain: isProduction ? config.COOKIE_DOMAIN : undefined,
  };

  // Set access token cookie (shorter expiry)
  res.cookie(
    isProduction ? "__Secure-access-token" : "access-token",
    tokens.accessToken,
    {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    }
  );

  // Set refresh token cookie (longer expiry)
  res.cookie(
    isProduction ? "__Secure-refresh-token" : "refresh-token",
    tokens.refreshToken,
    {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }
  );

  console.log("🍪 Set JWT token cookies");
};

export const clearTokenCookies = (res: Response) => {
  const isProduction = config.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    domain: isProduction ? config.COOKIE_DOMAIN : undefined,
  };

  res.clearCookie(
    isProduction ? "__Secure-access-token" : "access-token",
    cookieOptions
  );
  
  res.clearCookie(
    isProduction ? "__Secure-refresh-token" : "refresh-token",
    cookieOptions
  );

  console.log("🗑️ Cleared JWT token cookies");
};

export const clearAuthCookie = (res: Response) => {
  const cookieName = config.NODE_ENV === "production" ? "__Secure-flowtim" : "flowtim";
  const cookieOptions = getCookieConfig();
  
  res.clearCookie(cookieName, cookieOptions);
  
  console.log(`🗑️ Cleared auth cookie: ${cookieName}`);
};

export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove "Bearer " prefix
};

export const extractTokenFromCookies = (cookies: any): { accessToken: string | null; refreshToken: string | null } => {
  const isProduction = config.NODE_ENV === "production";
  
  const accessToken = cookies?.[isProduction ? "__Secure-access-token" : "access-token"] || null;
  const refreshToken = cookies?.[isProduction ? "__Secure-refresh-token" : "refresh-token"] || null;
  
  return { accessToken, refreshToken };
};

export const isValidSession = (req: any): boolean => {
  const hasSession = !!(req.session && req.sessionID);
  const hasUser = !!(req.user && req.user._id);
  const isAuthenticated = !!(req.isAuthenticated && req.isAuthenticated());
  
  console.log("Session validation:", {
    hasSession,
    hasUser,
    isAuthenticated,
    sessionId: req.sessionID || "none",
    userId: req.user?._id || "none"
  });
  
  return hasSession && hasUser && isAuthenticated;
};