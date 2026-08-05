import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlineClock,
  HiOutlineExclamation,
} from "react-icons/hi";

import TextField from "../components/TextField";
import TextAreaField from "../components/TextAreaField";
import PasswordField from "../components/PasswordField";
import Button from "../components/Button";
import ConfirmModal from "../components/ConfirmModal";
import { useAuth } from "../hooks/useAuth";
import {
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useUpdateProfileMutation,
  useUpdateRemindersMutation,
} from "../hooks/useUserSettings";
import {
  INTERVIEW_REMINDER_OPTIONS,
  MAX_FOLLOW_UP_REMINDER_DAYS,
  MIN_FOLLOW_UP_REMINDER_DAYS,
} from "../constants";

const TABS = [
  { id: "profile", label: "Profile", icon: HiOutlineUser },
  { id: "password", label: "Password", icon: HiOutlineLockClosed },
  { id: "reminders", label: "Reminders", icon: HiOutlineClock },
  { id: "danger", label: "Danger Zone", icon: HiOutlineExclamation, danger: true },
];

function ProfileTab() {
  const { user, updateUser } = useAuth();
  const updateProfileMutation = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      fullName: user?.fullName || "",
      jobTitle: user?.jobTitle || "",
      location: user?.location || "",
      bio: user?.bio || "",
    },
  });

  const onSubmit = async (formData) => {
    try {
      const data = await updateProfileMutation.mutateAsync(formData);
      updateUser(data.user);
      reset(formData);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <h3 className="text-base font-semibold text-slate-900">Profile Information</h3>
      <p className="mt-1 text-sm text-slate-500">Update your personal details and public profile.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            id="fullName"
            label="Full Name"
            error={errors.fullName?.message}
            {...register("fullName", {
              required: "Full name is required",
              minLength: { value: 2, message: "Full name must be at least 2 characters" },
            })}
          />

          <TextField id="email" label="Email Address" value={user?.email || ""} disabled readOnly />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            id="jobTitle"
            label="Job Title"
            placeholder="Software Engineer"
            error={errors.jobTitle?.message}
            {...register("jobTitle", {
              maxLength: { value: 100, message: "Job title cannot exceed 100 characters" },
            })}
          />

          <TextField
            id="location"
            label="Location"
            placeholder="Bangalore, India"
            error={errors.location?.message}
            {...register("location", {
              maxLength: { value: 200, message: "Location cannot exceed 200 characters" },
            })}
          />
        </div>

        <TextAreaField
          id="bio"
          label="Bio"
          rows={4}
          placeholder="Tell us a little about your experience..."
          error={errors.bio?.message}
          {...register("bio", {
            maxLength: { value: 500, message: "Bio cannot exceed 500 characters" },
          })}
        />

        <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
          <Button type="submit" isLoading={isSubmitting} disabled={!isDirty} className="w-auto px-6">
            Save Changes
          </Button>
          <button
            type="button"
            onClick={() => reset()}
            className="flex h-[42px] items-center rounded-lg px-4 text-sm font-medium text-slate-500 transition-smooth hover:bg-slate-100 hover:text-slate-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function PasswordTab() {
  const [serverError, setServerError] = useState("");
  const changePasswordMutation = useChangePasswordMutation();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });

  const newPassword = watch("newPassword");

  const onSubmit = async (formData) => {
    setServerError("");
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success("Password updated successfully");
      reset();
    } catch (error) {
      setServerError(error.message);
      toast.error(error.message);
    }
  };

  return (
    <div>
      <h3 className="text-base font-semibold text-slate-900">Change Password</h3>
      <p className="mt-1 text-sm text-slate-500">Ensure your account is secured with a strong password.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 max-w-md space-y-5">
        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <PasswordField
          id="currentPassword"
          label="Current Password"
          error={errors.currentPassword?.message}
          {...register("currentPassword", {
            required: "Current password is required",
          })}
        />

        <PasswordField
          id="newPassword"
          label="New Password"
          placeholder="Min. 8 characters"
          error={errors.newPassword?.message}
          {...register("newPassword", {
            required: "Password is required",
            minLength: { value: 8, message: "Password must be at least 8 characters" },
          })}
        />

        <PasswordField
          id="confirmNewPassword"
          label="Confirm New Password"
          placeholder="Repeat new password"
          error={errors.confirmNewPassword?.message}
          {...register("confirmNewPassword", {
            required: "Please confirm your password",
            validate: (value) => value === newPassword || "Passwords do not match",
          })}
        />

        <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
          <Button type="submit" isLoading={isSubmitting} className="w-auto px-6">
            Save Changes
          </Button>
          <button
            type="button"
            onClick={() => {
              reset();
              setServerError("");
            }}
            className="flex h-[42px] items-center rounded-lg px-4 text-sm font-medium text-slate-500 transition-smooth hover:bg-slate-100 hover:text-slate-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function RemindersTab() {
  const { user, updateUser } = useAuth();
  const updateRemindersMutation = useUpdateRemindersMutation();

  const initialInterviewDays = user?.reminders?.interviewReminderDays ?? 1;
  const initialFollowUpDays = user?.reminders?.followUpReminderDays ?? 7;

  const [interviewReminderDays, setInterviewReminderDays] = useState(initialInterviewDays);
  const [followUpReminderDays, setFollowUpReminderDays] = useState(initialFollowUpDays);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty =
    interviewReminderDays !== initialInterviewDays || followUpReminderDays !== initialFollowUpDays;

  const isFollowUpValid =
    Number.isInteger(followUpReminderDays) &&
    followUpReminderDays >= MIN_FOLLOW_UP_REMINDER_DAYS &&
    followUpReminderDays <= MAX_FOLLOW_UP_REMINDER_DAYS;

  const handleReset = () => {
    setInterviewReminderDays(initialInterviewDays);
    setFollowUpReminderDays(initialFollowUpDays);
  };

  const handleSave = async () => {
    if (!isFollowUpValid) {
      toast.error(
        `Follow-up reminder must be between ${MIN_FOLLOW_UP_REMINDER_DAYS} and ${MAX_FOLLOW_UP_REMINDER_DAYS} days`
      );
      return;
    }
    setIsSaving(true);
    try {
      const data = await updateRemindersMutation.mutateAsync({
        interviewReminderDays,
        followUpReminderDays,
      });
      updateUser(data.user);
      toast.success("Reminder settings updated successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h3 className="text-base font-semibold text-slate-900">Reminder Settings</h3>
      <p className="mt-1 text-sm text-slate-500">Configure when and how often you get reminded.</p>

      <div className="mt-6 max-w-md space-y-6">
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Remind before interview</p>
          <div className="flex flex-wrap gap-2">
            {INTERVIEW_REMINDER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setInterviewReminderDays(option.value)}
                className={`h-10 rounded-lg px-4 text-sm font-medium transition-smooth ${
                  interviewReminderDays === option.value
                    ? "bg-brand-600 text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <TextField
          id="followUpReminderDays"
          label="Follow-up after application (days)"
          type="number"
          min={MIN_FOLLOW_UP_REMINDER_DAYS}
          max={MAX_FOLLOW_UP_REMINDER_DAYS}
          value={followUpReminderDays}
          onChange={(e) => setFollowUpReminderDays(Number(e.target.value))}
          error={!isFollowUpValid ? "Enter a value between 1 and 60 days" : undefined}
        />

        <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
          <Button
            type="button"
            onClick={handleSave}
            isLoading={isSaving}
            disabled={!isDirty}
            className="w-auto px-6"
          >
            Save Changes
          </Button>
          <button
            type="button"
            onClick={handleReset}
            className="flex h-[42px] items-center rounded-lg px-4 text-sm font-medium text-slate-500 transition-smooth hover:bg-slate-100 hover:text-slate-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function DangerZoneTab() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const deleteAccountMutation = useDeleteAccountMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDeleteConfirmed = async () => {
    try {
      await deleteAccountMutation.mutateAsync();
      toast.success("Your account has been deleted");
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.message);
      setConfirmOpen(false);
    }
  };

  return (
    <div>
      <h3 className="text-base font-semibold text-slate-900">Danger Zone</h3>
      <p className="mt-1 text-sm text-slate-500">Irreversible and destructive actions.</p>

      <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-red-100 bg-red-50 p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-red-700">Delete Account</p>
          <p className="mt-1 text-sm text-red-600">
            Permanently delete your account and all data. This action cannot be undone.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="flex h-10 shrink-0 items-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition-smooth hover:bg-red-700"
        >
          Delete Account
        </button>
      </div>

      {confirmOpen && (
        <ConfirmModal
          title="Delete your account?"
          message="Your account will be deactivated and you will be signed out immediately. All your applications, resumes, companies, interviews, and related data will no longer be accessible. This action cannot be undone."
          confirmLabel="Delete Account"
          isLoading={deleteAccountMutation.isPending}
          onConfirm={handleDeleteConfirmed}
          onClose={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-0.5 text-sm text-slate-500">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card sm:flex-row">
        <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-100 p-3 sm:w-56 sm:flex-col sm:gap-0.5 sm:border-b-0 sm:border-r sm:p-4">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth ${
                  isActive
                    ? tab.danger
                      ? "bg-red-50 text-red-600"
                      : "bg-brand-50 text-brand-700"
                    : tab.danger
                    ? "text-red-500 hover:bg-red-50"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="flex-1 p-6 sm:p-8">
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "password" && <PasswordTab />}
          {activeTab === "reminders" && <RemindersTab />}
          {activeTab === "danger" && <DangerZoneTab />}
        </div>
      </div>
    </div>
  );
}
