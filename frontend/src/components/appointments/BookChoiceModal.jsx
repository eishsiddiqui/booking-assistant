import { useEffect } from "react";
import { X, Sparkles, CalendarPlus, ArrowRight, Bot } from "lucide-react";
import "./BookChoiceModal.css";

export default function BookChoiceModal({
  isOpen,
  onClose,
  onSelectAiBooking,
  onSelectManualBooking,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content modal-choice-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Book an Appointment</h2>
            <p className="modal-subtitle">Choose your preferred booking method</p>
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

        {/* Options */}
        <div className="choice-options-grid">
          {/* AI Option (Primary / Recommended) */}
          <div
            className="choice-card primary-choice"
            onClick={onSelectAiBooking}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelectAiBooking()}
          >
            <div className="choice-badge-row">
              <span className="recommended-badge">
                <Sparkles size={13} />
                <span>Recommended</span>
              </span>
            </div>

            <div className="choice-icon-row">
              <div className="choice-icon-wrapper ai-icon-wrapper">
                <Bot size={28} />
              </div>
            </div>

            <h3 className="choice-title">Book with AI Assistant</h3>
            <p className="choice-description">
              Describe your desired date, time, and reason in natural conversational language. Our AI handles the scheduling instantly.
            </p>

            <div className="choice-action-text">
              <span>Start Conversational Booking</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Manual Option */}
          <div
            className="choice-card secondary-choice"
            onClick={onSelectManualBooking}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelectManualBooking()}
          >
            <div className="choice-badge-row">
              <span className="standard-badge">Standard Form</span>
            </div>

            <div className="choice-icon-row">
              <div className="choice-icon-wrapper manual-icon-wrapper">
                <CalendarPlus size={28} />
              </div>
            </div>

            <h3 className="choice-title">Book Manually</h3>
            <p className="choice-description">
              Choose your date and time slot from a traditional structured calendar form with specific details.
            </p>

            <div className="choice-action-text secondary-action">
              <span>Fill Booking Form</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
