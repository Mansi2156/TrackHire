const mongoose = require("mongoose");
const {
  STATUSES,
  JOB_TYPES,
  WORK_MODES,
} = require("../constants/application.constants");

const jobApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Company Management (Phase 4) has now introduced the Company model.
    // `company` (free text) is kept as-is for full backward compatibility
    // with existing applications, search, and display; `companyId` is an
    // additive, optional reference used for accurate Company statistics
    // and the Company Details page's application list. It's populated
    // automatically by application.service.js when the `company` text
    // matches an existing Company (case-insensitively), or explicitly if a
    // client sends one directly — see assertCompanyOwnership/autoLinkCompany.
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [200, "Company name cannot exceed 200 characters"],
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
      index: true,
    },
    jobTitle: {
      type: String,
      required: [true, "Role / job title is required"],
      trim: true,
      maxlength: [200, "Job title cannot exceed 200 characters"],
    },
    // Required for On-site/Hybrid, and cleared/ignored for Remote. Enforced
    // in the validator (request-level) and here (model-level) so direct
    // service/model usage can't bypass the rule either.
    location: {
      type: String,
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
      default: "",
      validate: {
        validator: function (value) {
          if (this.workMode === "Remote") return true;
          return Boolean(value && value.trim());
        },
        message: "Location is required for On-site or Hybrid work mode",
      },
    },
    jobType: {
      type: String,
      enum: JOB_TYPES,
      default: "Full-Time",
    },
    workMode: {
      type: String,
      enum: WORK_MODES,
      default: undefined,
    },
    salaryRange: {
      type: String,
      trim: true,
      maxlength: [100, "Salary range cannot exceed 100 characters"],
      default: "",
    },
    appliedDate: {
      type: Date,
      required: function () {
        return this.status !== "Saved";
      },
      default: null,
    },
    interviewDate: {
      type: Date,
      required: function () {
        return this.status === "Interview";
      },
      default: null,
    },
    deadline: {
      type: Date,
      default: null,
    },
    recruiterName: {
      type: String,
      trim: true,
      maxlength: [100, "Recruiter name cannot exceed 100 characters"],
      default: "",
    },
    recruiterEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid recruiter email address"],
      default: "",
    },
    jobDescription: {
      type: String,
      trim: true,
      maxlength: [10000, "Job description cannot exceed 10000 characters"],
      default: "",
    },
    applicationUrl: {
      type: String,
      trim: true,
      default: "",
    },
    // Resume Manager (Phase 3) now exists, so applications reference an
    // uploaded Resume directly instead of storing a free-text version
    // label. Optional: an application can exist with no resume attached.
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: "Applied",
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
      default: "",
    },
    // Required for Phase 2's archive functionality. Not listed as a column
    // in DATABASE_DESIGN.md's field table, so it's documented here and in
    // the design doc rather than assumed silently.
    archived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Common list-page access pattern: a user's applications, optionally
// scoped by status/archived, sorted by recency.
jobApplicationSchema.index({ userId: 1, archived: 1, createdAt: -1 });
// Case-insensitive search by company/role.
jobApplicationSchema.index({ userId: 1, company: 1 });
jobApplicationSchema.index({ userId: 1, jobTitle: 1 });
// Supports the duplicate-application check (same user + company + jobTitle)
// performed on create/update.
jobApplicationSchema.index({ userId: 1, company: 1, jobTitle: 1 });

module.exports = mongoose.model("JobApplication", jobApplicationSchema);