import express from "express";
import passport from "passport";

const router = express.Router();

/**
 * GET /api/auth/google
 * Initiate Google OAuth flow
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

/**
 * GET /api/auth/google/callback
 * Google OAuth callback
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    failureMessage: true,
  }),
  (req, res) => {
    // Successful authentication, redirect to frontend
    res.redirect("/");
  }
);

/**
 * POST /api/auth/logout
 * Destroy user session
 */
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Logout failed",
      });
    }

    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Session destruction failed",
        });
      }

      // Clear the session cookie
      res.clearCookie("connect.sid");

      res.json({
        success: true,
        message: "Logout successful",
      });
    });
  });
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get("/me", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  res.json({
    success: true,
    user: {
      _id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture,
    },
  });
});

/**
 * POST /api/auth/migrate-guest-data
 * Migrate guest sessions to authenticated user
 */
router.post("/migrate-guest-data", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { sessionIds } = req.body;
    const userId = req.user._id.toString();

    if (!sessionIds || !Array.isArray(sessionIds)) {
      return res.status(400).json({
        success: false,
        message: "sessionIds array is required",
      });
    }

    // Import getDb (should be at top but adding here for context)
    const { getDb } = await import("../db/mongoDBClient.js");
    const { ObjectId } = await import("mongodb");

    const db = await getDb();
    const sessionsCollection = db.collection("sessions");
    const responsesCollection = db.collection("responses");

    let migratedCount = 0;

    // Migrate each session
    for (const sessionId of sessionIds) {
      if (!ObjectId.isValid(sessionId)) {
        continue; // Skip invalid IDs
      }

      const objectId = new ObjectId(sessionId);

      // Update session to belong to authenticated user
      const sessionResult = await sessionsCollection.updateOne(
        { _id: objectId, userId: "guest" },
        { $set: { userId } },
      );

      if (sessionResult.modifiedCount > 0) {
        migratedCount++;

        // Also update all responses for this session
        await responsesCollection.updateMany(
          { sessionId: objectId },
          { $set: { userId } },
        );
      }
    }

    res.json({
      success: true,
      message: `Successfully migrated ${migratedCount} session(s)`,
      migratedCount,
    });
  } catch (error) {
    console.error("Error migrating guest data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to migrate guest data",
    });
  }
});

/**
 * Middleware to protect routes
 */
export const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }
  next();
};

export default router;
