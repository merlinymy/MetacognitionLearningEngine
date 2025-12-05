import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../components/Button";
import "./Landing.css";

const Landing = ({ user }) => {
  const navigate = useNavigate();
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const handleTryDemo = () => {
    // Navigate to upload page in demo mode
    navigate("/upload?demo=true");
  };

  return (
    <div className="landing">
      <div className="landing-content">
        <h1 className="landing-title">Learn with metacognition</h1>
        <p className="landing-subtitle">
          A research-backed approach to learning. Plan your strategy, monitor
          your understanding, and evaluate your progress.
        </p>

        {user ? (
          // Authenticated user - show full options
          <div className="landing-actions">
            <Button variant="primary" onClick={() => navigate("/upload")}>
              Start learning
            </Button>
            <Button variant="secondary" onClick={() => navigate("/dashboard")}>
              View dashboard
            </Button>
            <Button variant="secondary" onClick={() => navigate("/library")}>
              View library
            </Button>
          </div>
        ) : (
          // Guest user - show demo and signup options
          <div className="landing-actions">
            <Button variant="primary" onClick={handleTryDemo}>
              Try demo →
            </Button>
            <div className="landing-divider">
              <span>or</span>
            </div>
            <Button variant="secondary" onClick={() => navigate("/login")}>
              Sign in
            </Button>
          </div>
        )}

        {!user && (
          <>
            <div className="landing-features">
              <div className="landing-feature">
                <span className="feature-icon">📋</span>
                <h3>Plan</h3>
                <p>Set learning goals and choose effective strategies</p>
              </div>
              <div className="landing-feature">
                <span className="feature-icon">🎯</span>
                <h3>Monitor</h3>
                <p>Track your understanding in real-time</p>
              </div>
              <div className="landing-feature">
                <span className="feature-icon">📊</span>
                <h3>Evaluate</h3>
                <p>Reflect on what works and improve</p>
              </div>
            </div>

            <div className="landing-explanation">
              <button
                className="how-it-works-toggle"
                onClick={() => setShowHowItWorks(!showHowItWorks)}
              >
                {showHowItWorks ? "−" : "+"} How does metacognition improve
                learning?
              </button>

              {showHowItWorks && (
                <div className="how-it-works-content">
                  <div className="explanation-intro">
                    <p>
                      <strong>Metacognition</strong> means "thinking about your
                      thinking." Research shows that students who reflect on
                      their learning strategies perform{" "}
                      <strong>20-30% better</strong> than those who just re-read
                      content.
                    </p>
                    <p>
                      Most students study passively—reading and re-reading
                      notes. But this creates an <em>illusion of knowing</em>.
                      You feel like you understand because the material looks
                      familiar, but you can't actually explain it or apply it.
                    </p>
                  </div>

                  <div className="metacognition-cycle">
                    <h3>The Plan-Monitor-Evaluate Loop</h3>

                    <div className="cycle-phase">
                      <div className="phase-header">
                        <span className="phase-icon">📋</span>
                        <h4>Plan</h4>
                      </div>
                      <p>
                        Set a clear goal and choose a learning strategy{" "}
                        <em>before</em> you start. Research shows that students
                        who plan their approach remember 40% more material.
                      </p>
                      <p className="phase-example">
                        Example: "I'll visualize this concept as a diagram" or
                        "I'll explain it as if teaching a friend"
                      </p>
                    </div>

                    <div className="cycle-phase">
                      <div className="phase-header">
                        <span className="phase-icon">🎯</span>
                        <h4>Monitor</h4>
                      </div>
                      <p>
                        Test yourself and track your confidence vs. actual
                        understanding. Most students are overconfident—they
                        think they know more than they do.
                      </p>
                      <p className="phase-example">
                        Example: "I'm 80% confident" → You score 65% → You
                        learn you were overconfident and need to adjust
                      </p>
                    </div>

                    <div className="cycle-phase">
                      <div className="phase-header">
                        <span className="phase-icon">📊</span>
                        <h4>Evaluate</h4>
                      </div>
                      <p>
                        Reflect on what worked and what didn't to improve next
                        time. This is where the real learning happens—when you
                        consciously analyze your strategies.
                      </p>
                      <p className="phase-example">
                        Example: "Self-explaining worked better than
                        visualizing for this topic. I'll use it more often."
                      </p>
                    </div>
                  </div>

                  <div className="explanation-benefit">
                    <h3>Why This Works</h3>
                    <p>
                      By cycling through Plan-Monitor-Evaluate repeatedly, you
                      build <strong>metacognitive awareness</strong>—you learn
                      not just the content, but also <em>how you learn best</em>
                      . This skill transfers to every subject you study!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Landing;
