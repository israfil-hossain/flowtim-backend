import passport from "passport";
import { config, getCookieConfig } from "../config/app.config";
import { HTTPSTATUS } from "../config/http.config";
import { NextFunction, Request, Response, RequestHandler } from "express";
import { registerSchema } from "../validation/auth.validation";
import { registerUserService } from "../services/auth.service";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { clearAuthCookie, isValidSession } from "../utils/auth.utils";

export const googleLoginCallback: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("Google callback - User:", req.user);
    console.log("Google callback - Session:", req.session);

    if (!req.user) {
      console.log("No user found in request");
      return res.redirect(
        `${config.FRONTEND_URL}/auth/google/callback/failure`
      );
    }

    const currentWorkspace = req.user?.currentWorkspace;
    console.log("Current workspace:", currentWorkspace);

    if (!currentWorkspace) {
      console.log("No current workspace found, redirecting to dashboard");
      return res.redirect(`${config.FRONTEND_URL}/dashboard`);
    }

    console.log("Redirecting to workspace:", currentWorkspace);
    return res.redirect(`${config.FRONTEND_URL}/workspace/${currentWorkspace}`);
  }
);

export const registerUserController: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse({
      ...req.body,
    });

    await registerUserService(body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "User created successfully",
    });
  }
);

export const loginController: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: Express.User | false,
        info: { message: string } | undefined
      ) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(HTTPSTATUS.UNAUTHORIZED).json({
            message: info?.message || "Invalid email or password",
          });
        }

        req.logIn(user, (err) => {
          if (err) {
            console.error("❌ req.logIn error:", err);
            return next(err);
          }

          console.log("✅ Login successful for user:", user._id);
          console.log("📋 Session ID:", req.sessionID);
          console.log("🍪 Session cookie config:", req.session?.cookie);
          console.log("🌍 Environment:", config.NODE_ENV);
          console.log("🏠 Cookie domain:", config.COOKIE_DOMAIN);
          
          // Log passport data after login
          console.log("🎫 Passport data:", (req.session as any)?.passport);
          console.log("👤 req.user after login:", !!req.user);
          console.log("🔐 isAuthenticated:", req.isAuthenticated ? req.isAuthenticated() : false);

          // Force save session to ensure passport data is persisted
          req.session.save((saveErr) => {
            if (saveErr) {
              console.error("❌ Session save error:", saveErr);
              return next(saveErr);
            }
            
            console.log("💾 Session saved successfully");
            console.log("🎫 Final passport data:", (req.session as any)?.passport);
            
            return res.status(HTTPSTATUS.OK).json({
              message: "Logged in successfully",
              user,
              sessionId: req.sessionID,
            });
          });
        });
      }
    )(req, res, next);
  }
);

export const logOutController: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res
          .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
          .json({ error: "Failed to log out" });
      }
    });

    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res
            .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
            .json({ error: "Failed to destroy session" });
        }

        // Clear the session cookie
        clearAuthCookie(res);
        
        console.log("Session and cookie cleared successfully");
        return res
          .status(HTTPSTATUS.OK)
          .json({ message: "Logged out successfully" });
      });
    } else {
      return res
        .status(HTTPSTATUS.OK)
        .json({ message: "Logged out successfully" });
    }
  }
);

export const validateSessionController: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("Session validation check");
    
    const isValid = isValidSession(req);
    
    if (!isValid) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: "Invalid session",
        isAuthenticated: false,
      });
    }

    return res.status(HTTPSTATUS.OK).json({
      message: "Session is valid",
      isAuthenticated: true,
      user: req.user,
      sessionId: req.sessionID,
    });
  }
);

export const testCookieController: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("Testing cookie setting...");
    console.log("Environment:", config.NODE_ENV);
    console.log("Cookie domain:", config.COOKIE_DOMAIN);
    
    const cookieConfig = getCookieConfig();
    console.log("Cookie config:", cookieConfig);
    
    // Set a test cookie
    res.cookie("test-cookie", "test-value", cookieConfig);
    
    // Also try setting with different configurations
    res.cookie("test-simple", "simple-value", {
      httpOnly: false,
      secure: false,
      sameSite: "lax"
    });
    
    return res.status(HTTPSTATUS.OK).json({
      message: "Test cookies set",
      cookieConfig,
      environment: config.NODE_ENV,
      domain: config.COOKIE_DOMAIN,
    });
  }
);

export const debugSessionController: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("=== SESSION DEBUG ===");
    console.log("Session ID:", req.sessionID);
    console.log("Session exists:", !!req.session);
    console.log("Passport data:", (req.session as any)?.passport);
    console.log("User:", req.user);
    console.log("User ID:", req.user?._id);
    console.log("Cookies:", req.headers.cookie);
    console.log("Is authenticated:", req.isAuthenticated ? req.isAuthenticated() : "no method");
    console.log("=== SESSION DEBUG END ===");
    
    return res.status(HTTPSTATUS.OK).json({
      message: "Session debug info",
      sessionId: req.sessionID,
      hasSession: !!req.session,
      hasUser: !!req.user,
      user: req.user,
      passportData: (req.session as any)?.passport,
      isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
      cookies: req.headers.cookie,
    });
  }
);
