import { Router } from "express";
import passport from "passport";
import { config } from "../config/app.config";
import {
  googleLoginCallback,
  loginController,
  logOutController,
  registerUserController,
  validateSessionController,
  testCookieController,
} from "../controllers/auth.controller";

const failedUrl = `${config.FRONTEND_URL}/auth/google/callback/failure`;

const router = Router();

router.post("/register", registerUserController);
router.post("/login", loginController);
router.get("/validate", validateSessionController);
router.get("/test-cookie", testCookieController);

router.post("/logout", logOutController);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: failedUrl,
  }),
  googleLoginCallback
);

export default router;
