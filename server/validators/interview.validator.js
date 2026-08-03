const { body, param, query, checkExact } = require("express-validator");
const { ROUNDS, TYPES, STATUSES, MODES, SORT_OPTIONS } = require("../constants/interview.constants");

const idParamValidator = [param("id").isMongoId().withMessage("Invalid interview id")];

const applicationIdParamValidator = [
  param("applicationId").isMongoId().withMessage("Invalid application id"),
];

const baseFieldValidators = [
  body("applicationId").isMongoId().withMessage("A valid job application is required"),
  body("round").isIn(ROUNDS).withMessage(`Round must be one of: ${ROUNDS.join(", ")}`),
  body("type").isIn(TYPES).withMessage(`Interview type must be one of: ${TYPES.join(", ")}`),
  body("interviewDate")
    .notEmpty()
    .withMessage("Interview date and time are required")
    .bail()
    .isISO8601()
    .withMessage("Interview date must be a valid date/time"),
  body("mode")
    .optional({ checkFalsy: true })
    .isIn(MODES)
    .withMessage(`Mode must be one of: ${MODES.join(", ")}`),
  body("link")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Link/location cannot exceed 500 characters"),
  body("notes")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Preparation notes cannot exceed 2000 characters"),
  body("feedback")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Feedback cannot exceed 2000 characters"),
  body("status")
    .optional({ checkFalsy: true })
    .isIn(STATUSES)
    .withMessage(`Status must be one of: ${STATUSES.join(", ")}`),
  // Whitelist enforcement: rejects any field not covered above — including
  // non-editable fields like userId/createdAt/updatedAt/_id — instead of
  // silently dropping them.
  checkExact(),
];

const createInterviewValidator = [...baseFieldValidators];

const updateInterviewValidator = [...idParamValidator, ...baseFieldValidators];

const updateStatusValidator = [
  ...idParamValidator,
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(STATUSES)
    .withMessage(`Status must be one of: ${STATUSES.join(", ")}`),
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
  query("type")
    .optional({ checkFalsy: true })
    .custom((value) => {
      const values = String(value).split(",");
      const invalid = values.filter((v) => !TYPES.includes(v));
      if (invalid.length > 0) {
        throw new Error(`Invalid type filter: ${invalid.join(", ")}`);
      }
      return true;
    }),
  query("applicationId").optional({ checkFalsy: true }).isMongoId().withMessage("Invalid application id"),
  query("when").optional({ checkFalsy: true }).isIn(["upcoming", "past"]),
  query("sortBy")
    .optional({ checkFalsy: true })
    .isIn(SORT_OPTIONS)
    .withMessage(`sortBy must be one of: ${SORT_OPTIONS.join(", ")}`),
  query("page").optional().isInt({ min: 1 }).withMessage("page must be an integer of at least 1").toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be an integer between 1 and 100")
    .toInt(),
];

module.exports = {
  idParamValidator,
  applicationIdParamValidator,
  createInterviewValidator,
  updateInterviewValidator,
  updateStatusValidator,
  listQueryValidator,
};
