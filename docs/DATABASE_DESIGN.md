# TrackHire - Database Design (MVP)

This document defines the MongoDB database structure for TrackHire. All backend development must follow this design unless it is officially updated.

**Database:** `trackhire`  
**Database:** MongoDB Atlas  
**ODM:** Mongoose

---

## Database Structure

```text
trackhire
│
├── users
├── companies
├── resumes
├── jobApplications
├── interviews
└── notes
```

---

## Collection Relationships

```text
User (1)
│
├── (*) Resumes
│
├── (*) Companies
│
└── (*) Job Applications
        │
        ├── (1) Company
        ├── (1) Resume
        ├── (*) Interviews
        └── (*) Notes
```

---

## Collections

### Users

Stores authentication, profile, and account preferences.

| Field | Notes |
|-------|-------|
| fullName | |
| email | Unique. Read-only from Settings — never editable after registration |
| password | bcrypt-hashed, hidden by default |
| avatar | Optional. Not currently editable from the UI (Settings > Profile intentionally has no avatar upload) |
| jobTitle | Optional. Settings > Profile addition — added here per the "update this document first" rule |
| location | Optional. Settings > Profile addition |
| bio | Optional, max 500 chars. Settings > Profile addition |
| reminders.interviewReminderDays | One of `0, 1, 2, 3` (days before an interview; `0` = same day). In-app only — no email reminders in the MVP. Settings > Reminders addition |
| reminders.followUpReminderDays | Integer, 1–60. How many days after applying to be reminded to follow up. Settings > Reminders addition |
| isDeleted | Boolean, default `false`. Settings > Danger Zone addition — see "Account Deletion" below |
| deletedAt | Date, default `null`. Set alongside `isDeleted` |
| createdAt | |
| updatedAt | |

**Account deletion (Settings > Danger Zone) is a soft delete, not a hard delete.** The user document is kept — never removed — so related records (Job Applications, Resumes, Companies, Interviews) never dangle, consistent with this document's own "deleting a parent record must never break related records" principle. Instead, `isDeleted: true` makes the account immediately and permanently unreachable: `auth.service.js`'s login treats `isDeleted: true` the same as "no such user," and `auth.middleware.js`'s `protect` middleware rejects any request from a token belonging to a soft-deleted user, even if the JWT itself hasn't expired. This is what "invalidates the session/JWT" in a stateless-JWT setup that has no server-side revocation list.

---

### Companies

Stores company information.

| Field | Notes |
|-------|-------|
| userId | Reference → Users |
| name | |
| website | Optional. Normalized to include a protocol (e.g. `https://`) before storing |
| industry | Optional. One of a fixed set of common industries |
| location | Optional |
| description | Optional |
| notes | Optional. Personal notes/observations about the company (Phase 4 addition — added here per the "update this document first" rule) |
| createdAt | |
| updatedAt | |

A company is unique per user by **name + website** (case-insensitive). Deleting a company never deletes or blocks deletion of related job applications — it only clears their `companyId` reference (see Job Applications below).

---

### Resumes

Stores uploaded resume versions.

| Field | Notes |
|-------|-------|
| userId | Reference → Users |
| title | Resume name (e.g. React Developer Resume) |
| fileName | Original file name |
| fileUrl | Storage path / URL |
| version | v1, v2, v3... |
| isDefault | Boolean |
| fileSize |
| mimeType |
| tags | Optional. Array of short free-form labels (e.g. "React", "Remote"), max 6 tags, 30 chars each. Trimmed and case-insensitively de-duplicated before saving (UI/UX addition — added here per the "update this document first" rule) |
| createdAt | |
| updatedAt | |

Kept as a simple embedded array on the Resume document rather than a separate `tags` collection — tags have no identity or behavior of their own outside the resume they describe, and are always read/written together with it, so a dedicated collection would only add a join for no practical benefit at this scale.

---

### Job Applications

Stores every job application.

| Field | Notes |
|-------|-------|
| userId | Reference → Users |
| company | Free-text company name. Kept as the primary display/search field for backward compatibility with Phases 1–3 |
| companyId | Reference → Companies. Optional. Populated automatically when `company` matches an existing Company by name (case-insensitively), or explicitly if sent by a client. Cleared (not cascade-deleted) if the referenced Company is deleted |
| resumeId | Reference → Resumes |
| jobTitle | |
| jobDescription | |
| applicationUrl | Original job posting URL |
| recruiterName | Optional |
| recruiterEmail | Optional |
| status | Saved, Applied, Screening, Assessment, Interview, Offer, Accepted, Rejected, Withdrawn, Closed |
| appliedDate | Required unless status is `Saved`; must not be a future date |
| interviewDate | Required when status is `Interview`; must be ≥ appliedDate; must be empty when status is `Saved` |
| deadline | Optional; must be ≥ appliedDate |
| salaryRange | Optional |
| location | |
| jobType | Full-Time, Part-Time, Internship, Contract, Freelance |
| workMode | On-site, Remote, Hybrid |
| notes | Short summary (optional) |
| archived | Boolean. Not in the original field list above but required by Phase 2's archive functionality; documented here per that phase's decision |
| createdAt | |
| updatedAt | |

---

### Interviews

Stores interview rounds for a job application. **Implemented in Phase 5.**

| Field | Notes |
|-------|-------|
| userId | Reference → Users. Not in the field list originally sketched above (only `applicationId` was), but stored directly here — same as every other user-owned collection (Companies, Resumes, Job Applications) — so list/filter/pagination queries can be scoped and indexed on `userId` directly instead of joining through Job Applications on every request. Added here per the "update this document first" rule |
| applicationId | Reference → Job Applications |
| round | One of a fixed set matching the Figma's round picker: `Round 1`, `Round 2`, `Round 3`, `HR Round`, `Final Round`, `Offer Call`. Supersedes the originally-sketched free-numeric `1, 2, 3...` — company-specific round names (e.g. "HR Round") don't fit a plain integer, and the UI is the source of truth for exactly which options are offered |
| type | `Technical`, `Behavioral`, `System Design`, `HR`, `Take-Home`, `Panel`, `Culture Fit` — matches the Figma's type picker exactly. Supersedes the originally-sketched list (`HR Screening, Technical, Managerial, ...`), which didn't match the actual UI |
| status | Scheduled, Completed, Passed, Failed, Cancelled, Rescheduled *(unchanged from the original sketch — already matched the Figma)* |
| interviewDate | Single combined date+time value (the Figma's separate date/time inputs are combined into one `Date` before saving), matching how `jobApplications.interviewDate` already models this |
| mode | `Video Call`, `Phone`, `On-site`, `Async` — matches the Figma's mode toggle. Supersedes the originally-sketched `Online, On-site, Phone`, which didn't distinguish a live video call from an async take-home submission |
| link | Optional. Meeting link (Video Call / Async) or office address (On-site) — a single free-text field, since only one applies at a time depending on `mode`. Not in the original sketch; added here per the "update this document first" rule, matching the Figma's "Meeting Link" / "Office Location" field |
| notes | Optional. Preparation notes, filled in before the interview. Same "add + document" precedent as `link` above |
| feedback | Optional. Post-interview feedback/outcome commentary *(unchanged from the original sketch)* |
| createdAt | |
| updatedAt | |

Deleting a Job Application **cascade-deletes** its Interviews (unlike Company deletion, which only unlinks — see Job Applications above): an interview round has no meaning independent of the application it belongs to.

Now that Interviews exist, `jobApplications.interviewDate` is retained purely for backward compatibility with Phases 1–4 and is no longer the source of truth for interview counts/statistics. Company statistics (`company.service.js`'s `getCompanyStats`, `listCompanies`, `getOverallStats`) now query the Interviews collection directly for their `interviews` figure instead of the earlier interviewDate-boolean proxy.

**Application ↔ Interview sync.** Creating, updating, or deleting an Interview keeps its parent Job Application's `status` and `interviewDate` in sync (`interview.service.js`'s `applyInterviewOutcome` / `resyncApplicationFromRemainingInterviews`):

| Interview `status` | Effect on the Job Application |
|---|---|
| `Scheduled`, `Rescheduled` | `status` → `Interview`; `interviewDate` set to the interview's date/time |
| `Failed` | `status` → `Rejected` |
| `Passed` | `status` → `Offer` if `round` is `Offer Call` (the final round); otherwise stays `Interview` (a further round is pending — the application model has no more granular in-between state) |
| `Completed`, `Cancelled` | No change — attended-but-pending and cancelled interviews don't map to a clear application outcome |

Deleting an Interview (or moving it to a different application) recomputes the affected application(s) from whichever Interview records remain: the most recently-scheduled remaining interview drives the recomputed status/date, or, if none remain, `interviewDate` is cleared and `status` steps back to `Applied` (only if it was `Interview` — an application already moved to Offer/Accepted/Rejected is left alone).

---

### Notes

Stores notes related to a job application.

| Field | Notes |
|-------|-------|
| applicationId | Reference → Job Applications |
| note | |
| createdBy | Reference → Users |
| createdAt | |

Not yet implemented as a separate collection. `jobApplications.notes` and `companies.notes` continue to cover single free-text notes per record; a per-application multi-note thread isn't part of the currently approved MVP phases (see `docs/MVP_SCOPE.md`) and remains a candidate for a future phase.

---

## Design Principles

- Use **ObjectId** references between collections.
- Keep collections normalized and avoid duplicate data.
- One user can have multiple resumes, companies, and job applications.
- One company can have multiple job applications.
- One job application uses one resume and (optionally) one company.
- One job application can have multiple interview rounds.
- One job application can have multiple notes.
- Keep application status generic and interview stages separate.
- Add new collections only when required by future phases.
- Deleting a parent record (e.g. a Company) must never break or cascade-delete related records (e.g. Job Applications) — references are cleared instead.

---

## Naming Convention

| Item | Convention |
|------|------------|
| Database | `trackhire` |
| Collections | `camelCase` (plural) |
| Models | `PascalCase` |
| References | `<entity>Id` |
| Timestamps | `createdAt`, `updatedAt` |

---

## Future Scope (Out of MVP)

```text
notifications
activityLogs
savedSearches
emailTemplates
aiSuggestions
```

`userSettings` was originally listed here as a future collection but is
**implemented** — as fields embedded directly on the `Users` document
(`jobTitle`, `location`, `bio`, `reminders.*`, `isDeleted`, `deletedAt`;
see the Users section above), not as a separate collection. A separate
`userSettings` collection was considered and rejected: these fields have
no identity or behavior of their own outside the user they describe, are
always read/written together with the user record, and stay well within
a single small document — the same reasoning already applied to `Resume`
tags in this document.

---

## Rule

Before adding or modifying any MongoDB collection or Mongoose model, update this document first. Every implementation phase must follow this database design.