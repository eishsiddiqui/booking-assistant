const express = require("express");
const cors = require("cors");
const config = require("./config");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");
const requestLogger = require("./middleware/logger");

const { generalLimiter } = require("./middleware/rateLimiter");

const app = express();

app.use(
  cors({
    origin: config.clientUrl || "*",
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
