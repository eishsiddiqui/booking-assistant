import { useAuth } from "../hooks/useAuth";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <main className="dashboard-container">
      <div className="dashboard-card">
        <h1 className="dashboard-title">Welcome, {user?.name || "User"}!</h1>
        <p className="dashboard-user-info">
          {user?.email
            ? `Logged in as ${user.email}`
            : "You are currently signed in."}
        </p>
        <button
          type="button"
          onClick={logout}
          className="dashboard-signout-btn"
        >
          Sign Out
        </button>
      </div>
    </main>
  );
}
