import { useEffect, useState } from "react";
import {
  X,
  CalendarCheck,
  Copy,
  Check,
  Calendar,
  Clock,
  FileText,
} from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "Not specified";
  try {
    const [year, month, day] = dateStr.split("-");
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr) {
  if (!timeStr) return "Not specified";
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

export default function AppointmentDetailsModal({ appointment, onClose }) {
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!appointment) return null;

  const {
    id,
    appointment_date,
    appointment_time,
    description,
    status,
    created_at,
  } = appointment;

  const normalizedStatus = (status || "scheduled").toLowerCase();

  const handleCopyId = () => {
    if (id && navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-content modal-details-sample-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Cross Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="modal-corner-close-btn"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        <div className="sample-modal-body">
          {/* Centered Circular Green Icon Badge */}
          <div className="modal-center-icon-badge">
            <CalendarCheck size={28} color="#ffffff" />
          </div>

          {/* Title and Subtitle */}
          <div className="sample-modal-heading">
            <h2 className="sample-modal-title">
              {description || "Appointment Details"}
            </h2>
          </div>

          {/* Appointment ID Container (matching sample ID card styling) */}
          {id && (
            <div className="sample-id-block">
              <span className="sample-block-label">APPOINTMENT ID</span>
              <div className="sample-id-row">
                <span className="sample-id-text">{id}</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="sample-copy-btn"
                  title="Copy Appointment ID"
                  aria-label="Copy Appointment ID"
                >
                  {copiedId ? (
                    <Check size={18} className="copy-check-icon" />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Date & Time Box */}
          <div className="sample-schedule-block">
            <div className="sample-schedule-item">
              <div className="sample-schedule-icon">
                <Calendar size={16} />
              </div>
              <div className="sample-schedule-text">
                <span className="sample-schedule-label">Date</span>
                <span className="sample-schedule-val">
                  {formatDate(appointment_date)}
                </span>
              </div>
            </div>

            <div className="sample-schedule-divider" />

            <div className="sample-schedule-item">
              <div className="sample-schedule-icon">
                <Clock size={16} />
              </div>
              <div className="sample-schedule-text">
                <span className="sample-schedule-label">Time</span>
                <span className="sample-schedule-val">
                  {formatTime(appointment_time)}
                </span>
              </div>
            </div>
          </div>

          {/* Reason / Purpose Details */}
          {description && (
            <div className="sample-reason-block">
              <div className="sample-reason-icon">
                <FileText size={16} />
              </div>
              <div className="sample-reason-content">
                <span className="sample-block-label">Reason / Purpose</span>
                <p className="sample-reason-text">{description}</p>
              </div>
              <span className={`status-pill status-pill-${normalizedStatus}`}>
                {status ? status.toUpperCase() : "SCHEDULED"}
              </span>
            </div>
          )}

          {/* Booked on timestamp if present */}
          {created_at && (
            <div className="sample-created-note">
              <span>Booked on: {new Date(created_at).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
