export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const TOKEN_STORAGE_KEY = "trackhire_token";

// Mirrors server/constants/application.constants.js — kept generic per
// docs/DATABASE_DESIGN.md; interview-round granularity lives in a
// separate Interview collection in a later phase.
export const APPLICATION_STATUSES = [
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

// Ordered "on-track" pipeline for the visual progress stepper.
// Rejected / Withdrawn / Closed are terminal exits, shown separately.
export const PIPELINE_STATUSES = [
  "Applied",
  "Screening",
  "Assessment",
  "Interview",
  "Offer",
  "Accepted",
];

export const TERMINAL_STATUSES = ["Rejected", "Withdrawn", "Closed"];

export const JOB_TYPES = ["Full-Time", "Part-Time", "Contract", "Internship", "Freelance"];

// Mirrors server/constants/application.constants.js
export const WORK_MODES = ["On-site", "Remote", "Hybrid"];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "company", label: "Company Name" },
  { value: "status", label: "Status" },
];

// Tailwind classes per status, styled to match the existing badge pattern
// used across the app (soft background + matching border + text color).
export const STATUS_STYLES = {
  Saved: "bg-slate-100 text-slate-600 border border-slate-200",
  Applied: "bg-blue-50 text-blue-700 border border-blue-200",
  Screening: "bg-cyan-50 text-cyan-700 border border-cyan-200",
  Assessment: "bg-amber-50 text-amber-700 border border-amber-200",
  Interview: "bg-brand-50 text-brand-700 border border-brand-200",
  Offer: "bg-purple-50 text-purple-700 border border-purple-200",
  Accepted: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border border-red-200",
  Withdrawn: "bg-slate-100 text-slate-500 border border-slate-200",
  Closed: "bg-neutral-100 text-neutral-600 border border-neutral-300",
};

// Mirrors server/constants/resume.constants.js — kept in one place so the
// upload dropzone and the edit/replace file picker enforce identical
// client-side rules before ever hitting the API.
export const RESUME_ACCEPTED_EXTENSIONS = [".pdf", ".docx"];

export const RESUME_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB