const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Resume title is required"],
      trim: true,
      maxlength: [150, "Resume title cannot exceed 150 characters"],
    },
    fileName: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
    },
    // Cloudinary asset identifier, required to delete/replace the file in
    // production (see utils/fileStorage.js — cloudinary.uploader.destroy
    // needs the exact public_id, not just the URL). Null for resumes
    // stored on local disk in development, which are deleted by path alone.
    filePublicId: {
      type: String,
      default: null,
    },
    // Free-form version label (e.g. "v1", "v2"). Auto-computed per
    // user+title on upload, but can be overridden on rename — see
    // resume.service.js `computeNextVersion`.
    version: {
      type: String,
      required: true,
      trim: true,
      maxlength: [20, "Version cannot exceed 20 characters"],
    },
    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: [0, "File size cannot be negative"],
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    // UI/UX addition: short free-form labels (e.g. "Frontend", "Remote")
    // shown as badge chips on the Resume Manager card. Normalized and
    // capped in resume.service.js's normalizeTags() before ever reaching
    // the model, so schema-level validation here just guards against
    // direct/second-path writes.
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length <= 6;
        },
        message: "A resume can have at most 6 tags",
      },
    },
  },
  { timestamps: true }
);

// Common access pattern: a user's resumes, newest first.
resumeSchema.index({ userId: 1, createdAt: -1 });
// Supports the per-title version auto-increment lookup.
resumeSchema.index({ userId: 1, title: 1 });

module.exports = mongoose.model("Resume", resumeSchema);