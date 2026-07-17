# TrackHire — MVP Project Scope and Implementation Plan

We are building **TrackHire**, a production-quality full-stack MERN job application tracking platform.

The current goal is to build only the **core MVP**. Do not implement Resume Manager, AI features, advanced notifications, email reminders, or other future modules unless explicitly requested later.

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

## Phase 3 — Search, Filtering and Interview Tracking

* Server-side search
* Status filter
* Priority filter
* Date filter
* Sorting
* Server-side pagination
* Create Interview model
* Support multiple interviews per application
* Add, edit, delete and complete interviews
* Display interview history on the application details page
* Display upcoming interviews

## Phase 4 — Dashboard and Analytics

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

## Phase 5 — Testing, Production Readiness and Deployment

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
