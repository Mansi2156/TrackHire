const asyncHandler = require("../utils/asyncHandler");
const userService = require("../services/user.service");

// PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});

// PUT /api/users/password
const changePassword = asyncHandler(async (req, res) => {
  await userService.changePassword(req.user._id, req.body);
  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

// PUT /api/users/reminders
const updateReminders = asyncHandler(async (req, res) => {
  const user = await userService.updateReminders(req.user._id, req.body);
  res.status(200).json({
    success: true,
    message: "Reminder settings updated successfully",
    user,
  });
});

// DELETE /api/users/account
const deleteAccount = asyncHandler(async (req, res) => {
  await userService.softDeleteAccount(req.user._id);
  res.status(200).json({
    success: true,
    message: "Your account has been deleted",
  });
});

module.exports = { updateProfile, changePassword, updateReminders, deleteAccount };
