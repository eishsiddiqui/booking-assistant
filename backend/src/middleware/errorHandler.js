const errorHandler = (err, req, res, next) => {
  const statusCode =
    err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const message = err.message || "Internal Server Error";

  if (statusCode >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
