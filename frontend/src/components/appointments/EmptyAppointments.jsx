import { Calendar, Plus } from "lucide-react";
import "./EmptyAppointments.css";

export default function EmptyAppointments({ onBookAppointment }) {
  return (
    <div className="empty-appointments-container">
      <div className="empty-icon-circle">
        <Calendar size={36} className="empty-icon" />
      </div>
      <h3 className="empty-title">No appointments yet</h3>
      <p className="empty-description">
        Book your first appointment to get started.
      </p>
      <button
        type="button"
        onClick={onBookAppointment}
        className="btn-primary empty-action-btn"
      >
        <Plus size={18} />
        <span>Book Appointment</span>
      </button>
    </div>
  );
}
