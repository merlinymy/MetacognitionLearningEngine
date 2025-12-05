import { useNavigate } from "react-router-dom";
import "./SaveProgressBanner.css";

function SaveProgressBanner({ chunkNumber, onDismiss, variant = "gentle" }) {
  const navigate = useNavigate();

  const handleSignup = () => {
    navigate("/signup");
  };

  if (variant === "gentle") {
    // After chunk 1 - gentle notification
    return (
      <div className="save-progress-banner gentle">
        <div className="banner-content">
          <div className="banner-icon">💾</div>
          <div className="banner-text">
            <p className="banner-title">Want to save your progress?</p>
            <p className="banner-subtitle">
              Sign up to track your learning across sessions
            </p>
          </div>
          <div className="banner-actions">
            <button onClick={handleSignup} className="banner-btn primary">
              Sign up free
            </button>
            <button onClick={onDismiss} className="banner-btn dismiss">
              Maybe later
            </button>
          </div>
        </div>
      </div>
    );
  }

  // After chunk 2 - more prominent
  return (
    <div className="save-progress-banner prominent">
      <div className="banner-content">
        <div className="banner-icon">🎯</div>
        <div className="banner-text">
          <p className="banner-title">You're doing great!</p>
          <p className="banner-subtitle">
            Create a free account to save your progress and continue learning
          </p>
        </div>
        <div className="banner-actions">
          <button onClick={handleSignup} className="banner-btn primary">
            Sign up to continue
          </button>
          <button onClick={onDismiss} className="banner-btn dismiss">
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaveProgressBanner;
