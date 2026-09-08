const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isStrictCalendarDate = (dateString) => {
  if (
    !dateString ||
    typeof dateString !== "string" ||
    !DATE_REGEX.test(dateString)
  ) {
    return false;
  }

  const [year, month, day] = dateString.split("-").map(Number);

  const parsed = new Date(year, month - 1, day);

  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
};

const validateUUIDParam = (req, res, next) => {
  const { id } = req.params;

  if (!id || !UUID_REGEX.test(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format: Must be a valid UUID.",
    });
  }

  next();
};

const validateCreateAppointment = (req, res, next) => {
  const { appointment_date, appointment_time, description } = req.body;

  // Validate appointment_date
  if (!appointment_date || typeof appointment_date !== "string") {
    return res.status(400).json({
      success: false,
      message: "Validation error: appointment_date is required (YYYY-MM-DD).",
    });
  }

  const trimmedDate = appointment_date.trim();

  if (!isStrictCalendarDate(trimmedDate)) {
    return res.status(400).json({
      success: false,
      message:
        "Validation error: appointment_date must be a valid calendar date in YYYY-MM-DD format.",
    });
  }

  // Check if date is in the past
  const [year, month, day] = trimmedDate.split("-").map(Number);
  const appointmentDateObj = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (appointmentDateObj < today) {
    return res.status(400).json({
      success: false,
      message: "Validation error: appointment_date cannot be in the past.",
    });
  }

  // Validate appointment_time
  if (!appointment_time || typeof appointment_time !== "string") {
    return res.status(400).json({
      success: false,
      message:
        "Validation error: appointment_time is required (HH:MM or HH:MM:SS).",
    });
  }

  const trimmedTime = appointment_time.trim();

  if (!TIME_REGEX.test(trimmedTime)) {
    return res.status(400).json({
      success: false,
      message:
        "Validation error: appointment_time must be in valid 24-hour format (HH:MM or HH:MM:SS).",
    });
  }

  // Validate description
  if (description !== undefined && description !== null) {
    if (typeof description !== "string") {
      return res.status(400).json({
        success: false,
        message: "Validation error: description must be a string.",
      });
    }

    if (description.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: "Validation error: description cannot exceed 500 characters.",
      });
    }

    req.body.description = description.trim();
  }

  req.body.appointment_date = trimmedDate;
  req.body.appointment_time = trimmedTime;

  next();
};

const validateGetAppointmentsQuery = (req, res, next) => {
  const { status, date } = req.query;

  if (status !== undefined) {
    const validStatuses = ["scheduled", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Validation error: status query parameter must be one of: ${validStatuses.join(", ")}.`,
      });
    }
  }

  if (date !== undefined) {
    const trimmedDate = typeof date === "string" ? date.trim() : "";
    if (!isStrictCalendarDate(trimmedDate)) {
      return res.status(400).json({
        success: false,
        message:
          "Validation error: date query parameter must be a valid calendar date in YYYY-MM-DD format.",
      });
    }
    req.query.date = trimmedDate;
  }

  next();
};

module.exports = {
  isStrictCalendarDate,
  validateUUIDParam,
  validateCreateAppointment,
  validateGetAppointmentsQuery,
};
