const fs = require("fs");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const resumeService = require("../services/resume.service");
const { resolveAbsolutePath } = require("../utils/fileStorage");

// POST /api/resumes
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "A resume file is required");
  }
  const resume = await resumeService.uploadResume(req.user._id, req.file, req.body);
  res.status(201).json({
    success: true,
    message: "Resume uploaded successfully",
    resume,
  });
});

// GET /api/resumes
const listResumes = asyncHandler(async (req, res) => {
  const resumes = await resumeService.listResumes(req.user._id);
  res.status(200).json({ success: true, resumes });
});

// GET /api/resumes/stats
const getResumeStats = asyncHandler(async (req, res) => {
  const stats = await resumeService.getResumeStats(req.user._id);
  res.status(200).json({ success: true, stats });
});

// GET /api/resumes/:id
const getResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.getOwnedResume(req.user._id, req.params.id);
  res.status(200).json({ success: true, resume });
});

// PUT /api/resumes/:id
const renameResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.renameResume(req.user._id, req.params.id, req.body.title);
  res.status(200).json({
    success: true,
    message: "Resume updated successfully",
    resume,
  });
});

// PUT /api/resumes/:id/replace
const replaceResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "A replacement resume file is required");
  }
  const resume = await resumeService.replaceResumeFile(req.user._id, req.params.id, req.file);
  res.status(200).json({
    success: true,
    message: "Resume file replaced successfully",
    resume,
  });
});

// DELETE /api/resumes/:id
const deleteResume = asyncHandler(async (req, res) => {
  await resumeService.deleteResume(req.user._id, req.params.id);
  res.status(200).json({ success: true, message: "Resume deleted successfully" });
});

// PATCH /api/resumes/:id/default
const setDefaultResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.setDefaultResume(req.user._id, req.params.id);
  res.status(200).json({
    success: true,
    message: "Default resume updated",
    resume,
  });
});

// Shared by download/preview: resolves the owned resume to an on-disk path,
// verifying the file still exists before streaming it.
async function resolveOwnedFilePath(userId, id) {
  const resume = await resumeService.getOwnedResume(userId, id);
  const absolutePath = resolveAbsolutePath(resume.fileUrl);
  if (!fs.existsSync(absolutePath)) {
    throw new ApiError(404, "Resume file is missing from storage");
  }
  return { resume, absolutePath };
}

// GET /api/resumes/:id/download
const downloadResume = asyncHandler(async (req, res) => {
  const { resume, absolutePath } = await resolveOwnedFilePath(req.user._id, req.params.id);
  res.download(absolutePath, resume.fileName);
});

// GET /api/resumes/:id/preview
// Streamed inline (not as an attachment) so the frontend can load it into
// a blob URL and render it in the in-page preview modal.
const previewResume = asyncHandler(async (req, res) => {
  const { resume, absolutePath } = await resolveOwnedFilePath(req.user._id, req.params.id);
  res.setHeader("Content-Type", resume.mimeType);
  res.setHeader("Content-Disposition", `inline; filename="${resume.fileName}"`);
  fs.createReadStream(absolutePath).pipe(res);
});

module.exports = {
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
};