// Central source of truth for Resume enums/limits. Shared by the model
// (schema validation), validators (request validation), and the upload
// middleware, so they never drift apart.

// Per docs/DATABASE_DESIGN.md (Module 5, TrackHire.docx): only PDF and DOCX
// resumes are supported.
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

const ALLOWED_EXTENSIONS = [".pdf", ".docx"];

// Minor implementation detail (not specified in DATABASE_DESIGN.md): a
// reasonable industry-standard cap to keep uploads and storage predictable
// for the MVP. Documented in PROJECT_IMPLEMENTATION_GUIDE.md.
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Soft cap on resumes per user, to keep the manager page and storage usage
// bounded for the MVP. Also a documented minor-detail decision.
const MAX_RESUMES_PER_USER = 20;

// Tags (UI/UX addition): free-form labels like "Frontend", "React" shown as
// badge chips on the Resume Manager cards. Kept as a simple embedded array
// on the Resume document (not a separate collection) since tags have no
// identity or behavior of their own outside the resume they describe, and
// are always read/written together with it — a dedicated collection would
// add a join for no practical benefit at this scale. Limits are a minor
// implementation detail (not specified in DATABASE_DESIGN.md), documented
// here per that rule.
const MAX_TAGS_PER_RESUME = 6;
const MAX_TAG_LENGTH = 30;

module.exports = {
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  MAX_RESUMES_PER_USER,
  MAX_TAGS_PER_RESUME,
  MAX_TAG_LENGTH,
};