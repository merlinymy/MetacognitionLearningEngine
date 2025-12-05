import { MongoClient } from "mongodb";

// Singleton connection pool
let cachedClient = null;
let cachedDb = null;

/**
 * Get MongoDB client with connection pooling
 * Reuses existing connection instead of creating new one per request
 */
export const mongoClient = async () => {
  // Return cached client if available
  if (
    cachedClient &&
    cachedClient.topology &&
    cachedClient.topology.isConnected()
  ) {
    return cachedClient;
  }

  const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/";

  try {
    // Create new client with connection pool options
    const client = new MongoClient(MONGO_URL, {
      maxPoolSize: 10, // Max 10 connections in pool
      minPoolSize: 2, // Keep 2 connections always ready
      maxIdleTimeMS: 30000, // Close idle connections after 30s
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if can't connect
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    // Connect to MongoDB
    await client.connect();

    // Cache the client for reuse
    cachedClient = client;

    console.log("✅ MongoDB connected successfully");
    return client;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

/**
 * Get database instance with connection pooling
 * Preferred method - doesn't require closing connection
 */
export const getDb = async (dbName = "metacognition") => {
  // Return cached database if available
  if (cachedDb) {
    return cachedDb;
  }

  const client = await mongoClient();
  cachedDb = client.db(dbName);
  return cachedDb;
};

/**
 * Close all MongoDB connections
 * Only call this on application shutdown
 */
export const closeConnection = async () => {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log("MongoDB connection closed");
  }
};
