import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { HiX } from "react-icons/hi";
import TextField from "./TextField";
import TextAreaField from "./TextAreaField";
import SelectField from "./SelectField";
import ResumeSelectField from "./ResumeSelectField";
import CompanySelectField from "./CompanySelectField";
import Button from "./Button";
import { APPLICATION_STATUSES, JOB_TYPES, WORK_MODES } from "../constants";
import { useResumesQuery } from "../hooks/useResumes";

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

const EMPTY_DEFAULTS = {
  company: "",
  jobTitle: "",
  location: "",
  jobType: "Full-Time",
  workMode: "On-site",
  salaryRange: "",
  appliedDate: toDateInputValue(new Date()),
  interviewDate: "",
  deadline: "",
  recruiterName: "",
  recruiterEmail: "",
  jobDescription: "",
  applicationUrl: "",
  resumeId: "",
  status: "Applied",
  notes: "",
};

// Keys the form actually owns. Used to whitelist incoming defaultValues so
// non-editable fields from the fetched document (_id, userId, createdAt,
// updatedAt, __v, archived) never enter react-hook-form's internal state —
// otherwise they'd ride along in the submitted payload even though no
// input ever renders them.
const EDITABLE_FIELDS = Object.keys(EMPTY_DEFAULTS);

function pickEditableFields(source) {
  if (!source) return {};
  const picked = {};
  for (const field of EDITABLE_FIELDS) {
    if (source[field] !== undefined) picked[field] = source[field];
  }
  // The GET /:id response populates resumeId with { _id, title, version,
  // isDefault } for display purposes elsewhere (ApplicationDetails); the
  // form only ever needs the bare id to match a <select> option's value.
  if (picked.resumeId && typeof picked.resumeId === "object") {
    picked.resumeId = picked.resumeId._id || "";
  }
  return picked;
}

function trimStrings(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = typeof value === "string" ? value.trim() : value;
  }
  return result;
}

export default function ApplicationForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Save Application",
  onCancel,
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ...EMPTY_DEFAULTS,
      ...pickEditableFields(defaultValues),
      appliedDate: toDateInputValue(defaultValues?.appliedDate || new Date()),
      interviewDate: toDateInputValue(defaultValues?.interviewDate),
      deadline: toDateInputValue(defaultValues?.deadline),
    },
  });

  const {
    data: resumesData,
    isLoading: resumesLoading,
    isError: resumesError,
  } = useResumesQuery();
  const resumes = resumesData?.resumes || [];

  const status = watch("status");
  const workMode = watch("workMode");
  const appliedDate = watch("appliedDate");
  const isSaved = status === "Saved";
  const isInterview = status === "Interview";
  const isRemote = workMode === "Remote";
  const isNewApplication = !defaultValues;

  // Saved is a pre-application draft: it has no application/interview date
  // by definition, so both fields are hidden and cleared the moment the
  // status becomes Saved (whether that's the initial value or a switch
  // made mid-edit). This mirrors the backend validator exactly.
  useEffect(() => {
    if (isSaved) {
      setValue("appliedDate", "");
      setValue("interviewDate", "");
    }
  }, [isSaved, setValue]);

  // Only ever preselects for a brand-new application (never overrides an
  // explicit choice already saved on an existing one), and only once
  // resumes have actually loaded and the field is still untouched.
  useEffect(() => {
    if (!isNewApplication || resumesLoading || resumes.length === 0) return;
    if (getValues("resumeId")) return;
    const defaultResume = resumes.find((r) => r.isDefault);
    if (defaultResume) {
      setValue("resumeId", defaultResume._id);
    }
  }, [isNewApplication, resumesLoading, resumes, getValues, setValue]);

  const submit = (data) => {
    const trimmed = trimStrings(data);
    // Empty interview/deadline dates should clear the field rather than send "".
    const payload = {
      ...trimmed,
      appliedDate: isSaved ? null : trimmed.appliedDate,
      interviewDate: isSaved ? null : trimmed.interviewDate || null,
      deadline: trimmed.deadline || null,
      resumeId: trimmed.resumeId || null,
    };
    // Remote roles have no physical location — don't send/store one, even
    // if a value is left over from switching work modes.
    if (isRemote) {
      delete payload.location;
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      {/* Company + Role */}
        <div className="grid grid-cols-2 gap-6">
          <CompanySelectField
            id="company"
            label="Company Name *"
            placeholder="e.g. Google"
            error={errors.company?.message}
            {...register("company", {
              required: "Company name is required",
              validate: (value) => value.trim().length > 0 || "Company name is required",
              maxLength: { value: 200, message: "Company name is too long" },
            })}
          />
          <TextField
            id="jobTitle"
            label="Role / Job Title *"
            placeholder="e.g. Senior Frontend Engineer"
            error={errors.jobTitle?.message}
            {...register("jobTitle", {
              required: "Role / job title is required",
              validate: (value) => value.trim().length > 0 || "Role / job title is required",
              maxLength: { value: 200, message: "Job title is too long" },
            })}
          />
        </div>
      

      {/* Work Mode + Location (Location only applies to On-site/Hybrid) */}
      <div className={`grid gap-6 ${isRemote ? "grid-cols-1" : "grid-cols-2"}`}>
        <SelectField
          id="workMode"
          label="Work Mode"
          options={WORK_MODES}
          placeholder={null}
          {...register("workMode")}
        />
        {!isRemote && (
          <TextField
            id="location"
            label="Location *"
            placeholder="e.g. San Francisco, CA"
            error={errors.location?.message}
            {...register("location", {
              required: "Location is required for On-site or Hybrid work mode",
              validate: (value) =>
                (value && value.trim().length > 0) ||
                "Location is required for On-site or Hybrid work mode",
              maxLength: { value: 200, message: "Location is too long" },
            })}
          />
        )}
      </div>

      {/* Employment + Salary */}
      <div className="grid grid-cols-2 gap-6">
        <SelectField
          id="jobType"
          label="Employment Type"
          options={JOB_TYPES}
          placeholder={null}
          {...register("jobType")}
        />
        <TextField
          id="salaryRange"
          label="Salary Range"
          placeholder="e.g. $120,000 - $150,000"
          {...register("salaryRange")}
        />
      </div>

      {/* Dates */}
      {!isSaved && (
      <div className="grid grid-cols-2 gap-6">
        <TextField
          id="appliedDate"
          label="Application Date *"
          type="date"
          error={errors.appliedDate?.message}
          {...register("appliedDate", {
            validate: (value) => {
              if (isSaved) return true;

              if (!value) {
                return "Application date is required";
              }

              if (new Date(value) > new Date()) {
                return "Application date cannot be in the future";
              }

              return true;
            }
          })}
        />
        <TextField
          id="interviewDate"
          label={isInterview ? "Interview Date *" : "Interview Date"}
          type="date"
          error={errors.interviewDate?.message}
          {...register("interviewDate", {
            validate: (value) => {
              if (isSaved) return true;

              if (isInterview && !value) {
                return "Interview date is required when status is Interview";
              }

              if (!value) return true;

              return (
                new Date(value) >= new Date(appliedDate) ||
                "Interview date cannot be before the application date"
              );
            },
          })}
        />
      </div>
    )}

      {/* Deadline */}
      <TextField
        id="deadline"
        label="Application Deadline"
        type="date"
        error={errors.deadline?.message}
        {...register("deadline", {
          validate: (value) => {
            if (isSaved || !value) return true;

            return (
              new Date(value) >= new Date(appliedDate) ||
              "Deadline cannot be before the application date"
            );
          }
        })}
      />

      {/* Recruiter */}
      <div className="grid grid-cols-2 gap-6">
        <TextField
          id="recruiterName"
          label="Recruiter Name"
          placeholder="e.g. Sarah Chen"
          {...register("recruiterName")}
        />
        <TextField
          id="recruiterEmail"
          label="Recruiter Email"
          type="email"
          placeholder="e.g. sarah@company.com"
          error={errors.recruiterEmail?.message}
          {...register("recruiterEmail", {
            pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" },
          })}
        />
      </div>

      {/* Job Description */}
      <TextAreaField
        id="jobDescription"
        label="Job Description"
        placeholder="Paste the job description here..."
        rows={4}
        {...register("jobDescription")}
      />

      {/* URL */}
      <TextField
        id="applicationUrl"
        label="Application URL"
        type="url"
        placeholder="https://company.com/careers/..."
        error={errors.applicationUrl?.message}
        {...register("applicationUrl", {
          pattern: {
            value: /^https?:\/\/.+/i,
            message: "Enter a valid URL starting with http:// or https://",
          },
        })}
      />

      {/* Status + Resume */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="mb-1.5 block text-sm font-medium text-slate-700">Current Status *</p>
          <div className="flex flex-wrap gap-2">
            {APPLICATION_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setValue("status", s, { shouldDirty: true })}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-smooth ${
                  status === s
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-slate-200 bg-white text-slate-500 hover:border-brand-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <ResumeSelectField
          id="resumeId"
          label="Resume"
          resumes={resumes}
          isLoading={resumesLoading}
          isError={resumesError}
          error={errors.resumeId?.message}
          {...register("resumeId")}
        />
      </div>

      {/* Notes */}
      <TextAreaField
        id="notes"
        label="Notes"
        placeholder="Any notes, referrals, or reminders..."
        rows={3}
        {...register("notes", {
          maxLength: {
            value: 2000,
            message: "Notes cannot exceed 2000 characters",
          },
        })}
      />

      {/* Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" isLoading={isSubmitting} className="w-auto px-6">
          {submitLabel}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-[42px] items-center gap-2 rounded-lg px-6 text-sm font-medium text-slate-500 transition-smooth hover:bg-slate-100 hover:text-slate-700"
        >
          <HiX className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </form>
  );
}
