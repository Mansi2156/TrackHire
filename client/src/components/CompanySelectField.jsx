import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { useCompaniesQuery } from "../hooks/useCompanies";

// Enhances the plain free-text Company Name field with a native <datalist>
// of the user's already-created Companies, so re-applying to a tracked
// company shows up as a pick-from-list suggestion — while still allowing a
// brand-new company name to be typed freely. Company Management (Phase 4)
// deliberately kept applications auto-linked by name match rather than a
// hard <select> picker (see IMPLEMENTATION_RULES.md/PROJECT_IMPLEMENTATION
// _GUIDE.md's Phase 4 decision), since a closed dropdown would block adding
// an application for a company the user hasn't tracked yet. A <datalist>
// gets the "select from created companies" experience without that
// regression or any change to the existing required/validation behavior.
const CompanySelectField = forwardRef(function CompanySelectField(
  { id = "company", label = "Company Name", error, placeholder, ...rest },
  ref
) {
  const listId = `${id}-companies-list`;
  // A generous limit keeps this a single request for realistic MVP usage;
  // matches the "Company Name" sort so suggestions read alphabetically.
  const { data } = useCompaniesQuery({ sortBy: "name", limit: 100 });
  const companies = data?.companies || [];

  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        type="text"
        placeholder={placeholder}
        list={companies.length > 0 ? listId : undefined}
        className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-smooth focus:outline-none focus:ring-2 focus:ring-brand-500/40 ${
          error ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-brand-500"
        }`}
        {...rest}
      />
      {companies.length > 0 && (
        <datalist id={listId}>
          {companies.map((company) => (
            <option key={company._id} value={company.name} />
          ))}
        </datalist>
      )}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      {companies.length === 0 && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
          <HiOutlineOfficeBuilding className="h-3.5 w-3.5 shrink-0" />
          <span>
            No tracked companies yet —{" "}
            <Link to="/companies/new" className="font-medium text-brand-600 hover:underline">
              add one
            </Link>{" "}
            or just type a name.
          </span>
        </p>
      )}
    </div>
  );
});

export default CompanySelectField;
