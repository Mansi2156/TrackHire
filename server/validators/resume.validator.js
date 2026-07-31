const { body, param } = require("express-validator");

const idParamValidator = [param("id").isMongoId().withMessage("Invalid resume id")];

// multipart/form-data fields arrive as strings on req.body just like JSON
// fields would; `title` is optional here because the service derives one
// from the filename when omitted.
// `tags` arrives as a comma-separated string over multipart/form-data (both
// upload and replace are file uploads), or as an array over a plain JSON
// body. Count/length limits are enforced in resume.service.js's
// normalizeTags() rather than here, since it already needs to run there to
// dedupe/trim regardless.
const tagsValidator = body("tags").optional();

const uploadResumeValidator = [
  body("title")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage("Resume title cannot exceed 150 characters"),
  tagsValidator,
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

const updateTagsValidator = [...idParamValidator, tagsValidator];

module.exports = {
  idParamValidator,
  uploadResumeValidator,
  renameResumeValidator,
  replaceResumeValidator,
  updateTagsValidator,
};