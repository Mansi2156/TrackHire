const express = require("express");
const { getOverview } = require("../controllers/dashboard.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// Every dashboard route requires authentication; data is always scoped to
// req.user, never a client-supplied id — same ownership-isolation pattern
// as every other module.
router.use(protect);

// GET /api/dashboard/overview
// No query parameters: the dashboard always reflects the authenticated
// user's current data. See dashboard.service.js for the two-query
// aggregation strategy this single endpoint is built on.
router.get("/overview", getOverview);

module.exports = router;
