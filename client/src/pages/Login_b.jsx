import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { HiArrowRight } from "react-icons/hi";
import AuthLayout from "../layouts/AuthLayout";
import TextField from "../components/TextField";
import PasswordField from "../components/PasswordField";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";

const APPLICATION_PREVIEWS = [
  { name: "Google", role: "Senior Engineer", tag: "Interview", tagClass: "bg-white/20" },
  { name: "Stripe", role: "Frontend Dev", tag: "HR Round", tagClass: "bg-white/20" },
  { name: "Vercel", role: "Staff Engineer", tag: "Offer ✓", tagClass: "bg-emerald-400/90 text-emerald-950" },
];

function LoginPanel() {
  return (
    <div className="flex flex-col gap-4">
      {APPLICATION_PREVIEWS.map((item) => (
        <div
          key={item.name}
          className="flex items-center justify-between rounded-2xl bg-white/10 p-4 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-sm font-bold">
              {item.name[0]}
            </div>
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-brand-100">{item.role}</p>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.tagClass}`}>
            {item.tag}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });

  const onSubmit = async (formData) => {
    setServerError("");
    try {
      await login(formData);
      toast.success("Welcome back!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setServerError(error.message);
      toast.error(error.message);
    }
  };

  return (
    <AuthLayout
      panel={<LoginPanel />}
      heading="Track every job application in one place"
      tagline="Stay organized through every stage of your job search — never miss a follow-up again."
    >
      <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
      <p className="mt-1.5 text-sm text-slate-500">
        Sign in to continue tracking your applications
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <TextField
          id="email"
          label="Email address"
          type="email"
          placeholder="rahul@example.com"
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" },
          })}
        />

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            {/* <Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Forgot password?
            </Link> */}
          </div>
          <PasswordField
            id="password"
            label={null}
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register("password", { required: "Password is required" })}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/40"
            {...register("rememberMe")}
          />
          Remember me
        </label>

        <Button type="submit" isLoading={isSubmitting}>
          Sign in to TrackHire
          <HiArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
          Create one free
        </Link>
      </p>
    </AuthLayout>
  );
}
