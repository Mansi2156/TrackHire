// Simple day-granularity relative time (e.g. "3d ago", "Today"). Deliberately
// coarse — this is a lightweight display detail for list rows, not a
// full i18n relative-time library.
export function formatRelativeDays(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1d ago";
  return `${diffDays}d ago`;
}