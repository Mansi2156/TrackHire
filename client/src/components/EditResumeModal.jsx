import { useRef, useState } from "react";
import { HiOutlineDocumentText, HiOutlineRefresh } from "react-icons/hi";
import Modal from "./Modal";
import TextField from "./TextField";
import Button from "./Button";
import { RESUME_ACCEPTED_EXTENSIONS, RESUME_MAX_FILE_SIZE_BYTES } from "../constants";

function isAcceptedFile(file) {
  const name = file.name.toLowerCase();
  return RESUME_ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export default function EditResumeModal({ resume, onClose, onSave, isSubmitting }) {
  const [title, setTitle] = useState(resume.title);
  const [replacementFile, setReplacementFile] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const candidate = e.target.files?.[0];
    if (!candidate) return;
    if (!isAcceptedFile(candidate)) {
      setError("Only PDF and DOCX files are supported");
      return;
    }
    if (candidate.size > RESUME_MAX_FILE_SIZE_BYTES) {
      setError("File cannot exceed 5MB");
      return;
    }
    setError("");
    setReplacementFile(candidate);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Resume title is required");
      return;
    }
    await onSave({
      title: title.trim() !== resume.title ? title.trim() : undefined,
      file: replacementFile,
    });
  }

  return (
    <Modal title="Edit Resume" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          id="edit-resume-title"
          label="Resume Name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div>
          <p className="mb-1.5 block text-sm font-medium text-slate-700">Replace File (optional)</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-lg border border-dashed border-slate-200 px-3.5 py-2.5 text-left text-sm text-slate-500 transition-smooth hover:border-brand-300 hover:bg-brand-50/20"
          >
            {replacementFile ? (
              <>
                <HiOutlineDocumentText className="h-4 w-4 shrink-0 text-brand-600" />
                <span className="truncate text-slate-700">{replacementFile.name}</span>
              </>
            ) : (
              <>
                <HiOutlineRefresh className="h-4 w-4 shrink-0 text-slate-400" />
                Keep current file ({resume.fileName})
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={RESUME_ACCEPTED_EXTENSIONS.join(",")}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-smooth hover:bg-slate-50"
          >
            Cancel
          </button>
          <Button type="submit" isLoading={isSubmitting} className="w-auto">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
