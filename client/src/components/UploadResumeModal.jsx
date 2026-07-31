import { useRef, useState } from "react";
import { HiOutlineCloudUpload, HiOutlineDocumentText } from "react-icons/hi";
import Modal from "./Modal";
import TextField from "./TextField";
import Button from "./Button";
import { RESUME_ACCEPTED_EXTENSIONS, RESUME_MAX_FILE_SIZE_BYTES } from "../constants";

function isAcceptedFile(file) {
  const name = file.name.toLowerCase();
  return RESUME_ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export default function UploadResumeModal({ onClose, onUpload, isSubmitting }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  function validateAndSetFile(candidate) {
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
    setFile(candidate);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    validateAndSetFile(e.dataTransfer.files?.[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError("Please select a resume file to upload");
      return;
    }
    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    await onUpload({ file, title: title.trim(), tags: parsedTags });
  }

  return (
    <Modal title="Upload Resume" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-smooth ${
            isDragging ? "border-brand-400 bg-brand-50/40" : "border-slate-200 hover:border-brand-300 hover:bg-brand-50/20"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={RESUME_ACCEPTED_EXTENSIONS.join(",")}
            className="hidden"
            onChange={(e) => validateAndSetFile(e.target.files?.[0])}
          />
          {file ? (
            <>
              <HiOutlineDocumentText className="h-8 w-8 text-brand-600" />
              <p className="text-sm font-medium text-slate-800">{file.name}</p>
              <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB &middot; Click to change</p>
            </>
          ) : (
            <>
              <HiOutlineCloudUpload className="h-8 w-8 text-slate-400" />
              <p className="text-sm font-medium text-slate-600">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-400">PDF or DOCX, up to 5MB</p>
            </>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}

        <TextField
          id="resume-title"
          label="Resume Name (optional)"
          placeholder="e.g. Frontend Developer Resume"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextField
          id="resume-tags"
          label="Tags (optional)"
          placeholder="e.g. React, Frontend, Remote"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <p className="-mt-2 text-xs text-slate-400">Separate tags with commas.</p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-smooth hover:bg-slate-50"
          >
            Cancel
          </button>
          <Button type="submit" isLoading={isSubmitting} className="w-auto">
            Upload Resume
          </Button>
        </div>
      </form>
    </Modal>
  );
}
