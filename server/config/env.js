require("dotenv").config();

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

// Fail fast if required environment variables are missing.
// This prevents the app from starting in a misconfigured, insecure state.
const requiredVars = ["MONGO_URI", "JWT_SECRET"];

// Cloudinary is only required in production. Resumes are stored on local
// disk in development (see utils/fileStorage.js), so these credentials
// aren't needed to run the app locally.
if (isProduction) {
  requiredVars.push("CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET");
}

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
  nodeEnv,
  isProduction,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};

module.exports = env;