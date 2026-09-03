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

// Maps an interview's outcome onto its parent application. Only the
// Interview `status` values that represent an actual scheduling event or a
// definite result drive an application change — "Completed" (attended,
// verdict pending) and "Cancelled" don't map onto a clear application
// outcome, so they intentionally leave the application's current status
// untouched rather than guessing.
function applyInterviewOutcome(application, interview) {
  switch (interview.status) {
    // Still on the calendar (or moved to a new time) — the application is
    // actively in its interview stage, and the application's
    // "Interview Date" is kept in sync with this interview's date/time.
    case "Scheduled":
    case "Rescheduled":
      application.status = "Interview";
      application.interviewDate = interview.interviewDate;
      break;

    case "Failed":
      application.status = "Rejected";
      break;

    // Passing a round means the process continues. `application.status`
    // (per docs/DATABASE_DESIGN.md / application.constants.js) has no
    // granular "which round" state beyond "Interview", so passing any
    // round other than the final one just confirms the application stays
    // at "Interview" (the next round is pending). Passing the final round
    // ("Offer Call") means the offer was extended, so the application
    // moves to "Offer".
    case "Passed":
      application.status = interview.round === "Offer Call" ? "Offer" : "Interview";
      break;

    default:
      break;
  }
}

async function syncApplicationFromInterview(applicationId, interview) {
  const application = await JobApplication.findById(applicationId);
  if (!application) return;

  applyInterviewOutcome(application, interview);
  await application.save();
}

// Recomputes an application's status/interviewDate from whatever interviews
// still exist for it — used after an interview is deleted, or moved to a
// different application, so the application never keeps stale state from an
// interview that no longer belongs to it.
async function resyncApplicationFromRemainingInterviews(userId, applicationId) {
  const application = await JobApplication.findById(applicationId);
  if (!application) return;

  const remaining = await Interview.find({ userId, applicationId }).sort({
    interviewDate: -1,
  });

  if (remaining.length === 0) {
    application.interviewDate = null;
    // Only step back to "Applied" if the status was actually
    // interview-driven — an application the user has since moved to
    // Offer/Accepted/Rejected shouldn't be silently reverted just because
    // its last interview record was removed.
    if (application.status === "Interview") {
      application.status = "Applied";
    }
    await application.save();
    return;
  }

  // The most recently-scheduled remaining interview is the best signal for
  // the application's current status/date.
  applyInterviewOutcome(application, remaining[0]);
  await application.save();
}

async function createInterview(userId, payload) {
  const data = pickWritableFields(payload);
  await assertApplicationOwnership(userId, data.applicationId);
  const interview = await Interview.create({ ...data, userId });

  await syncApplicationFromInterview(interview.applicationId, interview);

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
  const previousApplicationId = interview.applicationId;

  Object.assign(interview, data);
  await interview.save();

  await syncApplicationFromInterview(interview.applicationId, interview);

  // Interview was moved to a different application — the old application
  // no longer has it, so resync that one too from whatever interviews (if
  // any) still remain on it.
  if (data.applicationId && String(data.applicationId) !== String(previousApplicationId)) {
    await resyncApplicationFromRemainingInterviews(userId, previousApplicationId);
  }

  return interview;
}

async function deleteInterview(userId, id) {
  const interview = await Interview.findOneAndDelete({ _id: id, userId });
  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }

  await resyncApplicationFromRemainingInterviews(userId, interview.applicationId);

  return interview;
}

// Quick status transition (e.g. "Mark Complete", "Cancel") without
// resending the full form — mirrors application.service.js's updateStatus.
async function updateStatus(userId, id, status) {
  const interview = await getOwnedInterview(userId, id);
  interview.status = status;
  await interview.save();

  await syncApplicationFromInterview(interview.applicationId, interview);

  return interview;
}

const SORT_MAP = {
  newest: { interviewDate: -1 },
  oldest: { interviewDate: 1 },
};

// A generous separation between buckets so a bucket index can be combined
// with a millisecond epoch timestamp into one sortable number without the
// two ever overlapping.
const BUCKET_SPAN = 1e15;

// The Interviews page groups results into three sections — Upcoming,
// Needs Update (overdue), Completed — see client/src/pages/Interviews.jsx.
// A plain ascending/descending date sort doesn't match that grouping: it
// sorts by absolute date only, so once a user has any overdue "Scheduled"
// interviews (an older, smaller date), those sort ahead of a genuinely
// upcoming one on page 1, silently pushing new upcoming interviews onto
// page 2+ and making them look "missing". This computed rank instead
// always orders: (1) upcoming, soonest first, (2) overdue/needs-update,
// most recently overdue first, (3) everything else (completed/passed/
// failed/cancelled), most recent first — matching the page's own grouping
// regardless of how the pages are paginated.
function buildUpcomingSortStages(now) {
  return [
    {
      $addFields: {
        _bucket: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [
                    { $in: ["$status", ["Scheduled", "Rescheduled"]] },
                    { $gte: ["$interviewDate", now] },
                  ],
                },
                then: 0, // Upcoming
              },
              {
                case: { $in: ["$status", ["Scheduled", "Rescheduled"]] },
                then: 1, // Needs Update (overdue, still Scheduled/Rescheduled)
              },
            ],
            default: 2, // Completed / Passed / Failed / Cancelled
          },
        },
      },
    },
    {
      $addFields: {
        _sortRank: {
          $add: [
            { $multiply: ["$_bucket", BUCKET_SPAN] },
            {
              $cond: [
                { $eq: ["$_bucket", 0] },
                { $toLong: { $ifNull: ["$interviewDate", new Date(0)] } },
                { $multiply: [{ $toLong: { $ifNull: ["$interviewDate", new Date(0)] } }, -1] },
              ],
            },
          ],
        },
      },
    },
    { $sort: { _sortRank: 1 } },
  ];
}

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

  const now = new Date();
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
    match.interviewDate = { $gte: now };
  } else if (when === "past") {
    match.interviewDate = { $lt: now };
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

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

  if (sortBy === "upcoming") {
    pipeline.push(...buildUpcomingSortStages(now));
  } else {
    pipeline.push({ $sort: SORT_MAP[sortBy] || SORT_MAP.newest });
  }

  pipeline.push(
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
  const interviews = await Interview.find({ userId }).select("status interviewDate");
  const now = new Date();
  return {
    // "Scheduled" only counts as Upcoming while its date/time hasn't passed
    // yet — a Scheduled interview whose date has already gone by is stale
    // (the user forgot to update it) and must not be reported as upcoming.
    upcoming: interviews.filter(
      (i) => i.status === "Scheduled" && i.interviewDate && i.interviewDate >= now
    ).length,
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