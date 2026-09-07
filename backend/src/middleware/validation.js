const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateSignup = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Validation error: Name is required and cannot be empty.",
    });
  }

  if (name.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: "Validation error: Name must be 100 characters or fewer.",
    });
  }

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Validation error: A valid email address is required.",
    });
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Validation error: Password must be at least 6 characters long.",
    });
  }

  // Sanitize / normalize
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Validation error: A valid email address is required.",
    });
  }

  if (
    !password ||
    typeof password !== "string" ||
    password.trim().length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Validation error: Password is required.",
    });
  }

  req.body.email = email.trim().toLowerCase();

  next();
};

module.exports = {
  validateSignup,
  validateLogin,
};
