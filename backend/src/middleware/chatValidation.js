const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    if (typeof sessionId !== "string" || !UUID_REGEX.test(sessionId.trim())) {
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

const validateSessionIdParam = (req, res, next) => {
  const { sessionId } = req.params;

  if (!sessionId || !UUID_REGEX.test(sessionId)) {
    return res.status(400).json({
      success: false,
      message: "Validation error: sessionId parameter must be a valid UUID.",
    });
  }

  next();
};

module.exports = {
  validateSendMessage,
  validateSessionIdParam,
};
