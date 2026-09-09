import { Plus } from "lucide-react";
import "./BookAppointmentButton.css";

export default function BookAppointmentButton({
  onClick,
  className = "",
  children = "Book Appointment",
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`book-appointment-btn ${className}`.trim()}
      {...props}
    >
      <Plus size={18} className="book-appointment-icon" />
      <span>{children}</span>
    </button>
  );
}
