import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

// ── Spinner ───────────────────────────────────────────────────
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

// ── Trainer Pending Screen ────────────────────────────────────
function TrainerPendingScreen({ status }) {
  const isRejected = status === "on_leave";
  return (
    <div style={{
      minHeight: "100vh", background: "#000",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", padding: "2rem",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>

      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0,
        backgroundImage: "linear-gradient(rgba(255,26,26,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,26,26,0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px", pointerEvents: "none",
      }} />

      <div style={{
        maxWidth: "500px", width: "100%",
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${isRejected ? "rgba(255,26,26,0.3)" : "rgba(255,183,0,0.2)"}`,
        borderRadius: "20px", padding: "3rem 2.5rem",
        textAlign: "center",
        animation: "fadeUp 0.6s ease forwards",
        position: "relative", zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", gap: "12px",
          marginBottom: "2.5rem",
        }}>
          <div style={{
            width: "44px", height: "44px",
            background: "linear-gradient(135deg, #FF1A1A, #991111)",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", color: "#fff",
            boxShadow: "0 4px 20px rgba(255,26,26,0.4)",
          }}>FZ</div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "3px", color: "#fff", lineHeight: 1 }}>FITZONE</div>
            <div style={{ fontSize: "9px", letterSpacing: "4px", color: "#FF1A1A", fontWeight: 600 }}>GYM</div>
          </div>
        </div>

        {/* Icon */}
        <div style={{
          fontSize: "3.5rem", marginBottom: "1.25rem",
          animation: isRejected ? "none" : "pulse 2s ease infinite",
        }}>
          {isRejected ? "❌" : "⏳"}
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "2.2rem", letterSpacing: "3px",
          color: "#fff", marginBottom: "0.75rem",
        }}>
          {isRejected ? "NOT APPROVED" : "UNDER REVIEW"}
        </h2>

        {/* Message */}
        <p style={{
          color: "rgba(255,255,255,0.45)",
          lineHeight: 1.8, marginBottom: "2rem",
          fontSize: "0.95rem",
        }}>
          {isRejected
            ? "Your trainer application was not approved at this time. Please contact FitZone management for more information or to discuss next steps."
            : "Your trainer profile is currently under review by FitZone management. We verify certifications, experience, and ID proof before granting full access."}
        </p>

        {/* Status badge */}
        <div style={{
          background: isRejected
            ? "rgba(255,26,26,0.08)"
            : "rgba(255,183,0,0.08)",
          border: `1px solid ${isRejected ? "rgba(255,26,26,0.25)" : "rgba(255,183,0,0.25)"}`,
          borderRadius: "10px", padding: "1rem 1.5rem",
          marginBottom: "2rem",
        }}>
          <p style={{
            fontSize: "10px", fontWeight: 800,
            letterSpacing: "3px",
            color: isRejected ? "#FF1A1A" : "#FFB700",
            marginBottom: "6px",
          }}>
            ACCOUNT STATUS
          </p>
          <p style={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem" }}>
            {isRejected ? "Application Rejected" : "Pending Admin Approval"}
          </p>
        </div>

        {/* What happens next */}
        {!isRejected && (
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "10px", padding: "1.25rem",
            marginBottom: "2rem", textAlign: "left",
          }}>
            <p style={{
              fontSize: "10px", fontWeight: 800,
              letterSpacing: "3px", color: "rgba(255,255,255,0.4)",
              marginBottom: "0.75rem",
            }}>
              WHAT HAPPENS NEXT
            </p>
            {[
              "Admin reviews your profile & certifications",
              "Experience and ID proof is verified",
              "You'll be approved or contacted for more details",
              "Once approved, full dashboard access is granted",
            ].map((step, i) => (
              <div key={i} style={{
                display: "flex", gap: "10px",
                alignItems: "flex-start", marginBottom: "8px",
              }}>
                <span style={{
                  color: "#FF1A1A", fontWeight: 800,
                  fontSize: "12px", flexShrink: 0, marginTop: "2px",
                }}>{i + 1}.</span>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={() => {
            localStorage.removeItem("accessToken");
            window.location.href = "/login";
          }}
          style={{
            width: "100%", padding: "13px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            color: "rgba(255,255,255,0.5)",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600, fontSize: "0.9rem",
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          ← Back to Login
        </button>

        {/* Contact note */}
        <p style={{
          marginTop: "1.25rem",
          fontSize: "12px", color: "rgba(255,255,255,0.2)",
          lineHeight: 1.6,
        }}>
          Questions? Contact us at{" "}
          <span style={{ color: "rgba(255,255,255,0.4)" }}>info@fitzoneGym.in</span>
        </p>
      </div>
    </div>
  );
}

// ── RequireAuth ───────────────────────────────────────────────
// Requires login — redirects to /login if not authenticated
export function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user)   return <Navigate to="/login" replace />;
  return <Outlet />;
}

// ── RequireRole ───────────────────────────────────────────────
// Requires specific role(s) + handles trainer approval gate
export function RequireRole({ roles }) {
  const { user, loading } = useAuth();
  const [trainerStatus, setTrainerStatus]     = useState(null);
  const [checkingTrainer, setCheckingTrainer] = useState(false);

  useEffect(() => {
    // Only check trainer status when a trainer tries to access /trainer routes
    if (user?.role === "trainer" && roles.includes("trainer")) {
      setCheckingTrainer(true);
      api.get("/trainers/me")
        .then(({ data }) => setTrainerStatus(data.trainer?.status || "inactive"))
        .catch(() => setTrainerStatus("inactive"))
        .finally(() => setCheckingTrainer(false));
    }
  }, [user, roles]);

  if (loading || checkingTrainer) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;

  // ── Trainer approval gate ──
  if (user.role === "trainer" && roles.includes("trainer")) {
    if (trainerStatus !== "active") {
      return <TrainerPendingScreen status={trainerStatus} />;
    }
  }

  // ── Wrong role — redirect to their own dashboard ──
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

// ── RedirectIfAuth ────────────────────────────────────────────
// Redirects logged-in users away from /login and /register
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