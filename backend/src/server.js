const express = require("express");
const cors = require("cors");
const config = require("./config");
const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const errorHandler = require("./middleware/errorHandler");
const requestLogger = require("./middleware/logger");

const { generalLimiter } = require("./middleware/rateLimiter");

const app = express();

const allowedOrigins = [
  config.clientUrl,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);

app.use(express.json());

app.use(requestLogger);

app.get("/", (req, res) => {
  res.json({
    message: "Booking Assistant API is running",
    status: "healthy",
  });
});

app.use("/api", generalLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

module.exports = app;
