import {
  loginOrCreateAccountService,
  verifyUserService,
} from "../services/auth.service";
import passport from "passport";
import { Request } from "express";
import { config } from "./app.config";
import { NotFoundException } from "../utils/appError";
import { Strategy as LocalStrategy } from "passport-local";
import { ProviderEnum } from "../enums/account-provider.enum";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
      passReqToCallback: true,
    },
    async (_req: Request, _accessToken: string, _refreshToken: string, profile: any, done: any) => {
      try {
        const { email, sub: googleId, picture } = profile._json;
        console.log("Google OAuth - Profile:", profile.displayName);
        console.log("Google OAuth - ID:", googleId);
        
        if (!googleId) {
          throw new NotFoundException("Google ID (sub) is missing");
        }

        const { user } = await loginOrCreateAccountService({
          provider: ProviderEnum.GOOGLE,
          displayName: profile.displayName,
          providerId: googleId,
          picture: picture,
          email: email,
        });
        
        console.log("Google OAuth - User created/found:", user._id);
        done(null, user);
      } catch (error) {
        console.error("Google OAuth error:", error);
        done(error, false);
      }
    }
  )
);

// Local Strategy for email/password login
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: true,
    },
    async (email: string, password: string, done: any) => {
      try {
        console.log("Local auth attempt for email:", email);
        const user = await verifyUserService({ email, password });
        console.log("Local auth successful for user:", user._id);
        return done(null, user);
      } catch (error: any) {
        console.error("Local auth failed:", error?.message);
        return done(error, false, { message: error?.message });
      }
    }
  )
);

// Serialize user - store only user ID in session
passport.serializeUser((user: any, done: any) => {
  console.log("📝 SERIALIZE USER CALLED - ID:", user._id);
  console.log("📝 User object:", user);
  done(null, user._id.toString());
});

// Deserialize user - fetch user from database using stored ID
passport.deserializeUser(async (id: string, done: any) => {
  try {
    console.log("🔍 Deserializing user ID:", id);

    // Import here to avoid circular dependency
    const UserModel = (await import("../models/user.model")).default;

    const user = await UserModel.findById(id).select("-password");

    if (!user) {
      console.log("❌ User not found during deserialization:", id);
      console.log("❌ Available users in DB (first 5):");
      const allUsers = await UserModel.find({}).select("_id").limit(5);
      console.log(allUsers.map(u => (u._id as string).toString()));
      return done(null, false);
    }

    console.log("✅ User deserialized successfully:", user._id);
    console.log("✅ User email:", user.email);
    done(null, user);
  } catch (error) {
    console.error("❌ Error during user deserialization:", error);
    if (error instanceof Error) {
      console.error("❌ Error details:", error.message);
    }
    done(error, null);
  }
});

export default passport;