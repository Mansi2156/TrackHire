import { useForm } from "react-hook-form";
import { HiX } from "react-icons/hi";
import TextField from "./TextField";
import TextAreaField from "./TextAreaField";
import SelectField from "./SelectField";
import Button from "./Button";
import { APPLICATION_STATUSES, JOB_TYPES, WORK_MODES } from "../constants";

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
  resumeVersion: "",
  status: "Applied",
  notes: "",
};

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
    formState: { errors },
  } = useForm({
    defaultValues: {
      ...EMPTY_DEFAULTS,
      ...defaultValues,
      appliedDate: toDateInputValue(defaultValues?.appliedDate || new Date()),
      interviewDate: toDateInputValue(defaultValues?.interviewDate),
      deadline: toDateInputValue(defaultValues?.deadline),
    },
  });

  const status = watch("status");
  const workMode = watch("workMode");
  const isRemote = workMode === "Remote";

  const submit = (data) => {
    // Empty interview/deadline dates should clear the field rather than send "".
    const payload = {
      ...data,
      interviewDate: data.interviewDate || null,
      deadline: data.deadline || null,
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
        <TextField
          id="company"
          label="Company Name *"
          placeholder="e.g. Google"
          error={errors.company?.message}
          {...register("company", {
            required: "Company name is required",
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
      <div className="grid grid-cols-2 gap-6">
        <TextField
          id="appliedDate"
          label="Application Date *"
          type="date"
          error={errors.appliedDate?.message}
          {...register("appliedDate", { required: "Application date is required" })}
        />
        <TextField id="interviewDate" label="Interview Date" type="date" {...register("interviewDate")} />
      </div>

      {/* Deadline */}
      <TextField id="deadline" label="Application Deadline" type="date" {...register("deadline")} />

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
            message: "Include https:// at the start of the URL",
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
        <TextField
          id="resumeVersion"
          label="Resume Version"
          placeholder="e.g. Frontend Resume v3"
          {...register("resumeVersion")}
        />
      </div>

      {/* Notes */}
      <TextAreaField
        id="notes"
        label="Notes"
        placeholder="Any notes, referrals, or reminders..."
        rows={3}
        {...register("notes")}
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
