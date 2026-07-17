const jwt = require("jsonwebtoken");
const env = require("../config/env");

// Signs a JWT containing only the user id. Keep the payload minimal —
// full user data is fetched fresh from the DB on each authenticated request.
function generateToken(userId) {
  return jwt.sign({ id: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

module.exports = generateToken;
