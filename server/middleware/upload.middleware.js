const multer = require("multer");
const path = require("path");
const ApiError = require("../utils/ApiError");
const {
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
} = require("../constants/resume.constants");

// Memory storage: the file buffer is handed to fileStorage.js, which is the
// single place responsible for deciding where bytes actually land on disk.
const storage = multer.memoryStorage();

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const validMime = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const validExt = ALLOWED_EXTENSIONS.includes(ext);

  if (!validMime || !validExt) {
    return cb(new ApiError(400, "Only PDF and DOCX resumes are supported"));
  }
  return cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
});

// Wraps multer's single-file handler so its errors (wrong type, too large)
// flow through the same centralized error middleware as everything else,
// instead of multer's own default error shape.
function uploadResumeFile(req, res, next) {
  upload.single("file")(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      const maxMb = MAX_FILE_SIZE_BYTES / (1024 * 1024);
      return next(new ApiError(400, `Resume file cannot exceed ${maxMb}MB`));
    }
    return next(err);
  });
}

module.exports = { uploadResumeFile };