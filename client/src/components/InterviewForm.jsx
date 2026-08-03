import { useForm } from "react-hook-form";
import {
  HiOutlineVideoCamera,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineDesktopComputer,
  HiOutlineLink,
  HiX,
} from "react-icons/hi";
import TextField from "./TextField";
import TextAreaField from "./TextAreaField";
import SelectField from "./SelectField";
import ApplicationSelectField from "./ApplicationSelectField";
import Button from "./Button";
import { useApplicationsQuery } from "../hooks/useApplications";
import {
  INTERVIEW_ROUNDS,
  INTERVIEW_TYPES,
  INTERVIEW_MODES,
  INTERVIEW_STATUSES,
} from "../constants";

const MODE_ICONS = {
  "Video Call": HiOutlineVideoCamera,
  Phone: HiOutlinePhone,
  "On-site": HiOutlineLocationMarker,
  Async: HiOutlineDesktopComputer,
};

// input[type=date]/input[type=time] need local "YYYY-MM-DD"/"HH:MM" values.
// Using toISOString() here would shift the day/time for any user not in
// UTC, so these read from the Date object's local getters instead.
function toLocalDateValue(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toLocalTimeValue(date) {
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mi}`;
}

function splitInterviewDate(value) {
  if (!value) return { interviewDateOnly: "", interviewTimeOnly: "" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { interviewDateOnly: "", interviewTimeOnly: "" };
  return {
    interviewDateOnly: toLocalDateValue(date),
    interviewTimeOnly: toLocalTimeValue(date),
  };
}

const EMPTY_DEFAULTS = {
  applicationId: "",
  round: INTERVIEW_ROUNDS[0],
  type: INTERVIEW_TYPES[0],
  interviewDateOnly: "",
  interviewTimeOnly: "",
  mode: "Video Call",
  link: "",
  notes: "",
  feedback: "",
  status: "Scheduled",
};

export default function InterviewForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Schedule Interview",
  onCancel,
}) {
  const { interviewDateOnly, interviewTimeOnly } = splitInterviewDate(defaultValues?.interviewDate);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ...EMPTY_DEFAULTS,
      applicationId: defaultValues?.applicationId?._id || defaultValues?.applicationId || "",
      round: defaultValues?.round || EMPTY_DEFAULTS.round,
      type: defaultValues?.type || EMPTY_DEFAULTS.type,
      interviewDateOnly,
      interviewTimeOnly,
      mode: defaultValues?.mode || EMPTY_DEFAULTS.mode,
      link: defaultValues?.link || "",
      notes: defaultValues?.notes || "",
      feedback: defaultValues?.feedback || "",
      status: defaultValues?.status || EMPTY_DEFAULTS.status,
    },
  });

  const applicationId = watch("applicationId");
  const mode = watch("mode");
  const status = watch("status");

  // Same dataset ApplicationSelectField itself fetches — reused here just
  // to render the small "selected application" preview chip beneath it.
  const { data: applicationsData } = useApplicationsQuery({
    archived: "false",
    sortBy: "newest",
    limit: 100,
  });
  const selectedApplication = (applicationsData?.applications || []).find(
    (app) => app._id === applicationId
  );

  const linkLabel =
    mode === "On-site" ? "Office Location" : mode === "Async" ? "Submission Link" : "Meeting Link";
  const linkPlaceholder =
    mode === "On-site" ? "e.g. 1600 Amphitheatre Pkwy, Mountain View" : "https://...";

  const submit = (data) => {
    // Combine the separate date/time inputs into the single interviewDate
    // the API expects, matching how Interview.model.js stores it.
    const combined = new Date(`${data.interviewDateOnly}T${data.interviewTimeOnly || "00:00"}`);
    onSubmit({
      applicationId: data.applicationId,
      round: data.round,
      type: data.type,
      interviewDate: combined.toISOString(),
      mode: data.mode,
      link: data.link.trim(),
      notes: data.notes.trim(),
      feedback: data.feedback.trim(),
      status: data.status,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <ApplicationSelectField
        error={errors.applicationId ? "Please select a job application" : undefined}
        selectedApplication={selectedApplication}
        {...register("applicationId", { required: true })}
      />

      <div className="grid grid-cols-2 gap-6">
        <SelectField
          id="round"
          label="Interview Round *"
          placeholder={null}
          options={INTERVIEW_ROUNDS}
          {...register("round", { required: true })}
        />
        <SelectField
          id="type"
          label="Interview Type *"
          placeholder={null}
          options={INTERVIEW_TYPES}
          {...register("type", { required: true })}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <TextField
          id="interviewDateOnly"
          type="date"
          label="Interview Date *"
          error={errors.interviewDateOnly ? "Interview date is required" : undefined}
          {...register("interviewDateOnly", { required: true })}
        />
        <TextField
          id="interviewTimeOnly"
          type="time"
          label="Interview Time *"
          error={errors.interviewTimeOnly ? "Interview time is required" : undefined}
          {...register("interviewTimeOnly", { required: true })}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Interview Mode *</label>
        <input type="hidden" {...register("mode", { required: true })} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {INTERVIEW_MODES.map((m) => {
            const Icon = MODE_ICONS[m];
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setValue("mode", m, { shouldDirty: true, shouldValidate: true })}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-xs font-medium transition-smooth ${
                  active
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                }`}
              >
                <Icon className={`h-[18px] w-[18px] ${active ? "text-brand-600" : "text-slate-400"}`} />
                {m}
              </button>
            );
          })}
        </div>
      </div>

      <TextField
        id="link"
        label={linkLabel}
        placeholder={linkPlaceholder}
        rightElement={<HiOutlineLink className="h-4 w-4 text-slate-400" />}
        error={errors.link?.message}
        {...register("link", {
          maxLength: { value: 500, message: "This field cannot exceed 500 characters" },
        })}
      />

      <TextAreaField
        id="notes"
        label="Preparation Notes"
        placeholder="What to prepare, topics to study, questions to ask..."
        rows={4}
        error={errors.notes?.message}
        {...register("notes", {
          maxLength: { value: 2000, message: "Preparation notes cannot exceed 2000 characters" },
        })}
      />

      <TextAreaField
        id="feedback"
        label="Feedback & Result"
        placeholder="How did it go? Add feedback and outcome notes after the interview..."
        rows={3}
        error={errors.feedback?.message}
        {...register("feedback", {
          maxLength: { value: 2000, message: "Feedback cannot exceed 2000 characters" },
        })}
      />

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
        <input type="hidden" {...register("status", { required: true })} />
        <div className="flex flex-wrap gap-2">
          {INTERVIEW_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setValue("status", s, { shouldDirty: true, shouldValidate: true })}
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

      <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
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
