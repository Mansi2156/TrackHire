import { forwardRef } from "react";

const TextField = forwardRef(function TextField(
  { label, id, error, type = "text", rightElement, ...rest },
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
        <input
          id={id}
          ref={ref}
          type={type}
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-smooth focus:outline-none focus:ring-2 focus:ring-brand-500/40 ${
            error
              ? "border-red-400 focus:border-red-500"
              : "border-slate-200 focus:border-brand-500"
          } ${rightElement ? "pr-10" : ""}`}
          {...rest}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
});

export default TextField;
