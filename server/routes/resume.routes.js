const express = require("express");
const {
  uploadResume,
  listResumes,
  getResumeStats,
  getResume,
  renameResume,
  replaceResume,
  deleteResume,
  setDefaultResume,
  downloadResume,
  previewResume,
} = require("../controllers/resume.controller");
const {
  idParamValidator,
  uploadResumeValidator,
  renameResumeValidator,
  replaceResumeValidator,
} = require("../validators/resume.validator");
const validate = require("../middleware/validate.middleware");
const { protect } = require("../middleware/auth.middleware");
const { uploadResumeFile } = require("../middleware/upload.middleware");

const router = express.Router();

// Every resume route requires authentication; ownership is enforced in the
// service layer using req.user, never a client-supplied id.
router.use(protect);

// /stats must be registered before /:id so it isn't swallowed by the
// generic id route.
router.get("/stats", getResumeStats);

router.get("/", listResumes);
router.post("/", uploadResumeFile, uploadResumeValidator, validate, uploadResume);

router.get("/:id", idParamValidator, validate, getResume);
router.put("/:id", renameResumeValidator, validate, renameResume);
router.put("/:id/replace", uploadResumeFile, replaceResumeValidator, validate, replaceResume);
router.delete("/:id", idParamValidator, validate, deleteResume);
router.patch("/:id/default", idParamValidator, validate, setDefaultResume);
router.get("/:id/download", idParamValidator, validate, downloadResume);
router.get("/:id/preview", idParamValidator, validate, previewResume);

module.exports = router;