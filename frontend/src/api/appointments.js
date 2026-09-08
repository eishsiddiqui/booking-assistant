import { authFetch } from "./client";

/**
 * Fetch all appointments for the authenticated user with optional filtering
 * @param {string} token - JWT authentication token
 * @param {Object} [filters] - Optional query filters (status, date)
 * @returns {Promise<{ success: boolean, count: number, appointments: Array<Object> }>}
 */
export async function fetchAppointments(token, filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append("status", filters.status);
  if (filters.date) queryParams.append("date", filters.date);

  const queryString = queryParams.toString();
  return authFetch(`/appointments${queryString ? `?${queryString}` : ""}`, token);
}

/**
 * Book a new appointment
 * @param {string} token - JWT authentication token
 * @param {Object} appointmentData
 * @param {string} appointmentData.appointment_date - Date in YYYY-MM-DD
 * @param {string} appointmentData.appointment_time - Time in HH:MM or HH:MM:SS
 * @param {string} [appointmentData.description] - Purpose or reason for the appointment
 * @returns {Promise<{ success: boolean, message: string, appointment: Object }>}
 */
export async function createAppointment(token, appointmentData) {
  return authFetch("/appointments", token, {
    method: "POST",
    body: JSON.stringify({
      appointment_date: appointmentData.appointment_date,
      appointment_time: appointmentData.appointment_time,
      description: appointmentData.description,
    }),
  });
}

/**
 * Fetch a single appointment by ID
 * @param {string} token - JWT authentication token
 * @param {string} id - Appointment UUID
 * @returns {Promise<{ success: boolean, appointment: Object }>}
 */
export async function fetchAppointmentById(token, id) {
  return authFetch(`/appointments/${id}`, token);
}
