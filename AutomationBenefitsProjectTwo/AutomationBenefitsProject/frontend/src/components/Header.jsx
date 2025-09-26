import { Link, useNavigate } from "react-router-dom";
import { getUser, logout } from "../lib/auth";

export default function Header() {
  const me = getUser();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  return (
    <header className="header">
      <div className="container">
        <div style={{ fontWeight: 700 }}>Automation Benefits</div>
        <nav className="nav">
          {me && me.role === "Admin" && <Link to="/admin">Admin</Link>}
          {me && <Link to="/">Dashboard</Link>}
          {!me ? (
            <Link to="/login" className="btn secondary">
              Login
            </Link>
          ) : (
            <button className="btn secondary" onClick={handleLogout}>
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
