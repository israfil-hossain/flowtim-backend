import passport from "passport";
import { config } from "../config/app.config";
import { HTTPSTATUS } from "../config/http.config";
import { NextFunction, Request, Response, RequestHandler } from "express";
import { registerSchema } from "../validation/auth.validation";
import { registerUserService } from "../services/auth.service";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";

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
            return next(err);
          }

          return res.status(HTTPSTATUS.OK).json({
            message: "Logged in successfully",
            user,
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

    req.session.destroy(() => {
      console.log("Session destroyed");
    });
    return res
      .status(HTTPSTATUS.OK)
      .json({ message: "Logged out successfully" });
  }
);
