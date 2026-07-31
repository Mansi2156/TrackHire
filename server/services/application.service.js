const JobApplication = require("../models/JobApplication.model");
const Resume = require("../models/Resume.model");
const Company = require("../models/Company.model");
const ApiError = require("../utils/ApiError");

// Fields a client is allowed to set. Deliberately excludes userId/archived —
// ownership is always derived from the authenticated user, and archiving has
// its own dedicated endpoint so it can't be smuggled in through a generic update.
const WRITABLE_FIELDS = [
  "company",
  "companyId",
  "jobTitle",
  "location",
  "jobType",
  "workMode",
  "salaryRange",
  "appliedDate",
  "interviewDate",
  "deadline",
  "recruiterName",
  "recruiterEmail",
  "jobDescription",
  "applicationUrl",
  "resumeId",
  "status",
  "notes",
];

function pickWritableFields(payload) {
  const data = {};
  for (const field of WRITABLE_FIELDS) {
    if (payload[field] !== undefined) {
      data[field] = payload[field];
    }
  }
  return data;
}

// Remote applications don't have a physical location: never persist one,
// even if a client sends it alongside workMode=Remote. Validation already
// blocks this at the request level; this is a second, model-level guard.
function applyWorkModeRules(data, existingWorkMode) {
  const workMode = data.workMode !== undefined ? data.workMode : existingWorkMode;
  if (workMode === "Remote") {
    data.location = "";
  }
  return data;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// A client could otherwise reference another user's resume by guessing/
// enumerating an id. Every create/update re-verifies ownership rather than
// trusting whatever id was sent, per IMPLEMENTATION_RULES.md §6/§7 ("never
// trust client-provided ownership fields", "ensure users can access only
// their own resources").
async function assertResumeOwnership(userId, resumeId) {
  if (!resumeId) return;
  const resume = await Resume.findOne({ _id: resumeId, userId }).select("_id");
  if (!resume) {
    throw new ApiError(400, "Selected resume was not found");
  }
}

// Same ownership guard as assertResumeOwnership, for an explicitly-sent
// companyId (Company Management, Phase 4).
async function assertCompanyOwnership(userId, companyId) {
  if (!companyId) return;
  const company = await Company.findOne({ _id: companyId, userId }).select("_id");
  if (!company) {
    throw new ApiError(400, "Selected company was not found");
  }
}

// Best-effort auto-link: the Applications form doesn't (yet) offer an
// explicit company picker, so if the client didn't send a companyId
// directly, try to match the free-text `company` name to one the user has
// already added under Companies (case-insensitively). This keeps Company
// statistics and the Company Details page's application list accurate
// without requiring ApplicationForm.jsx to be redesigned in this phase.
// Returns null (no link) when there's no match — callers decide whether
// that clears an existing link or simply leaves companyId unset.
async function findMatchingCompanyId(userId, companyName) {
  if (!companyName) return null;
  const match = await Company.findOne({
    userId,
    name: new RegExp(`^${escapeRegExp(companyName.trim())}$`, "i"),
  }).select("_id");
  return match ? match._id : null;
}

// A user shouldn't end up with two application records for the same
// role at the same company. Compared case-insensitively so "Google" and
// "google" are treated as the same duplicate.
async function assertNoDuplicateApplication(userId, company, jobTitle, excludeId) {
  const filter = {
    userId,
    company: new RegExp(`^${escapeRegExp(company)}$`, "i"),
    jobTitle: new RegExp(`^${escapeRegExp(jobTitle)}$`, "i"),
  };
  if (excludeId) {
    filter._id = { $ne: excludeId };
  }
  const existing = await JobApplication.findOne(filter);
  if (existing) {
    throw new ApiError(
      409,
      "You already have an application for this role at this company"
    );
  }
}

async function createApplication(userId, payload) {
  const data = applyWorkModeRules(pickWritableFields(payload));
  await assertResumeOwnership(userId, data.resumeId);
  if (data.companyId) {
    await assertCompanyOwnership(userId, data.companyId);
  } else if (data.company) {
    data.companyId = await findMatchingCompanyId(userId, data.company);
  }
  if (data.status === "Saved") {
    data.appliedDate = null;
    data.interviewDate = null;
  }
  await assertNoDuplicateApplication(userId, data.company, data.jobTitle);
  const application = await JobApplication.create({ ...data, userId });
  return application;
}

const SORT_MAP = {
  newest: { appliedDate: -1, createdAt: -1 },
  oldest: { appliedDate: 1, createdAt: 1 },
  company: { company: 1 },
  status: { status: 1 },
};

async function listApplications(userId, query) {
  const {
    search,
    status,
    archived = "false",
    sortBy = "newest",
    page = 1,
    limit = 10,
  } = query;

  const filter = { userId };

  if (archived !== "all") {
    filter.archived = archived === "true";
  }

  if (status) {
    const statuses = String(status).split(",");
    filter.status = statuses.length > 1 ? { $in: statuses } : statuses[0];
  }

  if (search) {
    const regex = new RegExp(search.trim(), "i");
    filter.$or = [{ company: regex }, { jobTitle: regex }];
  }

  const sort = SORT_MAP[sortBy] || SORT_MAP.newest;
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [applications, total] = await Promise.all([
    JobApplication.find(filter).sort(sort).skip(skip).limit(limitNum),
    JobApplication.countDocuments(filter),
  ]);

  return {
    applications,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

// Every lookup is scoped to userId so one user can never read/modify
// another user's application, regardless of a guessed/enumerated id.
async function getOwnedApplication(userId, id) {
  const application = await JobApplication.findOne({ _id: id, userId });
  if (!application) {
    throw new ApiError(404, "Application not found");
  }
  return application;
}

async function updateApplication(userId, id, payload) {
  const application = await getOwnedApplication(userId, id);
  const data = applyWorkModeRules(pickWritableFields(payload), application.workMode);
  await assertResumeOwnership(userId, data.resumeId);
  if (data.companyId) {
    await assertCompanyOwnership(userId, data.companyId);
  } else if (data.company !== undefined) {
    // The company name was (re)sent as part of this update: keep the link
    // in sync with it, which may also clear a stale link if it no longer
    // matches any tracked company.
    data.companyId = await findMatchingCompanyId(userId, data.company);
  }
  if (data.status === "Saved") {
    data.appliedDate = null;
    data.interviewDate = null;
  }
  const nextCompany = data.company !== undefined ? data.company : application.company;
  const nextJobTitle = data.jobTitle !== undefined ? data.jobTitle : application.jobTitle;
  await assertNoDuplicateApplication(userId, nextCompany, nextJobTitle, id);
  Object.assign(application, data);
  await application.save();
  return application;
}

async function deleteApplication(userId, id) {
  const application = await JobApplication.findOneAndDelete({ _id: id, userId });
  if (!application) {
    throw new ApiError(404, "Application not found");
  }
  return application;
}

async function setArchived(userId, id, archived) {
  const application = await getOwnedApplication(userId, id);
  application.archived = archived;
  await application.save();
  return application;
}

// Bulk selection actions (Applications list). Both are scoped with
// `userId` directly in the filter (not a per-id ownership loop) so one user
// can never affect another's applications, and ids that don't belong to the
// user (or don't exist) are silently excluded rather than erroring the
// whole batch — matching how a partial multi-select action should behave.
async function bulkSetArchived(userId, ids, archived) {
  const result = await JobApplication.updateMany(
    { _id: { $in: ids }, userId },
    { $set: { archived } }
  );
  return { matchedCount: result.matchedCount ?? result.n ?? 0 };
}

async function bulkDelete(userId, ids) {
  const result = await JobApplication.deleteMany({ _id: { $in: ids }, userId });
  return { deletedCount: result.deletedCount ?? 0 };
}

async function updateStatus(userId, id, status) {
  const application = await getOwnedApplication(userId, id);
  application.status = status;
  if (status === "Saved") {
    application.appliedDate = null;
    application.interviewDate = null;
  }
  await application.save();
  return application;
}

module.exports = {
  createApplication,
  listApplications,
  getOwnedApplication,
  updateApplication,
  deleteApplication,
  setArchived,
  bulkSetArchived,
  bulkDelete,
  updateStatus,
};