const asyncHandler = require("../utils/asyncHandler");
const interviewService = require("../services/interview.service");

// POST /api/interviews
const createInterview = asyncHandler(async (req, res) => {
  const interview = await interviewService.createInterview(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: "Interview scheduled successfully",
    interview,
  });
});

// GET /api/interviews
const listInterviews = asyncHandler(async (req, res) => {
  const { interviews, pagination } = await interviewService.listInterviews(
    req.user._id,
    req.query
  );
  res.status(200).json({ success: true, interviews, pagination });
});

// GET /api/interviews/stats
const getOverallStats = asyncHandler(async (req, res) => {
  const stats = await interviewService.getOverallStats(req.user._id);
  res.status(200).json({ success: true, stats });
});

// GET /api/interviews/application/:applicationId
const listApplicationInterviews = asyncHandler(async (req, res) => {
  const interviews = await interviewService.listInterviewsForApplication(
    req.user._id,
    req.params.applicationId
  );
  res.status(200).json({ success: true, interviews });
});

// GET /api/interviews/:id
const getInterview = asyncHandler(async (req, res) => {
  const interview = await interviewService.getOwnedInterview(req.user._id, req.params.id);
  // Populated only for this read-facing response, matching
  // application.controller.js's getApplication — update continues to work
  // with the raw ObjectId via the (unpopulated) service layer.
  await interview.populate("applicationId", "company jobTitle location status");
  res.status(200).json({ success: true, interview });
});

// PUT /api/interviews/:id
const updateInterview = asyncHandler(async (req, res) => {
  const interview = await interviewService.updateInterview(
    req.user._id,
    req.params.id,
    req.body
  );
  res.status(200).json({
    success: true,
    message: "Interview updated successfully",
    interview,
  });
});

// DELETE /api/interviews/:id
const deleteInterview = asyncHandler(async (req, res) => {
  await interviewService.deleteInterview(req.user._id, req.params.id);
  res.status(200).json({ success: true, message: "Interview deleted successfully" });
});

// PATCH /api/interviews/:id/status
const updateInterviewStatus = asyncHandler(async (req, res) => {
  const interview = await interviewService.updateStatus(
    req.user._id,
    req.params.id,
    req.body.status
  );
  res.status(200).json({
    success: true,
    message: "Interview status updated",
    interview,
  });
});

module.exports = {
  createInterview,
  listInterviews,
  getOverallStats,
  listApplicationInterviews,
  getInterview,
  updateInterview,
  deleteInterview,
  updateInterviewStatus,
};
