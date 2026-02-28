import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { RequireAuth, RequireRole, RedirectIfAuth } from "./components/ProtectedRoute";

// Public pages
import Home     from "./pages/public/Home";
import Login    from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Customer pages
import CustomerDashboard  from "./pages/customer/Dashboard";
import CustomerProfile    from "./pages/customer/Profile";
import CustomerMembership from "./pages/customer/Membership";
import CustomerRequest    from "./pages/customer/Request";

// Admin / Manager / Staff pages
import AdminDashboard    from "./pages/admin/Dashboard";
import AdminLeads        from "./pages/admin/Leads";
import AdminMembers      from "./pages/admin/Members";
import AdminRequests     from "./pages/admin/Requests";
import AdminTrainers     from "./pages/admin/Trainers";
import { AdminApplications } from "./pages/admin/Applications";
import AdminUsers        from "./pages/admin/Users";
import AdminPayments     from "./pages/admin/Payments";

// Trainer pages
import TrainerDashboard from "./pages/trainer/Dashboard";
import TrainerMembers   from "./pages/trainer/Members";
import TrainerSchedule  from "./pages/trainer/Schedule";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* NotificationProvider must be INSIDE AuthProvider so it can
            access the auth token via your api/axios interceptors.     */}
        <NotificationProvider>
          <Routes>

            {/* ── Public ──────────────────────────── */}
            <Route path="/" element={<Home />} />

            {/* ── Auth (redirect if already logged in) ── */}
            <Route element={<RedirectIfAuth />}>
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* ── Customer ────────────────────────── */}
            <Route element={<RequireRole roles={["customer"]} />}>
              <Route path="/dashboard"            element={<CustomerDashboard />} />
              <Route path="/dashboard/profile"    element={<CustomerProfile />} />
              <Route path="/dashboard/membership" element={<CustomerMembership />} />
              <Route path="/dashboard/request"    element={<CustomerRequest />} />
            </Route>

            {/* ── Trainer ─────────────────────────── */}
            <Route element={<RequireRole roles={["trainer"]} />}>
              <Route path="/trainer"          element={<TrainerDashboard />} />
              <Route path="/trainer/members"  element={<TrainerMembers />} />
              <Route path="/trainer/schedule" element={<TrainerSchedule />} />
            </Route>

            {/* ── Admin / Manager / Staff ─────────── */}
            <Route element={<RequireRole roles={["admin", "manager", "staff"]} />}>
              <Route path="/admin"              element={<AdminDashboard />} />
              <Route path="/admin/leads"        element={<AdminLeads />} />
              <Route path="/admin/members"      element={<AdminMembers />} />
              <Route path="/admin/requests"     element={<AdminRequests />} />
              <Route path="/admin/trainers"     element={<AdminTrainers />} />
              <Route path="/admin/applications" element={<AdminApplications />} />
              <Route path="/admin/payments"     element={<AdminPayments />} />
              <Route path="/admin/users"        element={<AdminUsers />} />
            </Route>

            {/* ── Fallback ────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}