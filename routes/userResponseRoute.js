import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db/mongoDBClient.js";
import {
  evaluateResponse,
  getAvailableProviders,
} from "../services/llmService.js";

const router = express.Router();

/**
 * Update session statistics after a new response is added
 * Calculates averages for accuracy, confidence, calibration, and total time
 */
async function updateSessionStats(sessionsCollection, sessionId) {
  const db = await getDb();
  const responsesCollection = db.collection("responses");

  // Get all responses for this session
  const responses = await responsesCollection
    .find({ sessionId: sessionId })
    .toArray();

  if (responses.length === 0) {
    return; // No responses yet, nothing to update
  }

  // Calculate statistics
  const totalResponses = responses.length;
  const avgAccuracy = Math.round(
    responses.reduce((sum, r) => sum + r.accuracy, 0) / totalResponses,
  );
  const avgConfidence = Math.round(
    responses.reduce((sum, r) => sum + r.confidence, 0) / totalResponses,
  );
  const calibrationError = avgConfidence - avgAccuracy;
  const totalTime = responses.reduce((sum, r) => sum + r.timeSpentSeconds, 0);

  // Update session stats
  await sessionsCollection.updateOne(
    { _id: sessionId },
    {
      $set: {
        "sessionStats.averageAccuracy": avgAccuracy,
        "sessionStats.averageConfidence": avgConfidence,
        "sessionStats.calibrationError": calibrationError,
        "sessionStats.totalTimeSeconds": totalTime,
      },
    },
  );
}

// POST /api/responses - Submit a chunk response
router.post("/", async (req, res) => {
  try {
    const {
      sessionId,
      chunkId,
      goal,
      strategy,
      customStrategyDescription = "",
      priorKnowledge = "",
      hasPriorKnowledge = true,
      userAnswer,
      confidence,
      muddyPoint = "",
      provider = "GEMINI",
      priorKnowledgeTimeSeconds = 0,
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

    // Validate ObjectId and fetch from database
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

    const responsesCollection = db.collection("responses");

    // Validate provider
    const availableProviders = getAvailableProviders();
    if (!availableProviders.includes(provider.toUpperCase())) {
      return res.status(400).json({
        error: `Invalid provider. Available providers: ${availableProviders.join(", ")}`,
      });
    }

    // Get goal-specific question and expected points
    const questionToUse = chunk.questions?.[goal] || chunk.question;
    const expectedPointsToUse =
      chunk.expectedPoints?.[goal] || chunk.expectedPoints;

    // Evaluate the response using selected LLM provider
    const evaluation = await evaluateResponse(
      userAnswer,
      expectedPointsToUse,
      questionToUse,
      provider,
      muddyPoint,
      priorKnowledge,
    );

    const calibrationError = confidence - evaluation.accuracy;
    let calibrationDirection = "accurate";
    if (calibrationError > 10) {
      calibrationDirection = "overconfident";
    } else if (calibrationError < -10) {
      calibrationDirection = "underconfident";
    }

    // Generate a correct answer from expected points
    const correctAnswer = expectedPointsToUse.join(". ") + ".";

    // Calculate total time
    const evaluateTimeSeconds = 0; // Will be updated when user completes evaluate phase
    const totalTimeSeconds =
      priorKnowledgeTimeSeconds +
      planTimeSeconds +
      monitorTimeSeconds +
      evaluateTimeSeconds;

    // Save response to database
    const response = {
      sessionId: new ObjectId(sessionId),
      userId: session.userId,
      chunkId: chunkId,
      chunkTopic: chunk.topic,
      // Prior Knowledge phase
      priorKnowledge: priorKnowledge,
      hasPriorKnowledge: hasPriorKnowledge,
      priorKnowledgeTimeSeconds: priorKnowledgeTimeSeconds,
      // Plan phase
      goal: goal,
      strategy: strategy,
      customStrategyDescription: customStrategyDescription,
      planTimestamp: new Date(),
      planTimeSeconds: planTimeSeconds,
      // Monitor phase
      question: questionToUse,
      userAnswer: userAnswer,
      confidence: confidence,
      muddyPoint: muddyPoint,
      monitorTimestamp: new Date(),
      monitorTimeSeconds: monitorTimeSeconds,
      // Help-seeking behavior
      hintsUsed: hintsUsed,
      contentReviewed: contentReviewed,
      // Evaluate phase (LLM evaluation)
      expectedPoints: expectedPointsToUse,
      correctPoints: evaluation.correctPoints,
      missingPoints: evaluation.missingPoints,
      accuracy: evaluation.accuracy,
      calibrationError: calibrationError,
      calibrationDirection: calibrationDirection,
      feedback: evaluation.feedback,
      evaluateTimestamp: new Date(),
      evaluateTimeSeconds: evaluateTimeSeconds,
      // User reflection (will be updated via PATCH)
      strategyHelpful: null,
      strategyReflection: null,
      goalAchieved: null,
      nextTimeAdjustment: null,
      // Metadata
      createdAt: new Date(),
      timeSpentSeconds: totalTimeSeconds,
    };

    const result = await responsesCollection.insertOne(response);
    const responseId = result.insertedId.toString();

    // Update session stats with this new response
    await updateSessionStats(sessionsCollection, new ObjectId(sessionId));

    // Return response matching frontend expectations
    res.status(200).json({
      responseId: responseId,
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

    const db = await getDb();
    // Using connection pool
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

    const db = await getDb();
    // Using connection pool
    const responsesCollection = db.collection("responses");

    const responses = await responsesCollection
      .find({ sessionId: new ObjectId(sessionId) })
      .sort({ createdAt: 1 })
      .toArray();
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

    const db = await getDb();
    // Using connection pool
    const responsesCollection = db.collection("responses");

    const responses = await responsesCollection
      .find({ userId, strategy })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .toArray();

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

// GET /api/responses/strategy-history/:strategy - Get strategy usage history summary
router.get("/strategy-history/:strategy", async (req, res) => {
  try {
    const { strategy } = req.params;
    const { userId = "anonymous" } = req.query;

    const db = await getDb();
    const responsesCollection = db.collection("responses");

    // Get all previous uses of this strategy by the user
    const responses = await responsesCollection
      .find({
        userId,
        strategy,
        strategyReflection: { $ne: null }, // Only get responses with reflections
      })
      .sort({ createdAt: -1 })
      .limit(10) // Get last 10 uses max
      .toArray();

    // Return summary data
    const history = responses.map((r) => ({
      strategyReflection: r.strategyReflection,
      strategyHelpful: r.strategyHelpful,
      accuracy: r.accuracy,
      createdAt: r.createdAt,
    }));

    res.json({
      strategy: strategy,
      usageCount: history.length,
      history: history,
    });
  } catch (error) {
    console.error("Error fetching strategy history:", error);
    res.status(500).json({ error: "Failed to fetch strategy history" });
  }
});

// PATCH /api/responses/:id/strategy-helpful - Update strategy helpfulness
router.patch("/:id/strategy-helpful", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      strategyHelpful,
      strategyReflection = "",
      goalAchieved = null,
      nextTimeAdjustment = null,
    } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid response ID" });
    }

    if (typeof strategyHelpful !== "boolean") {
      return res.status(400).json({
        error: "strategyHelpful must be a boolean",
      });
    }

    const db = await getDb();
    // Using connection pool
    const responsesCollection = db.collection("responses");

    const updateFields = {
      strategyHelpful: strategyHelpful,
    };

    // Only add strategyReflection if provided
    if (strategyReflection && strategyReflection.trim()) {
      updateFields.strategyReflection = strategyReflection.trim();
    }

    // Add goalAchieved if provided
    if (goalAchieved) {
      updateFields.goalAchieved = goalAchieved;
    }

    // Add nextTimeAdjustment if provided
    if (nextTimeAdjustment) {
      updateFields.nextTimeAdjustment = nextTimeAdjustment;
    }

    const result = await responsesCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: updateFields,
      },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Response not found" });
    }

    res.json({
      message: "Strategy feedback updated",
      strategyHelpful: strategyHelpful,
      strategyReflection: updateFields.strategyReflection || null,
      goalAchieved: updateFields.goalAchieved || null,
      nextTimeAdjustment: updateFields.nextTimeAdjustment || null,
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

    const db = await getDb();
    // Using connection pool
    const responsesCollection = db.collection("responses");

    const result = await responsesCollection.deleteOne({
      _id: new ObjectId(id),
    });

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
