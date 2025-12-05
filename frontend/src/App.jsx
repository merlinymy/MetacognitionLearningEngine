import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Landing from "./pages/Landing";
import Upload from "./pages/Upload";
import Learning from "./pages/Learning";
import Summary from "./pages/Summary";
import Library from "./pages/Library";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { getCurrentUser, migrateGuestData, logout } from "./services/api";
import { getGuestSessions, clearGuestData } from "./utils/guestStorage";

function AppContent() {
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getCurrentUser();
        if (response.success && response.user) {
          setUser(response.user);
        }
      } catch (error) {
        console.log("User not authenticated");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Migrate guest sessions when user logs in
  useEffect(() => {
    const migrateGuestSessions = async () => {
      if (!user) return;

      try {
        const guestSessions = getGuestSessions();
        if (guestSessions.length === 0) return;

        const sessionIds = guestSessions.map((s) => s.sessionId);
        const result = await migrateGuestData(sessionIds);

        if (result.success && result.migratedCount > 0) {
          console.log(
            `Successfully migrated ${result.migratedCount} guest session(s)`,
          );
          // Clear guest data from localStorage
          clearGuestData();
        }
      } catch (error) {
        console.error("Failed to migrate guest sessions:", error);
        // Don't block user experience if migration fails
      }
    };

    migrateGuestSessions();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      // Continue with logout even if API call fails
    } finally {
      setUser(null);
      navigate("/login");
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="app" style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar user={user} onLogout={handleLogout} />

      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={<Landing user={user} />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" replace /> : <Signup />}
        />

        {/* Upload route - accessible to both authenticated users and guests (for demo) */}
        <Route
          path="/upload"
          element={<Upload user={user} />}
        />

        {/* Learning and Summary routes - accessible to guests for demo sessions */}
        <Route
          path="/learning/:sessionId"
          element={<Learning user={user} />}
        />
        <Route
          path="/summary/:sessionId"
          element={<Summary user={user} />}
        />

        {/* Protected routes */}
        <Route
          path="/library"
          element={
            <ProtectedRoute user={user}>
              <Library user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
