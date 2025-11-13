import { useState } from "react";
import Landing from "./pages/Landing";
import Upload from "./pages/Upload";
import Learning from "./pages/Learning";
import Summary from "./pages/Summary";
import Library from "./pages/Library";

const SCREENS = {
  LANDING: "landing",
  UPLOAD: "upload",
  LEARNING: "learning",
  SUMMARY: "summary",
  LIBRARY: "library",
};

function App() {
  const [currentScreen, setCurrentScreen] = useState(SCREENS.LANDING);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
  };

  const handleUploadComplete = (data) => {
    setCurrentSessionId(data.sessionId);
    setCurrentScreen(SCREENS.LEARNING);
  };

  const handleSelectSession = (sessionId) => {
    setCurrentSessionId(sessionId);
    setCurrentScreen(SCREENS.LEARNING);
  };

  const handleLearningComplete = () => {
    setCurrentScreen(SCREENS.SUMMARY);
  };

  const handleLearningExit = () => {
    setCurrentScreen(SCREENS.LIBRARY);
  };

  return (
    <div className="app">
      {currentScreen === SCREENS.LANDING && (
        <Landing onNavigate={handleNavigate} />
      )}

      {currentScreen === SCREENS.UPLOAD && (
        <Upload
          onUploadComplete={handleUploadComplete}
          onBack={() => handleNavigate("landing")}
        />
      )}

      {currentScreen === SCREENS.LEARNING && (
        <Learning
          sessionId={currentSessionId}
          onComplete={handleLearningComplete}
          onExit={handleLearningExit}
        />
      )}

      {currentScreen === SCREENS.SUMMARY && (
        <Summary sessionId={currentSessionId} onNavigate={handleNavigate} />
      )}

      {currentScreen === SCREENS.LIBRARY && (
        <Library
          onSelectSession={handleSelectSession}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}

export default App;
