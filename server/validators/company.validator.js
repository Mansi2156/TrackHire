const { body, param, query, checkExact } = require("express-validator");
const { INDUSTRIES, SORT_OPTIONS } = require("../constants/company.constants");

const idParamValidator = [param("id").isMongoId().withMessage("Invalid company id")];

// The Figma form's placeholder ("e.g. google.com") doesn't ask the user to
// type a protocol, but we still want to store/validate a proper URL —
// so a missing protocol is filled in before validation rather than rejected.
function normalizeWebsite(value) {
  if (!value) return value;
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

const baseFieldValidators = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Company name is required")
    .isLength({ max: 200 })
    .withMessage("Company name cannot exceed 200 characters"),
  body("website")
    .optional({ checkFalsy: true })
    .customSanitizer(normalizeWebsite)
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("Please enter a valid website URL")
    .bail()
    .isLength({ max: 300 })
    .withMessage("Website URL cannot exceed 300 characters"),
  body("industry")
    .optional({ checkFalsy: true })
    .isIn(INDUSTRIES)
    .withMessage(`Industry must be one of: ${INDUSTRIES.join(", ")}`),
  body("location")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage("Location cannot exceed 200 characters"),
  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),
  body("notes")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Notes cannot exceed 2000 characters"),
  // Whitelist enforcement: rejects any field not covered above — including
  // non-editable fields like userId/createdAt/updatedAt/_id — instead of
  // silently dropping them.
  checkExact(),
];

const createCompanyValidator = [...baseFieldValidators];

const updateCompanyValidator = [...idParamValidator, ...baseFieldValidators];

const listQueryValidator = [
  query("search").optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
  query("industry")
    .optional({ checkFalsy: true })
    .isIn(INDUSTRIES)
    .withMessage(`Industry must be one of: ${INDUSTRIES.join(", ")}`),
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
  createCompanyValidator,
  updateCompanyValidator,
  listQueryValidator,
};