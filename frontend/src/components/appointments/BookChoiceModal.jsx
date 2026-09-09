import { X, Sparkles, CalendarPlus, ArrowRight, Bot } from "lucide-react";
import Modal from "../common/Modal";
import "./BookChoiceModal.css";

export default function BookChoiceModal({
  isOpen,
  onClose,
  onSelectAiBooking,
  onSelectManualBooking,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="modal-choice-content"
      ariaLabel="Book an Appointment"
    >
      {/* Header */}
      <div className="modal-header choice-modal-header">
        <div className="choice-header-text">
          <h2 className="modal-title choice-modal-title">Book an Appointment</h2>
          <p className="modal-subtitle choice-modal-subtitle">
            Choose your preferred booking method
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="modal-close-btn choice-modal-close-btn"
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
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && onSelectAiBooking()
          }
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
            Describe your desired date, time, and reason in natural
            conversational language. Our AI handles the scheduling instantly.
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
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && onSelectManualBooking()
          }
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
            Choose your date and time slot from a traditional structured
            calendar form with specific details.
          </p>

          <div className="choice-action-text secondary-action">
            <span>Fill Booking Form</span>
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
