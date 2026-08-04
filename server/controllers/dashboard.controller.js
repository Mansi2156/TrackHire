const asyncHandler = require("../utils/asyncHandler");
const dashboardService = require("../services/dashboard.service");

// GET /api/dashboard/overview
// Single, optimized response for the entire Dashboard page (Goal, KPI
// cards, Funnel, Upcoming Interviews, Recent Activity, Upcoming Deadlines,
// Status Distribution) — see dashboard.service.js for the query strategy.
const getOverview = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.getDashboardOverview(req.user._id);
  res.status(200).json({ success: true, dashboard });
});

module.exports = { getOverview };
