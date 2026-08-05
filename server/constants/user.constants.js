// Central source of truth for User/Settings enums and limits. Shared by
// the model (schema validation) and the validators (request validation) so
// they never drift apart. Mirrors client/src/constants/index.js.

// Settings > Reminders > "Remind before interview" — same day, 1, 2 or 3
// days before, matching the Figma design exactly. Not specified in
// docs/DATABASE_DESIGN.md; documented here per the "update this document
// first" rule (see User.model.js).
const INTERVIEW_REMINDER_OPTIONS = [0, 1, 2, 3]; // days before; 0 = same day

// Settings > Reminders > "Follow-up after application (days)" — a
// reasonable industry-standard range, not specified in
// docs/DATABASE_DESIGN.md.
const MIN_FOLLOW_UP_REMINDER_DAYS = 1;
const MAX_FOLLOW_UP_REMINDER_DAYS = 60;

// Settings > Profile field limits.
const MAX_JOB_TITLE_LENGTH = 100;
const MAX_LOCATION_LENGTH = 200;
const MAX_BIO_LENGTH = 500;

module.exports = {
  INTERVIEW_REMINDER_OPTIONS,
  MIN_FOLLOW_UP_REMINDER_DAYS,
  MAX_FOLLOW_UP_REMINDER_DAYS,
  MAX_JOB_TITLE_LENGTH,
  MAX_LOCATION_LENGTH,
  MAX_BIO_LENGTH,
};
