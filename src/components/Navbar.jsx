import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/supabaseApi";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await api.logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-3">
      <Link className="navbar-brand" to="/">
        Car Alert
      </Link>

      <div className="ms-auto d-flex align-items-center gap-2">
        {user ? (
          <>
            <span className="text-white small">{user.email}</span>
            <button
              className="btn btn-outline-light btn-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="btn btn-light btn-sm">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
