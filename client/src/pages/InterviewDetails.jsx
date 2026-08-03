import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  HiArrowLeft,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineExternalLink,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineVideoCamera,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineDesktopComputer,
  HiOutlineDocumentText,
  HiOutlineChatAlt2,
  HiCheck,
} from "react-icons/hi";
import StatusBadge from "../components/StatusBadge";
import IconButton from "../components/IconButton";
import {
  useApplicationInterviewsQuery,
  useDeleteInterviewMutation,
  useInterviewQuery,
} from "../hooks/useInterviews";
import { INTERVIEW_STATUS_STYLES, INTERVIEW_TYPE_ICONS } from "../constants";
import { getCompanyColor, getCompanyInitial } from "../utils/companyAvatar";

const MODE_ICONS = {
  "Video Call": HiOutlineVideoCamera,
  Phone: HiOutlinePhone,
  "On-site": HiOutlineLocationMarker,
  Async: HiOutlineDesktopComputer,
};

function formatFullDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function InterviewDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useInterviewQuery(id);
  const interview = data?.interview;
  const applicationId = interview?.applicationId?._id || interview?.applicationId;
  // Sibling interviews for the same application, chronologically ordered —
  // this is what actually powers the "Round Progress" timeline below,
  // rather than a fixed hardcoded round list: every step shown genuinely
  // exists as a scheduled/completed Interview record for this application.
  const { data: siblingData } = useApplicationInterviewsQuery(applicationId);
  const deleteMutation = useDeleteInterviewMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
        <div className="h-48 animate-pulse rounded-2xl border border-slate-100 bg-white" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
          {error.message}
        </div>
      </div>
    );
  }

  const company = interview.applicationId?.company || "Company";
  const role = interview.applicationId?.jobTitle || "";
  const ModeIcon = MODE_ICONS[interview.mode] || HiOutlineVideoCamera;
  const isPassed = interview.status === "Passed";
  const isFailed = interview.status === "Failed";

  const siblingInterviews = siblingData?.interviews || [];
  const currentIndex = siblingInterviews.findIndex((iv) => iv._id === interview._id);
  const related = siblingInterviews.filter((iv) => iv._id !== interview._id);

  const handleDelete = async () => {
    if (isDeleting) return;
    const confirmed = window.confirm(
      `Delete the ${interview.round} interview at ${company}? This can't be undone.`
    );
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(interview._id);
      toast.success("Interview deleted");
      navigate("/interviews");
    } catch (err) {
      toast.error(err.message);
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
      <Link
        to="/interviews"
        className="group mb-6 flex items-center gap-2 text-sm text-slate-500 transition-smooth hover:text-slate-700"
      >
        <HiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Interviews
      </Link>

      {/* Header */}
      <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-7 shadow-card">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-5">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-sm ${getCompanyColor(
                company
              )}`}
            >
              {getCompanyInitial(company)}
            </div>
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{company}</h1>
                <StatusBadge status={interview.status} styles={INTERVIEW_STATUS_STYLES} />
              </div>
              <p className="text-slate-600">{role}</p>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <HiOutlineCalendar className="h-3.5 w-3.5" />
                  {formatFullDate(interview.interviewDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <HiOutlineClock className="h-3.5 w-3.5" />
                  {formatTime(interview.interviewDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <ModeIcon className="h-3.5 w-3.5" />
                  {interview.mode}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to={`/interviews/${interview._id}/edit`}
              className="flex h-9 items-center gap-2 rounded-xl border border-brand-200 px-4 text-sm font-medium text-brand-600 transition-smooth hover:bg-brand-50"
            >
              <HiOutlinePencilAlt className="h-4 w-4" />
              Edit
            </Link>
            <IconButton
              icon={HiOutlineTrash}
              label="Delete"
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
            />
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-5 flex flex-wrap items-center gap-6 border-t border-slate-100 pt-5">
          <div>
            <p className="mb-0.5 text-xs text-slate-400">Round</p>
            <p className="text-sm font-semibold text-slate-900">{interview.round}</p>
          </div>
          <div className="h-8 w-px bg-slate-100" />
          <div>
            <p className="mb-0.5 text-xs text-slate-400">Type</p>
            <p className="text-sm font-semibold text-slate-900">
              {INTERVIEW_TYPE_ICONS[interview.type]} {interview.type}
            </p>
          </div>
          <div className="h-8 w-px bg-slate-100" />
          <div>
            <p className="mb-0.5 text-xs text-slate-400">Mode</p>
            <p className="text-sm font-semibold text-slate-900">{interview.mode}</p>
          </div>
          {interview.link && (
            <>
              <div className="h-8 w-px bg-slate-100" />
              <div>
                <p className="mb-0.5 text-xs text-slate-400">
                  {interview.mode === "On-site" ? "Location" : "Link"}
                </p>
                {interview.mode === "On-site" ? (
                  <p className="text-sm font-semibold text-slate-900">{interview.link}</p>
                ) : (
                  <a
                    href={interview.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
                  >
                    {interview.mode === "Async" ? "Open Submission" : "Join Meeting"}{" "}
                    <HiOutlineExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Main content */}
        <div className="space-y-5 md:col-span-2">
          {(isPassed || isFailed) && (
            <div
              className={`rounded-2xl border p-5 ${
                isPassed ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
              }`}
            >
              <p className={`mb-1 text-sm font-semibold ${isPassed ? "text-emerald-800" : "text-red-700"}`}>
                {isPassed ? "Advanced to next round" : "Did not advance"}
              </p>
              {interview.feedback && (
                <p className={`text-xs leading-relaxed ${isPassed ? "text-emerald-700" : "text-red-600"}`}>
                  {interview.feedback}
                </p>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <HiOutlineDocumentText className="h-4 w-4 text-brand-500" />
              <h3 className="text-sm font-semibold text-slate-900">Preparation Notes</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              {interview.notes || "No preparation notes added."}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HiOutlineChatAlt2 className="h-4 w-4 text-brand-500" />
                <h3 className="text-sm font-semibold text-slate-900">Feedback & Notes</h3>
              </div>
              {!interview.feedback && interview.status === "Scheduled" && (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-600">
                  Add after interview
                </span>
              )}
            </div>
            {interview.feedback ? (
              <p className="text-sm leading-relaxed text-slate-600">{interview.feedback}</p>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <HiOutlineChatAlt2 className="mb-2 h-7 w-7 text-slate-300" />
                <p className="text-sm text-slate-400">No feedback yet</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Add your notes and feedback after the interview
                </p>
              </div>
            )}
          </div>

          {related.length > 0 && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Other Interviews at {company}</h3>
              <div className="space-y-2">
                {related.map((rv) => (
                  <div
                    key={rv._id}
                    onClick={() => navigate(`/interviews/${rv._id}`)}
                    className="flex cursor-pointer items-center gap-4 rounded-xl bg-slate-50 p-3 transition-smooth hover:bg-slate-100"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{rv.round}</p>
                      <p className="text-xs text-slate-400">
                        {rv.type} &middot; {formatShortDate(rv.interviewDate)}
                      </p>
                    </div>
                    <StatusBadge status={rv.status} styles={INTERVIEW_STATUS_STYLES} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {siblingInterviews.length > 1 && (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
              <h3 className="mb-5 text-sm font-semibold text-slate-900">Round Progress</h3>
              <div>
                {siblingInterviews.map((rnd, i) => {
                  const done = i < currentIndex;
                  const active = i === currentIndex;
                  const isLast = i === siblingInterviews.length - 1;
                  const rndPassed = rnd.status === "Passed";
                  const rndFailed = rnd.status === "Failed";
                  return (
                    <div key={rnd._id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-smooth ${
                            done
                              ? "border-brand-600 bg-brand-600"
                              : active
                              ? rndPassed
                                ? "border-emerald-500 bg-emerald-500"
                                : rndFailed
                                ? "border-red-400 bg-red-400"
                                : "border-brand-400 bg-white ring-[3px] ring-brand-50"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          {(done || (active && rndPassed)) && <HiCheck className="h-3 w-3 text-white" />}
                          {active && !rndPassed && !rndFailed && (
                            <div className="h-2 w-2 rounded-full bg-brand-400" />
                          )}
                        </div>
                        {!isLast && (
                          <div className={`mt-1 h-7 w-0.5 ${done ? "bg-brand-200" : "bg-slate-100"}`} />
                        )}
                      </div>
                      <div className={isLast ? "pb-0" : "pb-5"}>
                        <p
                          className={`pt-0.5 text-xs font-medium ${
                            done
                              ? "text-brand-600"
                              : active && rndPassed
                              ? "text-emerald-600"
                              : active && rndFailed
                              ? "text-red-500"
                              : active
                              ? "text-slate-900"
                              : "text-slate-400"
                          }`}
                        >
                          {rnd.round}
                        </p>
                        {active && (
                          <p
                            className={`mt-0.5 text-[11px] font-medium ${
                              rndPassed ? "text-emerald-500" : rndFailed ? "text-red-400" : "text-brand-500"
                            }`}
                          >
                            {rndPassed ? "Passed ✓" : rndFailed ? "Did not pass" : "Current"}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Interview Details</h3>
            <div className="space-y-3">
              {[
                { label: "Round", value: interview.round },
                { label: "Type", value: `${INTERVIEW_TYPE_ICONS[interview.type]} ${interview.type}` },
                { label: "Mode", value: interview.mode },
                { label: "Status", value: interview.status },
                { label: "Date", value: formatShortDate(interview.interviewDate) },
                { label: "Time", value: formatTime(interview.interviewDate) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400">{label}</span>
                  <span className="text-xs font-medium text-slate-700">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
