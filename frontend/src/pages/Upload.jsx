import { useState } from "react";
import Button from "../components/Button";
import { generateChunks } from "../services/api";
import "./Upload.css";

const Upload = ({ onUploadComplete, onBack }) => {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (content.trim().length < 100) {
      setError("Please enter at least 100 characters");
      return;
    }

    setLoading(true);

    try {
      const result = await generateChunks(
        content,
        title || "Untitled Session",
        "GEMINI"
      );

      if (onUploadComplete) {
        onUploadComplete({
          sessionId: result.sessionId,
          chunks: result.chunks,
          totalChunks: result.totalChunks,
        });
      }
    } catch (err) {
      setError(err.message || "Failed to generate chunks. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="upload">
      <div className="upload-container">
        <button className="upload-back" onClick={onBack}>
          ← Back
        </button>

        <h1 className="upload-title">What do you want to learn?</h1>
        <p className="upload-subtitle">
          Paste your learning material below. We'll break it into manageable
          chunks.
        </p>

        <div className="upload-form">
          <input
            type="text"
            placeholder="Session title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="upload-input"
            disabled={loading}
          />

          <textarea
            placeholder="Paste your text here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="upload-textarea"
            rows={12}
            disabled={loading}
          />

          <div className="upload-info">
            {content.length} characters (minimum 100)
          </div>

          {error && <div className="upload-error">{error}</div>}

          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading || content.trim().length < 100}
            fullWidth
          >
            {loading ? "Processing..." : "Start learning"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Upload;
