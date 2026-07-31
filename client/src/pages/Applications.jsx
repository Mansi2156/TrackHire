import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineArchive,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineBriefcase,
  HiOutlineX,
} from "react-icons/hi";
import StatusBadge from "../components/StatusBadge";
import SelectField from "../components/SelectField";
import Pagination from "../components/Pagination";
import IconButton from "../components/IconButton";
import {
  useApplicationsQuery,
  useArchiveApplicationMutation,
  useBulkArchiveApplicationsMutation,
  useBulkDeleteApplicationsMutation,
  useDeleteApplicationMutation,
} from "../hooks/useApplications";
import { APPLICATION_STATUSES, SORT_OPTIONS } from "../constants";
import { getCompanyColor, getCompanyInitial } from "../utils/companyAvatar";
import { formatAppliedDaysAgo } from "../utils/relativeTime";

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
  const [selectedIds, setSelectedIds] = useState([]);

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

  // A selection only ever makes sense against the rows currently on screen —
  // clear it whenever the underlying query (filters/sort/page) changes so a
  // stale id from a previous page/filter can never be bulk-acted on silently.
  useEffect(() => {
    setSelectedIds([]);
  }, [params]);

  const { data, isLoading, isFetching, isError, error } = useApplicationsQuery(params);
  const archiveMutation = useArchiveApplicationMutation();
  const deleteMutation = useDeleteApplicationMutation();
  const bulkArchiveMutation = useBulkArchiveApplicationsMutation();
  const bulkDeleteMutation = useBulkDeleteApplicationsMutation();

  const applications = data?.applications || [];
  const pagination = data?.pagination;

  const allSelected = applications.length > 0 && selectedIds.length === applications.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : applications.map((app) => app._id));
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

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

  const handleBulkArchive = async (next) => {
    try {
      await bulkArchiveMutation.mutateAsync({ ids: selectedIds, archived: next });
      toast.success(next ? "Selected applications archived" : "Selected applications unarchived");
      setSelectedIds([]);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBulkDelete = async () => {
    const confirmed = window.confirm(
      `Delete ${selectedIds.length} selected application${selectedIds.length === 1 ? "" : "s"}? This can't be undone.`
    );
    if (!confirmed) return;
    try {
      await bulkDeleteMutation.mutateAsync(selectedIds);
      toast.success("Selected applications deleted");
      setSelectedIds([]);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const isBulkActing = bulkArchiveMutation.isPending || bulkDeleteMutation.isPending;

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
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 w-fit">
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

        {/* Bulk selection action bar */}
        {selectedIds.length > 0 && (
          <div className="flex flex-1 flex-wrap items-center gap-2 rounded-xl border border-brand-100 bg-brand-50/60 px-3 py-1.5">
            <span className="text-xs font-semibold text-brand-700">
              {selectedIds.length} selected
            </span>
            <button
              onClick={() => handleBulkArchive(true)}
              disabled={isBulkActing}
              className="flex h-7 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 transition-smooth hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HiOutlineArchive className="h-3.5 w-3.5" />
              Archive
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isBulkActing}
              className="flex h-7 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 text-xs font-medium text-red-500 transition-smooth hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HiOutlineTrash className="h-3.5 w-3.5" />
              Delete
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-medium text-slate-500 transition-smooth hover:bg-white/70"
            >
              <HiOutlineX className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        )}
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
            {/* max-h + overflow-y-auto gives the sticky header a scroll
                container of its own, so it works regardless of how tall the
                surrounding page layout is. */}
            <div
              className={`max-h-[65vh] overflow-y-auto overflow-x-auto transition-opacity ${isFetching ? "opacity-60" : ""}`}
            >
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_0_0_theme(colors.slate.100)]">
                  <tr>
                    <th className="w-10 px-6 py-3">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected;
                        }}
                        onChange={toggleSelectAll}
                        aria-label="Select all applications on this page"
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 transition-smooth focus:ring-2 focus:ring-brand-500/40"
                      />
                    </th>
                    {["Company", "Role", "Applied", "Status", "Interview", ""].map((h) => (
                      <th key={h} className="bg-white px-6 py-3 text-left text-xs font-medium text-slate-400">
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
                      className="group cursor-pointer border-b border-slate-50 last:border-0 transition-smooth hover:bg-slate-50"
                    >
                      <td className="px-6 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(app._id)}
                          onChange={() => toggleSelectOne(app._id)}
                          aria-label={`Select application for ${app.jobTitle} at ${app.company}`}
                          className="h-4 w-4 rounded border-slate-300 text-brand-600 transition-smooth focus:ring-2 focus:ring-brand-500/40"
                        />
                      </td>
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
                      <td className="px-6 py-3.5 text-slate-500">
                        <p>{formatShortDate(app.appliedDate)}</p>
                        {formatAppliedDaysAgo(app.appliedDate) && (
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {formatAppliedDaysAgo(app.appliedDate)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">{formatShortDate(app.interviewDate)}</td>
                      <td className="px-6 py-3.5">
                        {/* Hover-only (and focus-within, for keyboard users)
                            action icons — invisible until the row is
                            interacted with, keeping the table calm at rest. */}
                        <div
                          className="flex items-center justify-end gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconButton
                            icon={HiOutlineEye}
                            label="View"
                            onClick={() => navigate(`/applications/${app._id}`)}
                          />
                          <IconButton
                            icon={HiOutlineArchive}
                            label={app.archived ? "Unarchive" : "Archive"}
                            onClick={() => handleArchive(app, !app.archived)}
                          />
                          <IconButton
                            icon={HiOutlineTrash}
                            label="Delete"
                            variant="danger"
                            onClick={() => handleDelete(app)}
                          />
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
