import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineArrowPath,
  HiOutlineBriefcase,
  HiOutlinePlus,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineDocumentText,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

import {
  HiOutlineCheckCircle,
  HiOutlineMinus,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
} from "react-icons/hi2";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useAuth } from "../hooks/useAuth";
import { getDashboardOverviewRequest } from "../api/dashboardService";

const activityConfig = {
  application_created: {
    icon: HiOutlinePlus,
    bg: "bg-blue-50",
    color: "text-blue-600",
  },

  interview_scheduled: {
    icon: HiOutlineCalendar,
    bg: "bg-violet-50",
    color: "text-violet-600",
  },

  status_updated: {
    icon: HiOutlineCheckCircle,
    bg: "bg-emerald-50",
    color: "text-emerald-600",
  },

  rejected: {
    icon: HiOutlineXCircle,
    bg: "bg-red-50",
    color: "text-red-600",
  },

  default: {
    icon: HiOutlineDocumentText,
    bg: "bg-slate-100",
    color: "text-slate-500",
  },
};

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";

  return "Good Evening";
}

function TrendBadge({ trend }) {
  if (trend === 0) {
    return (
      <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
        <HiOutlineMinus className="h-3 w-3" />
        No change
      </span>
    );
  }

  const up = trend > 0;

  return (
    <span
      className={`flex items-center gap-1 text-xs font-medium ${
        up ? "text-emerald-600" : "text-red-500"
      }`}
    >
      {up ? (
        <HiOutlineArrowTrendingUp className="h-3 w-3" />
      ) : (
        <HiOutlineArrowTrendingDown className="h-3 w-3" />
      )}

      {up ? "+" : ""}
      {trend}
    </span>
  );
}

function getCompanyInitial(company) {
  return company?.charAt(0)?.toUpperCase() || "?";
}

function getCompanyColor(company) {
  const colors = [
    "bg-indigo-500",
    "bg-blue-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
  ];

  let hash = 0;

  for (let i = 0; i < company.length; i++) {
    hash += company.charCodeAt(i);
  }

  return colors[hash % colors.length];
}

function formatInterviewDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatInterviewTime(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

const interviewStatusColors = {
  Scheduled:
    "bg-blue-50 text-blue-700 border border-blue-200",

  Completed:
    "bg-gray-100 text-gray-700 border border-gray-200",

  Passed:
    "bg-emerald-50 text-emerald-700 border border-emerald-200",

  Failed:
    "bg-red-50 text-red-700 border border-red-200",

  Cancelled:
    "bg-orange-50 text-orange-700 border border-orange-200",

  Rescheduled:
    "bg-amber-50 text-amber-700 border border-amber-200",
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const firstName = user?.fullName?.split(" ")[0] || "there";

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await getDashboardOverviewRequest();

      setDashboard(response.dashboard);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {getGreeting()}, {firstName} 👋
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            You have{" "}
            <span className="font-medium text-slate-700">
              {dashboard?.summary.interviewsThisWeek ?? 0} interviews
            </span>{" "}
            this week and{" "}
            <span className="font-medium text-slate-700">
              {dashboard?.summary.followUpsDueThisWeek ?? 0} follow-ups
            </span>{" "}
            due.
          </p>
        </div>

        <button
          onClick={() => navigate("/applications/new")}
          className="flex items-center gap-2 h-10 px-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-brand-200"
        >
          <HiOutlinePlus className="h-4 w-4" />
          Add Application
        </button>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <HiOutlineArrowPath className="mx-auto h-8 w-8 animate-spin text-brand-600" />
          <p className="mt-4 text-slate-500">Loading dashboard...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
          <HiOutlineExclamationTriangle className="mx-auto h-8 w-8 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-red-700">
            Failed to load dashboard
          </h2>
          <p className="mt-2 text-sm text-red-600">{error}</p>

          <button
            onClick={fetchDashboard}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <HiOutlineArrowPath className="h-4 w-4" />
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                  <HiOutlineCheckCircle className="h-5 w-5 text-brand-600" />
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    Application Goal
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {dashboard.goal.monthLabel} · {dashboard.goal.daysRemaining} days remaining
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {dashboard.goal.onTrack && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    On Track
                  </span>
                )}

                <span className="text-sm font-semibold text-slate-900">
                  {dashboard.goal.current}

                  <span className="font-normal text-slate-400">
                    {" "}
                    / {dashboard.goal.target}
                  </span>
                </span>
              </div>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-600 transition-all duration-700"
                style={{
                  width: `${dashboard.goal.percent}%`,
                }}
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {dashboard.goal.percent}% of monthly target
              </span>

              <span className="text-xs text-slate-400">
                Target: {dashboard.goal.target} applications
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Applications",
                value: dashboard.kpis.applications.value,
                trend: dashboard.kpis.applications.trend,
                unit: dashboard.kpis.applications.unit,
                icon: HiOutlineBriefcase,
                color: "text-brand-600",
                bg: "bg-brand-50",
              },
              {
                label: "Interviews",
                value: dashboard.kpis.interviews.value,
                trend: dashboard.kpis.interviews.trend,
                unit: dashboard.kpis.interviews.unit,
                icon: HiOutlineCalendar,
                color: "text-violet-600",
                bg: "bg-violet-50",
              },
              {
                label: "Follow-ups",
                value: dashboard.kpis.followUps.value,
                trend: dashboard.kpis.followUps.trend,
                unit: dashboard.kpis.followUps.unit,
                icon: HiOutlineClock,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
              {
                label: "Deadlines",
                value: dashboard.kpis.deadlines.value,
                trend: dashboard.kpis.deadlines.trend,
                unit: dashboard.kpis.deadlines.unit,
                icon: HiOutlineExclamationTriangle,
                color: "text-rose-600",
                bg: "bg-rose-50",
              },
            ].map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.bg}`}
                    >
                      <Icon className={`h-4.5 w-4.5 ${card.color}`} />
                    </div>

                    <TrendBadge trend={card.trend} />
                  </div>

                  <p className="text-3xl font-bold text-slate-900">
                    {card.value}
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {card.label}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {card.unit}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Application Funnel
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Hiring pipeline conversion — this month
                </p>
              </div>
            </div>

            <div className="flex items-stretch gap-0">
              {dashboard.funnel.stages.map((stage, index) => {
                const isLast = index === dashboard.funnel.stages.length - 1;

                const barHeight = 8 + Math.round((stage.percent / 100) * 28);

                const isOffer = stage.label === "Offer";

                return (
                  <div
                    key={stage.label}
                    className="flex flex-1 items-center gap-0"
                  >
                    <div className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex w-full flex-col items-center">
                        <div
                          className={`w-full rounded-lg ${
                            isOffer
                              ? "bg-emerald-500"
                              : "bg-brand-600"
                          }`}
                          style={{
                            height: `${barHeight}px`,
                            opacity: 1 - index * 0.12,
                          }}
                        />
                      </div>

                      <div className="text-center">
                        <p className="text-xl font-bold text-slate-900">
                          {stage.count}
                        </p>

                        <p className="mt-0.5 text-xs font-medium text-slate-600">
                          {stage.label}
                        </p>

                        <p
                          className={`mt-0.5 text-[11px] font-semibold ${
                            isOffer
                              ? "text-emerald-600"
                              : "text-brand-600"
                          }`}
                        >
                          {stage.percent}%
                        </p>
                      </div>
                    </div>

                    {!isLast && (
                      <div className="mx-1 mt-2 flex shrink-0 self-start">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M7 4L13 10L7 16"
                            stroke="#CBD5E1"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="mt-4 border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400">
              Overall offer rate{" "}
              <span className="font-semibold text-slate-700">
                {dashboard.funnel.offerRate}%
              </span>

              {" · "}

              Interview conversion{" "}
              <span className="font-semibold text-slate-700">
                {dashboard.funnel.interviewConversionRate}%
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Upcoming Interviews
                  </h2>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {dashboard.upcomingInterviews.length} scheduled
                  </p>
                </div>

                <Link
                  to="/interviews"
                  className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  View all
                </Link>
              </div>

              {dashboard.upcomingInterviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-6">
                  <HiOutlineCalendar className="h-8 w-8 text-slate-300 mb-3" />

                  <p className="text-sm font-medium text-slate-500">
                    No upcoming interviews
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Schedule your next interview from an application.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {dashboard.upcomingInterviews.slice(0, 4).map((interview, index, interviews) => (
                    <Link
                      key={interview.id}
                      to={`/interviews/${interview.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className={`h-10 w-10 rounded-xl flex items-center justify-center text-white font-semibold ${getCompanyColor(
                          interview.company
                        )}`}
                      >
                        {getCompanyInitial(interview.company)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 truncate">
                          {interview.company}
                        </h3>

                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {interview.jobTitle}
                        </p>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <HiOutlineClock className="h-3.5 w-3.5" />

                          <span>
                            {formatInterviewDate(interview.interviewDate)}
                          </span>

                          <span>•</span>

                          <span>
                            {formatInterviewTime(interview.interviewDate)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${
                            interviewStatusColors[interview.status]
                          }`}
                        >
                          {interview.status}
                        </span>

                        <span className="text-[11px] text-slate-400">
                          {interview.round}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="border-t border-slate-100 bg-slate-50/40 px-5 py-3">
                <Link
                  to="/interviews/new"
                  className="flex items-center justify-center gap-2 text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  <HiOutlinePlus className="h-4 w-4" />
                  Schedule Interview
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Recent Activity
                  </h2>

                  <p className="text-xs text-slate-400 mt-0.5">
                    Latest updates from your applications
                  </p>
                </div>

                <Link
                  to="/applications"
                  className="text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  View all
                </Link>
              </div>

              <div className="px-5 py-4">
                {dashboard.recentActivity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <HiOutlineClock className="h-8 w-8 text-slate-300 mb-2" />

                    <p className="text-sm text-slate-500">
                      No recent activity
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboard.recentActivity
                      .slice(0, 5)
                      .map((activity, index, activities) => {
                        const config =
                          activityConfig[activity.type] ?? activityConfig.default;

                        const Icon = config.icon;

                        return (
                          <div key={index} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full ${config.bg}`}
                              >
                                <Icon className={`h-4 w-4 ${config.color}`} />
                              </div>

                              {index !== activities.length - 1 && (
                                <div className="mt-2 h-8 w-px bg-slate-200" />
                              )}
                            </div>

                            <div className="flex-1 pb-2">
                              <p className="text-xs text-slate-500">
                                {activity.label}
                              </p>

                              <p className="mt-0.5 text-sm font-medium text-slate-900">
                                {activity.subject}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {new Date(activity.timestamp).toLocaleString([], {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Upcoming Deadlines
                  </h2>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {dashboard.upcomingDeadlines.length} approaching
                  </p>
                </div>

                <Link
                  to="/applications"
                  className="text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  View all
                </Link>
              </div>

              {dashboard.upcomingDeadlines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <HiOutlineClock className="h-8 w-8 text-slate-300 mb-2" />

                  <p className="text-sm text-slate-500">
                    No upcoming deadlines
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {dashboard.upcomingDeadlines
                    .slice(0, 3)
                    .map((deadline) => {
                      const days = deadline.daysLeft;

                      return (
                        <Link
                          key={deadline.id}
                          to={`/applications/${deadline.applicationId}`}
                          className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
                        >
                          <div
                            className={`h-10 w-10 rounded-xl flex items-center justify-center text-white font-semibold ${getCompanyColor(
                              deadline.company
                            )}`}
                          >
                            {getCompanyInitial(deadline.company)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-slate-900 truncate">
                              {deadline.company}
                            </h3>

                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {deadline.jobTitle}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                              days <= 1
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : days <= 5
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {days === 0
                              ? "Due Today"
                              : days === 1
                              ? "Due Tomorrow"
                              : `${days} days left`}
                          </span>
                        </Link>
                      );
                    })}
                </div>
              )}

              <div className="border-t border-slate-100 bg-slate-50/40 px-5 py-3">
                <Link
                  to="/applications"
                  className="flex items-center justify-center gap-2 text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  View Applications
                </Link>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Status Distribution
                  </h2>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {dashboard.statusDistribution.total} total applications
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">

                {/* Donut */}

                <div
                  className="relative shrink-0"
                  style={{
                    width: 150,
                    height: 150,
                  }}
                >
                  <ResponsiveContainer
                    width={150}
                    height={150}
                  >
                    <PieChart>
                      <Pie
                        data={dashboard.statusDistribution.buckets}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={70}
                        dataKey="count"
                        paddingAngle={2}
                        strokeWidth={0}
                      >
                        {dashboard.statusDistribution.buckets.map((item) => (
                          <Cell
                            key={item.key}
                            fill={item.color}
                          />
                        ))}
                      </Pie>

                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-slate-900">
                      {dashboard.statusDistribution.total}
                    </span>

                    <span className="text-[10px] text-slate-400">
                      total
                    </span>
                  </div>
                </div>

                {/* Legend */}

                <div className="flex-1 space-y-3">
                  {dashboard.statusDistribution.buckets.map((bucket) => (
                    <div
                      key={bucket.key}
                      className="flex items-center gap-3"
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{
                          backgroundColor: bucket.color,
                        }}
                      />

                      <span className="flex-1 text-sm text-slate-700">
                        {bucket.label}
                      </span>

                      <span className="text-sm font-semibold text-slate-900">
                        {bucket.count}
                      </span>

                      <span className="w-10 text-right text-xs text-slate-400">
                        {bucket.percent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}