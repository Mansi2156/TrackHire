const User = require("../models/User.model");
const ApiError = require("../utils/ApiError");

const PROFILE_WRITABLE_FIELDS = ["fullName", "jobTitle", "location", "bio"];

function pickWritableFields(payload, fields) {
  const data = {};
  for (const field of fields) {
    if (payload[field] !== undefined) {
      data[field] = payload[field];
    }
  }
  return data;
}

// Every lookup is scoped by userId (derived from the verified JWT via
// req.user, never a client-supplied id) so one user can never read or
// modify another user's settings.
async function getOwnedUser(userId) {
  const user = await User.findById(userId);
  if (!user || user.isDeleted) {
    throw new ApiError(404, "User not found");
  }
  return user;
}

// Settings > Profile. Email is never accepted/changed here — see
// user.validator.js.
async function updateProfile(userId, payload) {
  const user = await getOwnedUser(userId);
  const data = pickWritableFields(payload, PROFILE_WRITABLE_FIELDS);
  Object.assign(user, data);
  await user.save();
  return user;
}

// Settings > Password.
async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findOne({ _id: userId, isDeleted: { $ne: true } }).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, "Current password is incorrect");
  }

  const isSameAsCurrent = await user.comparePassword(newPassword);
  if (isSameAsCurrent) {
    throw new ApiError(400, "New password must be different from your current password");
  }

  user.password = newPassword; // re-hashed by the model's pre("save") hook
  await user.save();
  return user;
}

// Settings > Reminders (in-app only).
async function updateReminders(userId, { interviewReminderDays, followUpReminderDays }) {
  const user = await getOwnedUser(userId);
  user.reminders = {
    interviewReminderDays,
    followUpReminderDays,
  };
  await user.save();
  return user;
}

// Settings > Danger Zone > Delete Account. Soft delete only: the document
// is kept so related records (applications, resumes, companies,
// interviews) never dangle. The account becomes immediately unreachable —
// login (auth.service.js) and every protected route (auth.middleware.js)
// both treat isDeleted: true as "doesn't exist".
async function softDeleteAccount(userId) {
  const user = await getOwnedUser(userId);
  user.isDeleted = true;
  user.deletedAt = new Date();
  await user.save();
  return user;
}

module.exports = {
  getOwnedUser,
  updateProfile,
  changePassword,
  updateReminders,
  softDeleteAccount,
};
