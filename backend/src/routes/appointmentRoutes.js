const express = require("express");
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
} = require("../controllers/appointmentController");
const {
  validateUUIDParam,
  validateCreateAppointment,
  validateGetAppointmentsQuery,
} = require("../middleware/appointmentValidation");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", validateCreateAppointment, createAppointment);
router.get("/", validateGetAppointmentsQuery, getAppointments);
router.get("/:id", validateUUIDParam, getAppointmentById);

module.exports = router;
