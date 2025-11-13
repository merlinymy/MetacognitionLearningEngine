import { useState, useEffect } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import Progress from "../components/Progress";
import Slider from "../components/Slider";
import {
  getSession,
  getChunk,
  submitResponse,
  completeChunk,
  markStrategyHelpful,
} from "../services/api";
import "./Learning.css";

const PHASES = {
  PLAN: "plan",
  MONITOR: "monitor",
  EVALUATE: "evaluate",
};

const GOALS = [
  { id: "understand", label: "Understand the concept" },
  { id: "memorize", label: "Memorize key information" },
  { id: "apply", label: "Apply to real situations" },
  { id: "analyze", label: "Analyze and critique" },
];

const STRATEGIES = [
  "Self-explain (teach it back)",
  "Visualize (create mental images)",
  "Work an example",
  "Connect to prior knowledge",
  "Ask questions about it",
];

const Learning = ({ sessionId, onComplete, onExit }) => {
  const [session, setSession] = useState(null);
  const [currentChunk, setCurrentChunk] = useState(null);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [phase, setPhase] = useState(PHASES.PLAN);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Plan phase state
  const [selectedGoal, setSelectedGoal] = useState("");

  // Monitor phase state
  const [selectedStrategy, setSelectedStrategy] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [confidence, setConfidence] = useState(50);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [contentReviewed, setContentReviewed] = useState(false);

  // Time tracking
  const [phaseStartTime, setPhaseStartTime] = useState(Date.now());
  const [planTime, setPlanTime] = useState(0);
  const [monitorTime, setMonitorTime] = useState(0);

  // Evaluate phase state
  const [feedback, setFeedback] = useState(null);
  const [responseId, setResponseId] = useState(null);
  const [strategyFeedbackGiven, setStrategyFeedbackGiven] = useState(null);
  const [strategyReflection, setStrategyReflection] = useState("");

  // Load session data
  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        const sessionData = await getSession(sessionId);
        setSession(sessionData);

        // Find first incomplete chunk
        const incompleteIndex = sessionData.chunks.findIndex(
          (c) => !c.completed,
        );
        const chunkIndex =
          incompleteIndex !== -1 ? incompleteIndex : sessionData.chunks.length;

        if (chunkIndex >= sessionData.chunks.length) {
          // All chunks completed
          onComplete();
          return;
        }

        setCurrentChunkIndex(chunkIndex);
        const chunkData = await getChunk(
          sessionId,
          sessionData.chunks[chunkIndex].chunkId
        );
        setCurrentChunk(chunkData.chunk);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load session");
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId, onComplete]);

  const handlePlanComplete = () => {
    if (!selectedGoal) {
      setError("Please select a learning goal");
      return;
    }
    setError("");

    // Track time spent in Plan phase
    const timeSpent = Math.floor((Date.now() - phaseStartTime) / 1000);
    setPlanTime(timeSpent);
    setPhaseStartTime(Date.now());

    setPhase(PHASES.MONITOR);
  };

  const handleMonitorComplete = async () => {
    if (!selectedStrategy || !userAnswer.trim()) {
      setError("Please select a strategy and provide your answer");
      return;
    }

    setError("");
    setLoading(true);

    // Track time spent in Monitor phase
    const timeSpent = Math.floor((Date.now() - phaseStartTime) / 1000);
    setMonitorTime(timeSpent);

    try {
      const result = await submitResponse({
        sessionId,
        chunkId: currentChunk.chunkId,
        goal: selectedGoal,
        strategy: selectedStrategy,
        userAnswer: userAnswer,
        confidence: confidence,
        planTimeSeconds: planTime,
        monitorTimeSeconds: timeSpent,
        hintsUsed: hintsUsed,
        contentReviewed: contentReviewed,
      });

      setFeedback(result);
      setResponseId(result.responseId);
      setPhaseStartTime(Date.now());
      setPhase(PHASES.EVALUATE);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to submit response");
      setLoading(false);
    }
  };

  const handleStrategyFeedback = async (helpful) => {
    if (responseId && strategyReflection.trim()) {
      try {
        await markStrategyHelpful(responseId, helpful, strategyReflection);
        setStrategyFeedbackGiven(helpful);
      } catch (err) {
        console.error("Failed to mark strategy:", err);
        setError("Failed to save feedback");
      }
    }
  };

  const handleNextChunk = async () => {
    setLoading(true);

    try {
      await completeChunk(sessionId, currentChunk.chunkId);

      const nextIndex = currentChunkIndex + 1;

      if (nextIndex >= session.chunks.length) {
        // All chunks completed
        onComplete();
        return;
      }

      // Load next chunk
      setCurrentChunkIndex(nextIndex);
      const chunkData = await getChunk(
        sessionId,
        session.chunks[nextIndex].chunkId
      );
      setCurrentChunk(chunkData.chunk);

      // Reset state for next chunk
      setPhase(PHASES.PLAN);
      setSelectedGoal("");
      setSelectedStrategy("");
      setUserAnswer("");
      setConfidence(50);
      setFeedback(null);
      setResponseId(null);
      setStrategyFeedbackGiven(null);
      setStrategyReflection("");
      setHintsUsed(0);
      setContentReviewed(false);
      setPhaseStartTime(Date.now());
      setPlanTime(0);
      setMonitorTime(0);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to load next chunk");
      setLoading(false);
    }
  };

  if (loading && !currentChunk) {
    return (
      <div className="learning">
        <div className="learning-container">
          <p className="learning-loading">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !currentChunk) {
    return (
      <div className="learning">
        <div className="learning-container">
          <div className="learning-error">{error}</div>
          <Button onClick={onExit}>Back to library</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="learning">
      <div className="learning-container">
        <div className="learning-header">
          <button className="learning-exit" onClick={onExit}>
            ← Exit
          </button>
          <Progress
            current={currentChunkIndex + 1}
            total={session?.chunks.length || 1}
            showLabel
          />
        </div>

        <div className="learning-content">
          {/* Plan Phase */}
          {phase === PHASES.PLAN && (
            <div className="learning-phase">
              <h2 className="learning-phase-title">Plan</h2>
              <p className="learning-phase-subtitle">
                Set your learning goal for this chunk
              </p>

              <Card>
                <div className="learning-chunk-content">
                  {currentChunk?.miniTeach}
                </div>
              </Card>

              <div className="learning-goals">
                <label className="learning-label">Choose your goal:</label>
                {GOALS.map((goal) => (
                  <Card
                    key={goal.id}
                    hover
                    onClick={() => setSelectedGoal(goal.id)}
                  >
                    <div className="learning-goal">
                      <input
                        type="radio"
                        name="goal"
                        checked={selectedGoal === goal.id}
                        onChange={() => setSelectedGoal(goal.id)}
                      />
                      <span>{goal.label}</span>
                    </div>
                  </Card>
                ))}
              </div>

              {error && <div className="learning-error">{error}</div>}

              <Button
                variant="primary"
                onClick={handlePlanComplete}
                fullWidth
                disabled={!selectedGoal}
              >
                Continue to monitor
              </Button>
            </div>
          )}

          {/* Monitor Phase */}
          {phase === PHASES.MONITOR && (
            <div className="learning-phase">
              <h2 className="learning-phase-title">Monitor</h2>
              <p className="learning-phase-subtitle">
                Try to answer the question and track your understanding
              </p>

              <Card>
                <div className="learning-question">
                  {currentChunk?.question}
                </div>
              </Card>

              <div className="learning-strategies">
                <label className="learning-label">Choose a strategy:</label>
                {STRATEGIES.map((strategy) => (
                  <Card
                    key={strategy}
                    hover
                    onClick={() => setSelectedStrategy(strategy)}
                  >
                    <div className="learning-strategy">
                      <input
                        type="radio"
                        name="strategy"
                        checked={selectedStrategy === strategy}
                        onChange={() => setSelectedStrategy(strategy)}
                      />
                      <span>{strategy}</span>
                    </div>
                  </Card>
                ))}
              </div>

              <div>
                <label className="learning-label">Your answer:</label>
                <textarea
                  className="learning-textarea"
                  placeholder="Type your answer here..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  rows={6}
                />
              </div>

              <Slider
                value={confidence}
                onChange={setConfidence}
                min={0}
                max={100}
                label="How confident are you?"
              />

              {error && <div className="learning-error">{error}</div>}

              <Button
                variant="primary"
                onClick={handleMonitorComplete}
                fullWidth
                disabled={!selectedStrategy || !userAnswer.trim() || loading}
              >
                {loading ? "Evaluating..." : "Get feedback"}
              </Button>
            </div>
          )}

          {/* Evaluate Phase */}
          {phase === PHASES.EVALUATE && feedback && (
            <div className="learning-phase">
              <h2 className="learning-phase-title">Evaluate</h2>
              <p className="learning-phase-subtitle">
                Review your performance and learn from feedback
              </p>

              {/* Performance Display */}
              <Card>
                <div className="learning-feedback-section">
                  <h3 className="learning-feedback-title">Your Performance</h3>
                  <div className="accuracy-display">
                    <div className="accuracy-percentage">
                      {feedback.accuracy}% Accuracy
                    </div>
                    <div className="accuracy-bar">
                      <div
                        className="accuracy-fill"
                        style={{ width: `${feedback.accuracy}%` }}
                      />
                    </div>
                    <p className="accuracy-context">
                      You captured {feedback.correctPoints?.length || 0} of{" "}
                      {(feedback.correctPoints?.length || 0) +
                        (feedback.missingPoints?.length || 0)}{" "}
                      key concepts!{" "}
                      {feedback.accuracy >= 80
                        ? "🎉"
                        : feedback.accuracy >= 50
                          ? "👍"
                          : "💪"}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Calibration Feedback */}
              <Card>
                <div className="learning-feedback-section">
                  <h3 className="learning-feedback-title">
                    🎯 Calibration Check
                  </h3>
                  <div className="calibration-display">
                    <div className="calibration-comparison">
                      <div className="calibration-item">
                        <span className="calibration-label">
                          Your Confidence:
                        </span>
                        <span className="calibration-value">{confidence}%</span>
                      </div>
                      <div className="calibration-item">
                        <span className="calibration-label">
                          Actual Accuracy:
                        </span>
                        <span className="calibration-value">
                          {feedback.accuracy}%
                        </span>
                      </div>
                    </div>
                    <div className="calibration-message">
                      {Math.abs(feedback.calibrationError) < 10 ? (
                        <p>
                          ✅ Great calibration! You accurately assessed your
                          understanding.
                        </p>
                      ) : feedback.calibrationError > 0 ? (
                        <p>
                          📊 You were {Math.abs(feedback.calibrationError)}%
                          overconfident. As you practice, you'll get better at
                          knowing what you truly understand!
                        </p>
                      ) : (
                        <p>
                          📊 You were {Math.abs(feedback.calibrationError)}%
                          underconfident. You knew more than you thought!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="learning-feedback-section">
                  <h3 className="learning-feedback-title">Your answer</h3>
                  <p className="learning-feedback-text">{userAnswer}</p>
                </div>
              </Card>

              <Card>
                <div className="learning-feedback-section">
                  <h3 className="learning-feedback-title">Correct answer</h3>
                  <p className="learning-feedback-text">
                    {feedback.correctAnswer}
                  </p>
                </div>
              </Card>

              <Card>
                <div className="learning-feedback-section">
                  <h3 className="learning-feedback-title">Feedback</h3>
                  <p className="learning-feedback-text">
                    {feedback.evaluation}
                  </p>
                </div>
              </Card>

              <div className="learning-strategy-feedback">
                <p className="learning-label">
                  Reflect on the &ldquo;{selectedStrategy}&rdquo; strategy
                </p>

                <div>
                  <label className="learning-label" style={{ fontSize: "14px", marginBottom: "8px" }}>
                    Why did this strategy work or not work for you?
                  </label>
                  <textarea
                    className="learning-textarea"
                    placeholder="e.g., 'Self-explaining helped me realize I didn't fully understand the concept' or 'Visualizing didn't work because the topic was too abstract'"
                    value={strategyReflection}
                    onChange={(e) => setStrategyReflection(e.target.value)}
                    rows={3}
                    disabled={strategyFeedbackGiven !== null}
                  />
                </div>

                <div>
                  <p className="learning-label" style={{ marginTop: "16px" }}>
                    Was this strategy helpful?
                  </p>
                  <div className="learning-strategy-buttons">
                    <Button
                      variant={strategyFeedbackGiven === true ? "primary" : "secondary"}
                      onClick={() => handleStrategyFeedback(true)}
                      disabled={strategyFeedbackGiven !== null || !strategyReflection.trim()}
                    >
                      {strategyFeedbackGiven === true ? "✓ " : ""}Yes, helpful
                    </Button>
                    <Button
                      variant={strategyFeedbackGiven === false ? "primary" : "secondary"}
                      onClick={() => handleStrategyFeedback(false)}
                      disabled={strategyFeedbackGiven !== null || !strategyReflection.trim()}
                    >
                      {strategyFeedbackGiven === false ? "✓ " : ""}Not helpful
                    </Button>
                  </div>
                  {!strategyReflection.trim() && strategyFeedbackGiven === null && (
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "8px" }}>
                      Please share your reflection before rating the strategy
                    </p>
                  )}
                </div>
              </div>

              <Button variant="primary" onClick={handleNextChunk} fullWidth>
                {currentChunkIndex + 1 >= session.chunks.length
                  ? "Complete session"
                  : "Next chunk"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Learning;
