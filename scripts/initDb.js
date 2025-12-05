import "dotenv/config";
import User from "../models/User.js";
import Passcode from "../models/Passcode.js";
import Passkey from "../models/Passkey.js";
import { closeConnection } from "../db/mongoDBClient.js";

/**
 * Initialize database indexes
 */
async function initDb() {
  try {
    console.log("Initializing database indexes...");

    // Create indexes for User collection
    await User.createIndexes();
    console.log("✅ User indexes created successfully");

    // Create indexes for Passcode collection
    await Passcode.createIndexes();
    console.log("✅ Passcode indexes created successfully");

    // Create indexes for Passkey collection
    await Passkey.createIndexes();
    console.log("✅ Passkey indexes created successfully");

    console.log("\n✅ Database initialization complete!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

initDb();
