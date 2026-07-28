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
| createdAt | |
| updatedAt | |

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

Not yet implemented (planned for Phase 5). Until then, `jobApplications.interviewDate` is used as a proxy for "has an interview" wherever interview counts are shown (e.g. Company statistics).

---

### Notes

Stores notes related to a job application.

| Field | Notes |
|-------|-------|
| applicationId | Reference → Job Applications |
| note | |
| createdBy | Reference → Users |
| createdAt | |

Not yet implemented as a separate collection (planned for Phase 5, alongside Interviews). `jobApplications.notes` and `companies.notes` currently cover single free-text notes per record.

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
userSettings
```

---

## Rule

Before adding or modifying any MongoDB collection or Mongoose model, update this document first. Every implementation phase must follow this database design.
