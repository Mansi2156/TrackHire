import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { HiChevronDown, HiOutlineExclamationCircle, HiOutlineDocumentText } from "react-icons/hi";

function resumeOptionLabel(resume) {
  return resume.version ? `${resume.title} (${resume.version})` : resume.title;
}

// A presentational counterpart to SelectField: same visual language, but
// aware of the three states a remote-backed dropdown can be in (loading /
// errored / empty) instead of assuming `options` is always ready. Data
// fetching and default-resume preselection are the caller's responsibility
// (ApplicationForm), matching how the rest of the form already owns its
// own business logic (e.g. the Saved-status date-clearing effect).
const ResumeSelectField = forwardRef(function ResumeSelectField(
  { id = "resumeId", label = "Resume", error, resumes = [], isLoading = false, isError = false, ...rest },
  ref
) {
  if (isLoading) {
    return (
      <div>
        {label && <p className="mb-1.5 block text-sm font-medium text-slate-700">{label}</p>}
        <div className="flex h-[42px] animate-pulse items-center rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-400">
          Loading resumes…
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
          Couldn't load your resumes. Refresh the page to try again.
        </div>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div>
        {label && <p className="mb-1.5 block text-sm font-medium text-slate-700">{label}</p>}
        <div className="flex items-start gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500">
          <HiOutlineDocumentText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span>
            No resumes uploaded yet.{" "}
            <Link to="/resumes" className="font-medium text-brand-600 hover:underline">
              Upload one
            </Link>{" "}
            to attach it to this application.
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
          <option value="">No resume selected</option>
          {resumes.map((resume) => (
            <option key={resume._id} value={resume._id}>
              {resumeOptionLabel(resume)}
              {resume.isDefault ? " — Default" : ""}
            </option>
          ))}
        </select>
        <HiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
});

export default ResumeSelectField;
