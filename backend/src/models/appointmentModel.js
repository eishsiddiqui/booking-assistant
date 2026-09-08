const pool = require("../db/db");

/**
 * Find an appointment for a specific user by appointment ID
 * @param {string} id - Appointment UUID
 * @param {string} userId - User UUID
 * @returns {Promise<object|null>} Appointment record or null
 */
const findByIdAndUser = async (id, userId) => {
  const query = `
    SELECT id, user_id, appointment_date, appointment_time, description, status, created_at
    FROM appointments
    WHERE id = $1 AND user_id = $2
  `;
  const result = await pool.query(query, [id, userId]);
  return result.rows[0] || null;
};

/**
 * Check if a scheduled appointment exists for a given date and time slot
 * @param {string} date - Date in YYYY-MM-DD
 * @param {string} time - Time in HH:MM / HH:MM:SS
 * @returns {Promise<object|null>} Existing appointment record if booked, else null
 */
const findScheduledBySlot = async (date, time) => {
  const query = `
    SELECT id, appointment_date, appointment_time, status
    FROM appointments
    WHERE appointment_date = $1
      AND appointment_time = $2
      AND status = 'scheduled'
  `;
  const result = await pool.query(query, [date, time]);
  return result.rows[0] || null;
};

/**
 * Create a new appointment in the database
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.appointmentDate
 * @param {string} params.appointmentTime
 * @param {string|null} params.description
 * @param {string} [params.status='scheduled']
 * @returns {Promise<object>} Created appointment record
 */
const create = async ({
  userId,
  appointmentDate,
  appointmentTime,
  description = null,
  status = "scheduled",
}) => {
  const query = `
    INSERT INTO appointments (user_id, appointment_date, appointment_time, description, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, user_id, appointment_date, appointment_time, description, status, created_at
  `;
  const result = await pool.query(query, [
    userId,
    appointmentDate,
    appointmentTime,
    description,
    status,
  ]);
  return result.rows[0];
};

/**
 * Retrieve appointments for a specific user with optional filters
 * @param {object} filters
 * @param {string} filters.userId
 * @param {string} [filters.status]
 * @param {string} [filters.date]
 * @returns {Promise<Array<object>>} List of appointments
 */
const findAllByUser = async ({ userId, status, date }) => {
  let query = `
    SELECT id, user_id, appointment_date, appointment_time, description, status, created_at
    FROM appointments
    WHERE user_id = $1
  `;
  const params = [userId];
  let paramIndex = 2;

  if (status) {
    query += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (date) {
    query += ` AND appointment_date = $${paramIndex}`;
    params.push(date);
    paramIndex++;
  }

  query += ` ORDER BY appointment_date ASC, appointment_time ASC`;

  const result = await pool.query(query, params);
  return result.rows;
};

module.exports = {
  findByIdAndUser,
  findScheduledBySlot,
  create,
  findAllByUser,
};
