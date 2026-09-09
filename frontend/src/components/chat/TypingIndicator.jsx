import React from "react";
import { Bot } from "lucide-react";
import "./TypingIndicator.css";

export default function TypingIndicator() {
  return (
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
  );
}
