import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineEye,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineCalendar,
  HiOutlineVideoCamera,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineDesktopComputer,
  HiOutlineClock,
} from "react-icons/hi";
import StatusBadge from "../components/StatusBadge";
import SelectField from "../components/SelectField";
import Pagination from "../components/Pagination";
import IconButton from "../components/IconButton";
import {
  useDeleteInterviewMutation,
  useInterviewStatsQuery,
  useInterviewsQuery,
} from "../hooks/useInterviews";
import {
  INTERVIEW_STATUSES,
  INTERVIEW_TYPES,
  INTERVIEW_STATUS_STYLES,
  INTERVIEW_TYPE_ICONS,
} from "../constants";
import { getCompanyColor, getCompanyInitial } from "../utils/companyAvatar";

const MODE_ICONS = {
  "Video Call": HiOutlineVideoCamera,
  Phone: HiOutlinePhone,
  "On-site": HiOutlineLocationMarker,
  Async: HiOutlineDesktopComputer,
};

function formatDate(value) {
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

// Maps each clickable stat card to the status it filters by and the stats
// key it reads its count from, mirroring the Figma's clickable stat cards.
const STAT_CARDS = [
  { key: "upcoming", label: "Upcoming", status: "Scheduled", tone: "text-blue-600", bg: "bg-blue-50" },
  { key: "completed", label: "Completed", status: "Completed", tone: "text-gray-600", bg: "bg-gray-100" },
  { key: "passed", label: "Passed", status: "Passed", tone: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "failed", label: "Failed", status: "Failed", tone: "text-red-500", bg: "bg-red-50" },
];

export default function Interviews() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
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
      type: type || undefined,
      sortBy: "upcoming",
      page,
      limit: 10,
    }),
    [search, status, type, page]
  );

  const { data, isLoading, isFetching, isError, error } = useInterviewsQuery(params);
  const { data: statsData } = useInterviewStatsQuery();
  const deleteMutation = useDeleteInterviewMutation();

  const interviews = data?.interviews || [];
  const pagination = data?.pagination;
  const stats = statsData?.stats;

  const handleDelete = async (interview) => {
    const confirmed = window.confirm(
      `Delete the ${interview.round} interview at ${interview.company}? This can't be undone.`
    );
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(interview._id);
      toast.success("Interview deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Interviews</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage and track all your interview rounds</p>
        </div>
        <Link
          to="/interviews/new"
          className="flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition-smooth hover:bg-brand-700"
        >
          <HiOutlinePlus className="h-4 w-4" />
          Schedule Interview
        </Link>
      </div>

      {/* Stat cards — clicking one filters the table by that status,
          matching the Figma's clickable stat-card behavior. */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => {
              setStatus((prev) => (prev === card.status ? "" : card.status));
              setPage(1);
            }}
            className={`rounded-2xl border bg-white p-4 text-left shadow-card transition-smooth hover:shadow-md ${
              status === card.status ? "border-brand-300 ring-2 ring-brand-200" : "border-slate-100"
            }`}
          >
            <span className={`mb-3 inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${card.bg} ${card.tone}`}>
              {card.label}
            </span>
            <p className="text-3xl font-bold text-slate-900">{stats ? stats[card.key] : "—"}</p>
            <p className="mt-1 text-xs text-slate-400">{card.label} Interviews</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-card sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <HiOutlineSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search interviews..."
            className="h-10 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-smooth focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          />
        </div>
        <div className="w-full sm:w-44">
          <SelectField
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            placeholder="All statuses"
            placeholderDisabled={false}
            options={INTERVIEW_STATUSES}
          />
        </div>
        <div className="w-full sm:w-48">
          <SelectField
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            placeholder="All types"
            placeholderDisabled={false}
            options={INTERVIEW_TYPES}
          />
        </div>
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
        ) : interviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
              <HiOutlineCalendar className="h-7 w-7 text-brand-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">
              {search || status || type ? "No interviews match your filters" : "No interviews scheduled yet"}
            </h3>
            <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">
              {search || status || type
                ? "Try adjusting your search or filters."
                : "Schedule your first interview to start tracking rounds."}
            </p>
            {!search && !status && !type && (
              <Link
                to="/interviews/new"
                className="mt-4 flex h-9 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition-smooth hover:bg-brand-700"
              >
                <HiOutlinePlus className="h-4 w-4" />
                Schedule Interview
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className={`overflow-x-auto transition-opacity ${isFetching ? "opacity-60" : ""}`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Company & Role", "Round", "Type", "Date & Time", "Mode", "Status", ""].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-medium text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {interviews.map((iv) => {
                    const ModeIcon = MODE_ICONS[iv.mode] || HiOutlineVideoCamera;
                    return (
                      <tr
                        key={iv._id}
                        onClick={() => navigate(`/interviews/${iv._id}`)}
                        className="group cursor-pointer border-b border-slate-50 last:border-0 transition-smooth hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${getCompanyColor(
                                iv.company
                              )}`}
                            >
                              {getCompanyInitial(iv.company)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">{iv.company}</p>
                              <p className="truncate text-xs text-slate-400">{iv.jobTitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-700">{iv.round}</td>
                        <td className="px-5 py-4 text-slate-600">
                          {INTERVIEW_TYPE_ICONS[iv.type]} {iv.type}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-700">{formatDate(iv.interviewDate)}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                            <HiOutlineClock className="h-3 w-3" />
                            {formatTime(iv.interviewDate)}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1.5 text-xs text-slate-500">
                            <ModeIcon className="h-3.5 w-3.5" />
                            {iv.mode}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={iv.status} styles={INTERVIEW_STATUS_STYLES} />
                        </td>
                        <td className="px-5 py-4">
                          <div
                            className="flex items-center justify-end gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <IconButton
                              icon={HiOutlineEye}
                              label="View"
                              onClick={() => navigate(`/interviews/${iv._id}`)}
                            />
                            <IconButton
                              icon={HiOutlinePencilAlt}
                              label="Edit"
                              variant="brand"
                              onClick={() => navigate(`/interviews/${iv._id}/edit`)}
                            />
                            <IconButton
                              icon={HiOutlineTrash}
                              label="Delete"
                              variant="danger"
                              onClick={() => handleDelete(iv)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
