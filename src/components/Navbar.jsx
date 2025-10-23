import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../api/supabaseApi";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold text-white" to="/">
          CarAlert
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link text-white" to="/scanner">
                Scanner
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/annunci">
                Annunci
              </Link>
            </li>
            {user && (
              <li className="nav-item">
                <Link className="nav-link text-white" to="/new">
                  Nuovo Annuncio
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center">
            {user ? (
              <>
                <span className="text-white small me-2">
                  Ciao, <b>{user.email}</b>
                </span>
                {user.role === "admin" && (
                  <Link className="nav-link text-warning me-2" to="/admin">
                    Admin
                  </Link>
                )}
                <button
                  className="btn btn-sm btn-outline-light"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-light btn-sm me-2" to="/login">
                  Login
                </Link>
                <Link className="btn btn-warning btn-sm" to="/register">
                  Registrati
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
