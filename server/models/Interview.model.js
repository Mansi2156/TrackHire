const mongoose = require("mongoose");
const { ROUNDS, TYPES, STATUSES, MODES } = require("../constants/interview.constants");

const interviewSchema = new mongoose.Schema(
  {
    // Not listed alongside applicationId in docs/DATABASE_DESIGN.md's
    // original sketch, but stored directly here (rather than derived via a
    // join to jobApplications on every request) for the same reason every
    // other user-owned collection in this app (Company, Resume,
    // JobApplication) does the same: it lets list/filter/pagination queries
    // be scoped and indexed on userId directly, without a join, matching
    // IMPLEMENTATION_RULES.md §6/§7's ownership-isolation requirements.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobApplication",
      required: true,
      index: true,
    },
    round: {
      type: String,
      enum: { values: ROUNDS, message: "{VALUE} is not a supported interview round" },
      required: [true, "Interview round is required"],
    },
    type: {
      type: String,
      enum: { values: TYPES, message: "{VALUE} is not a supported interview type" },
      required: [true, "Interview type is required"],
    },
    status: {
      type: String,
      enum: STATUSES,
      default: "Scheduled",
      index: true,
    },
    // Combines the Figma's separate date + time inputs into a single Date,
    // matching how JobApplication.interviewDate already models this.
    interviewDate: {
      type: Date,
      required: [true, "Interview date and time are required"],
      index: true,
    },
    mode: {
      type: String,
      enum: MODES,
      default: "Video Call",
    },
    // Meeting link (Video Call / Async submission) or office address
    // (On-site) — a single free-text field, since only one applies at a
    // time depending on `mode`. Not in the original DATABASE_DESIGN.md
    // sketch; added here per that document's "update this document first"
    // rule, matching the Figma's "Meeting Link" / "Office Location" field.
    link: {
      type: String,
      trim: true,
      maxlength: [500, "Link/location cannot exceed 500 characters"],
      default: "",
    },
    // Preparation notes, filled in before the interview. Same
    // "add + document" precedent as `link` above.
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Preparation notes cannot exceed 2000 characters"],
      default: "",
    },
    // Post-interview feedback / outcome commentary. Present in
    // docs/DATABASE_DESIGN.md's original Interview sketch.
    feedback: {
      type: String,
      trim: true,
      maxlength: [2000, "Feedback cannot exceed 2000 characters"],
      default: "",
    },
  },
  { timestamps: true }
);

// Common list-page access pattern: a user's interviews, most relevant date first.
interviewSchema.index({ userId: 1, interviewDate: -1 });
// "Round Progress" timeline / "Other interviews at this application":
// sibling interviews for one application, in chronological order.
interviewSchema.index({ applicationId: 1, interviewDate: 1 });

module.exports = mongoose.model("Interview", interviewSchema);
