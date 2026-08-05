const { body, checkExact } = require("express-validator");
const {
  INTERVIEW_REMINDER_OPTIONS,
  MIN_FOLLOW_UP_REMINDER_DAYS,
  MAX_FOLLOW_UP_REMINDER_DAYS,
  MAX_JOB_TITLE_LENGTH,
  MAX_LOCATION_LENGTH,
  MAX_BIO_LENGTH,
} = require("../constants/user.constants");

// Settings > Profile. Email is intentionally not accepted here — it's
// read-only in the UI and changing it would affect authentication, which
// is out of scope for this module (see IMPLEMENTATION_RULES.md #3).
// fullName reuses the exact rule from auth.validator.js's registerValidator
// so the two never drift.
const updateProfileValidator = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),
  body("jobTitle")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: MAX_JOB_TITLE_LENGTH })
    .withMessage(`Job title cannot exceed ${MAX_JOB_TITLE_LENGTH} characters`),
  body("location")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: MAX_LOCATION_LENGTH })
    .withMessage(`Location cannot exceed ${MAX_LOCATION_LENGTH} characters`),
  body("bio")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: MAX_BIO_LENGTH })
    .withMessage(`Bio cannot exceed ${MAX_BIO_LENGTH} characters`),
  // Whitelist enforcement: rejects email or any other unexpected field
  // instead of silently dropping it.
  checkExact(),
];

// Settings > Password. currentPassword mirrors loginValidator's password
// rule (just required — strength was already enforced at registration).
// newPassword mirrors registerValidator's password rule exactly (same
// minLength and message) so "Change Password" enforces the same bar as
// account creation.
const changePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  checkExact(),
];

// Settings > Reminders (in-app only — no email reminders in the MVP).
const updateRemindersValidator = [
  body("interviewReminderDays")
    .isInt()
    .withMessage("Interview reminder must be a number")
    .bail()
    .toInt()
    .isIn(INTERVIEW_REMINDER_OPTIONS)
    .withMessage(
      `Interview reminder must be one of: ${INTERVIEW_REMINDER_OPTIONS.join(", ")} days before`
    ),
  body("followUpReminderDays")
    .isInt({ min: MIN_FOLLOW_UP_REMINDER_DAYS, max: MAX_FOLLOW_UP_REMINDER_DAYS })
    .withMessage(
      `Follow-up reminder must be between ${MIN_FOLLOW_UP_REMINDER_DAYS} and ${MAX_FOLLOW_UP_REMINDER_DAYS} days`
    )
    .toInt(),
  checkExact(),
];

module.exports = {
  updateProfileValidator,
  changePasswordValidator,
  updateRemindersValidator,
};
