import { HiOutlineBriefcase, HiOutlineSparkles } from "react-icons/hi";
import { useAuth } from "../hooks/useAuth";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(" ")[0] || "there";

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="mt-1 text-slate-500">
          You&apos;re signed in and ready to go. Application tracking, interviews,
          and analytics are coming in the next phases.
        </p>
      </header>

      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
          <HiOutlineBriefcase className="h-7 w-7 text-brand-600" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-800">
          Your application tracker starts here
        </h2>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
          Authentication is set up. The next build phase adds job application
          tracking, the pipeline view, and search &amp; filters.
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
        <HiOutlineSparkles className="h-4 w-4 shrink-0" />
        This account is secured with JWT authentication — only you can see your data.
      </div>
    </div>
  );
}
