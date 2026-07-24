const { body, param } = require("express-validator");

const idParamValidator = [param("id").isMongoId().withMessage("Invalid resume id")];

// multipart/form-data fields arrive as strings on req.body just like JSON
// fields would; `title` is optional here because the service derives one
// from the filename when omitted.
const uploadResumeValidator = [
  body("title")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage("Resume title cannot exceed 150 characters"),
];

const renameResumeValidator = [
  ...idParamValidator,
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Resume title is required")
    .isLength({ max: 150 })
    .withMessage("Resume title cannot exceed 150 characters"),
];

const replaceResumeValidator = [...idParamValidator];

module.exports = {
  idParamValidator,
  uploadResumeValidator,
  renameResumeValidator,
  replaceResumeValidator,
};