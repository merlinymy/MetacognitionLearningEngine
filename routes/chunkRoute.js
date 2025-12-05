import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db/mongoDBClient.js";
import {
  generateChunks,
  getAvailableProviders,
} from "../services/llmService.js";

const router = express.Router();

// POST /api/chunks/generate - Generate chunks from text content
router.post("/generate", async (req, res) => {
  try {
    const {
      content,
      title,
      provider = "GEMINI",
      userId = "anonymous",
      defaultGoal = "explain",
    } = req.body;

    // Validate content length
    if (!content || content.length < 500) {
      return res.status(400).json({
        error: "Content must be at least 500 characters",
      });
    }

    // Validate provider
    const availableProviders = getAvailableProviders();
    if (!availableProviders.includes(provider.toUpperCase())) {
      return res.status(400).json({
        error: `Invalid provider. Available providers: ${availableProviders.join(", ")}`,
      });
    }

    // Generate chunks using selected LLM provider
    const chunks = await generateChunks(content, provider);

    // Create session in database
    const db = await getDb();
    const sessionsCollection = db.collection("sessions");

    const session = {
      userId,
      rawContent: content,
      contentPreview: title || content.substring(0, 100),
      defaultGoal,
      createdAt: new Date(),
      completedAt: null,
      status: "in_progress",
      chunks: chunks.map((chunk) => ({
        ...chunk,
        completed: false,
      })),
      sessionStats: {
        totalChunks: chunks.length,
        chunksCompleted: 0,
        averageAccuracy: 0,
        averageConfidence: 0,
        calibrationError: 0,
        totalTimeSeconds: 0,
      },
    };

    const result = await sessionsCollection.insertOne(session);

    // Return response matching the design document
    res.status(200).json({
      sessionId: result.insertedId.toString(),
      chunks: chunks,
      totalChunks: chunks.length,
    });
  } catch (error) {
    console.error("Error generating chunks:", error);
    res.status(500).json({
      error: "Failed to generate chunks",
    });
  }
});

// GET /api/chunks/:sessionId - Get all chunks for a session
router.get("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    const db = await getDb();
    const sessionsCollection = db.collection("sessions");

    const session = await sessionsCollection.findOne({
      _id: new ObjectId(sessionId),
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({
      sessionId: sessionId,
      chunks: session.chunks,
      totalChunks: session.chunks.length,
    });
  } catch (error) {
    console.error("Error fetching chunks:", error);
    res.status(500).json({ error: "Failed to fetch chunks" });
  }
});

// GET /api/chunks/:sessionId/:chunkId - Get specific chunk
router.get("/:sessionId/:chunkId", async (req, res) => {
  try {
    const { sessionId, chunkId } = req.params;

    if (!ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    const db = await getDb();
    const sessionsCollection = db.collection("sessions");

    const session = await sessionsCollection.findOne({
      _id: new ObjectId(sessionId),
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const chunk = session.chunks.find((c) => c.chunkId === chunkId);

    if (!chunk) {
      return res.status(404).json({ error: "Chunk not found" });
    }

    res.json({
      sessionId: sessionId,
      chunk: chunk,
    });
  } catch (error) {
    console.error("Error fetching chunk:", error);
    res.status(500).json({ error: "Failed to fetch chunk" });
  }
});

export default router;
