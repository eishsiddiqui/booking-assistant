const { isUUID, validateUuidParam } = require("./validateUuid");

const validateSendMessage = (req, res, next) => {
  const { message, sessionId } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: "Validation error: 'message' is required and must be a non-empty string.",
    });
  }

  const trimmed = message.trim();
  if (trimmed.length > 2000) {
    return res.status(400).json({
      success: false,
      message: "Validation error: 'message' cannot exceed 2000 characters.",
    });
  }

  if (sessionId !== undefined && sessionId !== null && sessionId !== "") {
    if (!isUUID(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Validation error: 'sessionId' must be a valid UUID.",
      });
    }
    req.body.sessionId = sessionId.trim();
  }

  req.body.message = trimmed;
  next();
};

const validateSessionIdParam = validateUuidParam("sessionId");

module.exports = {
  validateSendMessage,
  validateSessionIdParam,
};
