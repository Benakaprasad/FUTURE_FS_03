import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashLayout from "../../components/DashLayout";
import api from "../../api/axios";
import { Check, Zap, Star, ArrowRight, Calendar, Dumbbell, Clock, ChevronRight } from "lucide-react";

const T = {
  red: "#FF1A1A", redDim: "rgba(255,26,26,0.12)",
  gold: "#FFB800", cyan: "#00C2FF", green: "#22C55E",
  glass: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.07)",
  muted: "rgba(255,255,255,0.35)", sub: "rgba(255,255,255,0.15)",
};

const PLANS = [
  { key: "student",    label: "Student",     price: 999,   period: "month",   color: T.cyan,   features: ["Full gym access","Group classes","Locker access"] },
  { key: "monthly",    label: "Monthly",     price: 1500,  period: "month",   color: "#FF6B00",features: ["Full gym access","All group classes","Locker access","Fitness assessment"] },
  { key: "quarterly",  label: "Quarterly",   price: 3999,  period: "3 months",color: T.red,    features: ["Full gym access","All classes","1 PT session/mo","Diet consult","Progress tracking"], popular: true },
  { key: "halfyearly", label: "Half-Yearly", price: 6999,  period: "6 months",color: T.gold,   features: ["Full gym access","All classes","2 PT sessions/mo","Diet & nutrition plan","Body composition"] },
  { key: "annual",     label: "Annual",      price: 11999, period: "year",    color: T.green,  features: ["Full gym access","All classes","4 PT sessions/mo","Full nutrition program","Priority booking","Guest passes"], best: true },
];

export default function CustomerMembership() {
  const [membership, setMembership] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [payLoading, setPayLoading] = useState(null);
  const [toast,      setToast]      = useState(null);

  useEffect(() => {
    api.get("/members/my").catch(() => ({ data: { members: [] } }))
      .then((res) => {
        const active = res.data.members?.find((m) => m.status === "active");
        setMembership(active || res.data.members?.[0] || null);
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
        key: data.key_id, amount: data.amount, currency: data.currency,
        name: "FitZone Gym", description: `${plan.label} Membership`,
        order_id: data.order_id,
        handler: async (response) => {
          try {
            await api.post("/payments/verify", {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              member_id:           data.member_id,
            });
            showToast("Payment successful! Membership activated. 🎉");
            const res = await api.get("/members/my");
            setMembership(res.data.members?.find((m) => m.status === "active") || null);
          } catch { showToast("Verification failed. Contact support.", "error"); }
        },
        prefill: { name: "", email: "", contact: "" },
        theme: { color: "#FF1A1A" },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      showToast(err.response?.data?.error || "Could not initiate payment.", "error");
    } finally { setPayLoading(null); }
  };

  const daysLeft    = membership?.end_date ? Math.max(0, Math.ceil((new Date(membership.end_date) - new Date()) / 86400000)) : null;
  const currentPlan = PLANS.find((p) => p.key === membership?.plan_type);
  const planColor   = currentPlan?.color || T.red;

  return (
    <DashLayout title="MEMBERSHIP" subtitle="View your plan and upgrade anytime">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%,100%{opacity:0.6} 50%{opacity:1} }
        .plan-card { transition: transform 0.25s, box-shadow 0.25s !important; }
        .plan-card:hover { transform: translateY(-6px) !important; }
        .pay-btn { transition: all 0.2s; }
        .pay-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .pay-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        @media(max-width:768px){
          .status-card { flex-direction:column!important; padding:1.25rem!important; }
          .plans-grid  { grid-template-columns:1fr!important; }
          .req-cta     { flex-direction:column!important; }
        }
        @media(min-width:769px) and (max-width:1100px){
          .plans-grid { grid-template-columns:repeat(2,1fr)!important; }
        }
      `}</style>

      {loading ? <Loader /> : (
        <>
          {/* ── Current membership card ── */}
          {membership ? (
            <div className="status-card" style={{
              position: "relative", display: "flex", justifyContent: "space-between",
              alignItems: "center", background: T.glass,
              border: `1px solid ${planColor}25`, borderRadius: 18,
              padding: "2rem", marginBottom: "2rem", overflow: "hidden", gap: "1rem",
              animation: "fadeUp 0.5s ease both",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${planColor},transparent)` }} />
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 70% at 80% 50%, ${planColor}06, transparent)`, pointerEvents: "none" }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: "10px", fontWeight: 800, letterSpacing: "2px", border: `1px solid ${planColor}40`, borderRadius: 100, padding: "5px 14px", marginBottom: "0.9rem", color: planColor, background: planColor + "12" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: planColor, display: "inline-block", animation: "shimmer 2s ease infinite" }} />
                  {membership.plan_type?.toUpperCase().replace("HALFYEARLY","HALF-YEARLY")} PLAN
                </div>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.9rem", letterSpacing: "2px", color: "#fff", marginBottom: "0.9rem" }}>
                  {membership.status === "active" ? "MEMBERSHIP ACTIVE" : "MEMBERSHIP EXPIRED"}
                </h2>
                <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                  {[
                    { icon: Calendar, text: `Started: ${new Date(membership.start_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}` },
                    { icon: Clock,    text: `Expires: ${new Date(membership.end_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}` },
                    ...(membership.trainer_name ? [{ icon: Dumbbell, text: `Trainer: ${membership.trainer_name}` }] : []),
                  ].map((m, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <m.icon size={13} color={T.muted} />
                      <span style={{ fontSize: "13px", color: T.muted }}>{m.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {daysLeft !== null && (
                <div style={{ flexShrink: 0, textAlign: "center", position: "relative", zIndex: 1 }}>
                  <div style={{ width: 104, height: 104, borderRadius: "50%", border: `3px solid ${planColor}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: `0 0 30px ${planColor}20` }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem", color: planColor, letterSpacing: "-1px", lineHeight: 1 }}>{daysLeft}</span>
                    <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1.5px", color: T.sub, lineHeight: 1.4 }}>DAYS<br/>LEFT</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "3rem", background: T.glass, border: `1px solid ${T.border}`, borderRadius: 16, marginBottom: "2rem", animation: "fadeUp 0.5s ease both" }}>
              <Dumbbell size={36} color={T.red} style={{ marginBottom: "1rem", opacity: 0.7 }} />
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "#fff", marginBottom: "0.5rem" }}>NO ACTIVE MEMBERSHIP</h3>
              <p style={{ fontSize: "0.9rem", color: T.muted }}>Choose a plan below to get started. First session is free.</p>
            </div>
          )}

          {/* ── Section header ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem", animation: "fadeUp 0.5s ease 0.1s both" }}>
            <Zap size={15} color={T.muted} />
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.95rem", letterSpacing: "3px", color: T.muted }}>
              {membership ? "UPGRADE OR RENEW" : "CHOOSE YOUR PLAN"}
            </span>
          </div>

          {/* ── Plans grid ── */}
          <div className="plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            {PLANS.map((plan, idx) => {
              const isCurrent = membership?.plan_type === plan.key && membership?.status === "active";
              return (
                <div key={plan.key} className="plan-card" style={{
                  borderRadius: 16, padding: "1.6rem", position: "relative", overflow: "hidden",
                  border: plan.popular || plan.best
                    ? `2px solid ${plan.color}50`
                    : isCurrent ? `2px solid ${plan.color}40` : `1px solid ${T.border}`,
                  background: plan.popular || plan.best ? plan.color + "07" : T.glass,
                  animation: `fadeUp 0.5s ease ${0.1 + idx * 0.06}s both`,
                }}>
                  {/* Top accent */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: plan.color, borderRadius: "16px 16px 0 0" }} />

                  {/* Badge */}
                  {plan.popular && (
                    <div style={{ position: "absolute", top: 14, right: 14, display: "flex", alignItems: "center", gap: 4, fontSize: "9px", fontWeight: 800, letterSpacing: "1px", color: plan.color, background: plan.color + "18", border: `1px solid ${plan.color}35`, padding: "3px 8px", borderRadius: 100 }}>
                      <Star size={9} fill={plan.color} color={plan.color} /> POPULAR
                    </div>
                  )}
                  {plan.best && (
                    <div style={{ position: "absolute", top: 14, right: 14, display: "flex", alignItems: "center", gap: 4, fontSize: "9px", fontWeight: 800, letterSpacing: "1px", color: plan.color, background: plan.color + "18", border: `1px solid ${plan.color}35`, padding: "3px 8px", borderRadius: 100 }}>
                      <Zap size={9} fill={plan.color} color={plan.color} /> BEST VALUE
                    </div>
                  )}
                  {isCurrent && !plan.popular && !plan.best && (
                    <div style={{ position: "absolute", top: 14, right: 14, fontSize: "9px", fontWeight: 800, letterSpacing: "1px", color: plan.color, background: plan.color + "15", border: `1px solid ${plan.color}30`, padding: "3px 8px", borderRadius: 100 }}>
                      CURRENT
                    </div>
                  )}

                  <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "1px", color: "#fff", marginTop: "0.5rem", marginBottom: "0.5rem" }}>{plan.label}</h3>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: "1.25rem" }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem", color: "#fff", letterSpacing: "-1px" }}>₹{plan.price.toLocaleString("en-IN")}</span>
                    <span style={{ fontSize: "11px", color: T.muted }}>/ {plan.period}</span>
                  </div>

                  <ul style={{ listStyle: "none", marginBottom: "1.25rem", display: "flex", flexDirection: "column", gap: 8 }}>
                    {plan.features.map((f, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 17, height: 17, borderRadius: "50%", background: plan.color + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Check size={10} color={plan.color} strokeWidth={3} />
                        </div>
                        <span style={{ fontSize: "12px", color: T.muted }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <div style={{ display: "block", width: "100%", padding: "11px", background: plan.color + "12", color: plan.color, border: `1px solid ${plan.color}25`, borderRadius: 9, textAlign: "center", fontSize: "13px", fontWeight: 700 }}>
                      ✓ Current Plan
                    </div>
                  ) : (
                    <button className="pay-btn" onClick={() => handlePay(plan)} disabled={!!payLoading}
                      style={{
                        display: "block", width: "100%", padding: "12px",
                        background: plan.popular || plan.best ? plan.color : "transparent",
                        color: plan.popular || plan.best ? "#fff" : plan.color,
                        border: plan.popular || plan.best ? "none" : `1px solid ${plan.color}60`,
                        borderRadius: 9, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "13px",
                        cursor: "pointer", boxShadow: plan.popular || plan.best ? `0 4px 16px ${plan.color}35` : "none",
                      }}>
                      {payLoading === plan.key ? (
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                          Processing…
                        </span>
                      ) : (
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          Pay Now <ArrowRight size={13} />
                        </span>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── PT Add-on ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "center", justifyContent: "center", padding: "1rem", background: T.glass, border: `1px solid ${T.border}`, borderRadius: 12, marginBottom: "1.5rem", fontSize: "0.875rem", color: T.muted, animation: "fadeUp 0.5s ease 0.5s both" }}>
            <Dumbbell size={16} color={T.red} />
            Personal Training add-on available at <strong style={{ color: T.red }}>₹4,000 / month</strong>. Raise a request after purchasing a plan.
          </div>

          {/* ── CTA ── */}
          <div className="req-cta" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: T.redDim, border: "1px solid rgba(255,26,26,0.18)", borderRadius: 14, padding: "1.5rem 2rem", gap: "1rem", flexWrap: "wrap", animation: "fadeUp 0.5s ease 0.55s both" }}>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: 5 }}>Need a custom plan or free trial?</div>
              <div style={{ fontSize: "0.875rem", color: T.muted }}>Raise a request and our team will contact you within 24 hours.</div>
            </div>
            <Link to="/dashboard/request" style={{ padding: "12px 24px", background: "linear-gradient(135deg,#FF1A1A,#cc0000)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "13px", borderRadius: 9, flexShrink: 0, boxShadow: "0 4px 16px rgba(255,26,26,0.3)", display: "flex", alignItems: "center", gap: 6 }}>
              Raise Request <ArrowRight size={13} />
            </Link>
          </div>
        </>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: "2rem", right: "2rem", padding: "14px 22px", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: "0.875rem", boxShadow: "0 8px 30px rgba(0,0,0,0.4)", animation: "slideIn 0.3s ease both", zIndex: 9999, background: toast.type === "error" ? "rgba(255,26,26,0.95)" : "rgba(34,197,94,0.95)", display: "flex", alignItems: "center", gap: 10 }}>
          {toast.type === "error" ? "✕" : <Check size={16} />} {toast.msg}
        </div>
      )}
    </DashLayout>
  );
}

function Loader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "5rem", gap: 16 }}>
      <div style={{ width: 32, height: 32, border: "2.5px solid rgba(255,26,26,0.15)", borderTop: "2.5px solid #FF1A1A", borderRadius: "50%", animation: "spin 0.75s linear infinite" }} />
      <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>Loading plans…</span>
    </div>
  );
}

const T2 = { redDim: "rgba(255,26,26,0.12)" };