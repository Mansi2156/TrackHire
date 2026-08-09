const fs = require("fs");
const path = require("path");
const https = require("https");
const crypto = require("crypto");
const env = require("../config/env");

// Resume Storage Decision
// =======================
// Development: resumes are stored on local disk under server/uploads/resumes.
// Production: resumes are stored in Cloudinary (resource_type "raw", since
// PDF/DOCX are not images/video). The environment decides which backend is
// used at runtime (env.isProduction) — all disk/Cloudinary access stays
// isolated behind this module so the service/controller layer never needs
// to know which one is active.

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads", "resumes");
const CLOUDINARY_FOLDER = "trackhire/resumes";

// Loaded lazily/only in production so `cloudinary` config (and its required
// env vars) is never touched during local development.
function getCloudinary() {
  // eslint-disable-next-line global-require
  return require("../config/cloudinary");
}

// ---------------------------------------------------------------------
// Local disk (development)
// ---------------------------------------------------------------------

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

function saveResumeFileLocal(userId, file) {
  const ext = path.extname(file.originalname);
  const uniqueName = `${crypto.randomUUID()}${ext}`;
  const dir = userDir(userId);
  const absolutePath = path.join(dir, uniqueName);
  fs.writeFileSync(absolutePath, file.buffer);

  // Stored as a path relative to UPLOAD_ROOT so it works regardless of
  // where the project is deployed/checked out. No Cloudinary public id
  // applies to a local file.
  return {
    fileUrl: path.join(String(userId), uniqueName),
    filePublicId: null,
  };
}

function deleteResumeFileLocal(relativeFileUrl) {
  const absolutePath = path.join(UPLOAD_ROOT, relativeFileUrl);
  fs.rm(absolutePath, { force: true }, () => {
    // Best-effort cleanup: a missing file should never fail the request
    // that triggered the deletion (e.g. replace/delete resume).
  });
}

function streamResumeFileLocal(relativeFileUrl) {
  const absolutePath = path.join(UPLOAD_ROOT, relativeFileUrl);
  if (!fs.existsSync(absolutePath)) return null;
  return fs.createReadStream(absolutePath);
}

// ---------------------------------------------------------------------
// Cloudinary (production)
// ---------------------------------------------------------------------

function saveResumeFileCloudinary(userId, file) {
  const cloudinary = getCloudinary();
  const ext = path.extname(file.originalname);
  const uniqueName = `${crypto.randomUUID()}${ext}`;
  // Extension included in the public_id: raw resources have no separate
  // "format" field, so this is what gives the delivered file the right
  // extension/content-type.
  const publicId = `${CLOUDINARY_FOLDER}/${userId}/${uniqueName}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        public_id: publicId,
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          fileUrl: result.secure_url,
          filePublicId: result.public_id,
        });
      }
    );
    uploadStream.end(file.buffer);
  });
}

async function deleteResumeFileCloudinary(_fileUrl, filePublicId) {
  if (!filePublicId) return;
  const cloudinary = getCloudinary();
  try {
    await cloudinary.uploader.destroy(filePublicId, { resource_type: "raw" });
  } catch (error) {
    // Best-effort cleanup: a failed remote delete should never fail the
    // request that triggered it (e.g. replace/delete resume).
  }
}

// Proxies the file through the backend rather than redirecting, so the
// controller can keep serving download/preview with the app's own
// filename and Content-Disposition instead of Cloudinary's raw URL.
function streamResumeFileCloudinary(fileUrl) {
  return new Promise((resolve, reject) => {
    https
      .get(fileUrl, (response) => {
        if (response.statusCode !== 200) {
          response.resume(); // drain so the socket can close cleanly
          return resolve(null);
        }
        resolve(response);
      })
      .on("error", reject);
  });
}

// ---------------------------------------------------------------------
// Public interface (used by resume.service.js / resume.controller.js)
// ---------------------------------------------------------------------

async function saveResumeFile(userId, file) {
  return env.isProduction ? saveResumeFileCloudinary(userId, file) : saveResumeFileLocal(userId, file);
}

async function deleteResumeFile(fileUrl, filePublicId) {
  return env.isProduction
    ? deleteResumeFileCloudinary(fileUrl, filePublicId)
    : deleteResumeFileLocal(fileUrl);
}

// Returns a readable stream for the resume's file, or null if it's missing.
async function getResumeFileStream(resume) {
  return env.isProduction
    ? streamResumeFileCloudinary(resume.fileUrl)
    : streamResumeFileLocal(resume.fileUrl);
}

module.exports = {
  saveResumeFile,
  deleteResumeFile,
  getResumeFileStream,
};