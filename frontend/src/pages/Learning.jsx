import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import Progress from "../components/Progress";
import Slider from "../components/Slider";
import SaveProgressBanner from "../components/SaveProgressBanner";
import HelpTooltip from "../components/HelpTooltip";
import DemoBanner from "../components/DemoBanner";
import {
  getSession,
  getChunk,
  submitResponse,
  completeChunk,
  markStrategyHelpful,
  getStrategyHistory,
} from "../services/api";
import {
  addGuestSession,
  updateGuestSessionProgress,
  shouldShowPrompt,
  markPromptShown,
  markPromptDismissed,
} from "../utils/guestStorage";
import "./Learning.css";

const PHASES = {
  PRIOR_KNOWLEDGE: "prior_knowledge",
  PLAN: "plan",
  MONITOR: "monitor",
  EVALUATE: "evaluate",
};

const GOALS = [
  {
    id: "gist",
    icon: "📋",
    label: "Get the gist",
    description: "Understand the main idea quickly",
  },
  {
    id: "explain",
    icon: "💡",
    label: "Be able to explain",
    description: "Deeply understand to teach others",
  },
  {
    id: "apply",
    icon: "🛠️",
    label: "Apply to a problem",
    description: "Use this concept in practice",
  },
];

const STRATEGIES = [
  {
    id: "self-explain",
    icon: "💬",
    label: "Self-explain",
    description: "Describe the concept in your own words",
    guidance: "Imagine teaching this to a friend. What would you say?",
  },
  {
    id: "visualize",
    icon: "✏️",
    label: "Visualize it",
    description: "Create a mental image or diagram",
    guidance: "What would this look like as a picture or flowchart?",
  },
  {
    id: "example",
    icon: "📝",
    label: "Work an example",
    description: "Apply to a concrete case",
    guidance: "Try the concept with specific numbers or scenarios",
  },
  {
    id: "connect",
    icon: "🔗",
    label: "Connect to prior knowledge",
    description: "Link to something you already know",
    guidance: "How is this similar to concepts you already understand?",
  },
  {
    id: "teach",
    icon: "👥",
    label: "Pretend to teach",
    description: "Explain as if teaching someone",
    guidance: "What would you write on a whiteboard to explain this?",
  },
  {
    id: "other",
    icon: "✨",
    label: "My own approach",
    description: "Use your preferred strategy",
    requiresInput: true,
  },
];

const NEXT_TIME_OPTIONS = [
  { id: "same-strategy", label: "Keep using the same strategy" },
  { id: "different-strategy", label: "Try a different strategy" },
  { id: "slow-down", label: "Slow down and think more carefully" },
  { id: "review-content", label: "Review the content before answering" },
  { id: "ask-hints", label: "Ask for hints earlier" },
  { id: "other", label: "Other (specify below)" },
];

const Learning = ({ user }) => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  const [session, setSession] = useState(null);
  const [currentChunk, setCurrentChunk] = useState(null);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [phase, setPhase] = useState(PHASES.PRIOR_KNOWLEDGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Guest progress tracking
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [savePromptVariant, setSavePromptVariant] = useState("gentle");

  // Prior Knowledge phase state
  const [priorKnowledge, setPriorKnowledge] = useState("");
  const [hasPriorKnowledge, setHasPriorKnowledge] = useState(true);
  const [priorKnowledgeTime, setPriorKnowledgeTime] = useState(0);

  // Plan phase state
  const [selectedGoal, setSelectedGoal] = useState("");
  const [selectedStrategy, setSelectedStrategy] = useState("");
  const [customStrategy, setCustomStrategy] = useState("");

  // Monitor phase state
  const [userAnswer, setUserAnswer] = useState("");
  const [confidence, setConfidence] = useState(50);
  const [muddyPoint, setMuddyPoint] = useState("");
  const [visibleHints, setVisibleHints] = useState(0);
  const [showContent, setShowContent] = useState(false);
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
  const [goalAchieved, setGoalAchieved] = useState(null);
  const [nextTimeAdjustment, setNextTimeAdjustment] = useState("");
  const [nextTimeCustom, setNextTimeCustom] = useState("");
  const [strategyHistory, setStrategyHistory] = useState(null);

  // Load session data
  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);

        // Fetch session from API
        const sessionData = await getSession(sessionId);
        setSession(sessionData);

        // If guest user, save session to localStorage for tracking
        if (!user && sessionData) {
          addGuestSession(
            sessionId,
            sessionData.contentPreview || "Learning Session",
          );
        }

        // Set default goal from session if available
        if (sessionData.defaultGoal) {
          setSelectedGoal(sessionData.defaultGoal);
        }

        // Find first incomplete chunk
        const incompleteIndex = sessionData.chunks.findIndex(
          (c) => !c.completed,
        );
        const chunkIndex =
          incompleteIndex !== -1 ? incompleteIndex : sessionData.chunks.length;

        if (chunkIndex >= sessionData.chunks.length) {
          // All chunks completed
          navigate(`/summary/${sessionId}`);
          return;
        }

        setCurrentChunkIndex(chunkIndex);

        // Fetch chunk from API
        const chunkData = await getChunk(
          sessionId,
          sessionData.chunks[chunkIndex].chunkId,
        );
        setCurrentChunk(chunkData.chunk);

        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load session");
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId, navigate, user]);

  const handlePriorKnowledgeComplete = () => {
    const timeSpent = Math.floor((Date.now() - phaseStartTime) / 1000);
    setPriorKnowledgeTime(timeSpent);
    setPhaseStartTime(Date.now());
    setPhase(PHASES.PLAN);
  };

  const handlePlanComplete = () => {
    if (!selectedGoal || !selectedStrategy) {
      setError("Please select both a goal and a strategy");
      return;
    }

    if (selectedStrategy === "other" && !customStrategy.trim()) {
      setError("Please describe your custom strategy");
      return;
    }

    setError("");

    // Track time spent in Plan phase
    const timeSpent = Math.floor((Date.now() - phaseStartTime) / 1000);
    setPlanTime(timeSpent);
    setPhaseStartTime(Date.now());

    setPhase(PHASES.MONITOR);
  };

  const handleShowHint = () => {
    if (
      currentChunk?.hints &&
      visibleHints < currentChunk.hints.length
    ) {
      setVisibleHints(visibleHints + 1);
    }
  };

  const handleReviewContent = () => {
    setShowContent(!showContent);
    if (!contentReviewed) {
      setContentReviewed(true);
    }
  };

  const handleMonitorComplete = async () => {
    if (!userAnswer.trim()) {
      setError("Please provide your answer");
      return;
    }

    setError("");
    setLoading(true);

    // Track time spent in Monitor phase
    const timeSpent = Math.floor((Date.now() - phaseStartTime) / 1000);
    setMonitorTime(timeSpent);

    try {
      // Call submitResponse API for both demo and regular sessions
      // Demo gets real LLM feedback based on their actual answer!
      const requestData = {
        sessionId,
        chunkId: currentChunk.chunkId,
        goal: selectedGoal,
        strategy: selectedStrategy,
        customStrategyDescription:
          selectedStrategy === "other" ? customStrategy : "",
        priorKnowledge,
        hasPriorKnowledge,
        userAnswer,
        confidence,
        muddyPoint,
        planTimeSeconds: planTime,
        priorKnowledgeTimeSeconds: priorKnowledgeTime,
        monitorTimeSeconds: timeSpent,
        hintsUsed: visibleHints,
        contentReviewed,
      };

      const result = await submitResponse(requestData);

      // Fetch strategy history for contextual prompts
      const strategyToFetch =
        selectedStrategy === "other" ? customStrategy : selectedStrategy;
      const userId = session?.userId || "anonymous";
      try {
        const history = await getStrategyHistory(strategyToFetch, userId);
        setStrategyHistory(history);
      } catch (err) {
        console.error("Failed to fetch strategy history:", err);
        setStrategyHistory(null);
      }

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
    if (
      responseId &&
      strategyReflection.trim() &&
      goalAchieved &&
      (nextTimeAdjustment || nextTimeAdjustment === "other")
    ) {
      const adjustment =
        nextTimeAdjustment === "other"
          ? nextTimeCustom.trim()
          : NEXT_TIME_OPTIONS.find((opt) => opt.id === nextTimeAdjustment)
              ?.label || "";

      try {
        await markStrategyHelpful(
          responseId,
          helpful,
          strategyReflection,
          goalAchieved,
          adjustment,
        );
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

      // Update guest session progress
      if (!user) {
        updateGuestSessionProgress(sessionId, nextIndex);

        // Show save progress prompts after certain chunks
        if (nextIndex === 1 && shouldShowPrompt(sessionId, "gentle", 1)) {
          // After completing first chunk - gentle prompt
          setSavePromptVariant("gentle");
          setShowSavePrompt(true);
          markPromptShown(sessionId, "gentle", 1);
        } else if (
          nextIndex === 2 &&
          shouldShowPrompt(sessionId, "prominent", 2)
        ) {
          // After completing second chunk - more prominent
          setSavePromptVariant("prominent");
          setShowSavePrompt(true);
          markPromptShown(sessionId, "prominent", 2);
        }
      }

      if (nextIndex >= session.chunks.length) {
        // All chunks completed
        navigate(`/summary/${sessionId}`);
        return;
      }

      // Load next chunk
      setCurrentChunkIndex(nextIndex);

      // Fetch chunk from API
      const chunkData = await getChunk(
        sessionId,
        session.chunks[nextIndex].chunkId,
      );
      setCurrentChunk(chunkData.chunk);

      // Reset state for next chunk
      setPhase(PHASES.PRIOR_KNOWLEDGE);
      setPriorKnowledge("");
      setHasPriorKnowledge(true);
      setSelectedGoal(session?.defaultGoal || "");
      setSelectedStrategy("");
      setCustomStrategy("");
      setUserAnswer("");
      setConfidence(50);
      setMuddyPoint("");
      setVisibleHints(0);
      setShowContent(false);
      setContentReviewed(false);
      setFeedback(null);
      setResponseId(null);
      setStrategyFeedbackGiven(null);
      setStrategyReflection("");
      setGoalAchieved(null);
      setNextTimeAdjustment("");
      setNextTimeCustom("");
      setPhaseStartTime(Date.now());
      setPriorKnowledgeTime(0);
      setPlanTime(0);
      setMonitorTime(0);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to load next chunk");
      setLoading(false);
    }
  };

  const handleDismissSavePrompt = () => {
    setShowSavePrompt(false);
    // Mark as dismissed in localStorage
    if (savePromptVariant === "gentle") {
      markPromptDismissed(sessionId, "gentle", 1);
    } else {
      markPromptDismissed(sessionId, "prominent", 2);
    }
  };

  const handleCheckboxChange = (checked) => {
    setHasPriorKnowledge(!checked);
    if (checked) {
      setPriorKnowledge("");
    }
  };

  const getSelectedGoal = () => {
    return GOALS.find((g) => g.id === selectedGoal);
  };

  const getSelectedStrategy = () => {
    return STRATEGIES.find((s) => s.id === selectedStrategy);
  };

  const getStrategyReflectionPrompt = () => {
    if (!strategyHistory) {
      // First use or history failed to load
      return "Why did this strategy work or not work for you?";
    }

    const usageCount = strategyHistory.usageCount || 0;

    if (usageCount === 0) {
      return "Why did this strategy work or not work for you?";
    } else if (usageCount === 1) {
      return "You used this strategy once before. How did it work this time compared to last time?";
    } else {
      return `You've used this strategy ${usageCount} times now. What patterns are you noticing?`;
    }
  };

  const getRecentReflections = () => {
    if (
      !strategyHistory ||
      !strategyHistory.history ||
      strategyHistory.history.length === 0
    ) {
      return null;
    }

    // Show the most recent 1-2 reflections
    return strategyHistory.history.slice(0, 2);
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
          <Button onClick={() => navigate('/library')}>Back to library</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="learning">
      <div className="learning-container">
        <div className="learning-header">
          <button
            className="learning-exit"
            onClick={() => navigate("/library")}
          >
            ← Exit
          </button>
          <Progress
            current={currentChunkIndex + 1}
            total={session?.chunks.length || 1}
            showLabel
          />
        </div>

        {/* Save Progress Banner for guests */}
        {!user && showSavePrompt && (
          <SaveProgressBanner
            chunkNumber={currentChunkIndex}
            variant={savePromptVariant}
            onDismiss={handleDismissSavePrompt}
          />
        )}

        <div className="learning-content">
          {/* Prior Knowledge Phase */}
          {phase === PHASES.PRIOR_KNOWLEDGE && (
            <div className="learning-phase">
              <h2 className="learning-phase-title">
                📖 Plan: Activate Prior Knowledge
                <HelpTooltip content="Why? Connecting new information to what you already know strengthens memory retention by 40%. Even thinking 'I know nothing about this' primes your brain to learn." />
              </h2>
              <p className="learning-phase-subtitle">
                Topic: {currentChunk?.topic}
              </p>

              {isDemo && (
                <DemoBanner
                  message="Step 2: Prior Knowledge - Before learning new material, we activate what you already know. This creates 'hooks' in your brain to attach new information to. Even saying 'I know nothing' is valuable metacognition!"
                  step={2}
                  totalSteps={5}
                />
              )}

              <Card>
                <div className="learning-prior-knowledge">
                  <p style={{ marginBottom: "16px" }}>
                    Before we begin, take a moment to think:
                    <br />
                    <strong>What do you already know about this topic?</strong>
                  </p>

                  <textarea
                    className="learning-textarea"
                    placeholder="Your thoughts (optional)..."
                    value={priorKnowledge}
                    onChange={(e) => setPriorKnowledge(e.target.value)}
                    rows={4}
                    disabled={!hasPriorKnowledge}
                  />

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: "12px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!hasPriorKnowledge}
                      onChange={(e) => handleCheckboxChange(e.target.checked)}
                      style={{ marginRight: "8px" }}
                    />
                    <span>
                      I have no prior knowledge of this topic
                      <br />
                      <small style={{ color: "var(--text-secondary)" }}>
                        (That's totally fine! This helps us understand where
                        you're starting from.)
                      </small>
                    </span>
                  </label>
                </div>
              </Card>

              {error && <div className="learning-error">{error}</div>}

              <Button
                variant="primary"
                onClick={handlePriorKnowledgeComplete}
                fullWidth
              >
                Continue →
              </Button>
            </div>
          )}

          {/* Plan Phase */}
          {phase === PHASES.PLAN && (
            <div className="learning-phase">
              <h2 className="learning-phase-title">
                Plan
                <HelpTooltip content="Students who set goals before studying remember 40% more material. Planning activates your brain's executive functions and makes learning intentional." />
              </h2>
              <p className="learning-phase-subtitle">
                Set your learning goal and choose your strategy
              </p>

              {isDemo && (
                <DemoBanner
                  message="Step 3: Plan - This is the first phase of metacognition. You set a specific learning goal (what level of understanding you want) and choose a strategy (how you'll approach it). Research shows planning makes learning 40% more effective!"
                  step={3}
                  totalSteps={5}
                />
              )}

              <Card>
                <div className="learning-chunk-content">
                  <strong
                    style={{
                      fontSize: "20px",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    {currentChunk?.topic}
                  </strong>
                  <p style={{ marginTop: "8px" }}>{currentChunk?.miniTeach}</p>
                </div>
              </Card>

              <div className="learning-goals">
                <label className="learning-label">
                  Choose your goal:
                  {session?.defaultGoal && (
                    <span
                      style={{
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                        marginLeft: "8px",
                        fontWeight: "normal",
                      }}
                    >
                      (You can change it for this chunk)
                    </span>
                  )}
                </label>
                {GOALS.map((goal) => (
                  <Card
                    key={goal.id}
                    hover
                    onClick={() => setSelectedGoal(goal.id)}
                  >
                    <div
                      className={`learning-goal ${selectedGoal === goal.id ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="goal"
                        checked={selectedGoal === goal.id}
                        onChange={() => setSelectedGoal(goal.id)}
                      />
                      <span className="learning-goal-icon">{goal.icon}</span>
                      <div className="learning-goal-content">
                        <strong>{goal.label}</strong>
                        <p style={{ fontSize: "14px", margin: "4px 0 0 0" }}>
                          {goal.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="learning-strategies">
                <label className="learning-label">Choose a strategy:</label>
                {STRATEGIES.map((strategy) => (
                  <Card
                    key={strategy.id}
                    hover
                    onClick={() => setSelectedStrategy(strategy.id)}
                  >
                    <div
                      className={`learning-strategy ${selectedStrategy === strategy.id ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="strategy"
                        checked={selectedStrategy === strategy.id}
                        onChange={() => setSelectedStrategy(strategy.id)}
                      />
                      <span className="learning-strategy-icon">
                        {strategy.icon}
                      </span>
                      <div className="learning-strategy-content">
                        <strong>{strategy.label}</strong>
                        <p style={{ fontSize: "14px", margin: "4px 0 0 0" }}>
                          {strategy.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}

                {selectedStrategy === "other" && (
                  <Card>
                    <div style={{ padding: "8px" }}>
                      <label className="learning-label">
                        Briefly describe your strategy:
                      </label>
                      <input
                        type="text"
                        className="learning-input"
                        placeholder='e.g., "Create a mnemonic", "Think of real-world uses"'
                        value={customStrategy}
                        onChange={(e) => setCustomStrategy(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px",
                          marginTop: "8px",
                        }}
                      />
                      <p
                        style={{
                          fontSize: "13px",
                          color: "var(--text-secondary)",
                          marginTop: "8px",
                        }}
                      >
                        ℹ️ We'll track how well this works for you!
                      </p>
                    </div>
                  </Card>
                )}
              </div>

              {error && <div className="learning-error">{error}</div>}

              <Button
                variant="primary"
                onClick={handlePlanComplete}
                fullWidth
                disabled={
                  !selectedGoal ||
                  !selectedStrategy ||
                  (selectedStrategy === "other" && !customStrategy.trim())
                }
              >
                Continue to monitor
              </Button>
            </div>
          )}

          {/* Monitor Phase */}
          {phase === PHASES.MONITOR && (
            <div className="learning-phase">
              <h2 className="learning-phase-title">
                Monitor
                <HelpTooltip content="This is where you test yourself! Testing is proven to be 50% more effective than re-reading. Don't worry about getting it perfect—mistakes help you learn." />
              </h2>
              <p className="learning-phase-subtitle">
                Try to answer the question and track your understanding
              </p>

              {isDemo && (
                <DemoBanner
                  message="Step 4: Monitor - The second phase of metacognition. You test yourself on the material and rate your confidence. This reveals the gap between what you think you know and what you actually know. Most students are overconfident!"
                  step={4}
                  totalSteps={5}
                />
              )}

              <Card>
                <div className="learning-reminder">
                  <strong>Your goal:</strong> {getSelectedGoal()?.label}
                  <br />
                  <strong>Your strategy:</strong>{" "}
                  {selectedStrategy === "other"
                    ? customStrategy
                    : getSelectedStrategy()?.label}
                  {getSelectedStrategy()?.guidance && (
                    <p
                      style={{
                        fontSize: "14px",
                        marginTop: "8px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      💡 {getSelectedStrategy().guidance}
                    </p>
                  )}
                </div>
              </Card>

              <Card>
                <div className="learning-question">
                  {currentChunk?.questions?.[selectedGoal] ||
                    currentChunk?.question}
                </div>
              </Card>

              <Button
                variant="secondary"
                onClick={handleReviewContent}
                fullWidth
              >
                📖 {showContent ? "Hide" : "Review"} content
              </Button>

              {showContent && (
                <Card>
                  <div className="learning-content-review">
                    <strong>{currentChunk?.topic}</strong>
                    <p style={{ marginTop: "8px" }}>
                      {currentChunk?.miniTeach}
                    </p>
                  </div>
                </Card>
              )}

              {currentChunk?.hints && currentChunk.hints.length > 0 && (
                <div className="learning-hints">
                  {visibleHints > 0 && (
                    <Card>
                      <div className="learning-hints-display">
                        {currentChunk.hints
                          .slice(0, visibleHints)
                          .map((hint, index) => (
                            <p key={index} style={{ marginBottom: "8px" }}>
                              <strong>Hint {index + 1}:</strong> {hint}
                            </p>
                          ))}
                      </div>
                    </Card>
                  )}

                  {visibleHints < currentChunk.hints.length && (
                    <Button variant="secondary" onClick={handleShowHint}>
                      💡 Show hint (
                      {currentChunk.hints.length - visibleHints} remaining)
                    </Button>
                  )}
                </div>
              )}

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

              <div>
                <label className="learning-label">
                  🤔 What's the muddiest (most confusing) part? (Optional)
                </label>
                <textarea
                  className="learning-textarea"
                  placeholder="e.g., 'I don't understand how X relates to Y'"
                  value={muddyPoint}
                  onChange={(e) => setMuddyPoint(e.target.value)}
                  rows={2}
                />
              </div>

              <div style={{ position: "relative" }}>
                <Slider
                  value={confidence}
                  onChange={setConfidence}
                  min={0}
                  max={100}
                  label={
                    <span>
                      How confident are you?
                      <HelpTooltip content="Research shows most students are overconfident. Tracking the gap between your confidence and actual performance helps you become a better judge of your own understanding." />
                    </span>
                  }
                />
              </div>

              {error && <div className="learning-error">{error}</div>}

              <Button
                variant="primary"
                onClick={handleMonitorComplete}
                fullWidth
                disabled={!userAnswer.trim() || loading}
              >
                {loading ? "Evaluating..." : "Get feedback"}
              </Button>
            </div>
          )}

          {/* Evaluate Phase */}
          {phase === PHASES.EVALUATE && feedback && (
            <div className="learning-phase">
              <h2 className="learning-phase-title">
                Evaluate
                <HelpTooltip content="This is the most important phase! Reflection turns experience into learning. Students who reflect on their strategies improve 3x faster than those who just move on." />
              </h2>
              <p className="learning-phase-subtitle">
                Review your performance and learn from feedback
              </p>

              {isDemo && (
                <DemoBanner
                  message="Step 5: Evaluate - The final and most important phase! You see how you did, compare your confidence to actual accuracy, and reflect on your strategy. This reflection is where the real learning happens - you're learning how YOU learn best. This skill transfers to every subject!"
                  step={5}
                  totalSteps={5}
                />
              )}

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
                    <HelpTooltip content="Calibration = how well you know what you know. Well-calibrated learners accurately judge their understanding, making them more efficient studiers." />
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

              {/* Goal Achievement */}
              <Card>
                <div className="learning-feedback-section">
                  <h3 className="learning-feedback-title">
                    🎯 Goal Achievement
                  </h3>
                  <p style={{ marginBottom: "12px" }}>
                    Your goal was: <strong>{getSelectedGoal()?.label}</strong>
                  </p>
                  <p style={{ marginBottom: "12px" }}>
                    Did you achieve your learning goal?
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <Button
                      variant={goalAchieved === "yes" ? "primary" : "secondary"}
                      onClick={() => setGoalAchieved("yes")}
                    >
                      ✅ Yes
                    </Button>
                    <Button
                      variant={
                        goalAchieved === "partial" ? "primary" : "secondary"
                      }
                      onClick={() => setGoalAchieved("partial")}
                    >
                      ⚡ Partially
                    </Button>
                    <Button
                      variant={goalAchieved === "no" ? "primary" : "secondary"}
                      onClick={() => setGoalAchieved("no")}
                    >
                      ❌ No
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Strategy Reflection */}
              <div className="learning-strategy-feedback">
                <p className="learning-label">
                  Reflect on the &ldquo;
                  {selectedStrategy === "other"
                    ? customStrategy
                    : getSelectedStrategy()?.label}
                  &rdquo; strategy
                </p>

                {/* Show previous reflections if available */}
                {getRecentReflections() && (
                  <div style={{ marginBottom: "16px", fontSize: "14px" }}>
                    <p style={{ fontWeight: "500", marginBottom: "8px" }}>
                      📊 Your previous reflections:
                    </p>
                    {getRecentReflections().map((reflection, index) => (
                      <div
                        key={index}
                        style={{
                          background: "#f5f5f5",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          marginBottom: "8px",
                          fontSize: "13px",
                        }}
                      >
                        <div style={{ marginBottom: "4px" }}>
                          <strong>
                            {reflection.strategyHelpful === true
                              ? "✅ Helpful"
                              : reflection.strategyHelpful === false
                                ? "❌ Not helpful"
                                : "⚪ Not rated"}
                          </strong>
                          {" • "}
                          <span style={{ color: "#666" }}>
                            {reflection.accuracy}% accuracy
                          </span>
                        </div>
                        <div style={{ fontStyle: "italic", color: "#444" }}>
                          "{reflection.strategyReflection}"
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label
                    className="learning-label"
                    style={{ fontSize: "14px", marginBottom: "8px" }}
                  >
                    {getStrategyReflectionPrompt()}
                  </label>
                  <textarea
                    className="learning-textarea"
                    placeholder="e.g., 'Self-explaining helped me realize I didn't fully understand the concept' or 'Visualizing didn't work because the topic was too abstract'"
                    value={strategyReflection}
                    onChange={(e) => setStrategyReflection(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <p className="learning-label" style={{ marginTop: "16px" }}>
                    Was this strategy helpful?
                  </p>
                  <div className="learning-strategy-buttons">
                    <Button
                      variant={
                        strategyFeedbackGiven === true ? "primary" : "secondary"
                      }
                      onClick={() => handleStrategyFeedback(true)}
                      disabled={
                        !strategyReflection.trim() ||
                        !goalAchieved ||
                        !nextTimeAdjustment
                      }
                    >
                      {strategyFeedbackGiven === true ? "✓ " : ""}Yes, helpful
                    </Button>
                    <Button
                      variant={
                        strategyFeedbackGiven === false
                          ? "primary"
                          : "secondary"
                      }
                      onClick={() => handleStrategyFeedback(false)}
                      disabled={
                        !strategyReflection.trim() ||
                        !goalAchieved ||
                        !nextTimeAdjustment
                      }
                    >
                      {strategyFeedbackGiven === false ? "✓ " : ""}Not helpful
                    </Button>
                  </div>
                </div>
              </div>

              {/* Next Time Reflection */}
              <Card>
                <div className="learning-feedback-section">
                  <h3 className="learning-feedback-title">
                    🔄 Plan for Next Time
                  </h3>
                  <p style={{ marginBottom: "12px" }}>
                    Based on this experience, next time I'll:
                  </p>
                  {NEXT_TIME_OPTIONS.map((option) => (
                    <label
                      key={option.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="nextTime"
                        value={option.id}
                        checked={nextTimeAdjustment === option.id}
                        onChange={(e) => setNextTimeAdjustment(e.target.value)}
                        style={{ marginRight: "8px" }}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}

                  {nextTimeAdjustment === "other" && (
                    <input
                      type="text"
                      className="learning-input"
                      placeholder="Describe what you'll do differently..."
                      value={nextTimeCustom}
                      onChange={(e) => setNextTimeCustom(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px",
                        marginTop: "8px",
                      }}
                    />
                  )}
                </div>
              </Card>

              {!goalAchieved ||
              !strategyReflection.trim() ||
              !nextTimeAdjustment ||
              (nextTimeAdjustment === "other" && !nextTimeCustom.trim()) ? (
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                    marginTop: "8px",
                    textAlign: "center",
                  }}
                >
                  Please complete all reflections before continuing
                </p>
              ) : null}

              <Button
                variant="primary"
                onClick={handleNextChunk}
                fullWidth
                disabled={strategyFeedbackGiven === null}
              >
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
