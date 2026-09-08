const appointmentService = require("../services/appointmentService");

const createAppointment = async (req, res, next) => {
  try {
    const { appointment_date, appointment_time, description } = req.body;
    const userId = req.user.id;

    const appointment = await appointmentService.createAppointment({
      userId,
      appointmentDate: appointment_date,
      appointmentTime: appointment_time,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully.",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

const getAppointments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, date } = req.query;

    const appointments = await appointmentService.getAppointments({
      userId,
      status,
      date,
    });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appointment = await appointmentService.getAppointmentById(id, userId);

    return res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
};
