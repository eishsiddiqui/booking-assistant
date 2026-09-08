import { useState, useEffect, useRef } from "react";
import { X, Send, Bot, Sparkles, User, CalendarCheck } from "lucide-react";
import { generateUniqueId } from "../../utils/id";
import "./AiChatModal.css";

export default function AiChatModal({ isOpen, onClose, onBookFromAi }) {
  const [messages, setMessages] = useState([
    {
      id: "msg-init",
      sender: "ai",
      text: "Hello! 👋 I'm your AI Appointment Assistant. Tell me when you'd like to schedule your appointment and what it's for (e.g., 'Book a General Consultation for tomorrow at 2 PM').",
      time: "Just now",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;

    const userMsg = {
      id: generateUniqueId("msg-user"),
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulated AI response
    setTimeout(() => {
      setIsTyping(false);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      const bookingDate = tomorrow.toISOString().split("T")[0];

      const aiReply = {
        id: generateUniqueId("msg-ai"),
        sender: "ai",
        text: `I can certainly help you with that! I've drafted an appointment for you on ${bookingDate} at 2:00 PM for "${text.slice(0, 40)}". Would you like me to confirm this booking?`,
        suggestedBooking: {
          appointment_date: bookingDate,
          appointment_time: "14:00",
          description: text.length > 50 ? `${text.slice(0, 47)}...` : text,
          status: "scheduled",
        },
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 900);
  };

  const handleConfirmSuggested = (booking) => {
    const newAppointment = {
      id: generateUniqueId("apt-ai"),
      appointment_date: booking.appointment_date,
      appointment_time: booking.appointment_time,
      description: booking.description,
      status: "scheduled",
      created_at: new Date().toISOString(),
    };
    onBookFromAi(newAppointment);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content modal-chat-content" onClick={(e) => e.stopPropagation()}>
        {/* Chat Header */}
        <div className="chat-modal-header">
          <div className="chat-header-brand">
            <div className="ai-avatar">
              <Bot size={20} />
            </div>
            <div>
              <div className="ai-title-row">
                <h2 className="chat-title">Appointment Assistant</h2>
                <span className="ai-badge">
                  <Sparkles size={11} /> AI Powered
                </span>
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

        {/* Chat Messages */}
        <div className="chat-messages-container">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message-row ${msg.sender}`}>
              <div className="message-avatar">
                {msg.sender === "ai" ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="message-bubble-wrapper">
                <div className="message-bubble">
                  <p>{msg.text}</p>
                  {msg.suggestedBooking && (
                    <div className="suggested-booking-card">
                      <div className="suggested-info">
                        <CalendarCheck size={16} />
                        <span>
                          {msg.suggestedBooking.appointment_date} at 2:00 PM
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleConfirmSuggested(msg.suggestedBooking)}
                        className="btn-confirm-booking"
                      >
                        Confirm Booking
                      </button>
                    </div>
                  )}
                </div>
                <span className="message-time">{msg.time}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="chat-message-row ai">
              <div className="message-avatar">
                <Bot size={16} />
              </div>
              <div className="message-bubble typing-bubble">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Pill Input matching Image 3 */}
        <div className="chat-input-section">
          <form onSubmit={handleSend} className="chat-pill-form">
            <input
              type="text"
              placeholder="Ask Appointment AI assistant to schedule a meeting..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="chat-pill-input"
              autoFocus
            />
            <button
              type="submit"
              className="chat-pill-send-btn"
              disabled={!inputValue.trim()}
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
      </div>
    </div>
  );
}
