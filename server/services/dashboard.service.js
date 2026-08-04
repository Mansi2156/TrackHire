const JobApplication = require("../models/JobApplication.model");
const Interview = require("../models/Interview.model");
const { TERMINAL_STATUSES } = require("../constants/application.constants");

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// ─────────────────────────────────────────────────────────────────────────
// MVP assumptions (no schema changes — every figure below is derived from
// fields that already exist per docs/DATABASE_DESIGN.md). Documented here,
// and in PROJECT_IMPLEMENTATION_GUIDE.md's Phase 7 section, since none of
// these are literal fields Applications/Interviews store directly.
//
// - Monthly application goal: there's no per-user goal-setting UI yet
//   (Settings is out of MVP scope per docs/MVP_SCOPE.md), so the target is a
//   fixed constant rather than a stored value. Revisit if/when Settings adds
//   a real "set your monthly goal" control.
// - "Follow-up due": an application is considered to need a follow-up once
//   it's been exactly FOLLOW_UP_WAIT_DAYS since `appliedDate` with no
//   progress (`status` still "Applied") — a standard "nudge if you haven't
//   heard back in a week" heuristic. There's no dedicated follow-up
//   field/collection in the schema.
// - Recent Activity: there's no activity-log collection (`activityLogs` is
//   explicitly listed as Out of MVP in docs/DATABASE_DESIGN.md's Future
//   Scope). The feed is synthesized from real, individually-timestamped
//   events we do have: an application's `createdAt` ("Applied to"), an
//   application reaching a terminal/notable status (`updatedAt`, only for
//   Offer/Accepted/Rejected — the best available proxy for "when that
//   status was reached" without a change-history log), and an interview's
//   `createdAt` ("Interview scheduled"). This means edits that don't change
//   status won't show up, and a status reached then later changed again
//   would only show its most recent value — acceptable for an MVP activity
//   feed, not a substitute for real audit logging.
// - Application Funnel: the Figma's stage labels (HR Screen, Technical,
//   Final Round) are milestones driven by real Interview `round`/`type`
//   values, not application.status directly — see the FUNNEL_STAGES
//   comment further down for the exact mapping and reasoning.
// - Status Distribution: built from applications' CURRENT `status` only
//   (there's no stage-history log), so a Rejected/Withdrawn/Closed
//   application is not retroactively counted at whichever pipeline stage
//   it reached before exiting — only its final status is known.
// ─────────────────────────────────────────────────────────────────────────

const DEFAULT_MONTHLY_GOAL = 60;
const FOLLOW_UP_WAIT_DAYS = 7;
const UPCOMING_INTERVIEWS_LIMIT = 5;
const UPCOMING_DEADLINES_LIMIT = 5;
const RECENT_ACTIVITY_LIMIT = 8;

// Buckets the Status Distribution donut into the 4 categories the UI shows,
// grouping the 10 granular application statuses (docs/DATABASE_DESIGN.md)
// into "where things stand" at a glance. "Saved" (drafts never submitted)
// is intentionally excluded from every dashboard figure below.
const DISTRIBUTION_BUCKETS = [
  { key: "applied", label: "Applied", color: "#0284C7", statuses: ["Applied", "Screening", "Assessment"] },
  { key: "interview", label: "Interview", color: "#7C3AED", statuses: ["Interview"] },
  { key: "offer", label: "Offer", color: "#059669", statuses: ["Offer", "Accepted"] },
  { key: "rejected", label: "Rejected", color: "#DC2626", statuses: ["Rejected", "Withdrawn", "Closed"] },
];

// The Application Funnel's stage labels (Applied → HR Screen → Technical →
// Final Round → Offer) come straight from the Figma and don't map 1:1 onto
// application.constants.js's generic STATUSES pipeline (which has no "HR
// Screen"/"Technical" concept). Instead each milestone after "Applied" is
// driven by real Interview records (`round`/`type`, per
// docs/DATABASE_DESIGN.md's Interviews section) — the closest real signal
// to what each label describes — with "Offer" falling back to the
// application's own status. Each application is credited with the
// *highest* milestone it has reached, so the funnel is a proper
// monotonically-narrowing pipeline (a Final Round interview implies HR
// Screen and Technical already happened) rather than raw, possibly
// overlapping, per-milestone counts.
const FUNNEL_STAGES = [
  { key: "applied", label: "Applied" },
  { key: "hrScreen", label: "HR Screen" },
  { key: "technical", label: "Technical" },
  { key: "finalRound", label: "Final Round" },
  { key: "offer", label: "Offer" },
];

function highestFunnelStageIndex(app, interviewsForApp) {
  if (["Offer", "Accepted"].includes(app.status)) return 4;
  if (interviewsForApp.some((iv) => iv.round === "Final Round")) return 3;
  if (interviewsForApp.some((iv) => iv.type === "Technical")) return 2;
  if (interviewsForApp.some((iv) => iv.round === "HR Round" || iv.type === "HR")) return 1;
  return 0; // submitted, but hasn't reached a recorded interview milestone yet
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function addDays(date, days) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

function computeGoal(applications, now) {
  const startThis = startOfMonth(now);
  const startNext = addMonths(startThis, 1);
  const current = applications.filter(
    (app) => app.createdAt >= startThis && app.createdAt < startNext
  ).length;

  const daysInMonth = Math.round((startNext - startThis) / MS_PER_DAY);
  const daysElapsed = Math.min(daysInMonth, Math.floor((now - startThis) / MS_PER_DAY) + 1);
  const daysRemaining = Math.max(0, daysInMonth - daysElapsed);

  const percent = Math.min(100, Math.round((current / DEFAULT_MONTHLY_GOAL) * 100));
  const elapsedPercent = Math.round((daysElapsed / daysInMonth) * 100);
  // "On track" if the goal completion percentage is keeping pace with how
  // much of the month has elapsed, with a small 5-point grace margin.
  const onTrack = percent >= elapsedPercent - 5;

  return {
    target: DEFAULT_MONTHLY_GOAL,
    current,
    daysRemaining,
    percent,
    onTrack,
    monthLabel: now.toLocaleString("en-US", { month: "long" }),
  };
}

function computeApplicationsKpi(applications, now) {
  const startThis = startOfMonth(now);
  const startNext = addMonths(startThis, 1);
  const startLast = addMonths(startThis, -1);

  const thisMonth = applications.filter(
    (app) => app.createdAt >= startThis && app.createdAt < startNext
  ).length;
  const lastMonth = applications.filter(
    (app) => app.createdAt >= startLast && app.createdAt < startThis
  ).length;

  return { value: thisMonth, trend: thisMonth - lastMonth, unit: "this month" };
}

function computeInterviewsKpi(interviews, now) {
  // "Scheduled" per the KPI card = still on the calendar — covers both
  // `Scheduled` and `Rescheduled` (a rescheduled interview is still
  // upcoming, just at a new time), matching how Upcoming Interviews and
  // the interviewsThisWeek summary figure both treat these two statuses.
  const scheduledNow = interviews.filter((iv) =>
    ["Scheduled", "Rescheduled"].includes(iv.status)
  ).length;

  // Trend reflects scheduling *activity* (interviews added this week vs the
  // week before), since "currently Scheduled" is a live status snapshot
  // with no history to diff against a week ago.
  const weekAgo = addDays(now, -7);
  const twoWeeksAgo = addDays(now, -14);
  const createdThisWeek = interviews.filter(
    (iv) => iv.createdAt >= weekAgo && iv.createdAt <= now
  ).length;
  const createdPrevWeek = interviews.filter(
    (iv) => iv.createdAt >= twoWeeksAgo && iv.createdAt < weekAgo
  ).length;

  return { value: scheduledNow, trend: createdThisWeek - createdPrevWeek, unit: "scheduled" };
}

// See the FOLLOW_UP_WAIT_DAYS assumption documented above.
function isFollowUpDueInWindow(app, windowStart, windowEnd) {
  if (app.status !== "Applied" || !app.appliedDate) return false;
  const followUpDue = addDays(app.appliedDate, FOLLOW_UP_WAIT_DAYS);
  return followUpDue >= windowStart && followUpDue < windowEnd;
}

function computeFollowUpsKpi(applications, now) {
  const dueThisWeek = applications.filter((app) =>
    isFollowUpDueInWindow(app, now, addDays(now, 7))
  ).length;
  const dueLastWeek = applications.filter((app) =>
    isFollowUpDueInWindow(app, addDays(now, -7), now)
  ).length;

  return { value: dueThisWeek, trend: dueThisWeek - dueLastWeek, unit: "due this week" };
}

function computeDeadlinesKpi(applications, now) {
  const isActive = (app) => app.deadline && !TERMINAL_STATUSES.includes(app.status);

  const dueThisWeek = applications.filter(
    (app) => isActive(app) && app.deadline >= now && app.deadline < addDays(now, 7)
  ).length;
  const dueLastWeek = applications.filter(
    (app) => isActive(app) && app.deadline >= addDays(now, -7) && app.deadline < now
  ).length;

  return { value: dueThisWeek, trend: dueThisWeek - dueLastWeek, unit: "this week" };
}

// Cumulative "reached at least this stage" counts — see the FUNNEL_STAGES
// comment above for why this is driven by Interview round/type rather than
// application.status directly. "Saved" (draft) applications are excluded,
// same as every other dashboard figure.
function computeFunnel(applications, interviewsByApplication) {
  const submitted = applications.filter((app) => app.status !== "Saved");
  const total = submitted.length;

  const highestStageByApp = submitted.map((app) =>
    highestFunnelStageIndex(app, interviewsByApplication.get(String(app._id)) || [])
  );

  const stages = FUNNEL_STAGES.map((stage, idx) => {
    const count = highestStageByApp.filter((highest) => highest >= idx).length;
    return {
      status: stage.key,
      label: stage.label,
      count,
      percent: total ? Math.round((count / total) * 100) : 0,
    };
  });

  const offerCount = stages[4].count;
  const interviewOrBeyondCount = stages[1].count; // reached HR Screen or later

  return {
    total,
    stages,
    offerRate: total ? Math.round((offerCount / total) * 1000) / 10 : 0,
    interviewConversion: total ? Math.round((interviewOrBeyondCount / total) * 1000) / 10 : 0,
  };
}

function computeStatusDistribution(applications) {
  const submitted = applications.filter((app) => app.status !== "Saved");
  const total = submitted.length;

  const buckets = DISTRIBUTION_BUCKETS.map((bucket) => {
    const count = submitted.filter((app) => bucket.statuses.includes(app.status)).length;
    return {
      key: bucket.key,
      label: bucket.label,
      color: bucket.color,
      count,
      percent: total ? Math.round((count / total) * 100) : 0,
    };
  });

  return { total, buckets };
}

function buildUpcomingInterviews(interviews, applicationsById, now) {
  return interviews
    .filter(
      (iv) =>
        ["Scheduled", "Rescheduled"].includes(iv.status) &&
        iv.interviewDate &&
        iv.interviewDate >= now &&
        applicationsById.has(String(iv.applicationId))
    )
    .sort((a, b) => a.interviewDate - b.interviewDate)
    .slice(0, UPCOMING_INTERVIEWS_LIMIT)
    .map((iv) => {
      const app = applicationsById.get(String(iv.applicationId));
      return {
        id: iv._id,
        applicationId: iv.applicationId,
        company: app.company,
        jobTitle: app.jobTitle,
        round: iv.round,
        type: iv.type,
        status: iv.status,
        interviewDate: iv.interviewDate,
      };
    });
}

function buildUpcomingDeadlines(applications, now) {
  return applications
    .filter(
      (app) => app.deadline && app.deadline >= now && !TERMINAL_STATUSES.includes(app.status)
    )
    .sort((a, b) => a.deadline - b.deadline)
    .slice(0, UPCOMING_DEADLINES_LIMIT)
    .map((app) => {
      const daysLeft = Math.max(0, Math.ceil((app.deadline - now) / MS_PER_DAY));
      const urgency = daysLeft <= 1 ? "critical" : daysLeft <= 5 ? "warning" : "normal";
      return {
        applicationId: app._id,
        company: app.company,
        jobTitle: app.jobTitle,
        deadline: app.deadline,
        daysLeft,
        urgency,
      };
    });
}

// Interview round names ("HR Round", "Final Round", "Offer Call") are
// already self-descriptive; numbered rounds ("Round 1"/"Round 2"/"Round 3")
// need the interview `type` alongside them for the activity feed to read
// naturally (e.g. "System Design Round 2"), matching the Figma's Recent
// Activity copy.
function formatInterviewMilestone(interview) {
  const selfDescriptive = ["HR Round", "Final Round", "Offer Call"];
  if (selfDescriptive.includes(interview.round)) return interview.round;
  return `${interview.type} ${interview.round}`;
}

// See the Recent Activity assumption documented above — synthesized from
// real timestamps, not a dedicated activity log (which doesn't exist yet).
// Each event carries a `sentiment` ("neutral" | "positive" | "negative")
// so the frontend can pick the right icon/color (matching the Figma's
// blue "+" / purple calendar / green check / red "x" icons) without
// re-deriving it from `type` + `status` itself.
function buildRecentActivity(applications, interviews, applicationsById) {
  const events = [];

  for (const app of applications) {
    events.push({
      type: "application_created",
      label: "Applied to",
      subject: `${app.company} — ${app.jobTitle}`,
      timestamp: app.createdAt,
      sentiment: "neutral",
    });

    const isNotableStatus = ["Offer", "Accepted", "Rejected"].includes(app.status);
    const wasUpdatedAfterCreation =
      app.updatedAt && app.createdAt && app.updatedAt.getTime() !== app.createdAt.getTime();
    if (isNotableStatus && wasUpdatedAfterCreation) {
      const copy = {
        Offer: { label: "Status updated", suffix: "Offer received 🎉", sentiment: "positive" },
        Accepted: { label: "Status updated", suffix: "Offer accepted", sentiment: "positive" },
        Rejected: { label: "Rejected by", suffix: app.jobTitle, sentiment: "negative" },
      }[app.status];
      events.push({
        type: "status_updated",
        status: app.status,
        label: copy.label,
        subject: `${app.company} — ${copy.suffix}`,
        timestamp: app.updatedAt,
        sentiment: copy.sentiment,
      });
    }
  }

  for (const iv of interviews) {
    const app = applicationsById.get(String(iv.applicationId));
    if (!app) continue;
    events.push({
      type: "interview_scheduled",
      label: "Interview at",
      subject: `${app.company} — ${formatInterviewMilestone(iv)}`,
      timestamp: iv.createdAt,
      sentiment: "neutral",
    });
  }

  return events
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, RECENT_ACTIVITY_LIMIT);
}

// Single optimized read: exactly two queries (Applications, Interviews),
// regardless of how many dashboard widgets need the data — everything else
// below is computed in memory from those two result sets, avoiding N+1
// per-widget queries.
async function getDashboardOverview(userId) {
  const now = new Date();

  const [applications, interviews] = await Promise.all([
    JobApplication.find({ userId, archived: false }).select(
      "company jobTitle status appliedDate deadline interviewDate createdAt updatedAt"
    ),
    Interview.find({ userId }).select("applicationId round type status interviewDate createdAt"),
  ]);

  const applicationsById = new Map(applications.map((app) => [String(app._id), app]));

  const interviewsByApplication = new Map();
  for (const iv of interviews) {
    const key = String(iv.applicationId);
    if (!interviewsByApplication.has(key)) interviewsByApplication.set(key, []);
    interviewsByApplication.get(key).push(iv);
  }

  const kpis = {
    applications: computeApplicationsKpi(applications, now),
    interviews: computeInterviewsKpi(interviews, now),
    followUps: computeFollowUpsKpi(applications, now),
    deadlines: computeDeadlinesKpi(applications, now),
  };

  const interviewsThisWeek = interviews.filter(
    (iv) =>
      ["Scheduled", "Rescheduled"].includes(iv.status) &&
      iv.interviewDate &&
      iv.interviewDate >= now &&
      iv.interviewDate < addDays(now, 7)
  ).length;

  return {
    goal: computeGoal(applications, now),
    kpis,
    funnel: computeFunnel(applications, interviewsByApplication),
    statusDistribution: computeStatusDistribution(applications),
    upcomingInterviews: buildUpcomingInterviews(interviews, applicationsById, now),
    upcomingDeadlines: buildUpcomingDeadlines(applications, now),
    recentActivity: buildRecentActivity(applications, interviews, applicationsById),
    summary: {
      interviewsThisWeek,
      followUpsDueThisWeek: kpis.followUps.value,
    },
  };
}

module.exports = { getDashboardOverview };
