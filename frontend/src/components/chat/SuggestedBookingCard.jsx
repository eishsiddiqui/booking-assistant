import { CalendarCheck, Loader2 } from "lucide-react";
import { formatDate, formatTime } from "../../utils/date";
import "./SuggestedBookingCard.css";

export default function SuggestedBookingCard({ booking, onConfirm, isLoading }) {
  if (!booking) return null;

  return (
    <div className="suggested-booking-card">
      <div className="suggested-info-row">
        <CalendarCheck size={16} />
        <span>
          {formatDate(booking.appointment_date)} at{" "}
          {formatTime(booking.appointment_time)}
        </span>
      </div>
      {booking.description && (
        <p className="suggested-desc">{booking.description}</p>
      )}
      <button
        type="button"
        onClick={onConfirm}
        className="btn-confirm-booking"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 size={14} className="spinner-icon" />
            <span>Confirming Booking...</span>
          </>
        ) : (
          <span>Confirm Booking</span>
        )}
      </button>
    </div>
  );
}
