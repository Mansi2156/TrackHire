const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/auth.service");

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  const { user, token } = await authService.registerUser({
    fullName,
    email,
    password,
  });

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    token,
    user,
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginUser({ email, password });

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    token,
    user,
  });
});

// POST /api/auth/logout
// Stateless JWT: there is no server-side session to destroy. The client
// is responsible for discarding the token. This endpoint exists for a
// consistent API contract and to support future token invalidation.
const logout = asyncHandler(async (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

module.exports = { register, login, logout, getMe };
