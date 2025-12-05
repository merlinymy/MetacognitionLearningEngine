import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db/mongoDBClient.js";

const router = express.Router();

// POST /api/sessions - Create new session
router.post("/", async (req, res) => {
  try {
    const {
      userId = req.user?._id?.toString() || "anonymous",
      rawContent,
      contentPreview,
      chunks,
    } = req.body;

    if (!rawContent || !chunks || chunks.length === 0) {
      return res
        .status(400)
        .json({ error: "Missing required fields: rawContent and chunks" });
    }

    const db = await getDb();
    const sessionsCollection = db.collection("sessions");

    const session = {
      userId,
      rawContent,
      contentPreview: contentPreview || rawContent.substring(0, 100),
      createdAt: new Date(),
      completedAt: null,
      status: "in_progress",
      chunks: chunks.map((chunk, index) => ({
        chunkId: chunk.chunkId || `chunk_${index}`,
        topic: chunk.topic,
        miniTeach: chunk.miniTeach,
        question: chunk.question,
        expectedPoints: chunk.expectedPoints || [],
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

    res.status(201).json({
      sessionId: result.insertedId.toString(),
      message: "Session created successfully",
    });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// GET /api/sessions - List all sessions
router.get("/", async (req, res) => {
  try {
    // Use authenticated user if available, otherwise use query param or default
    const defaultUserId = req.user?._id?.toString() || "anonymous";
    const { userId = defaultUserId, limit = 50, skip = 0 } = req.query;

    const db = await getDb();
    const sessionsCollection = db.collection("sessions");

    const sessions = await sessionsCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .toArray();

    res.json({
      sessions: sessions.map((s) => ({
        _id: s._id.toString(),
        contentPreview: s.contentPreview,
        createdAt: s.createdAt,
        completedAt: s.completedAt,
        status: s.status,
        sessionStats: s.sessionStats,
      })),
      total: sessions.length,
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// GET /api/sessions/:id - Get specific session
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    const db = await getDb();
    const sessionsCollection = db.collection("sessions");

    const session = await sessionsCollection.findOne({ _id: new ObjectId(id) });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({
      ...session,
      _id: session._id.toString(),
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// PATCH /api/sessions/:id/complete-chunk - Mark chunk as complete
router.patch("/:id/complete-chunk", async (req, res) => {
  try {
    const { id } = req.params;
    const { chunkId } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    if (!chunkId) {
      return res.status(400).json({ error: "Missing chunkId" });
    }

    const db = await getDb();
    const sessionsCollection = db.collection("sessions");

    const result = await sessionsCollection.updateOne(
      { _id: new ObjectId(id), "chunks.chunkId": chunkId },
      { $set: { "chunks.$.completed": true } },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Session or chunk not found" });
    }

    // Get updated session to recalculate stats
    const session = await sessionsCollection.findOne({ _id: new ObjectId(id) });
    const completedChunks = session.chunks.filter((c) => c.completed).length;

    // Update session stats
    await sessionsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          "sessionStats.chunksCompleted": completedChunks,
          status:
            completedChunks === session.chunks.length
              ? "completed"
              : "in_progress",
          completedAt:
            completedChunks === session.chunks.length
              ? new Date()
              : session.completedAt,
        },
      },
    );

    res.json({
      message: "Chunk marked as complete",
      chunksCompleted: completedChunks,
    });
  } catch (error) {
    console.error("Error completing chunk:", error);
    res.status(500).json({ error: "Failed to complete chunk" });
  }
});

// GET /api/sessions/:id/summary - Get session summary with stats
router.get("/:id/summary", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    const db = await getDb();
    const sessionsCollection = db.collection("sessions");
    const responsesCollection = db.collection("responses");

    const session = await sessionsCollection.findOne({ _id: new ObjectId(id) });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Get all responses for this session (for strategy performance)
    const responses = await responsesCollection
      .find({ sessionId: new ObjectId(id) })
      .toArray();

    // Use stats from session (already calculated on each response)
    const averageAccuracy = session.sessionStats.averageAccuracy || 0;
    const averageConfidence = session.sessionStats.averageConfidence || 0;
    const calibrationError = session.sessionStats.calibrationError || 0;

    // Calculate strategy performance
    const strategyMap = {};
    responses.forEach((r) => {
      if (!strategyMap[r.strategy]) {
        strategyMap[r.strategy] = { totalAccuracy: 0, count: 0 };
      }
      strategyMap[r.strategy].totalAccuracy += r.accuracy;
      strategyMap[r.strategy].count += 1;
    });

    const strategyPerformance = Object.entries(strategyMap).map(
      ([strategy, data]) => ({
        strategy,
        accuracy: Math.round(data.totalAccuracy / data.count),
        uses: data.count,
      }),
    );

    // Sort by accuracy descending
    strategyPerformance.sort((a, b) => b.accuracy - a.accuracy);

    // Generate insight
    let insight = "Complete more chunks to get personalized insights.";
    if (strategyPerformance.length > 0) {
      const bestStrategy = strategyPerformance[0];
      insight = `Your '${bestStrategy.strategy}' strategy worked best! You scored ${bestStrategy.accuracy}% when using it.`;

      if (strategyPerformance.length > 1) {
        const diff = bestStrategy.accuracy - strategyPerformance[1].accuracy;
        if (diff > 5) {
          insight += ` That's ${diff}% higher than your other strategies. Try using it more often!`;
        }
      }
    }

    // Stats are already updated in real-time by POST /api/responses
    // No need to recalculate here

    res.json({
      sessionId: id,
      title: session.contentPreview,
      completedAt: session.completedAt,
      stats: {
        totalChunks: session.chunks.length,
        chunksCompleted: session.sessionStats.chunksCompleted,
        averageAccuracy: Math.round(averageAccuracy),
        averageConfidence: Math.round(averageConfidence),
        calibrationError: Math.round(calibrationError),
        totalTimeSeconds: session.sessionStats.totalTimeSeconds,
      },
      strategyPerformance,
      insight,
    });
  } catch (error) {
    console.error("Error fetching session summary:", error);
    res.status(500).json({ error: "Failed to fetch session summary" });
  }
});

// POST /api/sessions/:id/redo - Reset session to allow redoing
router.post("/:id/redo", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    const db = await getDb();
    const sessionsCollection = db.collection("sessions");
    const responsesCollection = db.collection("responses");

    // Get the session
    const session = await sessionsCollection.findOne({ _id: new ObjectId(id) });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Delete all responses for this session
    await responsesCollection.deleteMany({ sessionId: new ObjectId(id) });

    // Reset all chunks to incomplete
    const resetChunks = session.chunks.map((chunk) => ({
      ...chunk,
      completed: false,
    }));

    // Reset session stats and status
    await sessionsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          chunks: resetChunks,
          status: "in_progress",
          completedAt: null,
          "sessionStats.chunksCompleted": 0,
          "sessionStats.averageAccuracy": 0,
          "sessionStats.averageConfidence": 0,
          "sessionStats.calibrationError": 0,
          "sessionStats.totalTimeSeconds": 0,
        },
      },
    );

    res.json({
      message: "Session reset successfully",
      sessionId: id,
    });
  } catch (error) {
    console.error("Error resetting session:", error);
    res.status(500).json({ error: "Failed to reset session" });
  }
});

// DELETE /api/sessions/:id - Delete session
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    const db = await getDb();
    const sessionsCollection = db.collection("sessions");
    const responsesCollection = db.collection("responses");

    // Delete all responses for this session
    await responsesCollection.deleteMany({ sessionId: new ObjectId(id) });

    // Delete the session
    const result = await sessionsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ error: "Failed to delete session" });
  }
});

export default router;
