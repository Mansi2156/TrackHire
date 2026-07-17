const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

// Runs after validator chains; converts express-validator errors into
// a single consistent ApiError so all validation failures return the
// same response shape.
function validate(req, _res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const messages = errors.array().map((err) => err.msg);
  next(new ApiError(400, messages.join(", ")));
}

module.exports = validate;
