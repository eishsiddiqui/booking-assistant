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

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
};
