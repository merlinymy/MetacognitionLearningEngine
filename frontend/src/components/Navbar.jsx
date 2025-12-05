import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          MetaCognition
        </Link>

        {user ? (
          <>
            <div className="navbar-links">
              <Link to="/" className="navbar-link">
                Home
              </Link>
              <Link to="/upload" className="navbar-link">
                Upload
              </Link>
              <Link to="/library" className="navbar-link">
                Library
              </Link>
              <Link to="/dashboard" className="navbar-link">
                Dashboard
              </Link>
            </div>

            <div className="navbar-user">
              <span className="navbar-username">{user?.email}</span>
              <button onClick={handleLogout} className="navbar-logout">
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="navbar-guest">
            <button onClick={() => navigate("/login")} className="navbar-signin">
              Sign in
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
