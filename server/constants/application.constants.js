// Central source of truth for JobApplication enums. Shared by the model
// (schema validation) and validators (request validation) so the two
// never drift apart.

// Status set follows docs/DATABASE_DESIGN.md. Kept generic on purpose —
// granular interview-round tracking belongs to a separate Interview
// collection in a later phase, per the design doc's own principle.
const STATUSES = [
  "Saved",
  "Applied",
  "Screening",
  "Assessment",
  "Interview",
  "Offer",
  "Accepted",
  "Rejected",
  "Withdrawn",
  "Closed",
];

// Ordered "on-track" pipeline used to render progress (Applied -> ... -> Accepted).
// Saved is a pre-application draft stage (comes before Applied); Rejected,
// Withdrawn, and Closed are terminal exit states off the main pipeline.
const PIPELINE_STATUSES = [
  "Applied",
  "Screening",
  "Assessment",
  "Interview",
  "Offer",
  "Accepted",
];

const TERMINAL_STATUSES = ["Rejected", "Withdrawn", "Closed"];

const JOB_TYPES = ["Full-Time", "Part-Time", "Contract", "Internship", "Freelance"];

const WORK_MODES = ["On-site", "Remote", "Hybrid"];

const SORT_OPTIONS = ["newest", "oldest", "company", "status"];

module.exports = {
  STATUSES,
  PIPELINE_STATUSES,
  TERMINAL_STATUSES,
  JOB_TYPES,
  WORK_MODES,
  SORT_OPTIONS,
};
