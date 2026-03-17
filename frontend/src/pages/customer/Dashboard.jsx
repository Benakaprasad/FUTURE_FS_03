import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashLayout from "../../components/DashLayout";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import {
  Zap, Clock, CheckCircle, Calendar, TrendingUp,
  CreditCard, ClipboardList, User, Dumbbell,
  ArrowRight, AlertTriangle, ChevronRight, Activity
} from "lucide-react";

// ── Design tokens ──────────────────────────────────────────────
const T = {
  red:    "#FF1A1A",
  redDim: "rgba(255,26,26,0.12)",
  gold:   "#FFB800",
  cyan:   "#00C2FF",
  green:  "#22C55E",
  purple: "#A855F7",
  glass:  "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.07)",
  muted:  "rgba(255,255,255,0.35)",
  sub:    "rgba(255,255,255,0.18)",
};

const PLAN_COLORS = {
  student:    T.cyan,
  monthly:    "#FF6B00",
  quarterly:  T.red,
  halfyearly: T.gold,
  annual:     T.green,
};

function KpiCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <div style={{
      background: T.glass,
      border: `1px solid ${T.border}`,
      borderTop: `2px solid ${color}`,
      borderRadius: "14px",
      padding: "1.4rem",
      animation: `fadeUp 0.5s ease ${delay}s both`,
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "default",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px ${color}20`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 10, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.9rem" }}>
        <Icon size={18} color={color} strokeWidth={2} />
      </div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem", color, letterSpacing: "-0.5px", lineHeight: 1 }}>{value ?? "—"}</div>
      <div style={{ fontSize: "11px", fontWeight: 600, color: T.muted, marginTop: "6px", letterSpacing: "0.5px" }}>{label}</div>
    </div>
  );
}

function QuickLink({ icon: Icon, label, sub, href, color }) {
  return (
    <Link to={href} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.1rem", background: T.glass, border: `1px solid ${T.border}`, borderRadius: "12px", textDecoration: "none", color: "#fff", transition: "all 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.background = color + "0a"; e.currentTarget.style.borderColor = color + "35"; e.currentTarget.style.transform = "translateX(4px)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = T.glass; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = ""; }}
    >
      <div style={{ width: 42, height: 42, borderRadius: 10, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={19} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: "11px", color: T.muted }}>{sub}</div>
      </div>
      <ChevronRight size={16} color={T.sub} />
    </Link>
  );
}

function ActivityRow({ icon: Icon, title, desc, time, color, delay = 0 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.9rem 1.25rem", borderBottom: `1px solid ${T.border}`, animation: `fadeUp 0.4s ease ${delay}s both` }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={16} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.83rem", fontWeight: 700, color: "#fff", marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: "11px", color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{desc}</div>
      </div>
      <div style={{ fontSize: "11px", color: T.sub, flexShrink: 0, fontWeight: 500 }}>{time}</div>
    </div>
  );
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [membership, setMembership] = useState(null);
  const [requests,   setRequests]   = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/members/my").catch(() => ({ data: { members: [] } })),
      api.get("/requests/my").catch(() => ({ data: { requests: [] } })),
    ]).then(([memRes, reqRes]) => {
      const members = memRes.data.members || [];
      const active  = members.find((m) => m.status === "active");
      setMembership(active || members[0] || null);
      setRequests(reqRes.data.requests || []);
    }).finally(() => setLoading(false));
  }, []);

  const daysLeft = membership?.end_date
    ? Math.max(0, Math.ceil((new Date(membership.end_date) - new Date()) / 86400000))
    : null;

  const totalDays = membership?.start_date && membership?.end_date
    ? Math.ceil((new Date(membership.end_date) - new Date(membership.start_date)) / 86400000)
    : null;

  const progressPct = totalDays && daysLeft !== null
    ? Math.round(((totalDays - daysLeft) / totalDays) * 100)
    : 0;

  const pendingRequests  = requests.filter((r) => r.status === "pending").length;
  const approvedRequests = requests.filter((r) => r.status === "approved").length;
  const planColor        = PLAN_COLORS[membership?.plan_type] || T.red;

  const greetHour = new Date().getHours();
  const greeting  = greetHour < 12 ? "Good Morning" : greetHour < 17 ? "Good Afternoon" : "Good Evening";
  const firstName = user?.full_name?.split(" ")[0] || user?.username || "Member";

  const TYPE_MAP = {
    new_membership:  { icon: Zap,           title: "New Membership",  color: T.green  },
    renewal:         { icon: TrendingUp,     title: "Renewal",         color: T.cyan   },
    upgrade:         { icon: Activity,       title: "Plan Upgrade",    color: T.purple },
    trainer_request: { icon: Dumbbell,       title: "Trainer Request", color: "#FF6B00"},
    freeze:          { icon: Clock,          title: "Freeze Request",  color: T.cyan   },
    cancellation:    { icon: AlertTriangle,  title: "Cancellation",    color: T.red    },
    other:           { icon: ClipboardList,  title: "General Request", color: T.gold   },
  };

  const recentActivity = requests.slice(0, 4).map((r) => {
    const info = TYPE_MAP[r.request_type] || { icon: ClipboardList, title: "Request", color: T.muted };
    return {
      icon:  info.icon,
      title: info.title,
      desc:  r.notes ? `${r.notes.slice(0, 55)}${r.notes.length > 55 ? "…" : ""}` : "No notes added",
      time:  new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      color: info.color,
    };
  });

  return (
    <DashLayout
      title="DASHBOARD"
      subtitle={`${greeting}, ${firstName} · ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`}
      actions={
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to="/dashboard/request" style={Btn.outline}>+ New Request</Link>
          <Link to="/dashboard/membership" style={Btn.primary}>View Plans <ArrowRight size={14} style={{ marginLeft: 4, verticalAlign: "middle" }} /></Link>
        </div>
      }
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp    { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes shimmer   { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes progressIn{ from{width:0} to{width:var(--w)} }
        @keyframes ringPulse { 0%,100%{box-shadow:0 0 0 0 var(--rc)} 50%{box-shadow:0 0 0 8px transparent} }

        @media(max-width:768px){
          .hero-card  { flex-direction:column!important; padding:1.25rem!important; }
          .hero-right { align-self:flex-start!important; }
          .kpi-grid   { grid-template-columns:1fr 1fr!important; }
          .two-col    { grid-template-columns:1fr!important; }
          .hero-btns  { flex-direction:column!important; }
          .hero-btns a{ width:100%!important; text-align:center!important; }
          .alert-bar  { font-size:0.8rem!important; padding:10px 14px!important; }
          .profile-snap{ flex-wrap:wrap!important; }
          .cta-banner { flex-direction:column!important; }
        }
        @media(max-width:380px){
          .hero-right { display:none!important; }
        }
      `}</style>

      {loading ? <Loader /> : (
        <div>
          {/* ── Hero membership card ── */}
          {membership ? (
            <div className="hero-card" style={{
              position: "relative", display: "flex", justifyContent: "space-between",
              alignItems: "center", background: T.glass,
              border: `1px solid ${planColor}25`,
              borderRadius: "18px", padding: "2rem", marginBottom: "1.5rem",
              overflow: "hidden", gap: "1.5rem", animation: "fadeUp 0.5s ease both",
            }}>
              {/* Glow bg */}
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 70% 60% at 80% 50%, ${planColor}07, transparent)`, pointerEvents: "none" }} />
              {/* Top accent line */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${planColor}, transparent)` }} />

              <div style={{ position: "relative", zIndex: 1, flex: 1, minWidth: 260 }}>
                {/* Status badge */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: "10px", fontWeight: 800, letterSpacing: "2px", border: `1px solid ${planColor}40`, borderRadius: 100, padding: "5px 14px", marginBottom: "1rem", color: planColor, background: planColor + "12" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: planColor, animation: membership.status === "active" ? "shimmer 2s ease infinite" : "none", display: "inline-block" }} />
                  {membership.status === "active" ? "ACTIVE" : "EXPIRED"} · {membership.plan_type?.toUpperCase().replace("HALFYEARLY","HALF-YEARLY")} PLAN
                </div>

                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "2px", color: "#fff", marginBottom: "1.1rem", lineHeight: 1 }}>
                  {membership.status === "active" ? "MEMBERSHIP ACTIVE" : "MEMBERSHIP EXPIRED"}
                </h2>

                {/* Meta row */}
                <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
                  {[
                    { label: "START DATE", value: new Date(membership.start_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) },
                    { label: "EXPIRES ON", value: new Date(membership.end_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) },
                    ...(membership.trainer_name ? [{ label: "TRAINER", value: `🏋 ${membership.trainer_name}` }] : []),
                  ].map((m, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", color: T.sub }}>{m.label}</span>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#fff" }}>{m.value}</span>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                {totalDays > 0 && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "1px", color: T.sub }}>MEMBERSHIP PROGRESS</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: planColor }}>{progressPct}%</span>
                    </div>
                    <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${progressPct}%`, background: `linear-gradient(90deg, ${planColor}80, ${planColor})`, borderRadius: 3, boxShadow: `0 0 8px ${planColor}60`, transition: "width 1.2s ease" }} />
                    </div>
                  </div>
                )}

                <div className="hero-btns" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <Link to="/dashboard/membership" style={{ ...Btn.primary, background: planColor, boxShadow: `0 4px 20px ${planColor}40` }}>
                    Renew / Upgrade <ArrowRight size={13} style={{ marginLeft: 4, verticalAlign: "middle" }} />
                  </Link>
                  <Link to="/dashboard/request" style={Btn.outline}>Raise Request</Link>
                </div>
              </div>

              {/* Days ring */}
              {daysLeft !== null && (
                <div className="hero-right" style={{ flexShrink: 0, textAlign: "center", position: "relative", zIndex: 1 }}>
                  <div style={{
                    width: 116, height: 116, borderRadius: "50%",
                    border: `3px solid ${planColor}`,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 0 30px ${planColor}25, inset 0 0 20px ${planColor}08`,
                    "--rc": planColor + "40",
                    animation: daysLeft <= 7 ? "ringPulse 2s ease infinite" : "none",
                  }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.4rem", color: planColor, letterSpacing: "-2px", lineHeight: 1 }}>{daysLeft}</span>
                    <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1.5px", color: T.sub, lineHeight: 1.4 }}>DAYS<br/>LEFT</span>
                  </div>
                  {daysLeft <= 7 && daysLeft > 0 && <p style={{ fontSize: "11px", fontWeight: 700, color: T.gold, marginTop: 10 }}>⚠ Expiring soon</p>}
                  {daysLeft === 0 && <p style={{ fontSize: "11px", fontWeight: 700, color: T.red, marginTop: 10 }}>✕ Expired</p>}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "3.5rem 2rem", background: T.glass, border: `1px solid ${T.border}`, borderRadius: "18px", marginBottom: "1.5rem", animation: "fadeUp 0.5s ease both" }}>
              <Dumbbell size={40} color={T.red} style={{ marginBottom: "1rem", opacity: 0.7 }} />
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", color: "#fff", marginBottom: "0.5rem" }}>NO ACTIVE MEMBERSHIP</h3>
              <p style={{ fontSize: "0.9rem", color: T.muted, marginBottom: "1.5rem" }}>Join FitZone and start your transformation today.</p>
              <Link to="/dashboard/membership" style={{ ...Btn.primary, display: "inline-block" }}>Browse Plans <ArrowRight size={13} style={{ marginLeft: 4, verticalAlign: "middle" }} /></Link>
            </div>
          )}

          {/* ── KPI Grid ── */}
          <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <KpiCard icon={ClipboardList} label="Total Requests"  value={requests.length}  color={T.cyan}   delay={0.05} />
            <KpiCard icon={Clock}         label="Pending"          value={pendingRequests}  color={T.gold}   delay={0.1}  />
            <KpiCard icon={CheckCircle}   label="Approved"         value={approvedRequests} color={T.green}  delay={0.15} />
            <KpiCard icon={Calendar}      label="Days Remaining"   value={daysLeft !== null ? `${daysLeft}d` : "—"} color={planColor} delay={0.2} />
          </div>

          {/* ── Alert bar ── */}
          {daysLeft !== null && daysLeft <= 7 && membership?.status === "active" && (
            <div className="alert-bar" style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,184,0,0.07)", border: `1px solid rgba(255,184,0,0.25)`, borderRadius: 12, padding: "13px 20px", marginBottom: "1.5rem", animation: "fadeUp 0.5s ease 0.25s both" }}>
              <AlertTriangle size={18} color={T.gold} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: "0.875rem", color: "rgba(255,255,255,0.65)" }}>
                Your <strong>{membership.plan_type}</strong> membership expires in <strong style={{ color: T.gold }}>{daysLeft} day{daysLeft !== 1 ? "s" : ""}</strong>. Renew to avoid losing access.
              </span>
              <Link to="/dashboard/membership" style={{ fontSize: 13, fontWeight: 700, color: T.gold, textDecoration: "none", flexShrink: 0 }}>Renew →</Link>
            </div>
          )}

          {/* ── Two col: Activity + Quick Actions ── */}
          <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem", animation: "fadeUp 0.5s ease 0.3s both" }}>

            <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Activity size={15} color={T.muted} />
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.95rem", letterSpacing: "2.5px", color: T.muted }}>RECENT ACTIVITY</span>
                </div>
                <Link to="/dashboard/request" style={{ fontSize: "12px", color: T.red, textDecoration: "none", fontWeight: 600 }}>View all →</Link>
              </div>
              {recentActivity.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
                  <ClipboardList size={32} color={T.sub} style={{ marginBottom: 12 }} />
                  <p style={{ fontSize: "0.875rem", color: T.muted }}>No activity yet</p>
                  <p style={{ fontSize: "12px", color: T.sub, marginTop: 4 }}>Raise a request to get started</p>
                </div>
              ) : recentActivity.map((a, i) => <ActivityRow key={i} {...a} delay={0.32 + i * 0.05} />)}
            </div>

            <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "1rem 1.25rem", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Zap size={15} color={T.muted} />
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.95rem", letterSpacing: "2.5px", color: T.muted }}>QUICK ACTIONS</span>
                </div>
              </div>
              <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <QuickLink icon={CreditCard}  label="My Membership" sub="View plan & pay online"    href="/dashboard/membership" color={planColor} />
                <QuickLink icon={ClipboardList} label="My Requests" sub="Track all your requests"   href="/dashboard/request"    color={T.gold}    />
                <QuickLink icon={User}         label="My Profile"   sub="Update info & password"     href="/dashboard/profile"    color={T.purple}  />
                <QuickLink icon={Dumbbell}     label="Trainer Info" sub={membership?.trainer_name ? `Assigned: ${membership.trainer_name}` : "No trainer assigned"} href="/dashboard/membership" color={T.cyan} />
              </div>
            </div>
          </div>

          {/* ── Profile snapshot ── */}
          <div className="profile-snap" style={{ display: "flex", alignItems: "center", gap: "1.25rem", background: T.glass, border: `1px solid ${T.border}`, borderRadius: 14, padding: "1.25rem 1.5rem", marginBottom: "1.5rem", animation: "fadeUp 0.5s ease 0.4s both" }}>
            <div style={{ width: 54, height: 54, flexShrink: 0, borderRadius: "50%", background: T.redDim, border: `2px solid ${T.red}40`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: T.red }}>
              {user?.full_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "M"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: 4 }}>{user?.full_name || user?.username}</div>
              <div style={{ fontSize: "12px", color: T.muted, marginBottom: 8 }}>{user?.email}</div>
              {membership && (
                <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "1.5px", border: `1px solid ${planColor}40`, borderRadius: 100, padding: "3px 10px", color: planColor, background: planColor + "10" }}>
                  {membership.plan_type?.toUpperCase().replace("HALFYEARLY","HALF-YEARLY")} MEMBER
                </span>
              )}
            </div>
            <Link to="/dashboard/profile" style={{ padding: "9px 18px", background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, borderRadius: 8, color: T.muted, textDecoration: "none", fontWeight: 600, fontSize: 13, flexShrink: 0, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color="#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color=T.muted; }}
            >
              Edit Profile →
            </Link>
          </div>

          {/* ── CTA Banner ── */}
          <div className="cta-banner" style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", background: T.redDim, border: `1px solid rgba(255,26,26,0.18)`, borderRadius: 14, padding: "1.5rem 2rem", gap: "1rem", overflow: "hidden", animation: "fadeUp 0.5s ease 0.45s both" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 40% 80% at 95% 50%, rgba(255,26,26,0.07), transparent)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: 5 }}>Need help or a custom plan?</div>
              <div style={{ fontSize: "0.875rem", color: T.muted }}>Raise a request and our team will contact you within 24 hours.</div>
            </div>
            <Link to="/dashboard/request" style={{ ...Btn.primary, flexShrink: 0, position: "relative", zIndex: 1 }}>
              Raise a Request <ArrowRight size={13} style={{ marginLeft: 4, verticalAlign: "middle" }} />
            </Link>
          </div>
        </div>
      )}
    </DashLayout>
  );
}

function Loader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "5rem", gap: 16 }}>
      <div style={{ width: 32, height: 32, border: "2.5px solid rgba(255,26,26,0.15)", borderTop: "2.5px solid #FF1A1A", borderRadius: "50%", animation: "spin 0.75s linear infinite" }} />
      <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>Loading your dashboard…</span>
    </div>
  );
}

const Btn = {
  primary: {
    padding: "10px 20px", background: "linear-gradient(135deg, #FF1A1A, #cc0000)",
    color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "13px",
    borderRadius: 9, boxShadow: "0 4px 16px rgba(255,26,26,0.3)", display: "inline-flex", alignItems: "center",
  },
  outline: {
    padding: "10px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.6)", textDecoration: "none", fontWeight: 600, fontSize: "13px", borderRadius: 9,
  },
};