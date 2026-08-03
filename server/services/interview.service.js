const mongoose = require("mongoose");
const Interview = require("../models/Interview.model");
const JobApplication = require("../models/JobApplication.model");
const ApiError = require("../utils/ApiError");

const WRITABLE_FIELDS = [
  "applicationId",
  "round",
  "type",
  "interviewDate",
  "mode",
  "link",
  "notes",
  "feedback",
  "status",
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Same ownership-guard pattern as application.service.js's
// assertResumeOwnership/assertCompanyOwnership — a client could otherwise
// attach an interview to another user's application by guessing/enumerating
// an id. Every create/update re-verifies ownership instead of trusting
// whatever id was sent, per IMPLEMENTATION_RULES.md §6/§7.
async function assertApplicationOwnership(userId, applicationId) {
  const application = await JobApplication.findOne({ _id: applicationId, userId }).select(
    "_id company jobTitle"
  );
  if (!application) {
    throw new ApiError(400, "Selected job application was not found");
  }
  return application;
}

async function createInterview(userId, payload) {
  const data = pickWritableFields(payload);
  await assertApplicationOwnership(userId, data.applicationId);
  const interview = await Interview.create({ ...data, userId });
  return interview;
}

// Every lookup is scoped to userId so one user can never read/modify
// another user's interview, regardless of a guessed/enumerated id.
async function getOwnedInterview(userId, id) {
  const interview = await Interview.findOne({ _id: id, userId });
  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }
  return interview;
}

async function updateInterview(userId, id, payload) {
  const interview = await getOwnedInterview(userId, id);
  const data = pickWritableFields(payload);
  if (data.applicationId) {
    await assertApplicationOwnership(userId, data.applicationId);
  }
  Object.assign(interview, data);
  await interview.save();
  return interview;
}

async function deleteInterview(userId, id) {
  const interview = await Interview.findOneAndDelete({ _id: id, userId });
  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }
  return interview;
}

// Quick status transition (e.g. "Mark Complete", "Cancel") without
// resending the full form — mirrors application.service.js's updateStatus.
async function updateStatus(userId, id, status) {
  const interview = await getOwnedInterview(userId, id);
  interview.status = status;
  await interview.save();
  return interview;
}

const SORT_MAP = {
  newest: { interviewDate: -1 },
  oldest: { interviewDate: 1 },
  upcoming: { interviewDate: 1 },
};

// List interviews with server-side search/filter/sort/pagination, per
// IMPLEMENTATION_RULES.md §9 ("do not fetch all records and filter/paginate
// only on the frontend"). Interview itself has no company/role text of its
// own (see docs/DATABASE_DESIGN.md), so search is done via an aggregation
// $lookup against jobApplications rather than a plain Mongoose query.
async function listInterviews(userId, query) {
  const {
    search,
    status,
    type,
    applicationId,
    when,
    sortBy = "newest",
    page = 1,
    limit = 10,
  } = query;

  const match = { userId: new mongoose.Types.ObjectId(userId) };

  if (status) {
    const statuses = String(status).split(",");
    match.status = statuses.length > 1 ? { $in: statuses } : statuses[0];
  }
  if (type) {
    const types = String(type).split(",");
    match.type = types.length > 1 ? { $in: types } : types[0];
  }
  if (applicationId) {
    match.applicationId = new mongoose.Types.ObjectId(applicationId);
  }
  if (when === "upcoming") {
    match.interviewDate = { $gte: new Date() };
  } else if (when === "past") {
    match.interviewDate = { $lt: new Date() };
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * limitNum;
  const sort = SORT_MAP[sortBy] || SORT_MAP.newest;

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: "jobapplications",
        localField: "applicationId",
        foreignField: "_id",
        as: "application",
      },
    },
    { $unwind: "$application" },
  ];

  if (search) {
    const regex = new RegExp(escapeRegExp(search.trim()), "i");
    pipeline.push({
      $match: { $or: [{ "application.company": regex }, { "application.jobTitle": regex }] },
    });
  }

  pipeline.push(
    { $sort: sort },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limitNum },
          {
            $project: {
              round: 1,
              type: 1,
              status: 1,
              interviewDate: 1,
              mode: 1,
              link: 1,
              notes: 1,
              feedback: 1,
              createdAt: 1,
              updatedAt: 1,
              applicationId: "$application._id",
              company: "$application.company",
              jobTitle: "$application.jobTitle",
              location: "$application.location",
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    }
  );

  const [result] = await Interview.aggregate(pipeline);
  const interviews = result?.data || [];
  const total = result?.totalCount?.[0]?.count || 0;

  return {
    interviews,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

// Stat cards for the Interviews list page header. Computed across ALL of
// the user's interviews (not just the current filtered/paged view) — same
// pattern as company.service.js's getOverallStats.
async function getOverallStats(userId) {
  const interviews = await Interview.find({ userId }).select("status");
  return {
    upcoming: interviews.filter((i) => i.status === "Scheduled").length,
    completed: interviews.filter((i) => i.status === "Completed").length,
    passed: interviews.filter((i) => i.status === "Passed").length,
    failed: interviews.filter((i) => i.status === "Failed").length,
    total: interviews.length,
  };
}

// Sibling interviews for the same application, chronologically ordered —
// powers both the Interview Details "Round Progress" timeline and the
// Application Details "Interviews" section. Not paginated: a single
// application is expected to have a handful of rounds at MVP scale.
async function listInterviewsForApplication(userId, applicationId) {
  await assertApplicationOwnership(userId, applicationId);
  const interviews = await Interview.find({ userId, applicationId }).sort({
    interviewDate: 1,
    createdAt: 1,
  });
  return interviews;
}

module.exports = {
  createInterview,
  getOwnedInterview,
  updateInterview,
  deleteInterview,
  updateStatus,
  listInterviews,
  getOverallStats,
  listInterviewsForApplication,
};
