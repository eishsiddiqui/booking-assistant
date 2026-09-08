import { CalendarCheck, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="dashboard-navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <div className="navbar-brand">
          <div className="brand-icon-wrapper">
            <CalendarCheck size={20} className="brand-icon" />
          </div>
          <span className="brand-name">Appointment AI</span>
        </div>

        {/* Navigation Items & Logout */}
        <nav className="navbar-actions">
          <div className="nav-link active" aria-current="page">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </div>

          <div className="navbar-divider" aria-hidden="true" />

          <button
            type="button"
            onClick={logout}
            className="navbar-logout-btn"
            title={`Log out ${user?.email || ""}`}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
