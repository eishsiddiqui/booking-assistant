import { Send, Sparkles, AlertCircle, X } from "lucide-react";
import "./ChatInput.css";

export default function ChatInput({
  inputValue,
  setInputValue,
  onSend,
  isTyping,
  chatError,
  setChatError,
}) {
  return (
    <div className="chat-input-section">
      {/* Optional Chat Error Alert */}
      {chatError && (
        <div className="chat-inline-alert" role="alert">
          <div className="chat-inline-alert-body">
            <AlertCircle size={15} />
            <span>{chatError}</span>
          </div>
          <button
            type="button"
            className="chat-alert-close-btn"
            onClick={() => setChatError(null)}
            aria-label="Dismiss alert"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <form onSubmit={onSend} className="chat-pill-form">
        <input
          type="text"
          placeholder="Ask Appointment AI assistant to schedule a meeting..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="chat-pill-input"
          disabled={isTyping}
          autoFocus
        />
        <button
          type="submit"
          className="chat-pill-send-btn"
          disabled={!inputValue.trim() || isTyping}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </form>
      <div className="chat-footer-note">
        <Sparkles size={12} className="note-sparkle" />
        <span>Appointment AI is analyzing your schedule live</span>
      </div>
    </div>
  );
}
