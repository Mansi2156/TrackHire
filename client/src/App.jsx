import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import AddApplication from "./pages/AddApplication";
import EditApplication from "./pages/EditApplication";
import ApplicationDetails from "./pages/ApplicationDetails";
import Companies from "./pages/Companies";
import AddCompany from "./pages/AddCompany";
import EditCompany from "./pages/EditCompany";
import CompanyDetails from "./pages/CompanyDetails";
import ResumeManager from "./pages/ResumeManager";
import Interviews from "./pages/Interviews";
import ScheduleInterview from "./pages/ScheduleInterview";
import EditInterview from "./pages/EditInterview";
import InterviewDetails from "./pages/InterviewDetails";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/applications/new" element={<AddApplication />} />
            <Route path="/applications/:id" element={<ApplicationDetails />} />
            <Route path="/applications/:id/edit" element={<EditApplication />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/new" element={<AddCompany />} />
            <Route path="/companies/:id" element={<CompanyDetails />} />
            <Route path="/companies/:id/edit" element={<EditCompany />} />
            <Route path="/resumes" element={<ResumeManager />} />
            <Route path="/interviews" element={<Interviews />} />
            <Route path="/interviews/new" element={<ScheduleInterview />} />
            <Route path="/interviews/:id" element={<InterviewDetails />} />
            <Route path="/interviews/:id/edit" element={<EditInterview />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
