import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import { getSessionSummary, getSession } from "../services/api";
import "./Summary.css";

const Summary = ({ user }) => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        const [summaryData, sessionData] = await Promise.all([
          getSessionSummary(sessionId),
          getSession(sessionId),
        ]);
        setSummary(summaryData);
        setSession(sessionData);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load summary");
        setLoading(false);
      }
    };

    loadSummary();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="summary">
        <div className="summary-container">
          <p className="summary-loading">Loading summary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="summary">
        <div className="summary-container">
          <div className="summary-error">{error}</div>
          <Button onClick={() => navigate("/library")}>Back to library</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="summary">
      <div className="summary-container">
        <div className="summary-header">
          <h1 className="summary-title">Session complete</h1>
          <p className="summary-subtitle">
            Great work! Here's how you performed.
          </p>
        </div>

        <div className="summary-stats">
          <Card>
            <div className="summary-stat">
              <div className="summary-stat-value">
                {summary?.stats?.totalChunks || 0}
              </div>
              <div className="summary-stat-label">Total chunks</div>
            </div>
          </Card>

          <Card>
            <div className="summary-stat">
              <div className="summary-stat-value">
                {summary?.stats?.averageConfidence
                  ? `${summary.stats.averageConfidence}%`
                  : "N/A"}
              </div>
              <div className="summary-stat-label">Average confidence</div>
            </div>
          </Card>

          <Card>
            <div className="summary-stat">
              <div className="summary-stat-value">
                {summary?.stats?.averageAccuracy
                  ? `${summary.stats.averageAccuracy}%`
                  : "N/A"}
              </div>
              <div className="summary-stat-label">Average accuracy</div>
            </div>
          </Card>
        </div>

        {summary?.insight && (
          <div className="summary-insights">
            <h2 className="summary-section-title">Insight</h2>
            <Card>
              <div className="summary-insight">
                <p className="summary-insight-text">{summary.insight}</p>
              </div>
            </Card>
          </div>
        )}

        {summary?.strategyPerformance &&
          summary.strategyPerformance.length > 0 && (
            <div className="summary-strategies">
              <h2 className="summary-section-title">
                Strategy performance
              </h2>
              <div className="summary-strategy-list">
                {summary.strategyPerformance.map((item, index) => (
                  <div key={index} className="summary-strategy-tag">
                    {item.strategy} ({item.accuracy}%)
                  </div>
                ))}
              </div>
            </div>
          )}

        {!user ? (
          // Guest user - prompt to sign in
          <div className="summary-actions">
            <div
              style={{
                backgroundColor: "var(--primary-bg)",
                border: "2px solid var(--primary-color)",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  color: "var(--primary-color)",
                  marginTop: 0,
                  marginBottom: "8px",
                  fontSize: "18px",
                }}
              >
                {session?.userId === "demo"
                  ? "Ready to continue learning?"
                  : "Want to save your progress?"}
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  margin: "0 0 16px 0",
                  fontSize: "14px",
                }}
              >
                {session?.userId === "demo"
                  ? "You've completed the demo! Sign in to track your learning sessions, view your progress over time, and access your sessions from any device."
                  : "Sign in to save your sessions, track your progress over time, and access your learning from any device."}
              </p>
              <Button
                variant="primary"
                onClick={() => navigate("/login")}
                fullWidth
              >
                Sign in to continue →
              </Button>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate("/")}
              fullWidth
            >
              Back to home
            </Button>
          </div>
        ) : (
          // Authenticated user - show normal actions
          <div className="summary-actions">
            <Button
              variant="primary"
              onClick={() => navigate("/upload")}
              fullWidth
            >
              Start new session
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/library")}
              fullWidth
            >
              View all sessions
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;
