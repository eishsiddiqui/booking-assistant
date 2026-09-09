const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Check if a string adheres to standard UUID format
 * @param {string} str
 * @returns {boolean}
 */
const isUUID = (str) => {
  return typeof str === "string" && UUID_REGEX.test(str.trim());
};

/**
 * Express middleware factory to validate a UUID route parameter
 * @param {string} [paramName='id'] - Route parameter name to validate (e.g. 'id', 'sessionId')
 * @returns {Function} Express middleware
 */
const validateUuidParam = (paramName = "id") => (req, res, next) => {
  const value = req.params[paramName];

  if (!value || !UUID_REGEX.test(value)) {
    return res.status(400).json({
      success: false,
      message: `Validation error: ${paramName} parameter must be a valid UUID.`,
    });
  }

  next();
};

module.exports = {
  UUID_REGEX,
  isUUID,
  validateUuidParam,
};
