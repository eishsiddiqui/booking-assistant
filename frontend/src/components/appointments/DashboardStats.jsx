import { Clock, CalendarCheck } from "lucide-react";

export default function DashboardStats({ upcomingCount, totalCount }) {
  return (
    <section className="stats-grid" aria-label="Appointment Statistics">
      {/* Upcoming Appointments Card */}
      <article className="stat-card">
        <div className="stat-info">
          <span className="stat-label">Upcoming</span>
          <span className="stat-number">{upcomingCount}</span>
        </div>
        <div className="stat-icon-wrapper upcoming-icon" aria-hidden="true">
          <Clock size={26} />
        </div>
      </article>

      {/* Total Appointments Card */}
      <article className="stat-card">
        <div className="stat-info">
          <span className="stat-label">Total Appointments</span>
          <span className="stat-number">{totalCount}</span>
        </div>
        <div className="stat-icon-wrapper total-icon" aria-hidden="true">
          <CalendarCheck size={26} />
        </div>
      </article>
    </section>
  );
}
