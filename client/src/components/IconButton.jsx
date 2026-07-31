import { forwardRef } from "react";

// A small, reusable icon-only action button with a hover/focus tooltip.
// Centralizing this here (rather than each screen re-implementing its own
// title/tooltip markup) keeps the "icon-only actions with tooltips" pattern
// requested across Applications, Application Details, and Resume cards
// visually and behaviorally consistent.
const VARIANT_STYLES = {
  default: "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
  brand: "text-slate-400 hover:bg-brand-50 hover:text-brand-600",
  danger: "text-slate-400 hover:bg-red-50 hover:text-red-500",
  amber: "text-slate-400 hover:bg-amber-50 hover:text-amber-500",
};

const TOOLTIP_POSITION_CLASSES = {
  top: "bottom-full left-1/2 mb-1.5 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-1.5 -translate-x-1/2",
  left: "right-full top-1/2 mr-1.5 -translate-y-1/2",
};

const IconButton = forwardRef(function IconButton(
  {
    icon: Icon,
    label,
    variant = "default",
    tooltipPosition = "top",
    size = "h-8 w-8",
    className = "",
    ...rest
  },
  ref
) {
  return (
    <span className="group/icon-btn relative inline-flex">
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={`flex ${size} items-center justify-center rounded-lg transition-smooth focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-40 ${VARIANT_STYLES[variant]} ${className}`}
        {...rest}
      >
        <Icon className="h-4 w-4" />
      </button>
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-20 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/icon-btn:opacity-100 group-focus-within/icon-btn:opacity-100 ${TOOLTIP_POSITION_CLASSES[tooltipPosition]}`}
      >
        {label}
      </span>
    </span>
  );
});

export default IconButton;
