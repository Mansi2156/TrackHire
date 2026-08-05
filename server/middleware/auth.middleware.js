const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const env = require("../config/env");
const User = require("../models/User.model");

// Verifies the JWT sent in the Authorization header and attaches the
// authenticated user to req.user. Downstream controllers must derive
// user identity from req.user — never from client-supplied fields.
const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Not authorized, no token provided");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    throw new ApiError(401, "Not authorized, invalid or expired token");
  }

  const user = await User.findById(decoded.id);
  // A soft-deleted account (Settings > Danger Zone) is treated exactly like
  // a nonexistent one here — this is what actually "invalidates" the JWT
  // for a stateless auth setup: the token itself still verifies, but every
  // subsequent request is rejected from this point on.
  if (!user || user.isDeleted) {
    throw new ApiError(401, "Not authorized, user no longer exists");
  }

  req.user = user;
  next();
});

module.exports = { protect };
