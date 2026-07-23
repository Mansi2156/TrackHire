const JobApplication = require("../models/JobApplication.model");
const ApiError = require("../utils/ApiError");

// Fields a client is allowed to set. Deliberately excludes userId/archived —
// ownership is always derived from the authenticated user, and archiving has
// its own dedicated endpoint so it can't be smuggled in through a generic update.
const WRITABLE_FIELDS = [
  "company",
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
  "resumeVersion",
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

async function updateStatus(userId, id, status) {
  const application = await getOwnedApplication(userId, id);
  application.status = status;
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
  updateStatus,
};