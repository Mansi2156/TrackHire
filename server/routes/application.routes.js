const express = require("express");
const {
  createApplication,
  listApplications,
  getApplication,
  updateApplication,
  deleteApplication,
  archiveApplication,
  updateApplicationStatus,
} = require("../controllers/application.controller");
const {
  idParamValidator,
  createApplicationValidator,
  updateApplicationValidator,
  updateStatusValidator,
  archiveValidator,
  listQueryValidator,
} = require("../validators/application.validator");
const validate = require("../middleware/validate.middleware");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// Every application route requires authentication; ownership is enforced
// in the service layer using req.user, never a client-supplied id.
router.use(protect);

router.get("/", listQueryValidator, validate, listApplications);
router.post("/", createApplicationValidator, validate, createApplication);
router.get("/:id", idParamValidator, validate, getApplication);
router.put("/:id", updateApplicationValidator, validate, updateApplication);
router.delete("/:id", idParamValidator, validate, deleteApplication);
router.patch("/:id/archive", archiveValidator, validate, archiveApplication);
router.patch("/:id/status", updateStatusValidator, validate, updateApplicationStatus);

module.exports = router;
