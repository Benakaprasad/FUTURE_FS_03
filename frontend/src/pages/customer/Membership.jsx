import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashLayout from "../../components/DashLayout";
import api from "../../api/axios";

const PLANS = [
  { key: "student",    label: "Student",     price: 999,   period: "/ month",   color: "#00C2FF", features: ["Full gym access", "Group classes", "Locker access"] },
  { key: "monthly",    label: "Monthly",     price: 1500,  period: "/ month",   color: "#FF6B00", features: ["Full gym access", "All group classes", "Locker access", "Fitness assessment"] },
  { key: "quarterly",  label: "Quarterly",   price: 3999,  period: "/ 3 months",color: "#FF1A1A", features: ["Full gym access", "All group classes", "1 PT session/month", "Diet consultation", "Progress tracking"], popular: true },
  { key: "halfyearly", label: "Half-Yearly", price: 6999,  period: "/ 6 months",color: "#FFB800", features: ["Full gym access", "All group classes", "2 PT sessions/month", "Diet & nutrition plan", "Body composition analysis"] },
  { key: "annual",     label: "Annual",      price: 11999, period: "/ year",     color: "#22C55E", features: ["Full gym access", "All group classes", "4 PT sessions/month", "Full nutrition program", "Priority booking", "Guest passes"] },
];

export default function CustomerMembership() {
  const [membership, setMembership] = useState(null);
  const [payments,   setPayments]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [payLoading, setPayLoading] = useState(null);
  const [toast,      setToast]      = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/members/my").catch(() => ({ data: { members: [] } })),
    ]).then(([memRes]) => {
      const active = memRes.data.members?.find((m) => m.status === "active");
      setMembership(active || memRes.data.members?.[0] || null);
    }).finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handlePay = async (plan) => {
    setPayLoading(plan.key);
    try {
      const { data } = await api.post("/payments/create-order", { plan_type: plan.key });
      const options = {
        key:         data.key_id,
        amount:      data.amount,
        currency:    data.currency,
        name:        "FitZone Gym",
        description: `${plan.label} Membership`,
        order_id:    data.order_id,
        handler: async (response) => {
          try {
            await api.post("/payments/verify", {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              member_id:           data.member_id,
            });
            showToast("Payment successful! Membership activated.");
            const res = await api.get("/members/my");
            const active = res.data.members?.find((m) => m.status === "active");
            setMembership(active || null);
          } catch {
            showToast("Payment verification failed. Contact support.", "error");
          }
        },
        prefill: { name: "", email: "", contact: "" },
        theme:   { color: "#FF1A1A" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      showToast(err.response?.data?.error || "Could not initiate payment.", "error");
    } finally {
      setPayLoading(null);
    }
  };

  const daysLeft = membership?.end_date
    ? Math.max(0, Math.ceil((new Date(membership.end_date) - new Date()) / 86400000))
    : null;

  const currentPlan = PLANS.find((p) => p.key === membership?.plan_type);

  return (
    <DashLayout title="MEMBERSHIP" subtitle="View your plan and upgrade anytime">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        .plan-card:hover { transform: translateY(-4px) !important; }
        .pay-btn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
        .pay-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Mobile responsive ── */
        @media (max-width: 768px) {

          /* Status card: stack vertically */
          .status-card {
            flex-direction: column !important;
            padding: 1.25rem !important;
            align-items: flex-start !important;
          }
          .status-right {
            align-self: flex-start !important;
          }
          .status-title {
            font-size: 1.4rem !important;
          }
          .status-meta {
            gap: 0.75rem !important;
            flex-direction: column !important;
          }

          /* Plans grid: 1 column on mobile */
          .plans-grid {
            grid-template-columns: 1fr !important;
            gap: 0.875rem !important;
          }

          /* Addon note */
          .addon-note {
            font-size: 0.8rem !important;
            padding: 0.875rem !important;
          }

          /* Request CTA: stack */
          .req-cta {
            flex-direction: column !important;
            padding: 1.25rem !important;
            gap: 0.875rem !important;
          }
          .req-cta-btn {
            width: 100% !important;
            text-align: center !important;
          }

          /* Section header */
          .section-header {
            margin-bottom: 0.875rem !important;
          }
        }

        /* ── Tablet: 2 column plans ── */
        @media (min-width: 769px) and (max-width: 1024px) {
          .plans-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>

      {loading ? <Loader /> : (
        <>
          {/* ── Current membership status ── */}
          {membership ? (
            <div className="status-card" style={{ ...ms.statusCard, borderColor: (currentPlan?.color || "#FF1A1A") + "30" }}>
              <div style={{ ...ms.statusGlow, background: (currentPlan?.color || "#FF1A1A") + "07" }} />
              <div className="status-left" style={ms.statusLeft}>
                <span style={{ ...ms.statusBadge, color: currentPlan?.color || "#FF1A1A", borderColor: (currentPlan?.color || "#FF1A1A") + "40", background: (currentPlan?.color || "#FF1A1A") + "10" }}>
                  {membership.plan_type?.toUpperCase().replace("HALFYEARLY", "HALF-YEARLY")} PLAN
                </span>
                <h2 className="status-title" style={ms.statusTitle}>
                  {membership.status === "active" ? "MEMBERSHIP ACTIVE" : "MEMBERSHIP EXPIRED"}
                </h2>
                <div className="status-meta" style={ms.statusMeta}>
                  <span style={ms.statusMetaItem}>
                    📅 Started: {new Date(membership.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span style={ms.statusMetaItem}>
                    🔚 Expires: {new Date(membership.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  {membership.trainer_name && (
                    <span style={ms.statusMetaItem}>🏋️ Trainer: {membership.trainer_name}</span>
                  )}
                </div>
              </div>
              {daysLeft !== null && (
                <div className="status-right" style={ms.statusRight}>
                  <div style={{ ...ms.daysRing, borderColor: currentPlan?.color || "#FF1A1A" }}>
                    <span style={{ ...ms.daysNum, color: currentPlan?.color || "#FF1A1A" }}>{daysLeft}</span>
                    <span style={ms.daysLabel}>DAYS<br />LEFT</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={ms.noMembership}>
              <span style={ms.noMemIcon}>🏋️</span>
              <h3 style={ms.noMemTitle}>No Active Membership</h3>
              <p style={ms.noMemSub}>Choose a plan below to get started. First session is free.</p>
            </div>
          )}

          {/* ── Plans grid ── */}
          <div className="section-header" style={ms.sectionHeader}>
            <h3 style={ms.sectionTitle}>
              {membership ? "UPGRADE OR RENEW" : "CHOOSE YOUR PLAN"}
            </h3>
          </div>

          <div className="plans-grid" style={ms.plansGrid}>
            {PLANS.map((plan) => {
              const isCurrent = membership?.plan_type === plan.key && membership?.status === "active";
              return (
                <div key={plan.key} className="plan-card" style={{
                  ...ms.planCard,
                  border: plan.popular ? `2px solid ${plan.color}` : isCurrent ? `2px solid ${plan.color}60` : "1px solid rgba(255,255,255,0.07)",
                  background: plan.popular ? plan.color + "0a" : "rgba(255,255,255,0.02)",
                  transition: "transform 0.25s ease",
                }}>
                  {plan.popular && <div style={ms.popularBadge}>MOST POPULAR</div>}
                  {isCurrent && <div style={{ ...ms.popularBadge, background: plan.color + "20", color: plan.color, borderColor: plan.color + "40" }}>CURRENT PLAN</div>}
                  <div style={{ ...ms.planBar, background: plan.color }} />
                  <h3 style={ms.planName}>{plan.label}</h3>
                  <div style={ms.planPriceRow}>
                    <span style={ms.planPrice}>₹{plan.price.toLocaleString("en-IN")}</span>
                    <span style={ms.planPeriod}>{plan.period}</span>
                  </div>
                  <ul style={ms.planFeatures}>
                    {plan.features.map((f, i) => (
                      <li key={i} style={ms.planFeature}>
                        <span style={{ color: plan.color }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <div style={{ ...ms.payBtn, background: plan.color + "15", color: plan.color, border: `1px solid ${plan.color}30`, cursor: "default", textAlign: "center" }}>
                      Current Plan
                    </div>
                  ) : (
                    <button
                      className="pay-btn"
                      onClick={() => handlePay(plan)}
                      disabled={!!payLoading}
                      style={{
                        ...ms.payBtn,
                        background: plan.popular ? plan.color : "transparent",
                        color: plan.popular ? "#fff" : plan.color,
                        border: plan.popular ? "none" : `1px solid ${plan.color}`,
                        cursor: payLoading === plan.key ? "wait" : "pointer",
                      }}
                    >
                      {payLoading === plan.key ? (
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                          <span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                          Processing...
                        </span>
                      ) : "Pay Now →"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── PT Add-on note ── */}
          <div className="addon-note" style={ms.addonNote}>
            💪 Personal Training add-on available at <strong style={{ color: "#FF1A1A" }}>₹4,000 / month</strong>. Raise a request after purchasing a plan.
          </div>

          {/* ── Raise request CTA ── */}
          <div className="req-cta" style={ms.reqCta}>
            <div>
              <h4 style={ms.reqCtaTitle}>Need a custom plan or free trial?</h4>
              <p style={ms.reqCtaSub}>Raise a request and our team will contact you within 24 hours.</p>
            </div>
            <Link className="req-cta-btn" to="/dashboard/request" style={ms.reqCtaBtn}>Raise Request →</Link>
          </div>
        </>
      )}

      {toast && (
        <div style={{ ...ms.toast, background: toast.type === "error" ? "rgba(255,26,26,0.95)" : "rgba(34,197,94,0.95)" }}>
          {toast.type === "error" ? "✕" : "✓"} {toast.msg}
        </div>
      )}
    </DashLayout>
  );
}

function Loader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
      <div style={{ width: "36px", height: "36px", border: "3px solid rgba(255,26,26,0.2)", borderTop: "3px solid #FF1A1A", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );
}

const ms = {
  statusCard: {
    position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "rgba(255,255,255,0.02)", border: "1px solid",
    borderRadius: "16px", padding: "2rem", marginBottom: "2rem", overflow: "hidden", gap: "1rem",
  },
  statusGlow:  { position: "absolute", inset: 0, pointerEvents: "none" },
  statusLeft:  { position: "relative", zIndex: 1 },
  statusBadge: { display: "inline-block", fontSize: "10px", fontWeight: 800, letterSpacing: "2px", border: "1px solid", borderRadius: "100px", padding: "4px 12px", marginBottom: "0.75rem" },
  statusTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", letterSpacing: "2px", color: "#fff", marginBottom: "0.75rem" },
  statusMeta:  { display: "flex", gap: "1.5rem", flexWrap: "wrap" },
  statusMetaItem: { fontSize: "13px", color: "rgba(255,255,255,0.5)" },
  statusRight: { flexShrink: 0, position: "relative", zIndex: 1 },
  daysRing:    { width: "100px", height: "100px", borderRadius: "50%", border: "3px solid", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  daysNum:     { fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "-1px", lineHeight: 1 },
  daysLabel:   { fontSize: "9px", fontWeight: 700, letterSpacing: "1px", color: "rgba(255,255,255,0.4)", textAlign: "center", lineHeight: 1.2 },
  noMembership: { textAlign: "center", padding: "3rem", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "14px", marginBottom: "2rem" },
  noMemIcon:    { fontSize: "2.5rem", display: "block", marginBottom: "1rem" },
  noMemTitle:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "#fff", marginBottom: "0.5rem" },
  noMemSub:     { fontSize: "0.9rem", color: "rgba(255,255,255,0.35)" },
  sectionHeader: { marginBottom: "1.25rem" },
  sectionTitle:  { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "3px", color: "rgba(255,255,255,0.4)" },
  plansGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "1rem", marginBottom: "1.5rem" },
  planCard:  { borderRadius: "14px", padding: "1.5rem", position: "relative", overflow: "hidden" },
  popularBadge: {
    position: "absolute", top: "12px", right: "12px",
    fontSize: "9px", fontWeight: 800, letterSpacing: "1.5px",
    color: "#FF1A1A", background: "rgba(255,26,26,0.1)",
    border: "1px solid rgba(255,26,26,0.25)", padding: "3px 8px", borderRadius: "100px",
  },
  planBar:       { height: "3px", borderRadius: "2px", marginBottom: "1.25rem" },
  planName:      { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", letterSpacing: "1px", color: "#fff", marginBottom: "0.5rem" },
  planPriceRow:  { display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "1rem" },
  planPrice:     { fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "#fff", letterSpacing: "-1px" },
  planPeriod:    { fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" },
  planFeatures:  { listStyle: "none", marginBottom: "1.25rem", display: "flex", flexDirection: "column", gap: "6px" },
  planFeature:   { fontSize: "12px", color: "rgba(255,255,255,0.55)" },
  payBtn: {
    display: "block", width: "100%", padding: "11px",
    fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "13px",
    borderRadius: "8px", transition: "all 0.2s",
  },
  addonNote: {
    textAlign: "center", padding: "1rem",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "10px", marginBottom: "1.5rem",
    fontSize: "0.875rem", color: "rgba(255,255,255,0.45)",
  },
  reqCta: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "rgba(255,26,26,0.05)", border: "1px solid rgba(255,26,26,0.15)",
    borderRadius: "14px", padding: "1.5rem 2rem", gap: "1rem", flexWrap: "wrap",
  },
  reqCtaTitle: { fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "4px" },
  reqCtaSub:   { fontSize: "0.875rem", color: "rgba(255,255,255,0.4)" },
  reqCtaBtn: {
    padding: "12px 24px", background: "linear-gradient(135deg, #FF1A1A, #cc0000)",
    color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "13px",
    borderRadius: "8px", flexShrink: 0, boxShadow: "0 4px 15px rgba(255,26,26,0.3)",
  },
  toast: {
    position: "fixed", bottom: "2rem", right: "2rem",
    padding: "14px 22px", borderRadius: "10px",
    color: "#fff", fontWeight: 700, fontSize: "0.875rem",
    boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
    animation: "slideIn 0.3s ease forwards", zIndex: 9999,
  },
};