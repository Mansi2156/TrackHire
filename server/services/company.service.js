const Company = require("../models/Company.model");
const JobApplication = require("../models/JobApplication.model");
const Interview = require("../models/Interview.model");
const ApiError = require("../utils/ApiError");
const { TERMINAL_STATUSES } = require("../constants/application.constants");

const WRITABLE_FIELDS = ["name", "website", "industry", "location", "description", "notes"];

function pickWritableFields(payload) {
  const data = {};
  for (const field of WRITABLE_FIELDS) {
    if (payload[field] !== undefined) {
      data[field] = payload[field];
    }
  }
  return data;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// A user shouldn't end up with two Company records for the same company.
// Per spec, "duplicate" means the same name AND the same website — a user
// tracking two genuinely different companies that happen to share a name
// (rare, but possible) can still add both as long as the website differs
// (or both are left blank, in which case they're indistinguishable and are
// treated as duplicates too).
async function assertNoDuplicateCompany(userId, name, website, excludeId) {
  const filter = {
    userId,
    name: new RegExp(`^${escapeRegExp(name.trim())}$`, "i"),
    website: new RegExp(`^${escapeRegExp((website || "").trim())}$`, "i"),
  };
  if (excludeId) {
    filter._id = { $ne: excludeId };
  }
  const existing = await Company.findOne(filter);
  if (existing) {
    throw new ApiError(409, "You're already tracking a company with this name and website");
  }
}

async function createCompany(userId, payload) {
  const data = pickWritableFields(payload);
  await assertNoDuplicateCompany(userId, data.name, data.website);
  const company = await Company.create({ ...data, userId });
  return company;
}

// Every lookup is scoped to userId so one user can never read/modify
// another user's company, regardless of a guessed/enumerated id.
async function getOwnedCompany(userId, id) {
  const company = await Company.findOne({ _id: id, userId });
  if (!company) {
    throw new ApiError(404, "Company not found");
  }
  return company;
}

async function updateCompany(userId, id, payload) {
  const company = await getOwnedCompany(userId, id);
  const data = pickWritableFields(payload);
  const nextName = data.name !== undefined ? data.name : company.name;
  const nextWebsite = data.website !== undefined ? data.website : company.website;
  await assertNoDuplicateCompany(userId, nextName, nextWebsite, id);
  Object.assign(company, data);
  await company.save();
  return company;
}

// Deleting a company must never break (or cascade-delete) its related job
// applications — per Phase 4 scope, the two records are unlinked instead:
// any application referencing this company via companyId has that
// reference cleared, but the application itself, and its own `company`
// text field, are left completely intact.
async function deleteCompany(userId, id) {
  const company = await Company.findOneAndDelete({ _id: id, userId });
  if (!company) {
    throw new ApiError(404, "Company not found");
  }
  await JobApplication.updateMany(
    { userId, companyId: company._id },
    { $set: { companyId: null } }
  );
  return company;
}

// Applications can be associated with a company two ways: an explicit
// companyId reference (set going forward via application.service.js), or —
// for applications created before this company existed, or never
// explicitly linked — a case-insensitive match on the free-text `company`
// name. Combining both keeps statistics accurate without requiring a
// one-time data migration.
function buildCompanyApplicationsFilter(userId, company) {
  return {
    userId,
    archived: false,
    $or: [
      { companyId: company._id },
      { company: new RegExp(`^${escapeRegExp(company.name.trim())}$`, "i") },
    ],
  };
}

// Shared math for a single company's metrics, given the (already filtered)
// applications belonging to it, and the number of real Interview records
// (from the Interviews collection, Phase 5) tied to those applications.
//
// `interviews` used to be a proxy metric (count of applications with an
// interviewDate set) because the Interview model didn't exist yet. Now that
// it does, callers pass in the actual count so this stays a true "how many
// interview rounds" figure rather than "how many applications reached the
// interview stage at least once".
function summarizeApplications(applications, interviewCount = 0) {
  const totalApplications = applications.length;
  const activeApplications = applications.filter(
    (app) => !TERMINAL_STATUSES.includes(app.status)
  ).length;
  const offers = applications.filter(
    (app) => app.status === "Offer" || app.status === "Accepted"
  ).length;
  const rejections = applications.filter((app) => app.status === "Rejected").length;

  return {
    totalApplications,
    activeApplications,
    interviews: interviewCount,
    offers,
    rejections,
  };
}

async function getCompanyStats(userId, id) {
  const company = await getOwnedCompany(userId, id);
  const filter = buildCompanyApplicationsFilter(userId, company);
  const applications = await JobApplication.find(filter);

  const applicationIds = applications.map((app) => app._id);
  const interviewCount = applicationIds.length
    ? await Interview.countDocuments({ userId, applicationId: { $in: applicationIds } })
    : 0;

  const stats = summarizeApplications(applications, interviewCount);

  let lastActivityAt = company.updatedAt;
  for (const app of applications) {
    if (app.updatedAt > lastActivityAt) lastActivityAt = app.updatedAt;
  }

  return { ...stats, lastActivityAt };
}

// Applications tied to a company, for the Company Details page. Sorted
// newest first; not paginated since a company's application list is
// expected to stay small for the MVP.
async function listCompanyApplications(userId, id) {
  const company = await getOwnedCompany(userId, id);
  const filter = buildCompanyApplicationsFilter(userId, company);
  const applications = await JobApplication.find(filter).sort({ createdAt: -1 });
  return applications;
}

const SORT_MAP = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  name: { name: 1 },
};

async function listCompanies(userId, query) {
  const { search, industry, sortBy = "newest", page = 1, limit = 10 } = query;

  const filter = { userId };
  if (industry) {
    filter.industry = industry;
  }
  if (search) {
    const regex = new RegExp(escapeRegExp(search.trim()), "i");
    filter.$or = [{ name: regex }, { location: regex }, { industry: regex }];
  }

  const sort = SORT_MAP[sortBy] || SORT_MAP.newest;
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [companies, total] = await Promise.all([
    Company.find(filter).sort(sort).skip(skip).limit(limitNum),
    Company.countDocuments(filter),
  ]);

  // One query for all of this user's active applications, then bucketed
  // per company in memory — far cheaper than N+1 queries per row, and
  // plenty fast at MVP scale (a single user's application count). Same
  // approach for interviews: one query for all of the user's Interview
  // records, reduced into a per-application count map, then summed per
  // company alongside its matched applications.
  const allApplications = await JobApplication.find({ userId, archived: false }).select(
    "company companyId status interviewDate updatedAt"
  );

  const allInterviews = await Interview.find({ userId }).select("applicationId");
  const interviewCountByApplication = allInterviews.reduce((map, interview) => {
    const key = String(interview.applicationId);
    map[key] = (map[key] || 0) + 1;
    return map;
  }, {});

  const companiesWithStats = companies.map((company) => {
    const matched = allApplications.filter(
      (app) =>
        (app.companyId && String(app.companyId) === String(company._id)) ||
        (!app.companyId && app.company.trim().toLowerCase() === company.name.trim().toLowerCase())
    );
    const interviewCount = matched.reduce(
      (sum, app) => sum + (interviewCountByApplication[String(app._id)] || 0),
      0
    );
    const stats = summarizeApplications(matched, interviewCount);
    let lastActivityAt = company.updatedAt;
    for (const app of matched) {
      if (app.updatedAt > lastActivityAt) lastActivityAt = app.updatedAt;
    }
    return { ...company.toObject(), stats, lastActivityAt };
  });

  return {
    companies: companiesWithStats,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

// Aggregate figures for the Companies list page's summary cards (Total
// companies, Active applications, Interviews, Offers). `interviews` is a
// real count of Interview records tied to linked applications (see
// summarizeApplications() above).
async function getOverallStats(userId) {
  const [companies, applications, interviews] = await Promise.all([
    Company.find({ userId }).select("name"),
    JobApplication.find({ userId, archived: false }).select(
      "company companyId status interviewDate"
    ),
    Interview.find({ userId }).select("applicationId"),
  ]);

  const companyIds = new Set(companies.map((c) => String(c._id)));
  const companyNames = new Set(companies.map((c) => c.name.trim().toLowerCase()));

  // Only count applications that are actually associated with a tracked
  // company (by link or by name match) — an application for a company the
  // user hasn't added to Companies yet shouldn't inflate these figures.
  const linkedApplications = applications.filter((app) => {
    if (app.companyId) return companyIds.has(String(app.companyId));
    return companyNames.has(app.company.trim().toLowerCase());
  });
  const linkedApplicationIds = new Set(linkedApplications.map((app) => String(app._id)));

  const interviewCount = interviews.filter((interview) =>
    linkedApplicationIds.has(String(interview.applicationId))
  ).length;

  const stats = summarizeApplications(linkedApplications, interviewCount);

  return {
    totalCompanies: companies.length,
    activeApplications: stats.activeApplications,
    interviews: stats.interviews,
    offers: stats.offers,
  };
}

module.exports = {
  createCompany,
  listCompanies,
  getOwnedCompany,
  updateCompany,
  deleteCompany,
  getCompanyStats,
  getOverallStats,
  listCompanyApplications,
};