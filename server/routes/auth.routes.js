const express = require("express");
const { register, login, logout, getMe } = require("../controllers/auth.controller");
const { registerValidator, loginValidator } = require("../validators/auth.validator");
const validate = require("../middleware/validate.middleware");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

module.exports = router;
