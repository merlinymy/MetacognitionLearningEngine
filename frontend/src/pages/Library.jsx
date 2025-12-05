import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import { getSessions, deleteSession, redoSession } from "../services/api";
import "./Library.css";

const Library = ({ user }) => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSessions = async () => {
    try {
      setLoading(true);
      const userId = user?._id || "anonymous";
      const data = await getSessions(userId);
      setSessions(data.sessions || []);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to load sessions");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleDelete = async (sessionId, e) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this session?")) {
      return;
    }

    try {
      await deleteSession(sessionId);
      setSessions(sessions.filter((s) => s._id !== sessionId));
    } catch (err) {
      setError(err.message || "Failed to delete session");
    }
  };

  const handleRedo = async (sessionId, e) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to redo this session? All previous responses will be deleted.")) {
      return;
    }

    try {
      await redoSession(sessionId);
      navigate(`/learning/${sessionId}`);
    } catch (err) {
      setError(err.message || "Failed to redo session");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="library">
        <div className="library-container">
          <p className="library-loading">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="library">
      <div className="library-container">
        <div className="library-header">
          <div>
            <h1 className="library-title">Your library</h1>
            <p className="library-subtitle">
              {sessions.length === 0
                ? "No sessions yet. Start learning to create your first session."
                : `${sessions.length} session${sessions.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate("/upload")}>
            New session
          </Button>
        </div>

        {error && <div className="library-error">{error}</div>}

        {sessions.length === 0 ? (
          <div className="library-empty">
            <p className="library-empty-text">
              Start your first learning session
            </p>
            <Button variant="primary" onClick={() => navigate("/upload")}>
              Upload content
            </Button>
          </div>
        ) : (
          <div className="library-grid">
            {sessions.map((session) => (
              <Card
                key={session._id}
                hover
                onClick={() => navigate(`/learning/${session._id}`)}
              >
                <div className="library-session">
                  <div className="library-session-header">
                    <h3 className="library-session-title">
                      {session.contentPreview || "Untitled Session"}
                    </h3>
                    <button
                      className="library-session-delete"
                      onClick={(e) => handleDelete(session._id, e)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="library-session-meta">
                    <span className="library-session-date">
                      {formatDate(session.createdAt)}
                    </span>
                    <span className="library-session-chunks">
                      {session.sessionStats?.totalChunks || 0} chunks
                    </span>
                  </div>

                  {session.status === "completed" && (
                    <div className="library-session-footer">
                      <div className="library-session-badge">Completed</div>
                      <Button
                        variant="secondary"
                        onClick={(e) => handleRedo(session._id, e)}
                      >
                        Redo
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
