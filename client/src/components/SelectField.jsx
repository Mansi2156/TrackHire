import { forwardRef } from "react";
import { HiChevronDown } from "react-icons/hi";

// A plain native <select> styled to match TextField. Using a native select
// (rather than a custom listbox) keeps keyboard/accessibility behavior free
// and works directly with react-hook-form's register().
const SelectField = forwardRef(function SelectField(
  { label, id, error, options, placeholder = "Select...", placeholderDisabled = true, ...rest },
  ref
) {
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
          {placeholder && (
            <option value="" disabled={placeholderDisabled}>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
        <HiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
});

export default SelectField;
