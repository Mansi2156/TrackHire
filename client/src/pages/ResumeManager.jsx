import { useState } from "react";
import toast from "react-hot-toast";
import { HiOutlineUpload, HiOutlineDocumentText } from "react-icons/hi";
import ResumeCard from "../components/ResumeCard";
import UploadResumeModal from "../components/UploadResumeModal";
import ResumePreviewModal from "../components/ResumePreviewModal";
import EditResumeModal from "../components/EditResumeModal";
import { formatFileSize } from "../utils/formatBytes";
import { fetchResumeBlob, triggerBrowserDownload } from "../api/resumeService";
import {
  useDeleteResumeMutation,
  useRenameResumeMutation,
  useReplaceResumeMutation,
  useResumeStatsQuery,
  useResumesQuery,
  useSetDefaultResumeMutation,
  useUploadResumeMutation,
} from "../hooks/useResumes";

function formatShortDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ResumeManager() {
  const { data: resumesData, isLoading, isError, error } = useResumesQuery();
  const { data: statsData } = useResumeStatsQuery();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewResume, setPreviewResume] = useState(null);
  const [editResume, setEditResume] = useState(null);

  const uploadMutation = useUploadResumeMutation();
  const renameMutation = useRenameResumeMutation();
  const replaceMutation = useReplaceResumeMutation();
  const deleteMutation = useDeleteResumeMutation();
  const setDefaultMutation = useSetDefaultResumeMutation();

  const resumes = resumesData?.resumes || [];
  const stats = statsData?.stats;

  const handleUpload = async ({ file, title }) => {
    try {
      await uploadMutation.mutateAsync({ file, title });
      toast.success("Resume uploaded successfully");
      setUploadOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEditSave = async ({ title, file }) => {
    try {
      if (title) {
        await renameMutation.mutateAsync({ id: editResume._id, title });
      }
      if (file) {
        await replaceMutation.mutateAsync({ id: editResume._id, file });
      }
      toast.success("Resume updated successfully");
      setEditResume(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (resume) => {
    const confirmed = window.confirm(`Delete "${resume.title}"? This can't be undone.`);
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(resume._id);
      toast.success("Resume deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSetDefault = async (resume) => {
    try {
      await setDefaultMutation.mutateAsync(resume._id);
      toast.success(`${resume.title} is now your default resume`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDownload = async (resume) => {
    try {
      const blob = await fetchResumeBlob(resume._id);
      triggerBrowserDownload(blob, resume.fileName);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const statCards = [
    {
      label: "Total Resumes",
      value: stats ? String(stats.totalResumes) : "—",
      sub: stats ? `${stats.totalResumes} uploaded` : "",
    },
    {
      label: "Storage Used",
      value: stats ? formatFileSize(stats.totalStorageBytes) : "—",
      sub: "Across all resumes",
    },
    {
      label: "Default Resume",
      value: stats?.defaultResume?.title || "None set",
      sub: stats?.defaultResume ? stats.defaultResume.version : "Set one from the menu",
    },
    {
      label: "Last Updated",
      value: stats?.lastUpdated ? formatShortDate(stats.lastUpdated.updatedAt) : "—",
      sub: stats?.lastUpdated?.title || "",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resume Manager</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {resumes.length} resume{resumes.length === 1 ? "" : "s"} &middot; Track which resume gets results
          </p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition-smooth hover:bg-brand-700"
        >
          <HiOutlineUpload className="h-4 w-4" />
          Upload Resume
        </button>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
            <p className="mb-1 text-xs text-slate-400">{card.label}</p>
            <p className="truncate font-bold text-slate-900">{card.value}</p>
            <p className="mt-0.5 truncate text-xs text-slate-400">{card.sub}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-sm text-red-600 shadow-card">
          {error.message}
        </div>
      ) : resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white px-6 py-16 text-center shadow-card">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
            <HiOutlineDocumentText className="h-7 w-7 text-brand-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No resumes yet</h3>
          <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">
            Upload different versions of your resume to track which one gets the best results.
          </p>
          <button
            onClick={() => setUploadOpen(true)}
            className="mt-4 flex h-9 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition-smooth hover:bg-brand-700"
          >
            <HiOutlineUpload className="h-4 w-4" />
            Upload Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume._id}
              resume={resume}
              onPreview={setPreviewResume}
              onEdit={setEditResume}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
              isSettingDefault={setDefaultMutation.isPending}
            />
          ))}
        </div>
      )}

      {uploadOpen && (
        <UploadResumeModal
          onClose={() => setUploadOpen(false)}
          onUpload={handleUpload}
          isSubmitting={uploadMutation.isPending}
        />
      )}

      {previewResume && (
        <ResumePreviewModal resume={previewResume} onClose={() => setPreviewResume(null)} />
      )}

      {editResume && (
        <EditResumeModal
          resume={editResume}
          onClose={() => setEditResume(null)}
          onSave={handleEditSave}
          isSubmitting={renameMutation.isPending || replaceMutation.isPending}
        />
      )}
    </div>
  );
}
