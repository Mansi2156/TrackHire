import { NavLink } from "react-router-dom";
import {
  HiOutlineViewGrid,
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlineSparkles,
  HiOutlineCog,
  HiOutlineLogout,
  HiLightningBolt,
} from "react-icons/hi";
import { useAuth } from "../hooks/useAuth";

// Calendar, Analytics, AI Assistant, and Settings belong to future phases.
// They're shown as part of the app shell per the Figma design but stay
// disabled until their module is implemented.
const NAV_ITEMS = [
  { label: "Dashboard", icon: HiOutlineViewGrid, to: "/dashboard", enabled: true },
  { label: "Applications", icon: HiOutlineBriefcase, to: "/applications", enabled: true },
  { label: "Calendar", icon: HiOutlineCalendar, enabled: false },
  { label: "Analytics", icon: HiOutlineChartBar, enabled: false },
  { label: "Resumes", icon: HiOutlineDocumentText, to: "/resumes", enabled: true },
  { label: "AI Assistant", icon: HiOutlineSparkles, enabled: false, badge: "PRO" },
  { label: "Settings", icon: HiOutlineCog, enabled: false },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col justify-between border-r border-slate-100 bg-white px-4 py-6">
      <div>
        <div className="mb-8 flex items-center gap-2.5 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
            <HiLightningBolt className="h-5 w-5 text-white" />
          </span>
          <span className="text-lg font-bold text-slate-900">TrackHire</span>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            if (!item.enabled) {
              return (
                <div
                  key={item.label}
                  title="Coming in a future phase"
                  className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            }
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth ${
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {user?.fullName?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{user?.fullName}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-smooth hover:bg-red-50 hover:text-red-600"
        >
          <HiOutlineLogout className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
