import { getDb } from "../db/mongoDBClient.js";

/**
 * User model for authentication
 * Supports both email (passwordless) and Google OAuth
 */
class User {
  /**
   * Get users collection
   */
  static async getCollection() {
    const db = await getDb();
    return db.collection("users");
  }

  /**
   * Create a new user with email (passwordless)
   * @param {string} email - User's email
   * @param {string} name - User's name
   * @returns {Promise<Object>} Created user object
   */
  static async create({ email, name }) {
    const collection = await this.getCollection();

    // Check if user already exists
    const existingUser = await collection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create user document (passwordless)
    const user = {
      email: email.toLowerCase(),
      name,
      authMethod: "email",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(user);

    return {
      ...user,
      _id: result.insertedId,
    };
  }

  /**
   * Create or update user from Google OAuth
   * @param {string} googleId - Google user ID
   * @param {string} email - User's email from Google
   * @param {string} name - User's name from Google
   * @param {string} picture - User's profile picture URL
   * @returns {Promise<Object>} User object
   */
  static async createOrUpdateFromGoogle({ googleId, email, name, picture }) {
    const collection = await this.getCollection();

    // Try to find existing user by googleId or email
    const existingUser = await collection.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }],
    });

    if (existingUser) {
      // Update existing user with Google info
      const updatedUser = {
        ...existingUser,
        googleId,
        name: name || existingUser.name,
        picture: picture || existingUser.picture,
        authMethod: existingUser.googleId ? "google" : "both",
        updatedAt: new Date(),
      };

      await collection.updateOne({ _id: existingUser._id }, { $set: updatedUser });

      return updatedUser;
    } else {
      // Create new user from Google
      const user = {
        googleId,
        email: email.toLowerCase(),
        name,
        picture,
        authMethod: "google",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(user);

      return {
        ...user,
        _id: result.insertedId,
      };
    }
  }

  /**
   * Find user by email
   * @param {string} email - User's email
   * @returns {Promise<Object|null>} User object or null
   */
  static async findByEmail(email) {
    const collection = await this.getCollection();
    return await collection.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find user by ID
   * @param {string} id - User's ID
   * @returns {Promise<Object|null>} User object or null
   */
  static async findById(id) {
    const collection = await this.getCollection();
    const { ObjectId } = await import("mongodb");
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  /**
   * Find user by Google ID
   * @param {string} googleId - Google user ID
   * @returns {Promise<Object|null>} User object or null
   */
  static async findByGoogleId(googleId) {
    const collection = await this.getCollection();
    return await collection.findOne({ googleId });
  }

  /**
   * Update user's last login timestamp
   * @param {string} id - User's ID
   */
  static async updateLastLogin(id) {
    const collection = await this.getCollection();
    const { ObjectId } = await import("mongodb");
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { lastLogin: new Date() } }
    );
  }

  /**
   * Create indexes for users collection
   */
  static async createIndexes() {
    const collection = await this.getCollection();
    await collection.createIndex({ email: 1 }, { unique: true });
    await collection.createIndex({ googleId: 1 }, { sparse: true });
  }
}

export default User;
