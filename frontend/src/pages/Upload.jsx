import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../components/Button";
import DemoBanner from "../components/DemoBanner";
import { generateChunks } from "../services/api";
import { DEMO_CONTENT } from "../data/demoSession";
import "./Upload.css";

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

const Upload = ({ user }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [defaultGoal, setDefaultGoal] = useState("explain");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill content if in demo mode
  useEffect(() => {
    if (isDemo) {
      setContent(DEMO_CONTENT);
      setTitle("Introduction to Metacognition (Demo)");
    }
  }, [isDemo]);

  const handleSubmit = async () => {
    setError("");

    if (content.trim().length < 100) {
      setError("Please enter at least 100 characters");
      return;
    }

    setLoading(true);

    try {
      // Both demo and regular sessions now use the same API flow
      const userId = user?._id || (isDemo ? "demo" : "anonymous");
      const result = await generateChunks(
        content,
        title || "Untitled Session",
        "GEMINI",
        userId,
        defaultGoal
      );

      // Navigate to learning page (no need for ?demo=true param anymore)
      navigate(`/learning/${result.sessionId}`);
    } catch (err) {
      setError(err.message || "Failed to generate chunks. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="upload">
      <div className="upload-container">
        <button className="upload-back" onClick={() => navigate("/")}>
          ← Back
        </button>

        <h1 className="upload-title">What do you want to learn?</h1>
        <p className="upload-subtitle">
          Paste your learning material below. We'll break it into manageable
          chunks.
        </p>

        {isDemo && (
          <DemoBanner
            message="Welcome to the demo! This is Step 1: Upload. We've pre-loaded content about metacognition so you can experience the full learning process. The content is locked for this demo - just click 'Start demo' below to begin your guided walkthrough!"
            step={1}
            totalSteps={5}
          />
        )}

        <div className="upload-form">
          <input
            type="text"
            placeholder="Session title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="upload-input"
            disabled={loading || isDemo}
            style={
              isDemo
                ? {
                    backgroundColor: "var(--bg-secondary)",
                    cursor: "not-allowed",
                    opacity: 0.7,
                  }
                : {}
            }
          />

          <div style={{ marginTop: "20px", marginBottom: "20px" }}>
            <label
              className="upload-label"
              style={{
                display: "block",
                marginBottom: "12px",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              What's your learning goal?
              {isDemo && (
                <span
                  style={{
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                    fontWeight: "normal",
                    marginLeft: "8px",
                  }}
                >
                  (Pre-selected for demo)
                </span>
              )}
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {GOALS.map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => !loading && !isDemo && setDefaultGoal(goal.id)}
                  style={{
                    padding: "12px 16px",
                    border: `2px solid ${
                      defaultGoal === goal.id
                        ? "var(--primary-color)"
                        : "var(--border-color)"
                    }`,
                    borderRadius: "8px",
                    cursor: loading || isDemo ? "not-allowed" : "pointer",
                    backgroundColor:
                      defaultGoal === goal.id
                        ? "var(--primary-bg)"
                        : "var(--card-bg)",
                    opacity: isDemo ? 0.7 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <input
                      type="radio"
                      name="goal"
                      checked={defaultGoal === goal.id}
                      onChange={() => setDefaultGoal(goal.id)}
                      disabled={loading || isDemo}
                      style={{ cursor: loading || isDemo ? "not-allowed" : "pointer" }}
                    />
                    <span style={{ fontSize: "20px" }}>{goal.icon}</span>
                    <div style={{ flex: 1 }}>
                      <strong
                        style={{
                          display: "block",
                          marginBottom: "2px",
                          color:
                            defaultGoal === goal.id
                              ? "var(--primary-color)"
                              : "var(--text-primary)",
                        }}
                      >
                        {goal.label}
                      </strong>
                      <p
                        style={{
                          fontSize: "14px",
                          margin: 0,
                          color: "var(--text-secondary)",
                        }}
                      >
                        {goal.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                marginTop: "8px",
              }}
            >
              💡 You can change your goal for individual chunks later
            </p>
          </div>

          <textarea
            placeholder="Paste your text here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="upload-textarea"
            rows={12}
            disabled={loading || isDemo}
            readOnly={isDemo}
            style={
              isDemo
                ? {
                    backgroundColor: "var(--bg-secondary)",
                    cursor: "not-allowed",
                    opacity: 0.7,
                  }
                : {}
            }
          />

          <div className="upload-info">
            {content.length} characters (minimum 100)
            {isDemo && (
              <span
                style={{
                  marginLeft: "8px",
                  color: "var(--accent)",
                  fontWeight: "500",
                }}
              >
                ✓ Demo content loaded
              </span>
            )}
          </div>

          {error && <div className="upload-error">{error}</div>}

          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading || content.trim().length < 100}
            fullWidth
          >
            {loading ? "Processing..." : isDemo ? "Start demo →" : "Start learning"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Upload;
