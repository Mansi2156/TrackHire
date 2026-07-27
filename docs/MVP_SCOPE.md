# TrackHire — MVP Project Scope and Implementation Plan

We are building **TrackHire**, a production-quality full-stack MERN job application tracking platform.

The current goal is to build only the **core MVP**. Do not implement AI features, advanced notifications, email reminders, or other future modules unless explicitly requested later.

## Tech Stack

### Frontend

* React.js with Vite
* React Router DOM
* Axios
* TanStack Query
* React Hook Form
* Tailwind CSS
* Recharts or Chart.js

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT-based secure authentication
* Input validation
* Centralized error handling

## Core MVP Features

### 1. Authentication

* Register
* Login
* Logout
* Get current authenticated user
* Protected frontend routes
* Protected backend APIs
* Secure authentication and session handling

### 2. Dashboard

Display:

* Total applications
* Active applications
* Interviews
* Offers
* Rejections
* Recent applications
* Upcoming interviews

### 3. Job Application Management

* Add application
* Edit application
* Delete application
* View application details
* Archive application
* Update application status

### 4. Application Pipeline

Support and visually represent the hiring journey:

Applied → Assessment → Technical → Manager → HR → Offer → Accepted

Also support:

* Rejected
* Withdrawn

Design the implementation so application progress can be tracked clearly and status changes can be extended in the future.

### 5. Search, Filter, Sort and Pagination

* Search by company and role
* Filter by status
* Filter by priority
* Filter by date
* Sort by newest and oldest
* Server-side pagination

### 6. Interview Tracking

Each application may have multiple interview rounds.

Track:

* Interview date and time
* Interview type
* Interview round
* Interview status
* Notes

### 7. Basic Analytics

* Applications by status
* Applications over time
* Interview conversion rate
* Offer rate

### 8. Deployment

Prepare and deploy:

* Frontend
* Backend
* MongoDB database

Use environment-based configuration and ensure the deployed application works correctly.

---

# General Implementation Rules

Before starting any phase:

- Inspect the existing codebase before creating new files.
- Reuse existing components, hooks and utilities whenever possible.
- Refer to the uploaded Figma folder for UI implementation.
- Refer to docs/DATABASE_DESIGN.md before implementing models or APIs.
- Only implement fields defined in DATABASE_DESIGN.md.
- Do not redesign the UI.
- Do not introduce mock data unless explicitly requested.
- Update PROJECT_IMPLEMENTATION_GUIDE.md after completing each feature.

---

# Implementation Phases

## Phase 1 — Project Foundation and Authentication

* Initialize frontend and backend
* Establish scalable folder structure
* Configure environment variables
* Configure MongoDB connection
* Create User model
* Implement registration
* Implement login
* Implement logout
* Implement current-user endpoint
* Implement secure authentication
* Add protected backend routes
* Add protected frontend routes
* Add centralized error handling
* Add request validation

## Phase 2 — Application Management and Pipeline

* Create JobApplication model
* Create application CRUD APIs
* Build application list page
* Build add/edit application forms
* Build application details page
* Implement archive functionality
* Implement application status updates
* Implement the visual application pipeline
* Design status handling so it remains maintainable and extensible


# Phase 3 — Resume Management

Implement the Resume Management module in a production-ready manner.

Before starting:
- Refer to the uploaded `Figma` folder and use it as the UI source of truth. Match the design closely without redesigning.
- Refer to `docs/DATABASE_DESIGN.md` for the database schema and business rules.
- Only implement fields that exist in `docs/DATABASE_DESIGN.md`. Ignore any placeholder or demo fields in the Figma.

Rules:
- Follow the existing project structure and coding standards.
- Build reusable, maintainable components.
- Do not use mock data.
- Use 4–5 predefined colors for resume preview cards as shown in the design.
- Do not create a separate "Add Resume" card; use the Upload Resume button from the design.
- Implement Resume Preview in a Bootstrap-style modal (same page, no navigation).
- Add the ability to mark a resume as the Default (only one default per user).
- Update `PROJECT_IMPLEMENTATION_GUIDE.md` under **Phase 3 — Resume Management** after completing each feature.

Implementation Order:
1. Resume Model & CRUD APIs
2. Upload, Replace, Download & Delete Resume
3. Resume Management Page
4. Resume Preview Modal
5. Mark as Default
6. Resume Analytics & Statistics
7. Resume Validation & Business Rules


## Phase 4 — Company Management

* Create Company model
* Company CRUD APIs
* Associate companies with job applications
* * Store company details (name, website, location, industry, description, notes)
* Company details page
* Company search and filtering
* Company notes
* Company statistics


## Phase 5 — Interview Management

* Create Interview model
* Support multiple interviews per application
* Add, edit, delete and complete interviews
* Interview history
* Upcoming interviews
* Calendar-friendly interview scheduling
* Interview notes and feedback
* Interview result tracking
* Interview details page


## Phase 6 — Search, Filtering

* Server-side search
* Search by company
* Search by job title
* Status filter
* Priority filter
* Company filter
* Date filter
* Sorting
* Server-side pagination

## Phase 7 — Dashboard and Analytics

* Dashboard statistics
* Total applications
* Active applications
* Interviews
* Offers
* Rejections
* Recent applications
* Upcoming interviews
* Applications by status chart
* Applications over time chart
* Interview conversion rate
* Offer rate

All analytics must be calculated from actual user data.

## Phase 8 — Testing, Production Readiness and Deployment

* Validate critical frontend and backend flows
* Improve loading, error and empty states
* Verify authentication security
* Verify API authorization and user data isolation
* Improve responsive design
* Review code quality
* Remove unused code
* Configure production environment variables
* Deploy frontend
* Deploy backend
* Configure MongoDB Atlas
* Perform final production testing
* Prepare project README and documentation

---

# Development Rules

Follow industry-standard development practices.

* Use a modular and scalable architecture.
* Maintain clear separation of concerns.
* Do not place business logic directly inside routes.
* Keep controllers thin where practical.
* Use services for business logic.
* Use Mongoose models for persistence.
* Use reusable React components.
* Use TanStack Query for server-state management.
* Refer to the uploaded Figma folder as the UI source of truth whenever applicable.
* Refer to docs/DATABASE_DESIGN.md before implementing any database model, API or business logic.
* Use React Hook Form for forms.
* Implement centralized API error handling.
* Validate all important backend inputs.
* Protect all user-specific resources.
* Ensure users can access only their own data.
* Use environment variables for configuration and secrets.
* Never hardcode credentials or secrets.
* Do not over-engineer the MVP.
* Do not implement features outside the defined scope without approval.
* Do not modify previously completed functionality unnecessarily.
* Before implementing a new phase, inspect the existing codebase and integrate with the current architecture instead of duplicating functionality.

The project should be developed one phase at a time. Complete and verify the current phase before moving to the next phase.
