const express = require("express");
const {
  updateProfile,
  changePassword,
  updateReminders,
  deleteAccount,
} = require("../controllers/user.controller");
const {
  updateProfileValidator,
  changePasswordValidator,
  updateRemindersValidator,
} = require("../validators/user.validator");
const validate = require("../middleware/validate.middleware");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// Every route here acts on the authenticated user only (req.user, derived
// from the verified JWT) — there is no :id param, so one user can never
// reach another user's settings.
router.use(protect);

router.put("/profile", updateProfileValidator, validate, updateProfile);
router.put("/password", changePasswordValidator, validate, changePassword);
router.put("/reminders", updateRemindersValidator, validate, updateReminders);
router.delete("/account", deleteAccount);

module.exports = router;
