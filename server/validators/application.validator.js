const { body, param, query, checkExact } = require("express-validator");
const {
  STATUSES,
  JOB_TYPES,
  WORK_MODES,
  SORT_OPTIONS,
} = require("../constants/application.constants");

const idParamValidator = [
  param("id").isMongoId().withMessage("Invalid application id"),
];

const baseFieldValidators = [
  body("company")
    .trim()
    .notEmpty()
    .withMessage("Company name is required")
    .isLength({ max: 200 })
    .withMessage("Company name cannot exceed 200 characters"),
  body("jobTitle")
    .trim()
    .notEmpty()
    .withMessage("Role / job title is required")
    .isLength({ max: 200 })
    .withMessage("Job title cannot exceed 200 characters"),
  body("workMode")
    .optional({ checkFalsy: true })
    .isIn(WORK_MODES)
    .withMessage(`Work mode must be one of: ${WORK_MODES.join(", ")}`),
  // Location is conditional on workMode: required for On-site/Hybrid,
  // not applicable (and not stored) for Remote.
  body("location")
    .if((value, { req }) => req.body.workMode !== "Remote")
    .trim()
    .notEmpty()
    .withMessage("Location is required for On-site or Hybrid work mode")
    .isLength({ max: 200 })
    .withMessage("Location cannot exceed 200 characters"),
  body("location")
    .if((value, { req }) => req.body.workMode === "Remote")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 }),
  body("jobType")
    .optional({ checkFalsy: true })
    .isIn(JOB_TYPES)
    .withMessage(`Employment type must be one of: ${JOB_TYPES.join(", ")}`),
  body("salaryRange").optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  // Saved is a pre-application draft: it never has an application or
  // interview date. Both are rejected outright if sent for a Saved status,
  // rather than silently ignored, so the client can't drift from this rule.
  body("appliedDate")
    .if((value, { req }) => req.body.status === "Saved")
    .custom((value) => {
      if (value) {
        throw new Error("Saved applications cannot have an application date");
      }
      return true;
    }),
  body("interviewDate")
    .if((value, { req }) => req.body.status === "Saved")
    .custom((value) => {
      if (value) {
        throw new Error("Saved applications cannot have an interview date");
      }
      return true;
    }),
  // Every non-Saved status requires an application date (must already have
  // been applied to). Validated before deadline below, since deadline's
  // cross-field check reads the already-sanitized req.body.appliedDate.
  body("appliedDate")
    .if((value, { req }) => req.body.status !== "Saved")
    .notEmpty()
    .withMessage("Application date is required")
    .bail()
    .isISO8601()
    .withMessage("Application date must be a valid date")
    .bail()
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error("Application date cannot be in the future");
      }
      return true;
    }),
  // Interview status specifically requires an interview date (it's the
  // whole point of that status); every other non-Saved status leaves it optional.
  body("interviewDate")
    .if((value, { req }) => req.body.status === "Interview")
    .notEmpty()
    .withMessage("Interview date is required when status is Interview")
    .bail()
    .isISO8601()
    .withMessage("Interview date must be a valid date")
    .bail()
    .custom((value, { req }) => {
      if (req.body.appliedDate && new Date(value) < new Date(req.body.appliedDate)) {
        throw new Error("Interview date cannot be before the application date");
      }
      return true;
    }),
  body("interviewDate")
    .if((value, { req }) => req.body.status !== "Saved" && req.body.status !== "Interview")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("Interview date must be a valid date")
    .bail()
    .custom((value, { req }) => {
      if (!value) return true;
      if (req.body.appliedDate && new Date(value) < new Date(req.body.appliedDate)) {
        throw new Error("Interview date cannot be before the application date");
      }
      return true;
    }),
  body("deadline")
    .optional({ checkFalsy: true, nullable: true })
    .isISO8601()
    .withMessage("Deadline must be a valid date")
    .bail()
    .custom((value, { req }) => {
      if (!req.body.appliedDate) return true;
      if (new Date(value) < new Date(req.body.appliedDate)) {
        throw new Error("Application deadline cannot be before the application date");
      }
      return true;
    }),
  body("recruiterName").optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body("recruiterEmail")
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage("Please provide a valid recruiter email address")
    .normalizeEmail(),
  body("jobDescription").optional({ checkFalsy: true }).trim().isLength({ max: 10000 }),
  body("applicationUrl")
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("Application URL must be a valid http:// or https:// URL"),
  body("resumeId")
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage("Invalid resume selected"),
  body("status")
    .optional({ checkFalsy: true })
    .isIn(STATUSES)
    .withMessage(`Status must be one of: ${STATUSES.join(", ")}`),
  body("notes").optional({ checkFalsy: true }).trim().isLength({ max: 2000 }).withMessage("Notes cannot exceed 2000 characters"),
  // Whitelist enforcement: rejects any field not covered above — including
  // non-editable fields like userId/createdAt/updatedAt/_id/archived (archiving
  // has its own dedicated endpoint) — instead of silently dropping them.
  checkExact(),
];

// Create requires the same fields as update; kept as a distinct export so
// the two can diverge later without surprising call sites.
const createApplicationValidator = [...baseFieldValidators];

const updateApplicationValidator = [...idParamValidator, ...baseFieldValidators];

const updateStatusValidator = [
  ...idParamValidator,
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(STATUSES)
    .withMessage(`Status must be one of: ${STATUSES.join(", ")}`),
  checkExact(),
];

const archiveValidator = [
  ...idParamValidator,
  body("archived")
    .notEmpty()
    .withMessage("archived is required")
    .isBoolean()
    .withMessage("archived must be true or false")
    .toBoolean(),
  checkExact(),
];

const listQueryValidator = [
  query("search").optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
  query("status")
    .optional({ checkFalsy: true })
    .custom((value) => {
      const values = String(value).split(",");
      const invalid = values.filter((v) => !STATUSES.includes(v));
      if (invalid.length > 0) {
        throw new Error(`Invalid status filter: ${invalid.join(", ")}`);
      }
      return true;
    }),
  query("archived").optional({ checkFalsy: true }).isIn(["true", "false", "all"]),
  query("sortBy")
    .optional({ checkFalsy: true })
    .isIn(SORT_OPTIONS)
    .withMessage(`sortBy must be one of: ${SORT_OPTIONS.join(", ")}`),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be an integer of at least 1")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be an integer between 1 and 100")
    .toInt(),
];

module.exports = {
  idParamValidator,
  createApplicationValidator,
  updateApplicationValidator,
  updateStatusValidator,
  archiveValidator,
  listQueryValidator,
};