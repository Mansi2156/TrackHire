const express = require("express");
const {
  createCompany,
  listCompanies,
  getOverallStats,
  getCompany,
  updateCompany,
  deleteCompany,
  getCompanyStats,
  listCompanyApplications,
} = require("../controllers/company.controller");
const {
  idParamValidator,
  createCompanyValidator,
  updateCompanyValidator,
  listQueryValidator,
} = require("../validators/company.validator");
const validate = require("../middleware/validate.middleware");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// Every company route requires authentication; ownership is enforced in
// the service layer using req.user, never a client-supplied id.
router.use(protect);

// /stats must be registered before /:id so it isn't swallowed by the
// generic id route.
router.get("/stats", getOverallStats);

router.get("/", listQueryValidator, validate, listCompanies);
router.post("/", createCompanyValidator, validate, createCompany);

router.get("/:id", idParamValidator, validate, getCompany);
router.put("/:id", updateCompanyValidator, validate, updateCompany);
router.delete("/:id", idParamValidator, validate, deleteCompany);
router.get("/:id/stats", idParamValidator, validate, getCompanyStats);
router.get("/:id/applications", idParamValidator, validate, listCompanyApplications);

module.exports = router;