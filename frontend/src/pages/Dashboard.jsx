import { useState, useMemo } from "react";
import { Plus, CheckCircle2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/common/Navbar";
import DashboardStats from "../components/appointments/DashboardStats";
import AppointmentCard from "../components/appointments/AppointmentCard";
import EmptyAppointments from "../components/appointments/EmptyAppointments";
import AppointmentDetailsModal from "../components/appointments/AppointmentDetailsModal";
import BookChoiceModal from "../components/appointments/BookChoiceModal";
import ManualBookingModal from "../components/appointments/ManualBookingModal";
import AiChatModal from "../components/chat/AiChatModal";
import AiAssistantCta from "../components/chat/AiAssistantCta";
import "./Dashboard.css";

// Initial realistic static mock appointments following backend schema
const INITIAL_APPOINTMENTS = [
  {
    id: "apt-001",
    appointment_date: "2026-09-10",
    appointment_time: "15:00",
    description: "General Consultation",
    status: "scheduled",
    created_at: "2026-09-01T10:30:00Z",
  },
  {
    id: "apt-002",
    appointment_date: "2026-09-18",
    appointment_time: "10:30",
    description: "Follow-up Health Review",
    status: "scheduled",
    created_at: "2026-09-03T14:15:00Z",
  },
  {
    id: "apt-003",
    appointment_date: "2026-09-02",
    appointment_time: "11:00",
    description: "Routine Physical Examination",
    status: "completed",
    created_at: "2026-08-25T09:00:00Z",
  },
];

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user } = useAuth();

  // Static appointments state
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);

  // Modal dialog states
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Success toast state
  const [toastMessage, setToastMessage] = useState(null);

  // Compute dynamic stats
  const upcomingCount = useMemo(() => {
    return appointments.filter(
      (a) => (a.status || "scheduled").toLowerCase() === "scheduled"
    ).length;
  }, [appointments]);

  const totalCount = appointments.length;

  // Add new appointment and display feedback
  const handleAddAppointment = (newApt) => {
    setAppointments((prev) => [newApt, ...prev]);
    setToastMessage(`Appointment "${newApt.description}" successfully scheduled!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const displayName = user?.name || "Eishal";
  const greeting = `${getTimeGreeting()}, ${displayName} 👋`;

  return (
    <div className="dashboard-page">
      {/* 1. Top Navigation Bar */}
      <Navbar />

      <main className="dashboard-main">
        {/* Toast confirmation banner */}
        {toastMessage && (
          <div className="dashboard-toast" role="status">
            <CheckCircle2 size={18} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 2. Welcome Section */}
        <section className="welcome-section" aria-label="Welcome banner">
          <h1 className="welcome-title">{greeting}</h1>
          <p className="welcome-subtitle">
            Manage your appointments and book a new one.
          </p>
        </section>

        {/* 3. Statistics Cards */}
        <DashboardStats
          upcomingCount={upcomingCount}
          totalCount={totalCount}
        />

        {/* 4. My Appointments Section */}
        <section className="appointments-section" aria-label="Appointments list">
          <div className="section-header">
            <h2 className="section-title">My Appointments</h2>

            <button
              type="button"
              onClick={() => setIsChoiceModalOpen(true)}
              className="book-btn-primary"
            >
              <Plus size={18} />
              <span>Book Appointment</span>
            </button>
          </div>

          {appointments.length === 0 ? (
            <EmptyAppointments
              onBookAppointment={() => setIsChoiceModalOpen(true)}
            />
          ) : (
            <div className="appointments-grid">
              {appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onViewDetails={setSelectedAppointment}
                />
              ))}
            </div>
          )}
        </section>

        {/* 5. AI Assistant Call-to-Action */}
        <AiAssistantCta onStartChat={() => setIsChatModalOpen(true)} />
      </main>

      {/* Choice Modal (AI vs Manual) */}
      <BookChoiceModal
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        onSelectAiBooking={() => {
          setIsChoiceModalOpen(false);
          setIsChatModalOpen(true);
        }}
        onSelectManualBooking={() => {
          setIsChoiceModalOpen(false);
          setIsManualModalOpen(true);
        }}
      />

      {/* Manual Booking Form Modal */}
      <ManualBookingModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onAddAppointment={handleAddAppointment}
      />

      {/* Conversational AI Assistant Modal */}
      <AiChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        onBookFromAi={handleAddAppointment}
      />

      {/* View Appointment Details Modal */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />
    </div>
  );
}
