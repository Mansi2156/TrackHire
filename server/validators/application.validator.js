const { body, param, query } = require("express-validator");
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
  body("deadline")
    .optional({ checkFalsy: true, nullable: true })
    .isISO8601()
    .withMessage("Deadline must be a valid date"),
  body("salaryRange").optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body("appliedDate")
    .notEmpty()
    .withMessage("Application date is required")
    .isISO8601()
    .withMessage("Application date must be a valid date"),
  body("interviewDate")
    .optional({ checkFalsy: true, nullable: true })
    .isISO8601()
    .withMessage("Interview date must be a valid date"),
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
    .isURL({ require_protocol: true })
    .withMessage("Application URL must be a valid URL (including https://)"),
  body("resumeVersion").optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body("status")
    .optional({ checkFalsy: true })
    .isIn(STATUSES)
    .withMessage(`Status must be one of: ${STATUSES.join(", ")}`),
  body("notes").optional({ checkFalsy: true }).trim().isLength({ max: 5000 }),
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
];

const archiveValidator = [
  ...idParamValidator,
  body("archived")
    .notEmpty()
    .withMessage("archived is required")
    .isBoolean()
    .withMessage("archived must be true or false")
    .toBoolean(),
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
  query("page").optional({ checkFalsy: true }).isInt({ min: 1 }).toInt(),
  query("limit").optional({ checkFalsy: true }).isInt({ min: 1, max: 100 }).toInt(),
];

module.exports = {
  idParamValidator,
  createApplicationValidator,
  updateApplicationValidator,
  updateStatusValidator,
  archiveValidator,
  listQueryValidator,
};