import { useEffect, useRef, useState } from "react";
import {
  HiOutlineDownload,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineDotsVertical,
  HiStar,
  HiOutlineStar,
} from "react-icons/hi";
// Overflow menu is intentionally minimal: "Set as Default" and "Delete" are
// the only actions that don't already have a dedicated control elsewhere on
// the card (Preview lives on the thumbnail, Download/Rename-Replace live in
// the card footer via onDownload/onEdit).
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
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const color = getResumeColor(resume._id);
  const extension = resume.mimeType?.includes("pdf") ? "PDF" : "DOCX";

  // Closing on outside click / Escape is standard menu behavior the rest of
  // the app already gets "for free" from native <select>s — a custom
  // dropdown needs to implement it explicitly to feel equally polished.
  useEffect(() => {
    if (!showMenu) return undefined;

    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setShowMenu(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showMenu]);

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
        <div className="mb-2 flex items-start justify-between">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-slate-900">{resume.title}</h3>
            <p className="mt-0.5 text-xs text-slate-400">
              {resume.version} &middot; {formatFileSize(resume.fileSize)}
            </p>
          </div>
          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={showMenu}
              aria-label="More actions"
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-smooth hover:bg-slate-100 hover:text-slate-600 ${
                showMenu ? "bg-slate-100 text-slate-600" : ""
              }`}
            >
              <HiOutlineDotsVertical className="h-4 w-4" />
            </button>
            {showMenu && (
              <div
                role="menu"
                className="absolute right-0 top-full z-10 mt-1.5 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
              >
                {!resume.isDefault && (
                  <button
                    role="menuitem"
                    disabled={isSettingDefault}
                    onClick={() => {
                      setShowMenu(false);
                      onSetDefault(resume);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <HiOutlineStar className="h-4 w-4 text-slate-400" />
                    {isSettingDefault ? "Setting as default…" : "Set as Default"}
                  </button>
                )}
                {!resume.isDefault && <div className="my-1 border-t border-slate-100" />}
                <button
                  role="menuitem"
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(resume);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50"
                >
                  <HiOutlineTrash className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="mb-4 text-xs text-slate-400">Updated {formatShortDate(resume.updatedAt)}</p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onDownload(resume)}
            className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 transition-smooth hover:bg-slate-50"
          >
            <HiOutlineDownload className="h-3.5 w-3.5" />
            Download
          </button>
          <button
            onClick={() => onEdit(resume)}
            className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-50 text-xs font-medium text-brand-700 transition-smooth hover:bg-brand-100"
          >
            <HiOutlinePencilAlt className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
