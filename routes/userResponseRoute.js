import express from "express";
import { ObjectId } from "mongodb";
import { mongoClient } from "../db/mongoDBClient.js";
import {
  evaluateResponse,
  getAvailableProviders,
} from "../services/llmService.js";

const router = express.Router();

// POST /api/responses - Submit a chunk response
router.post("/", async (req, res) => {
  try {
    const {
      sessionId,
      chunkId,
      goal,
      strategy,
      userAnswer,
      confidence,
      provider = "GEMINI",
      planTimeSeconds = 0,
      monitorTimeSeconds = 0,
      hintsUsed = 0,
      contentReviewed = false,
    } = req.body;

    // Validate required fields
    if (
      !sessionId ||
      !chunkId ||
      !goal ||
      !strategy ||
      !userAnswer ||
      confidence === undefined
    ) {
      return res.status(400).json({
        error:
          "Missing required fields: sessionId, chunkId, goal, strategy, userAnswer, confidence",
      });
    }

    if (!ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    const client = await mongoClient();
    const db = client.db("metacognition");
    const sessionsCollection = db.collection("sessions");
    const responsesCollection = db.collection("responses");

    // Get the session to find expected points
    const session = await sessionsCollection.findOne({
      _id: new ObjectId(sessionId),
    });

    if (!session) {
      await client.close();
      return res.status(404).json({ error: "Session not found" });
    }

    const chunk = session.chunks.find((c) => c.chunkId === chunkId);

    if (!chunk) {
      await client.close();
      return res.status(404).json({ error: "Chunk not found" });
    }

    // Validate provider
    const availableProviders = getAvailableProviders();
    if (!availableProviders.includes(provider.toUpperCase())) {
      await client.close();
      return res.status(400).json({
        error: `Invalid provider. Available providers: ${availableProviders.join(", ")}`,
      });
    }

    // Evaluate the response using selected LLM provider
    const evaluation = await evaluateResponse(
      userAnswer,
      chunk.expectedPoints,
      chunk.question,
      provider
    );

    const calibrationError = confidence - evaluation.accuracy;
    let calibrationDirection = "accurate";
    if (calibrationError > 10) {
      calibrationDirection = "overconfident";
    } else if (calibrationError < -10) {
      calibrationDirection = "underconfident";
    }

    // Generate a correct answer from expected points
    const correctAnswer = chunk.expectedPoints.join(". ") + ".";

    // Calculate total time
    const evaluateTimeSeconds = 0; // Will be updated when user completes evaluate phase
    const totalTimeSeconds = planTimeSeconds + monitorTimeSeconds + evaluateTimeSeconds;

    // Create response document
    const response = {
      sessionId: new ObjectId(sessionId),
      userId: session.userId,
      chunkId: chunkId,
      chunkTopic: chunk.topic,
      goal: goal,
      strategy: strategy,
      planTimestamp: new Date(),
      question: chunk.question,
      userAnswer: userAnswer,
      confidence: confidence,
      monitorTimestamp: new Date(),
      expectedPoints: chunk.expectedPoints,
      correctPoints: evaluation.correctPoints,
      missingPoints: evaluation.missingPoints,
      accuracy: evaluation.accuracy,
      calibrationError: calibrationError,
      calibrationDirection: calibrationDirection,
      feedback: evaluation.feedback,
      strategyHelpful: null,
      strategyReflection: null,
      evaluateTimestamp: new Date(),
      createdAt: new Date(),
      // Time tracking
      planTimeSeconds: planTimeSeconds,
      monitorTimeSeconds: monitorTimeSeconds,
      evaluateTimeSeconds: evaluateTimeSeconds,
      timeSpentSeconds: totalTimeSeconds,
      // Help-seeking behavior
      hintsUsed: hintsUsed,
      contentReviewed: contentReviewed,
    };

    const result = await responsesCollection.insertOne(response);

    // Note: Chunk completion is NOT done here - it's done via separate endpoint
    // to avoid race conditions and maintain single responsibility
    // The frontend should call PATCH /api/sessions/:id/complete-chunk after user clicks "Next chunk"

    await client.close();

    // Return response matching frontend expectations
    res.status(200).json({
      responseId: result.insertedId.toString(),
      accuracy: evaluation.accuracy,
      calibrationError: calibrationError,
      calibrationDirection: calibrationDirection,
      correctPoints: evaluation.correctPoints,
      missingPoints: evaluation.missingPoints,
      correctAnswer: correctAnswer,
      evaluation: evaluation.feedback,
    });
  } catch (error) {
    console.error("Error submitting response:", error);
    res.status(500).json({
      error: "Failed to submit response",
    });
  }
});

// GET /api/responses - Get all responses (with optional filters)
router.get("/", async (req, res) => {
  try {
    const { userId = "anonymous", strategy, limit = 50, skip = 0 } = req.query;

    const client = await mongoClient();
    const db = client.db("metacognition");
    const responsesCollection = db.collection("responses");

    const query = { userId };
    if (strategy) {
      query.strategy = strategy;
    }

    const responses = await responsesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .toArray();

    await client.close();

    res.json({
      responses: responses.map((r) => ({
        ...r,
        _id: r._id.toString(),
        sessionId: r.sessionId.toString(),
      })),
      total: responses.length,
    });
  } catch (error) {
    console.error("Error fetching responses:", error);
    res.status(500).json({ error: "Failed to fetch responses" });
  }
});

// GET /api/responses/session/:sessionId - Get all responses for a session
router.get("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    const client = await mongoClient();
    const db = client.db("metacognition");
    const responsesCollection = db.collection("responses");

    const responses = await responsesCollection
      .find({ sessionId: new ObjectId(sessionId) })
      .sort({ createdAt: 1 })
      .toArray();

    await client.close();

    res.json({
      sessionId: sessionId,
      responses: responses.map((r) => ({
        ...r,
        _id: r._id.toString(),
        sessionId: r.sessionId.toString(),
      })),
      total: responses.length,
    });
  } catch (error) {
    console.error("Error fetching session responses:", error);
    res.status(500).json({ error: "Failed to fetch session responses" });
  }
});

// GET /api/responses/strategy/:strategy - Get responses by strategy
router.get("/strategy/:strategy", async (req, res) => {
  try {
    const { strategy } = req.params;
    const { userId = "anonymous", limit = 50, skip = 0 } = req.query;

    const client = await mongoClient();
    const db = client.db("metacognition");
    const responsesCollection = db.collection("responses");

    const responses = await responsesCollection
      .find({ userId, strategy })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .toArray();

    await client.close();

    res.json({
      strategy: strategy,
      responses: responses.map((r) => ({
        ...r,
        _id: r._id.toString(),
        sessionId: r.sessionId.toString(),
      })),
      total: responses.length,
    });
  } catch (error) {
    console.error("Error fetching responses by strategy:", error);
    res.status(500).json({ error: "Failed to fetch responses" });
  }
});

// PATCH /api/responses/:id/strategy-helpful - Update strategy helpfulness
router.patch("/:id/strategy-helpful", async (req, res) => {
  try {
    const { id } = req.params;
    const { strategyHelpful, strategyReflection = "" } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid response ID" });
    }

    if (typeof strategyHelpful !== "boolean") {
      return res.status(400).json({
        error: "strategyHelpful must be a boolean",
      });
    }

    const client = await mongoClient();
    const db = client.db("metacognition");
    const responsesCollection = db.collection("responses");

    const updateFields = {
      strategyHelpful: strategyHelpful,
    };

    // Only add strategyReflection if provided
    if (strategyReflection && strategyReflection.trim()) {
      updateFields.strategyReflection = strategyReflection.trim();
    }

    const result = await responsesCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: updateFields,
      },
    );

    await client.close();

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Response not found" });
    }

    res.json({
      message: "Strategy feedback updated",
      strategyHelpful: strategyHelpful,
      strategyReflection: updateFields.strategyReflection || null,
    });
  } catch (error) {
    console.error("Error updating strategy feedback:", error);
    res.status(500).json({
      error: "Failed to update strategy feedback",
    });
  }
});

// DELETE /api/responses/:id - Delete a response
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid response ID" });
    }

    const client = await mongoClient();
    const db = client.db("metacognition");
    const responsesCollection = db.collection("responses");

    const result = await responsesCollection.deleteOne({
      _id: new ObjectId(id),
    });

    await client.close();

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Response not found" });
    }

    res.json({ message: "Response deleted successfully" });
  } catch (error) {
    console.error("Error deleting response:", error);
    res.status(500).json({ error: "Failed to delete response" });
  }
});

export default router;
