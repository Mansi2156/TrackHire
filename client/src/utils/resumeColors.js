// 5 predefined preview colors, matching the approved Figma design's resume
// card palette (indigo/brand, emerald, orange, violet) plus one extra
// (rose) so a 5th+ resume doesn't repeat a color before it has to.
const PALETTE = ["bg-brand-500", "bg-emerald-500", "bg-orange-500", "bg-violet-500", "bg-rose-500"];

// Deterministic hash on the resume id so a given resume always renders with
// the same color, regardless of sort order or which page of results it's on.
export function getResumeColor(resumeId) {
  const str = String(resumeId || "");
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) % PALETTE.length;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}