const jwt = require("jsonwebtoken");
const config = require("../config");

/**
 * Generate a JWT for a user.
 * @param {object} payload - Data to embed in token (e.g., { id, email, name })
 * @returns {string} Signed JWT
 */
const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Verify and decode a JWT.
 * @param {string} token - JWT string to verify
 * @returns {object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

module.exports = {
  generateToken,
  verifyToken,
};
