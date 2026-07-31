import {
  HiOutlineDownload,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineEye,
  HiStar,
  HiOutlineStar,
} from "react-icons/hi";
import IconButton from "./IconButton";
import { getResumeColor } from "../utils/resumeColors";
import { formatFileSize } from "../utils/formatBytes";

function formatShortDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ResumeCard({
  resume,
  onPreview,
  onEdit,
  onDownload,
  onDelete,
  onSetDefault,
  isSettingDefault = false,
}) {
  const color = getResumeColor(resume._id);
  const extension = resume.mimeType?.includes("pdf") ? "PDF" : "DOCX";
  const applicationsCount = resume.applicationsCount ?? 0;

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition-smooth hover:shadow-md">
      {/* Preview area */}
      <button
        type="button"
        onClick={() => onPreview(resume)}
        className={`relative flex h-36 w-full items-center justify-center overflow-hidden ${color}`}
      >
        <div className="flex w-28 flex-col gap-1.5 rounded-xl bg-white/20 p-4 backdrop-blur-sm">
          <div className="h-2 w-full rounded-full bg-white/60" />
          <div className="h-1.5 w-3/4 rounded-full bg-white/40" />
          <div className="h-1.5 w-5/6 rounded-full bg-white/40" />
          <div className="h-1.5 w-2/3 rounded-full bg-white/40" />
        </div>
        <span className="absolute left-3 top-3 rounded-md bg-black/20 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {extension}
        </span>
        {/* Default badge, shown right on the thumbnail so it's visible at a
            glance without needing to open the card's action area. */}
        {resume.isDefault && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
            <HiStar className="h-3 w-3 text-amber-400" />
            Default
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors group-hover:bg-black/10 group-hover:opacity-100">
          <span className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-lg">
            <HiOutlineEye className="h-3.5 w-3.5" />
            Preview
          </span>
        </div>
      </button>

      {/* Card body */}
      <div className="p-5">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900">{resume.title}</h3>
          <p className="mt-0.5 text-xs text-slate-400">
            {resume.version} &middot; {formatFileSize(resume.fileSize)}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <span>Updated {formatShortDate(resume.updatedAt)}</span>
          <span className="text-slate-300">&middot;</span>
          <span className="font-medium text-slate-500">
            Used in {applicationsCount} Application{applicationsCount === 1 ? "" : "s"}
          </span>
        </div>

        {/* Tag chips, shown above the action area per the Figma design */}
        {resume.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {resume.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Icon-only actions, bottom-right of the card (three-dot overflow
            menu removed in favor of directly-visible actions). */}
        <div className="mt-4 flex items-center justify-end gap-1 border-t border-slate-100 pt-3">
          {!resume.isDefault && (
            <IconButton
              icon={HiOutlineStar}
              label="Set as Default"
              onClick={() => onSetDefault(resume)}
              disabled={isSettingDefault}
            />
          )}
          <IconButton icon={HiOutlineDownload} label="Download" onClick={() => onDownload(resume)} />
          <IconButton icon={HiOutlinePencilAlt} label="Edit" variant="brand" onClick={() => onEdit(resume)} />
          <IconButton icon={HiOutlineTrash} label="Delete" variant="danger" onClick={() => onDelete(resume)} />
        </div>
      </div>
    </div>
  );
}
