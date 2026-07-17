import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { HiArrowRight, HiCheck } from "react-icons/hi";
import { Zap } from "lucide-react";

import AuthLayout from "../layouts/AuthLayout";
import TextField from "../components/TextField";
import PasswordField from "../components/PasswordField";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";

const STATS = [
  {
    value: "50K+",
    label: "Job seekers",
  },
  {
    value: "2.4M",
    label: "Apps tracked",
  },
  {
    value: "68%",
    label: "Interview rate",
  },
  {
    value: "4.9★",
    label: "User rating",
  },
];

const FEATURES = [
  "Track unlimited job applications",
  "AI-powered resume analysis",
  "Interview scheduling & reminders",
  "Analytics and success insights",
];

function RegisterPanel() {
  return (
    <div className="relative flex h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-12 text-white">

      {/* Decorations */}

      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/5" />

        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-white/5" />

        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

      </div>

      {/* Logo */}

      <div className="relative flex items-center gap-2.5">

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <Zap
            size={18}
            className="text-white"
            fill="white"
          />
        </div>

        <span className="text-xl font-bold tracking-tight">
          TrackHire
        </span>

      </div>

      {/* Center */}

      <div className="relative flex flex-1 flex-col justify-center py-8">

        {/* Stats */}

        <div className="mb-8 grid grid-cols-2 gap-4">

          {STATS.map((item) => (

            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm"
            >

              <p className="text-2xl font-bold">
                {item.value}
              </p>

              <p className="mt-1 text-xs text-indigo-200">
                {item.label}
              </p>

            </div>

          ))}

        </div>

        {/* Features */}

        <div className="space-y-3">

          {FEATURES.map((feature) => (

            <div
              key={feature}
              className="flex items-center gap-3"
            >

              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/30">

                <HiCheck
                  className="h-3 w-3 text-emerald-300"
                />

              </div>

              <span className="text-sm text-white/90">
                {feature}
              </span>

            </div>

          ))}

        </div>

      </div>

      {/* Bottom */}

      <div className="relative">

        <h2 className="mb-3 text-3xl font-bold leading-tight">
          Start your journey to your dream job today
        </h2>

        <p className="text-sm text-indigo-200">
          Free forever. No credit card required.
        </p>

      </div>

    </div>
  );
}

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
  });

  const password = watch("password");

  const onSubmit = async (formData) => {
    setServerError("");

    try {
      await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      toast.success("Account created — welcome to TrackHire!");

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      setServerError(error.message);
      toast.error(error.message);
    }
  };

  return (
    <AuthLayout panel={<RegisterPanel />}>

      {/* Mobile Logo */}

      <div className="mb-8 flex items-center gap-2.5 lg:hidden">

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <Zap
            size={16}
            className="text-white"
            fill="white"
          />
        </div>

        <span className="text-lg font-bold tracking-tight text-slate-900">
          TrackHire
        </span>

      </div>

      {/* Heading */}

      <div className="mb-8">

        <h1 className="mb-1 text-2xl font-bold text-slate-900">
          Create your account
        </h1>

        <p className="text-sm text-slate-500">
          Free forever. Start tracking in minutes.
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

        {/* Full Name */}

        <TextField
          id="fullName"
          label="Full Name"
          placeholder="Rahul Sharma"
          error={errors.fullName?.message}
          {...register("fullName", {
            required: "Full name is required",
            minLength: {
              value: 2,
              message: "Full name must be at least 2 characters",
            },
          })}
        />

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

        <PasswordField
          id="password"
          label="Password"
          placeholder="Min. 8 characters"
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          })}
        />

        {/* Confirm Password */}

        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Repeat password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) =>
              value === password || "Passwords do not match",
          })}
        />

        {/* Submit */}

        <Button
          type="submit"
          isLoading={isSubmitting}
          className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Create Free Account

          <HiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>

        {/* Terms */}

        <p className="text-center text-xs leading-5 text-slate-400">
          By signing up, you agree to our{" "}
          <button
            type="button"
            className="font-medium text-indigo-600 hover:underline"
          >
            Terms of Service
          </button>{" "}
          and{" "}
          <button
            type="button"
            className="font-medium text-indigo-600 hover:underline"
          >
            Privacy Policy
          </button>
        </p>

      </form>

      {/* Footer */}

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-indigo-600 hover:text-indigo-700"
        >
          Sign in
        </Link>
      </p>

    </AuthLayout>
  );
}