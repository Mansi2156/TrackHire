import { STATUS_STYLES } from "../constants";

// `styles` defaults to the application STATUS_STYLES map, but callers can
// pass a different one (e.g. INTERVIEW_STATUS_STYLES) to reuse this same
// badge for other status vocabularies without duplicating the component.
export default function StatusBadge({ status, className = "", styles = STATUS_STYLES }) {
  const style = styles[status] || "bg-slate-100 text-slate-600 border border-slate-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${style} ${className}`}
    >
      {status}
    </span>
  );
}
