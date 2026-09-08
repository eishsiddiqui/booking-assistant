import { Calendar, Clock, Eye, Info } from "lucide-react";
import { formatDate, formatTime } from "../../utils/date";
import "./AppointmentCard.css";

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
