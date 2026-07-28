import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  HiArrowLeft,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineGlobeAlt,
  HiOutlineLocationMarker,
  HiOutlineOfficeBuilding,
  HiOutlineBriefcase,
} from "react-icons/hi";
import StatusBadge from "../components/StatusBadge";
import {
  useCompanyApplicationsQuery,
  useCompanyQuery,
  useCompanyStatsQuery,
  useDeleteCompanyMutation,
} from "../hooks/useCompanies";
import { getCompanyColor, getCompanyInitial } from "../utils/companyAvatar";
import { formatRelativeDays } from "../utils/relativeTime";

function formatShortDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useCompanyQuery(id);
  const { data: statsData } = useCompanyStatsQuery(id);
  const { data: applicationsData } = useCompanyApplicationsQuery(id);
  const deleteMutation = useDeleteCompanyMutation();
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

  const company = data.company;
  const stats = statsData?.stats;
  const applications = applicationsData?.applications || [];

  const handleDelete = async () => {
    if (isDeleting) return;
    const confirmed = window.confirm(
      `Delete ${company.name}? Applications linked to it will be kept, just unlinked. This can't be undone.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(company._id);
      toast.success("Company deleted");
      navigate("/companies");
    } catch (err) {
      toast.error(err.message);
      setIsDeleting(false);
    }
  };

  const statCards = [
    { label: "Total Applications", value: stats?.totalApplications ?? "—", tone: "text-slate-900" },
    { label: "Active", value: stats?.activeApplications ?? "—", tone: "text-brand-600" },
    { label: "Interviews", value: stats?.interviews ?? "—", tone: "text-amber-600" },
    { label: "Offers", value: stats?.offers ?? "—", tone: "text-emerald-600" },
    { label: "Rejections", value: stats?.rejections ?? "—", tone: "text-red-500" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
      <Link
        to="/companies"
        className="group mb-6 flex items-center gap-2 text-sm text-slate-500 transition-smooth hover:text-slate-700"
      >
        <HiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Companies
      </Link>

      {/* Header */}
      <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-8 shadow-card">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-5">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-sm ${getCompanyColor(
                company.name
              )}`}
            >
              {getCompanyInitial(company.name)}
            </div>
            <div>
              <h1 className="mb-1 text-2xl font-bold text-slate-900">{company.name}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                {company.industry && (
                  <span className="inline-flex items-center gap-1">
                    <HiOutlineOfficeBuilding className="h-3.5 w-3.5 text-slate-400" />
                    {company.industry}
                  </span>
                )}
                {company.location && (
                  <span className="inline-flex items-center gap-1">
                    <HiOutlineLocationMarker className="h-3.5 w-3.5 text-slate-400" />
                    {company.location}
                  </span>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700"
                  >
                    <HiOutlineGlobeAlt className="h-3.5 w-3.5" />
                    {company.website.replace(/^https?:\/\//i, "")}
                  </a>
                )}
              </div>
              {stats?.lastActivityAt && (
                <p className="mt-2 text-xs text-slate-400">
                  Last activity {formatRelativeDays(stats.lastActivityAt)}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to={`/companies/${company._id}/edit`}
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

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
            <p className={`text-2xl font-bold ${card.tone}`}>{card.value}</p>
            <p className="mt-0.5 text-xs text-slate-400">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {company.description && (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
            <h3 className="mb-3 font-semibold text-slate-900">About</h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {company.description}
            </p>
          </div>
        )}

        {company.notes && (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
            <h3 className="mb-3 font-semibold text-slate-900">Notes</h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{company.notes}</p>
          </div>
        )}

        {/* Related applications */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="font-semibold text-slate-900">Applications at {company.name}</h3>
            <Link
              to="/applications/new"
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              + Add Application
            </Link>
          </div>
          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
                <HiOutlineBriefcase className="h-6 w-6 text-brand-600" />
              </div>
              <p className="text-sm text-slate-500">No applications linked to this company yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Role", "Applied", "Status", "Interview"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app._id}
                    onClick={() => navigate(`/applications/${app._id}`)}
                    className="cursor-pointer border-b border-slate-50 last:border-0 transition-smooth hover:bg-slate-50"
                  >
                    <td className="px-6 py-3.5 font-medium text-slate-800">{app.jobTitle}</td>
                    <td className="px-6 py-3.5 text-slate-500">{formatShortDate(app.appliedDate)}</td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">{formatShortDate(app.interviewDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
