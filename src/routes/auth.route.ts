/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and session management
 */

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

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/register", registerUserController);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/login", loginController);

/**
 * @swagger
 * /api/auth/validate:
 *   get:
 *     tags: [Authentication]
 *     summary: Validate current session
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Session is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Session is invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/validate", validateSessionController);

/**
 * @swagger
 * /api/auth/test-cookie:
 *   get:
 *     tags: [Authentication]
 *     summary: Test cookie functionality (development only)
 *     responses:
 *       200:
 *         description: Cookie test result
 */
router.get("/test-cookie", testCookieController);

/**
 * @swagger
 * /api/auth/debug-session:
 *   get:
 *     tags: [Authentication]
 *     summary: Debug session data (development only)
 *     responses:
 *       200:
 *         description: Session debug information
 */
router.get("/debug-session", debugSessionController);

/**
 * @swagger
 * /api/auth/test-session:
 *   get:
 *     tags: [Authentication]
 *     summary: Test session functionality (development only)
 *     responses:
 *       200:
 *         description: Session test result
 */
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

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout user
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post("/logout", logOutController);

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     tags: [Authentication]
 *     summary: Initiate Google OAuth login
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     tags: [Authentication]
 *     summary: Google OAuth callback
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: OAuth authorization code
 *     responses:
 *       302:
 *         description: Redirect after successful authentication
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: failedUrl,
  }),
  googleLoginCallback
);

export default router;
