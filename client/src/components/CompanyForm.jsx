import { useForm } from "react-hook-form";
import { HiOutlineOfficeBuilding, HiX } from "react-icons/hi";
import TextField from "./TextField";
import TextAreaField from "./TextAreaField";
import SelectField from "./SelectField";
import Button from "./Button";
import { INDUSTRIES } from "../constants";

const EMPTY_DEFAULTS = {
  name: "",
  website: "",
  industry: "",
  location: "",
  description: "",
  notes: "",
};

const EDITABLE_FIELDS = Object.keys(EMPTY_DEFAULTS);

function pickEditableFields(source) {
  if (!source) return {};
  const picked = {};
  for (const field of EDITABLE_FIELDS) {
    if (source[field] !== undefined) picked[field] = source[field];
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

export default function CompanyForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Add Company",
  onCancel,
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ...EMPTY_DEFAULTS,
      ...pickEditableFields(defaultValues),
    },
  });

  const name = watch("name");
  const industry = watch("industry");
  const location = watch("location");

  const submit = (data) => {
    const trimmed = trimStrings(data);
    onSubmit({
      ...trimmed,
      website: trimmed.website || "",
      industry: trimmed.industry || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      {/* Live preview, mirrors the Figma "Add New Company" card header */}
      <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <HiOutlineOfficeBuilding className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{name || "Company Name"}</p>
          <p className="truncate text-sm text-slate-400">
            {industry || "Industry"} &middot; {location || "Location"}
          </p>
        </div>
      </div>

      <TextField
        id="name"
        label="Company Name *"
        placeholder="e.g. Google"
        error={errors.name?.message}
        {...register("name", {
          required: "Company name is required",
          validate: (value) => value.trim().length > 0 || "Company name is required",
          maxLength: { value: 200, message: "Company name is too long" },
        })}
      />

      <div className="grid grid-cols-2 gap-6">
        <TextField
          id="website"
          label="Website"
          placeholder="e.g. google.com"
          error={errors.website?.message}
          {...register("website", {
            validate: (value) => {
              if (!value || !value.trim()) return true;
              const isValidDomain = /^(https?:\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)+([/?#].*)?$/i.test(
                value.trim()
              );
              return isValidDomain || "Please enter a valid website URL";
            },
            maxLength: { value: 300, message: "Website URL is too long" },
          })}
        />
        <SelectField
          id="industry"
          label="Industry"
          placeholder="Select industry"
          placeholderDisabled={false}
          options={INDUSTRIES}
          {...register("industry")}
        />
      </div>

      <TextField
        id="location"
        label="Location"
        placeholder="e.g. San Francisco, CA or Remote"
        error={errors.location?.message}
        {...register("location", {
          maxLength: { value: 200, message: "Location is too long" },
        })}
      />

      <TextAreaField
        id="description"
        label="Description"
        placeholder="Brief company overview — what they do, their mission, size..."
        rows={4}
        error={errors.description?.message}
        {...register("description", {
          maxLength: { value: 2000, message: "Description cannot exceed 2000 characters" },
        })}
      />

      <TextAreaField
        id="notes"
        label="Notes"
        placeholder="Personal notes, referrals, culture observations..."
        rows={3}
        error={errors.notes?.message}
        {...register("notes", {
          maxLength: { value: 2000, message: "Notes cannot exceed 2000 characters" },
        })}
      />

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
