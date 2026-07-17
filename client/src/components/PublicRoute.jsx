import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Sends already-authenticated users straight to the dashboard instead of
// showing them the login/register screens again.
export default function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
