import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { api } from "../api/supabaseApi";

export default function Navbar() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const adminEmails = ["admin@caralert.it"];
  const isAdmin =
    user &&
    adminEmails.some((email) => email.toLowerCase() === user.email?.toLowerCase());

  const handleLogout = async () => {
    await api.logout();
    navigate("/login");
  };

  if (loading) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">Car Alert</Link>

        <div className="d-flex align-items-center gap-3">
          <Link className="nav-link text-white" to="/reports">Annunci</Link>
          <Link className="nav-link text-white" to="/new">Nuovo</Link>
          <Link className="nav-link text-white" to="/scanner">Scanner</Link>

          {!user ? (
            <>
              <Link className="nav-link text-white" to="/login">Login</Link>
              <Link className="nav-link text-white" to="/register">Registrati</Link>
            </>
          ) : (
            <>
              <span className="text-white small me-2">
                Ciao, <b>{user.email}</b>
              </span>
              <Link className="nav-link text-white" to="/profile">Profilo</Link>
              {isAdmin && (
                <Link className="nav-link text-warning fw-bold" to="/admin">
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
          )}
        </div>
      </div>
    </nav>
  );
}
