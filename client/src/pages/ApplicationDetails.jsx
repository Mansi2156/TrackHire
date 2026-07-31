import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  HiArrowLeft,
  HiOutlineMail,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineArchive,
  HiExternalLink,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineBriefcase,
  HiOutlineCurrencyDollar,
} from "react-icons/hi";
import StatusBadge from "../components/StatusBadge";
import StatusPipeline from "../components/StatusPipeline";
import IconButton from "../components/IconButton";
import {
  useApplicationQuery,
  useArchiveApplicationMutation,
  useDeleteApplicationMutation,
} from "../hooks/useApplications";
import { getCompanyColor, getCompanyInitial } from "../utils/companyAvatar";

function formatDate(value, options = { month: "long", day: "numeric", year: "numeric" }) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", options);
}

export default function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useApplicationQuery(id);
  const archiveMutation = useArchiveApplicationMutation();
  const deleteMutation = useDeleteApplicationMutation();
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

  const app = data.application;

  const handleArchiveToggle = async () => {
    try {
      await archiveMutation.mutateAsync({ id: app._id, archived: !app.archived });
      toast.success(app.archived ? "Application unarchived" : "Application archived");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    const confirmed = window.confirm(
      `Delete the application for ${app.jobTitle} at ${app.company}? This can't be undone.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(app._id);
      toast.success("Application deleted");
      navigate("/applications");
    } catch (err) {
      toast.error(err.message);
      setIsDeleting(false);
    }
  };

  // Compact "Role & Company Information" grid: each cell is a small
  // label/value pair with a matching icon, replacing the previous single
  // middot-joined inline text row for clearer scanning and alignment.
  const infoItems = [
    formatDate(app.appliedDate) && {
      icon: HiOutlineCalendar,
      label: "Applied",
      value: formatDate(app.appliedDate, { month: "short", day: "numeric", year: "numeric" }),
    },
    {
      icon: HiOutlineLocationMarker,
      label: "Location",
      value: app.workMode === "Remote" ? "Remote" : app.location || "—",
    },
    app.jobType && { icon: HiOutlineBriefcase, label: "Employment", value: app.jobType },
    app.salaryRange && { icon: HiOutlineCurrencyDollar, label: "Salary", value: app.salaryRange },
  ].filter(Boolean);

  const details = [
    app.resumeId && {
      label: "Resume Used",
      value: app.resumeId.version ? `${app.resumeId.title} (${app.resumeId.version})` : app.resumeId.title,
    },
    formatDate(app.interviewDate) && {
      label: "Next Interview",
      value: formatDate(app.interviewDate, { month: "short", day: "numeric", year: "numeric" }),
    },
    app.deadline &&
      formatDate(app.deadline) && {
        label: "Deadline",
        value: formatDate(app.deadline, { month: "short", day: "numeric", year: "numeric" }),
      },
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
      <Link
        to="/applications"
        className="group mb-6 flex items-center gap-2 text-sm text-slate-500 transition-smooth hover:text-slate-700"
      >
        <HiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Applications
      </Link>

      {/* Role and Company Information */}
      <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-sm ${getCompanyColor(
                app.company
              )}`}
            >
              {getCompanyInitial(app.company)}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-slate-900">{app.company}</h1>
              <p className="mt-0.5 truncate text-base text-slate-600">{app.jobTitle}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={app.status} />
                {app.archived && (
                  <StatusBadge status="Archived" className="!border-slate-200 !bg-slate-100 !text-slate-500" />
                )}
              </div>
            </div>
          </div>

          {/* Icon-only actions with hover tooltips */}
          <div className="flex shrink-0 items-center gap-1.5 self-start">
            <IconButton
              icon={HiOutlineArchive}
              label={app.archived ? "Unarchive" : "Archive"}
              tooltipPosition="bottom"
              onClick={handleArchiveToggle}
            />
            <IconButton
              icon={HiOutlinePencilAlt}
              label="Edit"
              variant="brand"
              tooltipPosition="bottom"
              onClick={() => navigate(`/applications/${app._id}/edit`)}
            />
            <IconButton
              icon={HiOutlineTrash}
              label="Delete"
              variant="danger"
              tooltipPosition="bottom"
              onClick={handleDelete}
              disabled={isDeleting}
            />
          </div>
        </div>

        {/* Compact, well-aligned info grid (replaces the old inline
            middot-separated meta line) */}
        {infoItems.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-slate-100 pt-5 sm:grid-cols-4">
            {infoItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 md:col-span-2">
          {(app.recruiterName || app.recruiterEmail) && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
              <h3 className="mb-4 font-semibold text-slate-900">Recruiter Information</h3>
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 font-semibold text-brand-700">
                  {(app.recruiterName || "?")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{app.recruiterName || "—"}</p>
                  {app.recruiterEmail && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-400">
                      <HiOutlineMail className="h-3.5 w-3.5" />
                      {app.recruiterEmail}
                    </p>
                  )}
                </div>
                {app.recruiterEmail && (
                  <a
                    href={`mailto:${app.recruiterEmail}`}
                    className="flex h-9 items-center gap-2 rounded-xl border border-brand-200 px-4 text-sm font-medium text-brand-600 transition-smooth hover:bg-brand-50"
                  >
                    <HiOutlineMail className="h-4 w-4" />
                    Email
                  </a>
                )}
              </div>
            </div>
          )}

          {app.jobDescription && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Job Description</h3>
                {app.applicationUrl && (
                  <a
                    href={app.applicationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    View posting <HiExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {app.jobDescription}
              </p>
            </div>
          )}

          {app.notes && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
              <h3 className="mb-3 font-semibold text-slate-900">Notes</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{app.notes}</p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
            <h3 className="mb-5 font-semibold text-slate-900">Application Timeline</h3>
            <StatusPipeline status={app.status} />
          </div>

          {details.length > 0 && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
              <h3 className="mb-4 font-semibold text-slate-900">Details</h3>
              <div className="space-y-3">
                {details.map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-2">
                    <span className="shrink-0 text-xs text-slate-400">{label}</span>
                    <span className="text-right text-xs font-medium text-slate-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
