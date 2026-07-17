const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const env = require("./config/env");
const authRoutes = require("./routes/auth.routes");
const notFound = require("./middleware/notFound.middleware");
const errorHandler = require("./middleware/error.middleware");

const app = express();

// Core middleware
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "TrackHire API is running" });
});

// Routes
app.use("/api/auth", authRoutes);

// 404 + centralized error handling (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
