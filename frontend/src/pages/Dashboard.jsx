import { useState } from "react";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useAppointments } from "../hooks/useAppointments";
import Navbar from "../components/common/Navbar";
import DashboardStats from "../components/appointments/DashboardStats";
import AppointmentCard from "../components/appointments/AppointmentCard";
import EmptyAppointments from "../components/appointments/EmptyAppointments";
import BookAppointmentButton from "../components/appointments/BookAppointmentButton";
import AppointmentDetailsModal from "../components/appointments/AppointmentDetailsModal";
import BookChoiceModal from "../components/appointments/BookChoiceModal";
import ManualBookingModal from "../components/appointments/ManualBookingModal";
import AiChatModal from "../components/chat/AiChatModal";
import AiAssistantCta from "../components/chat/AiAssistantCta";
import "./Dashboard.css";

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user, token } = useAuth();

  // Appointments state & operations from custom hook
  const {
    appointments,
    isLoading,
    fetchError,
    handleRetry,
    addAppointment,
    upcomingCount,
    totalCount,
  } = useAppointments(token);

  // Modal dialog states
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [fallbackPrefill, setFallbackPrefill] = useState(null);

  // Success toast state
  const [toastMessage, setToastMessage] = useState(null);

  // Add new appointment and display feedback
  const handleAddAppointment = (newApt) => {
    addAppointment(newApt);
    setToastMessage(
      `Appointment "${newApt.description || "Booking"}" successfully scheduled!`,
    );
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handle fallback from AI chat to manual form
  const handleAiFormFallback = (prefillData) => {
    setIsChatModalOpen(false);
    setFallbackPrefill(prefillData || null);
    setIsManualModalOpen(true);
  };

  const displayName = user?.name || "User";
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

        {/* Fetch Error Banner with Retry */}
        {fetchError && (
          <div className="dashboard-error-banner" role="alert">
            <div className="error-banner-content">
              <AlertCircle size={20} />
              <span>{fetchError}</span>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="error-retry-btn"
            >
              <RefreshCw size={15} />
              <span>Retry</span>
            </button>
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
        <DashboardStats upcomingCount={upcomingCount} totalCount={totalCount} />

        {/* 4. My Appointments Section */}
        <section
          className="appointments-section"
          aria-label="Appointments list"
        >
          <div className="section-header">
            <h2 className="section-title">My Appointments</h2>

            <BookAppointmentButton
              onClick={() => {
                setFallbackPrefill(null);
                setIsChoiceModalOpen(true);
              }}
            />
          </div>

          {/* Loading Skeleton View */}
          {isLoading ? (
            <div
              className="appointments-grid"
              aria-label="Loading appointments"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-shimmer skeleton-pill" />
                  <div className="skeleton-shimmer skeleton-title" />
                  <div className="skeleton-shimmer skeleton-meta" />
                  <div className="skeleton-shimmer skeleton-button" />
                </div>
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <EmptyAppointments
              onBookAppointment={() => {
                setFallbackPrefill(null);
                setIsChoiceModalOpen(true);
              }}
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
          setFallbackPrefill(null);
          setIsManualModalOpen(true);
        }}
      />

      {/* Manual Booking Form Modal */}
      <ManualBookingModal
        key={
          isManualModalOpen
            ? `manual-${fallbackPrefill ? JSON.stringify(fallbackPrefill) : "fresh"}`
            : "closed"
        }
        isOpen={isManualModalOpen}
        onClose={() => {
          setIsManualModalOpen(false);
          setFallbackPrefill(null);
        }}
        onAddAppointment={handleAddAppointment}
        prefill={fallbackPrefill}
      />

      {/* Conversational AI Assistant Modal */}
      <AiChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        onBookFromAi={handleAddAppointment}
        onFallbackToManualForm={handleAiFormFallback}
      />

      {/* View Appointment Details Modal */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />
    </div>
  );
}
