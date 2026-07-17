const ApiError = require("../utils/ApiError");

// Catches requests to routes that don't exist and forwards a 404
// to the centralized error handler.
function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
}

module.exports = notFound;
