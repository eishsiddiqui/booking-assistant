import React from "react";
import { Calendar } from "lucide-react";
import "./FallbackActionCard.css";

export default function FallbackActionCard({ onFallback, bookingData }) {
  return (
    <div className="fallback-action-card">
      <p className="fallback-note">
        Would you prefer to use a structured calendar form?
      </p>
      <button
        type="button"
        onClick={() => onFallback(bookingData)}
        className="btn-fallback-action"
      >
        <Calendar size={14} />
        <span>Open Manual Booking Form</span>
      </button>
    </div>
  );
}
