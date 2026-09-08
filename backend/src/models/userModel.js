const pool = require("../db/db");

/**
 * Find user by email address (includes password_hash for authentication)
 * @param {string} email
 * @returns {Promise<object|null>}
 */
const findByEmail = async (email) => {
  const query = `
    SELECT id, name, email, password_hash, created_at
    FROM users
    WHERE email = $1
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
};

/**
 * Find user by ID (excludes password_hash for safety)
 * @param {string} id
 * @returns {Promise<object|null>}
 */
const findById = async (id) => {
  const query = `
    SELECT id, name, email, created_at
    FROM users
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Create a new user record in the database
 * @param {object} params
 * @param {string} params.name
 * @param {string} params.email
 * @param {string} params.passwordHash
 * @returns {Promise<object>}
 */
const create = async ({ name, email, passwordHash }) => {
  const query = `
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, created_at
  `;
  const result = await pool.query(query, [name, email, passwordHash]);
  return result.rows[0];
};

module.exports = {
  findByEmail,
  findById,
  create,
};
