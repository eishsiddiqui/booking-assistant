const appointmentModel = require("../models/appointmentModel");
const AppError = require("../utils/AppError");

/**
 * Service to create a new appointment
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.appointmentDate
 * @param {string} params.appointmentTime
 * @param {string|null} params.description
 * @returns {Promise<object>} Created appointment record
 */
const createAppointment = async ({
  userId,
  appointmentDate,
  appointmentTime,
  description,
}) => {
  const existingSlot = await appointmentModel.findScheduledBySlot(
    appointmentDate,
    appointmentTime,
  );

  if (existingSlot) {
    throw new AppError(
      "This time slot is already booked. Please select a different time or date.",
      409,
    );
  }

  try {
    const newAppointment = await appointmentModel.create({
      userId,
      appointmentDate,
      appointmentTime,
      description,
    });

    return newAppointment;
  } catch (error) {
    // Fallback for race condition: PostgreSQL unique constraint violation (code 23505)
    if (error.code === "23505") {
      throw new AppError(
        "This time slot is already booked. Please select a different time or date.",
        409,
      );
    }
    throw error;
  }
};

/**
 * Service to fetch all appointments for a user with optional filters
 * @param {object} filters
 * @param {string} filters.userId
 * @param {string} [filters.status]
 * @param {string} [filters.date]
 * @returns {Promise<Array<object>>} List of appointments
 */
const getAppointments = async ({ userId, status, date }) => {
  return await appointmentModel.findAllByUser({ userId, status, date });
};

/**
 * Service to fetch a single appointment by ID for a specific user
 *
 * @param {string} id - Appointment UUID
 * @param {string} userId - User UUID
 * @returns {Promise<object>} Found appointment record
 */
const getAppointmentById = async (id, userId) => {
  const appointment = await appointmentModel.findByIdAndUser(id, userId);

  if (!appointment) {
    throw new AppError("Appointment not found.", 404);
  }

  return appointment;
};

const STANDARD_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

/**
 * Get available and booked slots for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<object>}
 */
const getAvailabilityForDate = async (date) => {
  const scheduled = await appointmentModel.findScheduledByDate(date);
  const bookedSlots = scheduled.map((s) => s.appointment_time.slice(0, 5));

  // Determine current date & time to filter out past slots if date is today
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const isToday = date === todayStr;
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const availableSlots = STANDARD_SLOTS.filter((slot) => {
    if (bookedSlots.includes(slot)) return false;
    if (isToday) {
      const [slotH, slotM] = slot.split(":").map(Number);
      if (slotH < currentHour || (slotH === currentHour && currentMinute > 0)) {
        return false;
      }
    }
    return true;
  });

  const morning = availableSlots.filter((slot) => parseInt(slot.split(":")[0], 10) < 12);
  const afternoon = availableSlots.filter((slot) => parseInt(slot.split(":")[0], 10) >= 12);

  return {
    date,
    bookedSlots,
    availableSlots,
    morning,
    afternoon,
  };
};

/**
 * Check if a specific slot is available
 * @param {string} date - Date in YYYY-MM-DD
 * @param {string} time - Time in HH:MM or HH:MM:SS
 * @returns {Promise<{ isAvailable: boolean, existingSlot: object|null }>}
 */
const checkSlotAvailability = async (date, time) => {
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  const existingSlot = await appointmentModel.findScheduledBySlot(date, normalizedTime);
  return {
    isAvailable: !existingSlot,
    existingSlot,
  };
};

module.exports = {
  STANDARD_SLOTS,
  createAppointment,
  getAppointments,
  getAppointmentById,
  getAvailabilityForDate,
  checkSlotAvailability,
};
