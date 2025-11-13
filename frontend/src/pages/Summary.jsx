import { useState, useEffect } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import { getSessionSummary } from "../services/api";
import "./Summary.css";

const Summary = ({ sessionId, onNavigate }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        const data = await getSessionSummary(sessionId);
        setSummary(data);
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
          <Button onClick={() => onNavigate("library")}>Back to library</Button>
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

        <div className="summary-actions">
          <Button
            variant="primary"
            onClick={() => onNavigate("upload")}
            fullWidth
          >
            Start new session
          </Button>
          <Button
            variant="secondary"
            onClick={() => onNavigate("library")}
            fullWidth
          >
            View all sessions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Summary;
