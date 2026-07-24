const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Resume Storage Decision
// =======================
// docs/TrackHire.docx lists Cloudinary as the intended cloud file store, but
// no CLOUDINARY_* credentials exist in server/.env(.example) in this project.
// Rather than assume/hardcode third-party credentials (forbidden by
// docs/IMPLEMENTATION_RULES.md §7/§13), resumes are stored on local disk
// under server/uploads/resumes for this phase. All disk access is isolated
// behind this module so swapping in Cloudinary later only requires changing
// this file, not the service/controller layer.

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads", "resumes");

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function userDir(userId) {
  const dir = path.join(UPLOAD_ROOT, String(userId));
  ensureDirExists(dir);
  return dir;
}

// Persists an uploaded file buffer to disk under a random, collision-proof
// name (extension preserved) and returns the relative path to store as
// `fileUrl` on the Resume document.
function saveResumeFile(userId, file) {
  const ext = path.extname(file.originalname);
  const uniqueName = `${crypto.randomUUID()}${ext}`;
  const dir = userDir(userId);
  const absolutePath = path.join(dir, uniqueName);
  fs.writeFileSync(absolutePath, file.buffer);

  // Stored as a path relative to UPLOAD_ROOT so it works regardless of
  // where the project is deployed/checked out.
  return path.join(String(userId), uniqueName);
}

function resolveAbsolutePath(relativeFileUrl) {
  return path.join(UPLOAD_ROOT, relativeFileUrl);
}

function deleteResumeFile(relativeFileUrl) {
  const absolutePath = resolveAbsolutePath(relativeFileUrl);
  fs.rm(absolutePath, { force: true }, () => {
    // Best-effort cleanup: a missing file should never fail the request
    // that triggered the deletion (e.g. replace/delete resume).
  });
}

module.exports = {
  saveResumeFile,
  deleteResumeFile,
  resolveAbsolutePath,
};