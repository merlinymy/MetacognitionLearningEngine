import Button from "../components/Button";
import "./Landing.css";

const Landing = ({ onNavigate }) => {
  return (
    <div className="landing">
      <div className="landing-content">
        <h1 className="landing-title">Learn with metacognition</h1>
        <p className="landing-subtitle">
          A research-backed approach to learning. Plan your strategy, monitor
          your understanding, and evaluate your progress.
        </p>
        <div className="landing-actions">
          <Button variant="primary" onClick={() => onNavigate("upload")}>
            Start learning
          </Button>
          <Button variant="secondary" onClick={() => onNavigate("library")}>
            View library
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
