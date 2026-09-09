import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { sendChatMessage } from "../../api/chat";
import { createAppointment } from "../../api/appointments";
import { generateUniqueId } from "../../utils/id";
import Modal from "../common/Modal";
import ChatHeader from "./ChatHeader";
import ChatMessageItem from "./ChatMessageItem";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";
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
      text: "Hello! 👋 I'm your AI Appointment Assistant. Tell me when you'd like to schedule your appointment and what it's for.",
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="modal-chat-content"
      ariaLabel="AI Appointment Assistant"
    >
      {/* Chat Header */}
      <ChatHeader onClose={onClose} />

      {/* Chat Messages */}
      <div className="chat-messages-container">
        {messages.map((msg) => (
          <ChatMessageItem
            key={msg.id}
            msg={msg}
            bookingLoadingId={bookingLoadingId}
            onConfirmSuggested={handleConfirmSuggested}
            onFallbackToManualForm={onFallbackToManualForm}
          />
        ))}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form & Error Alert */}
      <ChatInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSend={handleSend}
        isTyping={isTyping}
        chatError={chatError}
        setChatError={setChatError}
      />
    </Modal>
  );
}
