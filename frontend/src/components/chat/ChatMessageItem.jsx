import React from "react";
import { Bot, User, AlertCircle } from "lucide-react";
import SuggestedBookingCard from "./SuggestedBookingCard";
import FallbackActionCard from "./FallbackActionCard";
import "./ChatMessageItem.css";

export default function ChatMessageItem({
  msg,
  bookingLoadingId,
  onConfirmSuggested,
  onFallbackToManualForm,
}) {
  const isAi = msg.sender === "ai";

  return (
    <div
      className={`chat-message-row ${msg.sender} ${
        msg.isConflict ? "conflict-message" : ""
      } ${msg.isError ? "error-message" : ""}`}
    >
      <div className="message-avatar">
        {isAi ? (
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
            <SuggestedBookingCard
              booking={msg.suggestedBooking}
              isLoading={bookingLoadingId === msg.id}
              onConfirm={() => onConfirmSuggested(msg.suggestedBooking, msg.id)}
            />
          )}

          {/* Structured Form Fallback Button */}
          {msg.needsFormFallback && onFallbackToManualForm && (
            <FallbackActionCard
              bookingData={msg.extractedBooking || msg.suggestedBooking}
              onFallback={onFallbackToManualForm}
            />
          )}
        </div>
        <span className="message-time">{msg.time}</span>
      </div>
    </div>
  );
}
