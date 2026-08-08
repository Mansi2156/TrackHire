import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { HiArrowRight } from "react-icons/hi";
import { Zap } from "lucide-react";

import AuthLayout from "../layouts/AuthLayout";
import TextField from "../components/TextField";
import PasswordField from "../components/PasswordField";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";

const APPLICATION_PREVIEWS = [
  {
    company: "Google",
    role: "Senior Engineer",
    status: "Interview",
    color: "bg-white/10",
    badge: "bg-white/15 text-white/80",
  },
  {
    company: "Stripe",
    role: "Frontend Dev",
    status: "HR Round",
    color: "bg-white/10",
    badge: "bg-white/15 text-white/80",
  },
  {
    company: "Vercel",
    role: "Staff Engineer",
    status: "Offer ✓",
    color: "bg-emerald-400/20",
    badge: "bg-emerald-400/30 text-emerald-200",
  },
];

function LoginPanel() {
  return (
    <div className="relative flex h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-12 text-white">

      {/* Decorations */}

      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/5" />

        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-white/5" />

        <div className="absolute left-1/4 top-1/2 h-48 w-48 rounded-full bg-white/5" />

        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Logo */}

      <div className="relative flex items-center gap-2">
        {/* <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <Zap
            size={18}
            className="text-white"
            fill="white"
          />
        </div> */}
        <div className="flex h-9 w-9 items-center justify-center rounded-lg">
          <img
            src="/trackhire_logo_white1.png"
            alt="TrackHire Logo"
            className="h-full w-full object-contain"
          />
        </div>

        <span className="text-xl font-bold tracking-tight">
          TrackHire
        </span>
      </div>

      {/* Cards */}

      <div className="relative flex flex-1 items-center justify-center -mt-8">

        <div className="w-full max-w-sm space-y-3">

          {APPLICATION_PREVIEWS.map((item, index) => (

            <div
              key={item.company}
              style={{
                transform: `translateX(${index * 8}px)`,
              }}
              className={`${item.color} flex items-center gap-4 rounded-2xl border border-white/10 p-4 backdrop-blur-sm`}
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-sm font-bold">
                {item.company[0]}
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {item.company}
                </p>

                <p className="text-xs text-white/60">
                  {item.role}
                </p>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.badge}`}
              >
                {item.status}
              </span>

            </div>

          ))}

        </div>

      </div>

      {/* Bottom */}

      <div className="relative">

        <h2 className="mb-3 text-3xl font-bold leading-tight">
          Track smarter. Stay organized. Get hired faster.
        </h2>

        <p className="text-sm leading-relaxed text-indigo-200">
          Manage every step of your job search in one place.
        </p>

      </div>

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
  } = useForm({
    mode: "onBlur",
  });

  const onSubmit = async (formData) => {
    setServerError("");

    try {
      await login(formData);

      toast.success("Welcome back!");

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      setServerError(error.message);
      toast.error(error.message);
    }
  };

  return (
    <AuthLayout panel={<LoginPanel />}>
      {/* Mobile Logo */}

      <div className="mb-8 flex items-center gap-2 lg:hidden">
        {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <Zap
            size={16}
            className="text-white"
            fill="white"
          />
        </div> */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg">
          <img
            src="/trackhire_logo.png"
            alt="TrackHire Logo"
            className="h-full w-full object-contain"
          />
        </div>

        <span className="text-lg font-bold tracking-tight text-slate-900">
          TrackHire
        </span>
      </div>

      {/* Heading */}

      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">
          Welcome back
        </h1>

        <p className="text-sm text-slate-500">
          Sign in to continue tracking your applications
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-6"
      >
        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        {/* Google */}

        {/* <button
          type="button"
          className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
          >
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
            />
          </svg>

          Continue with Google
        </button> */}

        {/* Divider */}

        <div className="relative flex items-center">
          <div className="flex-1 border-t border-slate-200" />

          <div className="flex-1 border-t border-slate-200" />
        </div>

        {/* Email */}

        <TextField
          id="email"
          label="Email address"
          type="email"
          placeholder="rahul@example.com"
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Enter a valid email address",
            },
          })}
        />

            {/* Password */}

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700"
            >
              Password
            </label>

            {/* Uncomment when Forgot Password is implemented */}
            {/*
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              Forgot password?
            </Link>
            */}
          </div>

          <PasswordField
            id="password"
            label={null}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
            })}
          />
        </div>

        {/* Remember Me */}

        <label className="flex items-center gap-2.5 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30"
            {...register("rememberMe")}
          />

          Remember me
        </label>

        {/* Submit */}

        <Button
          type="submit"
          isLoading={isSubmitting}
          className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Sign in to TrackHire

          <HiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>

      </form>

      {/* Footer */}

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-medium text-indigo-600 hover:text-indigo-700"
        >
          Create one free
        </Link>
      </p>

    </AuthLayout>
  );
}