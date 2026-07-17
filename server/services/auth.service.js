const User = require("../models/User.model");
const ApiError = require("../utils/ApiError");
const generateToken = require("../utils/generateToken");

// Registers a new user. Throws if the email is already taken.
async function registerUser({ fullName, email, password }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const user = await User.create({ fullName, email, password });
  const token = generateToken(user._id);

  return { user, token };
}

// Authenticates a user by email/password. Throws a generic error on
// failure so we don't reveal whether the email or password was wrong.
async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user._id);
  return { user, token };
}

async function getUserById(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
}

module.exports = { registerUser, loginUser, getUserById };
