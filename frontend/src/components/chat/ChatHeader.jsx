import { Bot, X } from "lucide-react";
import "./ChatHeader.css";

export default function ChatHeader({ onClose }) {
  return (
    <div className="chat-modal-header">
      <div className="chat-header-brand">
        <div className="ai-avatar">
          <Bot size={20} />
        </div>
        <div>
          <div className="ai-title-row">
            <h2 className="chat-title">Appointment Assistant</h2>
          </div>
          <span className="chat-status-indicator">Online & Ready to book</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="modal-close-btn"
        aria-label="Close chat dialog"
      >
        <X size={20} />
      </button>
    </div>
  );
}
