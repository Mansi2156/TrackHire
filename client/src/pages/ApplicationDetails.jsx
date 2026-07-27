import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  HiArrowLeft,
  HiOutlineMail,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineArchive,
  HiExternalLink,
} from "react-icons/hi";
import StatusBadge from "../components/StatusBadge";
import StatusPipeline from "../components/StatusPipeline";
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

  const details = [
    app.resumeId && {
      label: "Resume Used",
      value: app.resumeId.version ? `${app.resumeId.title} (${app.resumeId.version})` : app.resumeId.title,
    },
    app.jobType && { label: "Employment", value: app.jobType },
    app.salaryRange && { label: "Salary", value: app.salaryRange },
    app.location && { label: "Location", value: app.location },
    formatDate(app.interviewDate) && {
      label: "Next Interview",
      value: formatDate(app.interviewDate, { month: "short", day: "numeric", year: "numeric" }),
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

      {/* Header */}
      <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-8 shadow-card">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-5">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-sm ${getCompanyColor(
                app.company
              )}`}
            >
              {getCompanyInitial(app.company)}
            </div>
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{app.company}</h1>
                <StatusBadge status={app.status} />
                {app.archived && <StatusBadge status="Archived" className="!bg-slate-100 !text-slate-500 !border-slate-200" />}
              </div>
              <p className="text-lg text-slate-600">{app.jobTitle}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
                {formatDate(app.appliedDate) && <span>Applied {formatDate(app.appliedDate)}</span>}
                {app.location && <span>&middot; {app.location}</span>}
                {app.jobType && <span>&middot; {app.jobType}</span>}
                {app.salaryRange && (
                  <span className="font-medium text-emerald-600">&middot; {app.salaryRange}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={handleArchiveToggle}
              className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition-smooth hover:bg-slate-50"
            >
              <HiOutlineArchive className="h-4 w-4" />
              {app.archived ? "Unarchive" : "Archive"}
            </button>
            <Link
              to={`/applications/${app._id}/edit`}
              className="flex h-9 items-center gap-2 rounded-xl border border-brand-200 px-4 text-sm font-medium text-brand-600 transition-smooth hover:bg-brand-50"
            >
              <HiOutlinePencil className="h-4 w-4" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="flex h-9 items-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-medium text-red-500 transition-smooth hover:bg-red-50"
            >
              <HiOutlineTrash className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
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
