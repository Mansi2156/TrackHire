const PALETTE = [
  "bg-blue-500",
  "bg-brand-500",
  "bg-orange-500",
  "bg-slate-800",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-cyan-600",
];

export function getCompanyInitial(company) {
  return (company || "?").trim().charAt(0).toUpperCase() || "?";
}

// Simple deterministic hash so the same company name always gets the same
// color, without needing to store a logo/color field on the application.
export function getCompanyColor(company) {
  const str = company || "";
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) % PALETTE.length;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
