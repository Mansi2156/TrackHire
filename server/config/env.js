require("dotenv").config();

// Fail fast if required environment variables are missing.
// This prevents the app from starting in a misconfigured, insecure state.
const requiredVars = ["MONGO_URI", "JWT_SECRET"];

const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.error(
    `Missing required environment variables: ${missing.join(", ")}. ` +
      "Copy server/.env.example to server/.env and fill in real values."
  );
  process.exit(1);
}

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};

module.exports = env;
