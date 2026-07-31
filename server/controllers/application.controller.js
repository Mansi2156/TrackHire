const asyncHandler = require("../utils/asyncHandler");
const applicationService = require("../services/application.service");

// POST /api/applications
const createApplication = asyncHandler(async (req, res) => {
  const application = await applicationService.createApplication(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: "Application created successfully",
    application,
  });
});

// GET /api/applications
const listApplications = asyncHandler(async (req, res) => {
  const { applications, pagination } = await applicationService.listApplications(
    req.user._id,
    req.query
  );
  res.status(200).json({ success: true, applications, pagination });
});

// GET /api/applications/:id
const getApplication = asyncHandler(async (req, res) => {
  const application = await applicationService.getOwnedApplication(req.user._id, req.params.id);
  // Populated only for this read-facing response; update/archive/status
  // continue to work with the raw ObjectId via the (unpopulated) service
  // layer so re-saving the document never risks writing back a populated
  // sub-document instead of a plain id.
  await application.populate("resumeId", "title version isDefault");
  await application.populate("companyId", "name industry website");
  res.status(200).json({ success: true, application });
});

// PUT /api/applications/:id
const updateApplication = asyncHandler(async (req, res) => {
  const application = await applicationService.updateApplication(
    req.user._id,
    req.params.id,
    req.body
  );
  res.status(200).json({
    success: true,
    message: "Application updated successfully",
    application,
  });
});

// DELETE /api/applications/:id
const deleteApplication = asyncHandler(async (req, res) => {
  await applicationService.deleteApplication(req.user._id, req.params.id);
  res.status(200).json({ success: true, message: "Application deleted successfully" });
});

// PATCH /api/applications/:id/archive
const archiveApplication = asyncHandler(async (req, res) => {
  const application = await applicationService.setArchived(
    req.user._id,
    req.params.id,
    req.body.archived
  );
  res.status(200).json({
    success: true,
    message: application.archived ? "Application archived" : "Application unarchived",
    application,
  });
});

// PATCH /api/applications/:id/status
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const application = await applicationService.updateStatus(
    req.user._id,
    req.params.id,
    req.body.status
  );
  res.status(200).json({
    success: true,
    message: "Application status updated",
    application,
  });
});

// POST /api/applications/bulk-archive
const bulkArchiveApplications = asyncHandler(async (req, res) => {
  const { matchedCount } = await applicationService.bulkSetArchived(
    req.user._id,
    req.body.ids,
    req.body.archived
  );
  res.status(200).json({
    success: true,
    message: req.body.archived
      ? `${matchedCount} application${matchedCount === 1 ? "" : "s"} archived`
      : `${matchedCount} application${matchedCount === 1 ? "" : "s"} unarchived`,
    matchedCount,
  });
});

// POST /api/applications/bulk-delete
const bulkDeleteApplications = asyncHandler(async (req, res) => {
  const { deletedCount } = await applicationService.bulkDelete(req.user._id, req.body.ids);
  res.status(200).json({
    success: true,
    message: `${deletedCount} application${deletedCount === 1 ? "" : "s"} deleted`,
    deletedCount,
  });
});

module.exports = {
  createApplication,
  listApplications,
  getApplication,
  updateApplication,
  deleteApplication,
  archiveApplication,
  updateApplicationStatus,
  bulkArchiveApplications,
  bulkDeleteApplications,
};