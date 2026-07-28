const mongoose = require("mongoose");
const { INDUSTRIES } = require("../constants/company.constants");

const companySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [200, "Company name cannot exceed 200 characters"],
    },
    website: {
      type: String,
      trim: true,
      maxlength: [300, "Website URL cannot exceed 300 characters"],
      default: "",
    },
    industry: {
      type: String,
      enum: { values: INDUSTRIES, message: "{VALUE} is not a supported industry" },
      default: undefined,
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
      default: "",
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: "",
    },
    // A single free-text notes field (personal observations, referrals,
    // culture impressions) per the Figma "Add New Company" form — not a
    // separate collection, matching how JobApplication.notes works.
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
      default: "",
    },
  },
  { timestamps: true }
);

// Common list-page access pattern: a user's companies, newest first.
companySchema.index({ userId: 1, createdAt: -1 });
// Supports case-insensitive duplicate-name lookups and name-based search/sort.
companySchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model("Company", companySchema);