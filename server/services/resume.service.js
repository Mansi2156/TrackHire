const Resume = require("../models/Resume.model");
const ApiError = require("../utils/ApiError");
const { saveResumeFile, deleteResumeFile } = require("../utils/fileStorage");
const { MAX_RESUMES_PER_USER } = require("../constants/resume.constants");

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Derives a display title from the original filename when the client
// doesn't send one explicitly (e.g. "React_Dev_Resume.pdf" -> "React Dev Resume").
function titleFromFileName(fileName) {
  const withoutExt = fileName.replace(/\.[^/.]+$/, "");
  return withoutExt.replace(/[_-]+/g, " ").trim() || "Resume";
}

// Resumes sharing the same title (case-insensitively) for a user are treated
// as versions of the same resume. On upload, the next version is derived
// automatically (v1, v2, v3...) rather than requiring the client to track it.
async function computeNextVersion(userId, title) {
  const siblings = await Resume.find({
    userId,
    title: new RegExp(`^${escapeRegExp(title)}$`, "i"),
  }).select("version");

  let maxVersion = 0;
  for (const sibling of siblings) {
    const match = /^v(\d+)$/i.exec(sibling.version || "");
    if (match) {
      maxVersion = Math.max(maxVersion, Number(match[1]));
    }
  }
  return `v${maxVersion + 1}`;
}

async function assertResumeLimitNotExceeded(userId) {
  const count = await Resume.countDocuments({ userId });
  if (count >= MAX_RESUMES_PER_USER) {
    throw new ApiError(
      409,
      `You've reached the maximum of ${MAX_RESUMES_PER_USER} resumes. Delete an existing resume before uploading another.`
    );
  }
}

// A user's very first resume automatically becomes their default — there's
// always exactly one obvious choice at that point, and it avoids an
// awkward "no default resume" empty state right after onboarding.
async function isFirstResumeForUser(userId) {
  const count = await Resume.countDocuments({ userId });
  return count === 0;
}

async function uploadResume(userId, file, payload = {}) {
  await assertResumeLimitNotExceeded(userId);

  const title = (payload.title || titleFromFileName(file.originalname)).trim();
  const version = await computeNextVersion(userId, title);
  const makeDefault = await isFirstResumeForUser(userId);

  const fileUrl = saveResumeFile(userId, file);

  const resume = await Resume.create({
    userId,
    title,
    fileName: file.originalname,
    fileUrl,
    version,
    fileSize: file.size,
    mimeType: file.mimetype,
    isDefault: makeDefault,
  });

  return resume;
}

async function listResumes(userId) {
  return Resume.find({ userId }).sort({ createdAt: -1 });
}

// Every lookup is scoped to userId so one user can never read/modify
// another user's resume, regardless of a guessed/enumerated id.
async function getOwnedResume(userId, id) {
  const resume = await Resume.findOne({ _id: id, userId });
  if (!resume) {
    throw new ApiError(404, "Resume not found");
  }
  return resume;
}

async function renameResume(userId, id, title) {
  const resume = await getOwnedResume(userId, id);
  resume.title = title.trim();
  await resume.save();
  return resume;
}

// Replaces the underlying file for an existing resume record (same _id,
// same title/default status), bumping the version and deleting the old
// file from disk once the new one is safely written.
async function replaceResumeFile(userId, id, file) {
  const resume = await getOwnedResume(userId, id);
  const previousFileUrl = resume.fileUrl;

  const fileUrl = saveResumeFile(userId, file);
  const version = await computeNextVersion(userId, resume.title);

  resume.fileUrl = fileUrl;
  resume.fileName = file.originalname;
  resume.fileSize = file.size;
  resume.mimeType = file.mimetype;
  resume.version = version;
  await resume.save();

  deleteResumeFile(previousFileUrl);
  return resume;
}

// Deletion never auto-promotes another resume to default: which resume is
// "the" default is a deliberate user choice, not something to guess for them.
async function deleteResume(userId, id) {
  const resume = await Resume.findOneAndDelete({ _id: id, userId });
  if (!resume) {
    throw new ApiError(404, "Resume not found");
  }
  deleteResumeFile(resume.fileUrl);
  return resume;
}

// Only one resume can be default per user. Implemented as unset-all then
// set-one rather than a unique partial index, since MongoDB Atlas free/shared
// tiers commonly used for this MVP don't reliably support the collation
// needed for a boolean-true-only partial unique index; this is documented
// as an accepted trade-off for the MVP.
async function setDefaultResume(userId, id) {
  const resume = await getOwnedResume(userId, id);
  if (!resume.isDefault) {
    await Resume.updateMany({ userId, isDefault: true }, { isDefault: false });
    resume.isDefault = true;
    await resume.save();
  }
  return resume;
}

// Statistics computed only from fields that actually exist on the Resume
// model (per docs/DATABASE_DESIGN.md). Figures like "applications sent" or
// "interview rate" per resume are not implemented: they would require a
// resumeId reference on JobApplication, which is an explicit, documented,
// not-yet-made decision (see JobApplication.model.js and the Known
// Limitations section of PROJECT_IMPLEMENTATION_GUIDE.md).
async function getResumeStats(userId) {
  const resumes = await Resume.find({ userId });

  const totalResumes = resumes.length;
  const totalStorageBytes = resumes.reduce((sum, r) => sum + r.fileSize, 0);
  const defaultResume = resumes.find((r) => r.isDefault) || null;

  let lastUpdated = null;
  for (const resume of resumes) {
    if (!lastUpdated || resume.updatedAt > lastUpdated.updatedAt) {
      lastUpdated = resume;
    }
  }

  return {
    totalResumes,
    totalStorageBytes,
    defaultResume,
    lastUpdated,
  };
}

module.exports = {
  uploadResume,
  listResumes,
  getOwnedResume,
  renameResume,
  replaceResumeFile,
  deleteResume,
  setDefaultResume,
  getResumeStats,
};