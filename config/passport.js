import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

/**
 * Configure Passport authentication strategies
 */
export const configurePassport = () => {
  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            const name = profile.displayName;
            const picture = profile.photos?.[0]?.value;
            const googleId = profile.id;

            if (!email) {
              return done(new Error("No email from Google profile"));
            }

            // Create or update user from Google profile
            const user = await User.createOrUpdateFromGoogle({
              googleId,
              email,
              name,
              picture,
            });

            // Update last login
            await User.updateLastLogin(user._id.toString());

            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  } else {
    console.log("⚠️  Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env");
  }

  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user._id.toString());
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};

export default passport;
