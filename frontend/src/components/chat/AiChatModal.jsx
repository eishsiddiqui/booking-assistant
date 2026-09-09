import { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Bot,
  Sparkles,
  User,
  CalendarCheck,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { sendChatMessage } from "../../api/chat";
import { createAppointment } from "../../api/appointments";
import { formatDate, formatTime } from "../../utils/date";
import { generateUniqueId } from "../../utils/id";
import "./AiChatModal.css";

export default function AiChatModal({
  isOpen,
  onClose,
  onBookFromAi,
  onFallbackToManualForm,
}) {
  const { token } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: "msg-init",
      sender: "ai",
      text: "Hello! 👋 I'm your AI Appointment Assistant. Tell me when you'd like to schedule your appointment and what it's for (e.g., 'Book a General Consultation for tomorrow at 2 PM').",
      time: "Just now",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [bookingLoadingId, setBookingLoadingId] = useState(null);
  const [chatError, setChatError] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sendUserMessage = async (text) => {
    const trimmed = (text || "").trim();
    if (!trimmed || isTyping) return;

    const userMsg = {
      id: generateUniqueId("msg-user"),
      sender: "user",
      text: trimmed,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);
    setChatError(null);

    try {
      const response = await sendChatMessage(token, {
        message: trimmed,
        sessionId,
      });

      const aiData = response.data;
      if (aiData?.sessionId) {
        setSessionId(aiData.sessionId);
      }

      const aiReply = {
        id: generateUniqueId("msg-ai"),
        sender: "ai",
        text: aiData?.reply || "I am ready to help you book your appointment.",
        suggestedBooking:
          aiData?.isComplete && aiData?.extractedBooking
            ? aiData.extractedBooking
            : null,
        needsFormFallback: Boolean(aiData?.needsFormFallback),
        extractedBooking: aiData?.extractedBooking || null,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error("AI Assistant error:", err);
      const errorMsg = {
        id: generateUniqueId("msg-error"),
        sender: "ai",
        isError: true,
        text: "I'm having trouble reaching the scheduling service right now. You can try again or switch directly to the manual booking form.",
        needsFormFallback: true,
        extractedBooking: null,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendUserMessage(inputValue);
  };

  const handleConfirmSuggested = async (booking, msgId) => {
    if (!booking) return;

    setBookingLoadingId(msgId);
    setChatError(null);

    try {
      const response = await createAppointment(token, {
        appointment_date: booking.appointment_date,
        appointment_time: booking.appointment_time,
        description: booking.description || "General Appointment",
      });

      if (response?.appointment) {
        onBookFromAi(response.appointment);
        onClose();
      } else {
        throw new Error("Invalid response received from server.");
      }
    } catch (err) {
      console.error("Failed to confirm booking from AI:", err);
      const rawMsg =
        err.message ||
        "Could not confirm this slot. It may have already been booked.";
      const errorText = rawMsg.toLowerCase().includes("please select")
        ? `${rawMsg} Or you can use the manual form below.`
        : `${rawMsg} Please select a different time or use the manual form below.`;

      const conflictMsg = {
        id: generateUniqueId("msg-conflict"),
        sender: "ai",
        isConflict: true,
        text: errorText,
        needsFormFallback: true,
        extractedBooking: booking,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, conflictMsg]);
    } finally {
      setBookingLoadingId(null);
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
        className="modal-content modal-chat-content"
        onClick={(e) => e.stopPropagation()}
      >
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
              <span className="chat-status-indicator">
                Online & Ready to book
              </span>
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
            <div
              key={msg.id}
              className={`chat-message-row ${msg.sender} ${
                msg.isConflict ? "conflict-message" : ""
              } ${msg.isError ? "error-message" : ""}`}
            >
              <div className="message-avatar">
                {msg.sender === "ai" ? (
                  msg.isConflict || msg.isError ? (
                    <AlertCircle size={16} />
                  ) : (
                    <Bot size={16} />
                  )
                ) : (
                  <User size={16} />
                )}
              </div>
              <div className="message-bubble-wrapper">
                <div className="message-bubble">
                  <p>{msg.text}</p>

                  {/* Suggested Booking Card if AI extracted complete slots */}
                  {msg.suggestedBooking && (
                    <div className="suggested-booking-card">
                      <div className="suggested-info-row">
                        <CalendarCheck size={16} />
                        <span>
                          {formatDate(msg.suggestedBooking.appointment_date)} at{" "}
                          {formatTime(msg.suggestedBooking.appointment_time)}
                        </span>
                      </div>
                      {msg.suggestedBooking.description && (
                        <p className="suggested-desc">
                          {msg.suggestedBooking.description}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          handleConfirmSuggested(msg.suggestedBooking, msg.id)
                        }
                        className="btn-confirm-booking"
                        disabled={bookingLoadingId === msg.id}
                      >
                        {bookingLoadingId === msg.id ? (
                          <>
                            <Loader2 size={14} className="spinner-icon" />
                            <span>Confirming Booking...</span>
                          </>
                        ) : (
                          <span>Confirm Booking</span>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Structured Form Fallback Button */}
                  {msg.needsFormFallback && onFallbackToManualForm && (
                    <div className="fallback-action-card">
                      <p className="fallback-note">
                        Would you prefer to use a structured calendar form?
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          onFallbackToManualForm(
                            msg.extractedBooking || msg.suggestedBooking
                          )
                        }
                        className="btn-fallback-action"
                      >
                        <Calendar size={14} />
                        <span>Open Manual Booking Form</span>
                      </button>
                    </div>
                  )}
                </div>
                <span className="message-time">{msg.time}</span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
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

        {/* Input Form */}
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

          <form onSubmit={handleSend} className="chat-pill-form">
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
      </div>
    </div>
  );
}
