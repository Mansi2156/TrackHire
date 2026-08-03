import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { HiChevronDown, HiOutlineExclamationCircle, HiOutlineBriefcase } from "react-icons/hi";
import { useApplicationsQuery } from "../hooks/useApplications";
import { getCompanyColor, getCompanyInitial } from "../utils/companyAvatar";

// A required-field counterpart to ResumeSelectField: lists the user's own
// (active) job applications as "Company — Role" options for "which
// application is this interview round for". Fetches a generous,
// unpaginated page — plenty for MVP scale, and avoids standing up a
// separate "search applications" endpoint just for this dropdown.
const ApplicationSelectField = forwardRef(function ApplicationSelectField(
  { id = "applicationId", label = "Job Application *", error, selectedApplication, ...rest },
  ref
) {
  const { data, isLoading, isError } = useApplicationsQuery({
    archived: "false",
    sortBy: "newest",
    limit: 100,
  });
  const applications = data?.applications || [];

  if (isLoading) {
    return (
      <div>
        {label && <p className="mb-1.5 block text-sm font-medium text-slate-700">{label}</p>}
        <div className="flex h-[42px] animate-pulse items-center rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-400">
          Loading applications…
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        {label && <p className="mb-1.5 block text-sm font-medium text-slate-700">{label}</p>}
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-600">
          <HiOutlineExclamationCircle className="h-4 w-4 shrink-0" />
          Couldn't load your applications. Refresh the page to try again.
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div>
        {label && <p className="mb-1.5 block text-sm font-medium text-slate-700">{label}</p>}
        <div className="flex items-start gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500">
          <HiOutlineBriefcase className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span>
            No applications yet —{" "}
            <Link to="/applications/new" className="font-medium text-brand-600 hover:underline">
              add one
            </Link>{" "}
            before scheduling an interview.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          ref={ref}
          className={`w-full appearance-none rounded-lg border bg-white px-3.5 py-2.5 pr-9 text-sm text-slate-900 transition-smooth focus:outline-none focus:ring-2 focus:ring-brand-500/40 ${
            error ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-brand-500"
          }`}
          {...rest}
        >
          <option value="">Select application...</option>
          {applications.map((app) => (
            <option key={app._id} value={app._id}>
              {app.company} — {app.jobTitle}
            </option>
          ))}
        </select>
        <HiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
      {selectedApplication && (
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2">
          <div
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white ${getCompanyColor(
              selectedApplication.company
            )}`}
          >
            {getCompanyInitial(selectedApplication.company)}
          </div>
          <span className="text-xs font-medium text-brand-700">
            {selectedApplication.company} &middot; {selectedApplication.jobTitle} &middot;{" "}
            {selectedApplication.status}
          </span>
        </div>
      )}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
});

export default ApplicationSelectField;
