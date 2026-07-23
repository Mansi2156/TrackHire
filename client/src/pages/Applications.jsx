import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineArchive,
  HiOutlineTrash,
  HiOutlineBriefcase,
} from "react-icons/hi";
import StatusBadge from "../components/StatusBadge";
import SelectField from "../components/SelectField";
import Pagination from "../components/Pagination";
import {
  useApplicationsQuery,
  useArchiveApplicationMutation,
  useDeleteApplicationMutation,
} from "../hooks/useApplications";
import { APPLICATION_STATUSES, SORT_OPTIONS } from "../constants";
import { getCompanyColor, getCompanyInitial } from "../utils/companyAvatar";

const VIEW_TABS = [
  { value: "false", label: "Active" },
  { value: "true", label: "Archived" },
  { value: "all", label: "All" },
];

function formatShortDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Applications() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [archived, setArchived] = useState("false");
  const [page, setPage] = useState(1);

  // Debounce free-text search so we don't fire a request per keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const params = useMemo(
    () => ({
      search: search || undefined,
      status: status || undefined,
      sortBy,
      archived,
      page,
      limit: 10,
    }),
    [search, status, sortBy, archived, page]
  );

  const { data, isLoading, isFetching, isError, error } = useApplicationsQuery(params);
  const archiveMutation = useArchiveApplicationMutation();
  const deleteMutation = useDeleteApplicationMutation();

  const applications = data?.applications || [];
  const pagination = data?.pagination;

  const handleArchive = async (app, next) => {
    try {
      await archiveMutation.mutateAsync({ id: app._id, archived: next });
      toast.success(next ? "Application archived" : "Application unarchived");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (app) => {
    const confirmed = window.confirm(
      `Delete the application for ${app.jobTitle} at ${app.company}? This can't be undone.`
    );
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(app._id);
      toast.success("Application deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {pagination ? `${pagination.total} application${pagination.total === 1 ? "" : "s"}` : "Track every job opportunity"}
          </p>
        </div>
        <Link
          to="/applications/new"
          className="flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition-smooth hover:bg-brand-700"
        >
          <HiOutlinePlus className="h-4 w-4" />
          Add Application
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-card sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <HiOutlineSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by company or role..."
            className="h-10 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-smooth focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          />
        </div>
        <div className="w-full sm:w-52">
          <SelectField
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            placeholder="All statuses"
            placeholderDisabled={false}
            options={APPLICATION_STATUSES}
          />
        </div>
        <div className="w-full sm:w-44">
          <SelectField
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            placeholder={null}
            options={SORT_OPTIONS}
          />
        </div>
      </div>

      {/* View tabs */}
      <div className="mb-4 flex gap-1 rounded-xl bg-slate-100 p-1 w-fit">
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setArchived(tab.value);
              setPage(1);
            }}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-smooth ${
              archived === tab.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-red-600">{error.message}</div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
              <HiOutlineBriefcase className="h-7 w-7 text-brand-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">
              {search || status ? "No applications match your filters" : "No applications yet"}
            </h3>
            <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">
              {search || status
                ? "Try adjusting your search or filters."
                : "Start tracking your job search by adding your first application."}
            </p>
            {!search && !status && (
              <Link
                to="/applications/new"
                className="mt-4 flex h-9 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition-smooth hover:bg-brand-700"
              >
                <HiOutlinePlus className="h-4 w-4" />
                Add Application
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className={`overflow-x-auto transition-opacity ${isFetching ? "opacity-60" : ""}`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Company", "Role", "Applied", "Status", "Interview", ""].map((h) => (
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
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${getCompanyColor(
                              app.company
                            )}`}
                          >
                            {getCompanyInitial(app.company)}
                          </div>
                          <span className="font-medium text-slate-800">{app.company}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">{app.jobTitle}</td>
                      <td className="px-6 py-3.5 text-slate-500">{formatShortDate(app.appliedDate)}</td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">{formatShortDate(app.interviewDate)}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleArchive(app, !app.archived)}
                            title={app.archived ? "Unarchive" : "Archive"}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-smooth hover:bg-slate-100 hover:text-slate-600"
                          >
                            <HiOutlineArchive className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(app)}
                            title="Delete"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-smooth hover:bg-red-50 hover:text-red-500"
                          >
                            <HiOutlineTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination && (
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
