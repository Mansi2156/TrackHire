const env = require("../config/env");

// Centralized error handler. Normalizes known error types (Mongoose,
// JWT, custom ApiError) into a consistent { success, message } response
// and never leaks stack traces or internals in production.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Mongoose duplicate key error (e.g. duplicate email)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} is already in use` : "Duplicate field value";
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  }

  // JWT errors (defensive fallback; auth middleware already handles these)
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Not authorized, invalid or expired token";
  }

  if (statusCode === 500) {
    // eslint-disable-next-line no-console
    console.error(err);
    if (env.nodeEnv === "production") {
      message = "Internal server error";
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.nodeEnv === "development" && statusCode === 500
      ? { stack: err.stack }
      : {}),
  });
}

module.exports = errorHandler;
