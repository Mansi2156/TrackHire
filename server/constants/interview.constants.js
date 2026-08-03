// Central source of truth for Interview enums. Shared by the model (schema
// validation) and validators (request validation), and mirrored by the
// frontend constants file, so all three never drift apart.
//
// Values match the Figma "Interviews" module (interview-list /
// schedule-interview / interview-details) exactly, per the project rule to
// match the Figma closely without redesigning it. docs/DATABASE_DESIGN.md's
// originally-sketched enum values (numeric round, a different type/mode
// list) have been updated to match — see that document's Interviews
// section for the reasoning, following the same "update the design doc"
// rule used for prior additions like Company.notes / Resume.tags.
const ROUNDS = ["Round 1", "Round 2", "Round 3", "HR Round", "Final Round", "Offer Call"];

const TYPES = [
  "Technical",
  "Behavioral",
  "System Design",
  "HR",
  "Take-Home",
  "Panel",
  "Culture Fit",
];

const STATUSES = ["Scheduled", "Completed", "Passed", "Failed", "Cancelled", "Rescheduled"];

const MODES = ["Video Call", "Phone", "On-site", "Async"];

const SORT_OPTIONS = ["newest", "oldest", "upcoming"];

module.exports = {
  ROUNDS,
  TYPES,
  STATUSES,
  MODES,
  SORT_OPTIONS,
};
