import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Spinner shown while session is being verified
function Spinner() {
  return (
    <div style={{
      minHeight: "100vh", background: "#000",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: "40px", height: "40px",
        border: "3px solid rgba(255,26,26,0.2)",
        borderTop: "3px solid #FF1A1A",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Requires login — redirects to /login if not authenticated
export function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user)   return <Navigate to="/login" replace />;
  return <Outlet />;
}

// Requires specific role(s) — redirects to their dashboard if wrong role
export function RequireRole({ roles }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user)   return <Navigate to="/login" replace />;

  if (!roles.includes(user.role)) {
    const dashMap = {
      admin:    "/admin",
      manager:  "/admin",
      staff:    "/admin",
      trainer:  "/trainer",
      customer: "/dashboard",
    };
    return <Navigate to={dashMap[user.role] || "/login"} replace />;
  }

  return <Outlet />;
}

// Redirects logged-in users away from auth pages
export function RedirectIfAuth() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;

  if (user) {
    const dashMap = {
      admin:    "/admin",
      manager:  "/admin",
      staff:    "/admin",
      trainer:  "/trainer",
      customer: "/dashboard",
    };
    return <Navigate to={dashMap[user.role] || "/"} replace />;
  }

  return <Outlet />;
}