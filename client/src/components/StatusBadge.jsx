import { STATUS_STYLES } from "../constants";

export default function StatusBadge({ status, className = "" }) {
  const style = STATUS_STYLES[status] || "bg-slate-100 text-slate-600 border border-slate-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${style} ${className}`}
    >
      {status}
    </span>
  );
}
