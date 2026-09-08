import { Calendar, Clock, Eye, Info } from "lucide-react";

/**
 * Format date string (YYYY-MM-DD) into readable format (e.g., "September 10, 2026")
 */
function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const [year, month, day] = dateStr.split("-");
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format time (HH:MM or HH:MM:SS) into 12-hour format (e.g., "3:00 PM")
 */
function formatTime(timeStr) {
  if (!timeStr) return "";
  try {
    const parts = timeStr.split(":");
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1] || "00";
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  } catch {
    return timeStr;
  }
}

export default function AppointmentCard({ appointment, onViewDetails }) {
  const { appointment_date, appointment_time, description, status } = appointment;

  const normalizedStatus = (status || "scheduled").toLowerCase();

  return (
    <article className={`appointment-card status-border-${normalizedStatus}`}>
      <div className="appointment-card-header">
        <span className={`status-pill status-pill-${normalizedStatus}`}>
          {status ? status.toUpperCase() : "SCHEDULED"}
        </span>

        <button
          type="button"
          onClick={() => onViewDetails(appointment)}
          className="card-info-icon-btn"
          title="Quick info"
          aria-label="View appointment details"
        >
          <Info size={16} />
        </button>
      </div>

      <div className="appointment-card-body">
        <h3 className="appointment-title">{description || "General Appointment"}</h3>

        <div className="appointment-meta-group">
          <div className="meta-item">
            <Calendar size={14} className="meta-icon" />
            <span>{formatDate(appointment_date)}</span>
          </div>

          <span className="meta-dot">•</span>

          <div className="meta-item">
            <Clock size={14} className="meta-icon" />
            <span>{formatTime(appointment_time)}</span>
          </div>
        </div>
      </div>

      <div className="appointment-card-footer">
        <button
          type="button"
          onClick={() => onViewDetails(appointment)}
          className="appointment-details-btn"
        >
          <Eye size={15} />
          <span>View Details</span>
        </button>
      </div>
    </article>
  );
}
