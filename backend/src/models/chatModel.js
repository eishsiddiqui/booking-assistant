const pool = require("../db/db");

/**
 * Create a new chat session for a user
 * @param {string} userId - User UUID
 * @param {object} [initialMetadata={}] - Initial session metadata
 * @returns {Promise<object>} Created chat session record
 */
const createSession = async (userId, initialMetadata = {}) => {
  const query = `
    INSERT INTO chat_sessions (user_id, messages, metadata)
    VALUES ($1, $2::jsonb, $3::jsonb)
    RETURNING id, user_id, messages, metadata, created_at, updated_at
  `;
  const result = await pool.query(query, [
    userId,
    JSON.stringify([]),
    JSON.stringify(initialMetadata),
  ]);
  return result.rows[0];
};

/**
 * Find a chat session by ID for a specific user
 * @param {string} id - Chat session UUID
 * @param {string} userId - User UUID
 * @returns {Promise<object|null>} Found chat session or null
 */
const findByIdAndUser = async (id, userId) => {
  const query = `
    SELECT id, user_id, messages, metadata, created_at, updated_at
    FROM chat_sessions
    WHERE id = $1 AND user_id = $2
  `;
  const result = await pool.query(query, [id, userId]);
  return result.rows[0] || null;
};

/**
 * Update messages and metadata in a chat session
 * @param {string} id - Chat session UUID
 * @param {string} userId - User UUID
 * @param {Array<object>} messages - Full updated messages array
 * @param {object} metadata - Full updated metadata object
 * @returns {Promise<object>} Updated chat session record
 */
const updateSession = async (id, userId, messages, metadata) => {
  const query = `
    UPDATE chat_sessions
    SET messages = $1::jsonb,
        metadata = $2::jsonb,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3 AND user_id = $4
    RETURNING id, user_id, messages, metadata, created_at, updated_at
  `;
  const result = await pool.query(query, [
    JSON.stringify(messages),
    JSON.stringify(metadata),
    id,
    userId,
  ]);
  return result.rows[0];
};

/**
 * Find all chat sessions belonging to a specific user
 * @param {string} userId - User UUID
 * @returns {Promise<Array<object>>} List of user's chat sessions
 */
const findAllByUser = async (userId) => {
  const query = `
    SELECT id, user_id, metadata, created_at, updated_at,
           jsonb_array_length(messages) AS message_count
    FROM chat_sessions
    WHERE user_id = $1
    ORDER BY updated_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

module.exports = {
  createSession,
  findByIdAndUser,
  updateSession,
  findAllByUser,
};
