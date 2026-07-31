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

// Full-sentence variant for the Applications list row ("Applied 3 days
// ago"), rather than the compact "3d ago" used elsewhere. Returns null (not
// a placeholder string) when there's no date, since callers only render
// this line when it's meaningful.
export function formatAppliedDaysAgo(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Applied today";
  if (diffDays === 1) return "Applied 1 day ago";
  return `Applied ${diffDays} days ago`;
}