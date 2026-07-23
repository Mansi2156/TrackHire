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

Stores authentication and user profile.

| Field |
|-------|
| fullName |
| email |
| password |
| avatar |
| createdAt |
| updatedAt |

---

### Companies

Stores company information.

| Field |
|-------|
| name |
| website |
| industry |
| location |
| description |
| createdAt |
| updatedAt |

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
| createdAt | |
| updatedAt | |

---

### Job Applications

Stores every job application.

| Field | Notes |
|-------|-------|
| userId | Reference → Users |
| company | **Plain text** (not a reference). Company Management (Phase 4) will introduce a `Company` model with `companyId`; until then the company name is stored directly on the application. See "Phase 2 Deviations" below. |
| resumeId | **Deferred.** Resume Management (Phase 3) will introduce a `Resume` model. Until then, stored as `resumeVersion` (plain text), mirroring the `company` decision above. |
| jobTitle | |
| jobDescription | |
| applicationUrl | Original job posting URL |
| recruiterName | Optional |
| recruiterEmail | Optional |
| status | `Saved, Applied, Screening, Assessment, Interview, Offer, Accepted, Rejected, Withdrawn, Closed` — confirmed as the authoritative set in Phase 2 (see "Phase 2 Deviations"). `Applied → Screening → Assessment → Interview → Offer → Accepted` is the on-track pipeline; `Rejected`, `Withdrawn`, `Closed` are terminal exits; `Saved` is a pre-application draft state. |
| appliedDate | |
| deadline | Optional. Present in the schema; **no form control yet** — not part of the approved Figma Add/Edit Application design for this phase. |
| salaryRange | Optional, free text (e.g. "$120,000 - $150,000") |
| location | |
| jobType | `Full-Time, Part-Time, Contract, Internship, Freelance` |
| workMode | `On-site, Remote, Hybrid`. Optional. Present in the schema per this design; **no form control yet** — same reasoning as `deadline`. |
| notes | Short summary (optional) |
| archived | **Added in Phase 2**, not originally listed in this table. Boolean, defaults to `false`. Required by the MVP's "Archive Application" feature; a separate flag from `status` so archiving never overloads/loses the application's pipeline status. |
| createdAt | |
| updatedAt | |

---

### Interviews

Stores interview rounds for a job application.

| Field | Notes |
|-------|-------|
| applicationId | Reference → Job Applications |
| round | 1, 2, 3... |
| type | HR Screening, Technical, Managerial, Hiring Manager, Panel, Final, Behavioral, Case Study, Assignment Review, Custom |
| status | Scheduled, Completed, Passed, Failed, Cancelled, Rescheduled |
| interviewDate | |
| mode | Online, On-site, Phone |
| feedback | Optional |
| createdAt | |
| updatedAt | |

---

### Notes

Stores notes related to a job application.

| Field | Notes |
|-------|-------|
| applicationId | Reference → Job Applications |
| note | |
| createdBy | Reference → Users |
| createdAt | |

---

## Phase 2 Deviations

Documented here per the "update this document first" rule in `IMPLEMENTATION_RULES.md` §8, since these differ from what was originally written above before Phase 2:

1. **`companyId` → `company` (plain text).** Explicit scope decision for Phase 2: Company Management (with a real `Company` collection and `companyId` reference) is Phase 4. Storing company as plain text now avoids a throwaway/duplicate model. When Phase 4 introduces `Company`, existing `company` text values can be backfilled/matched to `companyId` references as a migration step.
2. **`resumeId` → `resumeVersion` (plain text).** Same reasoning as above — Resume Management is Phase 3. Deferred until the `Resume` model exists.
3. **`archived` field added.** Required by Phase 2's "Archive Application" feature. Kept separate from `status` intentionally: an application can be archived at any status (e.g. archive an old Rejected application, or archive an Offer you accepted elsewhere) without losing its pipeline history.
4. **Status enum confirmed as-is.** Three sources (Figma UI, `MVP_SCOPE.md`'s pipeline description, this document) proposed different status sets. This document's set was confirmed as authoritative for Phase 2; the Figma-derived UI (status pills, badges, pipeline stepper) was updated to match it rather than the other way around.

---



- Use **ObjectId** references between collections.
- Keep collections normalized and avoid duplicate data.
- One user can have multiple resumes and job applications.
- One company can have multiple job applications.
- One job application uses one resume.
- One job application can have multiple interview rounds.
- One job application can have multiple notes.
- Keep application status generic and interview stages separate.
- Add new collections only when required by future phases.

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
userSettings
```

---

## Rule

Before adding or modifying any MongoDB collection or Mongoose model, update this document first. Every implementation phase must follow this database design.