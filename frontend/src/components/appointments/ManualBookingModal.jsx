import { useState, useEffect } from "react";
import { X, Calendar, Clock, FileText, AlertCircle } from "lucide-react";
import { generateUniqueId } from "../../utils/id";

function getDefaultFormData() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    date: tomorrow.toISOString().split("T")[0],
    time: "10:00",
    description: "",
  };
}

export default function ManualBookingModal({ isOpen, onClose, onAddAppointment }) {
  const [formData, setFormData] = useState(getDefaultFormData);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.date) {
      setError("Please select a date for your appointment.");
      return;
    }
    if (!formData.time) {
      setError("Please select a time for your appointment.");
      return;
    }
    if (!formData.description.trim()) {
      setError("Please enter a brief description or purpose of the appointment.");
      return;
    }

    const newAppointment = {
      id: generateUniqueId("apt-manual"),
      appointment_date: formData.date,
      appointment_time: formData.time,
      description: formData.description.trim(),
      status: "scheduled",
      created_at: new Date().toISOString(),
    };

    onAddAppointment(newAppointment);
    setFormData(getDefaultFormData());
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Manual Appointment Booking</h2>
            <p className="modal-subtitle">Choose your preferred schedule and reason</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="manual-booking-form">
          {error && (
            <div className="modal-alert modal-alert-error" role="alert">
              <AlertCircle size={18} className="modal-alert-icon" />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="manual-date" className="form-label">
              <Calendar size={16} />
              <span>Appointment Date</span>
            </label>
            <input
              id="manual-date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="manual-time" className="form-label">
              <Clock size={16} />
              <span>Appointment Time</span>
            </label>
            <input
              id="manual-time"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="manual-description" className="form-label">
              <FileText size={16} />
              <span>Description / Reason</span>
            </label>
            <textarea
              id="manual-description"
              name="description"
              placeholder="e.g. General Consultation, Follow-up checkup..."
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Confirm & Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
