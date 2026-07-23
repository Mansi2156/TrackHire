import { forwardRef } from "react";

const TextAreaField = forwardRef(function TextAreaField(
  { label, id, error, rows = 4, ...rest },
  ref
) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        className={`w-full resize-none rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-smooth focus:outline-none focus:ring-2 focus:ring-brand-500/40 ${
          error ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-brand-500"
        }`}
        {...rest}
      />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
});

export default TextAreaField;
