const express = require("express");
const {
  createInterview,
  listInterviews,
  getOverallStats,
  listApplicationInterviews,
  getInterview,
  updateInterview,
  deleteInterview,
  updateInterviewStatus,
} = require("../controllers/interview.controller");
const {
  idParamValidator,
  applicationIdParamValidator,
  createInterviewValidator,
  updateInterviewValidator,
  updateStatusValidator,
  listQueryValidator,
} = require("../validators/interview.validator");
const validate = require("../middleware/validate.middleware");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// Every interview route requires authentication; ownership is enforced in
// the service layer using req.user, never a client-supplied id.
router.use(protect);

// "/stats" and "/application/:applicationId" must be registered before
// "/:id" so they're never misread as an :id path segment.
router.get("/stats", getOverallStats);
router.get(
  "/application/:applicationId",
  applicationIdParamValidator,
  validate,
  listApplicationInterviews
);

router.get("/", listQueryValidator, validate, listInterviews);
router.post("/", createInterviewValidator, validate, createInterview);

router.get("/:id", idParamValidator, validate, getInterview);
router.put("/:id", updateInterviewValidator, validate, updateInterview);
router.delete("/:id", idParamValidator, validate, deleteInterview);
router.patch("/:id/status", updateStatusValidator, validate, updateInterviewStatus);

module.exports = router;
