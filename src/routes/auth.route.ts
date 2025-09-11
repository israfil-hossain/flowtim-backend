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
  debugSessionController,
} from "../controllers/auth.controller";

const failedUrl = `${config.FRONTEND_URL}/auth/google/callback/failure`;

const router = Router();

router.post("/register", registerUserController);
router.post("/login", loginController);
router.get("/validate", validateSessionController);
router.get("/test-cookie", testCookieController);
router.get("/debug-session", debugSessionController);
router.get("/test-session", (req, res) => {
  (req.session as any).test = "test-value";
  req.session.save((err) => {
    if (err) {
      return res.status(500).json({ error: "Session save failed" });
    }
    res.json({
      message: "Session test set",
      sessionId: req.sessionID,
      testValue: (req.session as any).test
    });
  });
});

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
