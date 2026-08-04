import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="ml-64 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
