import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../api/supabaseApi";

export default function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand fw-bold text-warning" to="/">
        Car Alert
      </Link>

      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <Link className="nav-link" to="/scanner">Scanner</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/annunci">Annunci</Link>
          </li>
        </ul>

        <div className="d-flex align-items-center gap-2">
          {!user ? (
            <>
              <Link className="btn btn-outline-light btn-sm" to="/login">
                Login
              </Link>
              <Link className="btn btn-warning btn-sm" to="/register">
                Registrati
              </Link>
            </>
          ) : (
            <>
              <span className="text-white small me-2">
                Ciao, <b>{user.email}</b>
              </span>

              <Link className="btn btn-sm btn-outline-light" to="/profile">
                Profilo
              </Link>

              {user.email === "admin@caralert.it" && (
                <Link className="btn btn-sm btn-warning" to="/admin">
                  Admin
                </Link>
              )}

              <button
                className="btn btn-sm btn-outline-danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
