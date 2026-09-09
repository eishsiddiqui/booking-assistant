import {
  X,
  CalendarCheck,
  Calendar,
  Clock,
  FileText,
} from "lucide-react";
import { formatFullDate as formatDate, formatTime } from "../../utils/date";
import Modal from "../common/Modal";
import "./AppointmentDetailsModal.css";

export default function AppointmentDetailsModal({ appointment, onClose }) {
  if (!appointment) return null;

  const {
    appointment_date,
    appointment_time,
    description,
    status,
    created_at,
  } = appointment;

  const normalizedStatus = (status || "scheduled").toLowerCase();

  return (
    <Modal
      isOpen={Boolean(appointment)}
      onClose={onClose}
      className="modal-details-sample-card"
      ariaLabel="Appointment Details"
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

        {/* Title */}
        <div className="sample-modal-heading">
          <h2 className="sample-modal-title">
            {description || "Appointment Details"}
          </h2>
        </div>

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
    </Modal>
  );
}
