import { useState, useEffect } from "react";
import { X, Calendar, Clock, FileText, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { createAppointment } from "../../api/appointments";
import "./ManualBookingModal.css";

function getDefaultFormData() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    date: tomorrow.toISOString().split("T")[0],
    time: "10:00",
    description: "",
  };
}

function getInitialFormData(prefill) {
  if (prefill) {
    return {
      date: prefill.appointment_date || prefill.date || getDefaultFormData().date,
      time: prefill.appointment_time || prefill.time || "10:00",
      description: prefill.description || "",
    };
  }
  return getDefaultFormData();
}

export default function ManualBookingModal({
  isOpen,
  onClose,
  onAddAppointment,
  prefill = null,
}) {
  const { token } = useAuth();
  const [formData, setFormData] = useState(() => getInitialFormData(prefill));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Handle escape key to dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date) {
      setError("Please select a date for your appointment.");
      return;
    }
    const [y, m, d] = formData.date.split("-").map(Number);
    const [hh, mm] = formData.time.split(":").map(Number);
    const selectedDateTime = new Date(y, m - 1, d, hh, mm || 0, 0);

    if (selectedDateTime <= new Date()) {
      setError("The selected appointment date and time has already passed. Please choose a future time.");
      return;
    }
    if (!formData.description.trim() || formData.description.trim().length < 3) {
      setError("Please enter a description with at least 3 characters.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await createAppointment(token, {
        appointment_date: formData.date,
        appointment_time: formData.time,
        description: formData.description.trim(),
      });

      if (response?.appointment) {
        onAddAppointment(response.appointment);
        setFormData(getDefaultFormData());
        onClose();
      } else {
        throw new Error("Invalid response received from server.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      setError(err.message || "Failed to schedule appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="modal-backdrop" onClick={!isSubmitting ? onClose : undefined} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header manual-modal-header">
          <div className="manual-header-text">
            <h2 className="modal-title">Manual Appointment Booking</h2>
            <p className="modal-subtitle">Choose your preferred schedule and reason</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn manual-close-btn"
            aria-label="Close dialog"
            disabled={isSubmitting}
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
              min={todayStr}
              value={formData.date}
              onChange={handleChange}
              className="form-input"
              required
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>

          {/* Footer Actions */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spinner-icon" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <span>Confirm & Book</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
