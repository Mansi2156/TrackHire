import { useEffect, useState } from "react";
import { HiOutlineDocumentText, HiOutlineDownload } from "react-icons/hi";
import Modal from "./Modal";
import { fetchResumeBlob, triggerBrowserDownload } from "../api/resumeService";

export default function ResumePreviewModal({ resume, onClose }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const isPdf = resume.mimeType?.includes("pdf");

  useEffect(() => {
    let objectUrl;
    let cancelled = false;

    async function loadPreview() {
      try {
        const blob = await fetchResumeBlob(resume._id, { inline: true });
        if (cancelled) return;
        objectUrl = window.URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPreview();
    return () => {
      cancelled = true;
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [resume._id]);

  async function handleDownload() {
    const blob = await fetchResumeBlob(resume._id);
    triggerBrowserDownload(blob, resume.fileName);
  }

  return (
    <Modal title={resume.title} onClose={onClose} size="lg">
      <div className="flex h-[70vh] flex-col">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-400">Loading preview...</div>
        ) : error ? (
          <div className="flex flex-1 items-center justify-center text-sm text-red-500">{error}</div>
        ) : isPdf ? (
          <iframe title={`${resume.title} preview`} src={blobUrl} className="h-full w-full rounded-lg border border-slate-100" />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <HiOutlineDocumentText className="h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-700">Preview isn't available for DOCX files</p>
            <p className="max-w-xs text-xs text-slate-400">
              Download the file to view it in Word or another document viewer.
            </p>
            <button
              onClick={handleDownload}
              className="mt-1 flex h-9 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition-smooth hover:bg-brand-700"
            >
              <HiOutlineDownload className="h-4 w-4" />
              Download
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
