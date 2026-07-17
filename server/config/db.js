const mongoose = require("mongoose");
const env = require("./env");

async function connectDB() {
  try {
    // console.log("MONGO_URI:", env.mongoUri);
    await mongoose.connect(env.mongoUri);
    // eslint-disable-next-line no-console
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
