import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineGlobeAlt,
} from "react-icons/hi";
import SelectField from "../components/SelectField";
import Pagination from "../components/Pagination";
import { useCompaniesQuery, useCompanyStatsOverviewQuery } from "../hooks/useCompanies";
import { INDUSTRIES, COMPANY_SORT_OPTIONS } from "../constants";
import { getCompanyColor, getCompanyInitial } from "../utils/companyAvatar";
import { formatRelativeDays } from "../utils/relativeTime";

export default function Companies() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [sortBy, setSortBy] = useState("newest");
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
      industry: industry || undefined,
      sortBy,
      page,
      limit: 10,
    }),
    [search, industry, sortBy, page]
  );

  const { data, isLoading, isFetching, isError, error } = useCompaniesQuery(params);
  const { data: statsData } = useCompanyStatsOverviewQuery();

  const companies = data?.companies || [];
  const pagination = data?.pagination;
  const stats = statsData?.stats;

  const statCards = [
    { label: "Total", value: stats ? String(stats.totalCompanies) : "—", sub: "Total Companies", tone: "text-slate-900" },
    { label: "Active", value: stats ? String(stats.activeApplications) : "—", sub: "Active Applications", tone: "text-brand-600" },
    { label: "Interviews", value: stats ? String(stats.interviews) : "—", sub: "Interviews", tone: "text-amber-600" },
    { label: "Offers", value: stats ? String(stats.offers) : "—", sub: "Offers", tone: "text-emerald-600" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Track companies you&apos;ve applied to and manage relationships
          </p>
        </div>
        <Link
          to="/companies/new"
          className="flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition-smooth hover:bg-brand-700"
        >
          <HiOutlinePlus className="h-4 w-4" />
          Add Company
        </Link>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{card.label}</p>
            <p className={`text-2xl font-bold ${card.tone}`}>{card.value}</p>
            <p className="mt-0.5 text-xs text-slate-400">{card.sub}</p>
          </div>
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
            placeholder="Search companies..."
            className="h-10 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-smooth focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          />
        </div>
        <div className="w-full sm:w-52">
          <SelectField
            value={industry}
            onChange={(e) => {
              setIndustry(e.target.value);
              setPage(1);
            }}
            placeholder="All Industries"
            placeholderDisabled={false}
            options={INDUSTRIES}
          />
        </div>
        <div className="w-full sm:w-44">
          <SelectField
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            placeholder={null}
            options={COMPANY_SORT_OPTIONS}
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
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
              <HiOutlineOfficeBuilding className="h-7 w-7 text-brand-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">
              {search || industry ? "No companies match your filters" : "No companies yet"}
            </h3>
            <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">
              {search || industry
                ? "Try adjusting your search or filters."
                : "Add companies you're interested in to keep track of them."}
            </p>
            {!search && !industry && (
              <Link
                to="/companies/new"
                className="mt-4 flex h-9 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition-smooth hover:bg-brand-700"
              >
                <HiOutlinePlus className="h-4 w-4" />
                Add Company
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className={`overflow-x-auto transition-opacity ${isFetching ? "opacity-60" : ""}`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Company", "Industry", "Location", "Website", "Applications", "Last Activity"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr
                      key={company._id}
                      onClick={() => navigate(`/companies/${company._id}`)}
                      className="cursor-pointer border-b border-slate-50 last:border-0 transition-smooth hover:bg-slate-50"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${getCompanyColor(
                              company.name
                            )}`}
                          >
                            {getCompanyInitial(company.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-800">{company.name}</p>
                            {company.stats?.offers > 0 && (
                              <span className="mt-0.5 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                Offer received
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        {company.industry ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            <HiOutlineOfficeBuilding className="h-3 w-3" />
                            {company.industry}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">
                        {company.location ? (
                          <span className="inline-flex items-center gap-1">
                            <HiOutlineLocationMarker className="h-3.5 w-3.5 text-slate-400" />
                            {company.location}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        {company.website ? (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700"
                          >
                            <HiOutlineGlobeAlt className="h-3.5 w-3.5" />
                            {company.website.replace(/^https?:\/\//i, "")}
                          </a>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        <span className="font-medium text-slate-800">
                          {company.stats?.totalApplications ?? 0}
                        </span>{" "}
                        apps
                        <br />
                        <span className="text-xs text-slate-400">
                          {company.stats?.interviews ?? 0} interviews
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-400">
                        {formatRelativeDays(company.lastActivityAt)}
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
