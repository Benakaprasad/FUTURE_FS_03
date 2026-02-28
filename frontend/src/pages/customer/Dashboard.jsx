import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashLayout from "../../components/DashLayout";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

// ── Sub-components ─────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, accent, sub }) {
  return (
    <div style={{ ...ds.kpiCard, borderTop: `3px solid ${accent}` }}>
      <div style={ds.kpiTop}>
        <span style={{ ...ds.kpiIcon, background: accent + "15", color: accent }}>{icon}</span>
      </div>
      <p style={{ ...ds.kpiValue, color: accent }}>{value ?? "—"}</p>
      <p style={ds.kpiLabel}>{label}</p>
      {sub && <p style={ds.kpiSub}>{sub}</p>}
    </div>
  );
}

function ActivityRow({ icon, title, desc, time, accent }) {
  return (
    <div style={ds.activityRow}>
      <span style={{ ...ds.activityIcon, background: accent + "15", color: accent }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={ds.activityTitle}>{title}</p>
        <p style={ds.activityDesc}>{desc}</p>
      </div>
      <span style={ds.activityTime}>{time}</span>
    </div>
  );
}

function QuickLink({ icon, label, sub, href, accent }) {
  return (
    <Link to={href} style={ds.quickLink}>
      <span style={{ ...ds.quickIcon, color: accent, background: accent + "15" }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={ds.quickLabel}>{label}</p>
        <p style={ds.quickSub}>{sub}</p>
      </div>
      <span style={ds.quickArrow}>→</span>
    </Link>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────

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

  // ── Derived values ──────────────────────────────────────────────────────────
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

  const PLAN_COLORS = {
    student:    "#00C2FF",
    monthly:    "#FF6B00",
    quarterly:  "#FF1A1A",
    halfyearly: "#FFB800",
    annual:     "#22C55E",
  };
  const planColor = PLAN_COLORS[membership?.plan_type] || "#FF1A1A";

  const greetHour = new Date().getHours();
  const greeting  = greetHour < 12 ? "Good Morning" : greetHour < 17 ? "Good Afternoon" : "Good Evening";
  const firstName = user?.full_name?.split(" ")[0] || user?.username || "Member";

  // ── Recent activity (synthesised from requests) ─────────────────────────────
  const recentActivity = requests.slice(0, 4).map((r) => {
    const typeMap = {
      new_membership: { icon: "🆕", title: "New Membership Request", accent: "#22C55E" },
      renewal:        { icon: "🔄", title: "Renewal Request",        accent: "#00C2FF" },
      upgrade:        { icon: "⬆️", title: "Plan Upgrade Request",   accent: "#A855F7" },
      trainer_request:{ icon: "🏋️", title: "Trainer Request",        accent: "#FF6B00" },
      freeze:         { icon: "❄️", title: "Freeze Request",         accent: "#00C2FF" },
      cancellation:   { icon: "✕",  title: "Cancellation Request",   accent: "#FF1A1A" },
      other:          { icon: "💬", title: "General Request",        accent: "#FFB800" },
    };
    const info = typeMap[r.request_type] || { icon: "📋", title: "Request", accent: "#fff" };
    return {
      icon:   info.icon,
      title:  info.title,
      desc:   r.notes ? `"${r.notes.slice(0, 50)}${r.notes.length > 50 ? "…" : ""}"` : "No notes added",
      time:   new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      accent: info.accent,
    };
  });

  return (
    <DashLayout
      title="DASHBOARD"
      subtitle={`${greeting}, ${firstName} · ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`}
      actions={
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to="/dashboard/request" style={ds.outlineBtn}>+ New Request</Link>
          <Link to="/dashboard/membership" style={ds.primaryBtn}>View Plans →</Link>
        </div>
      }
    >
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes progressFill { from { width: 0%; } to { width: var(--target-width); } }
        .kpi-card:hover    { transform: translateY(-3px) !important; box-shadow: 0 8px 30px rgba(0,0,0,0.3) !important; }
        .quick-link:hover  { background: rgba(255,255,255,0.04) !important; border-color: rgba(255,255,255,0.12) !important; }
        .quick-link:hover .quick-arrow { color: #FF1A1A !important; }

        /* ── Mobile responsive overrides ── */
        @media (max-width: 768px) {

          /* Hero card: stack vertically, hide days ring on very small */
          .hero-card {
            flex-direction: column !important;
            padding: 1.25rem !important;
          }
          .hero-left { min-width: unset !important; }
          .hero-right {
            align-self: flex-start !important;
          }
          .hero-title { font-size: 1.4rem !important; }
          .hero-btns {
            flex-direction: column !important;
          }
          .hero-btns a {
            text-align: center;
            width: 100%;
          }

          /* KPI: 2 per row on mobile */
          .kpi-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 0.75rem !important;
          }
          .kpi-card { padding: 1rem !important; }
          .kpi-value { font-size: 1.6rem !important; }

          /* Two col panels: stack */
          .two-col {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }

          /* Alert bar: smaller text */
          .alert-bar {
            padding: 10px 14px !important;
            font-size: 0.8rem !important;
            gap: 8px !important;
          }

          /* Profile snap: wrap on mobile */
          .profile-snap {
            padding: 1rem !important;
            gap: 0.875rem !important;
          }
          .snap-edit-btn {
            width: 100% !important;
            text-align: center !important;
          }

          /* CTA banner: stack */
          .cta-banner {
            flex-direction: column !important;
            padding: 1.25rem !important;
            align-items: flex-start !important;
          }
          .cta-banner-btn {
            width: 100% !important;
            text-align: center !important;
          }

          /* Activity row: truncate desc */
          .activity-desc {
            display: none !important;
          }
          .activity-title { font-size: 0.8rem !important; }
        }

        /* ── Very small phones (≤380px) ── */
        @media (max-width: 380px) {
          .kpi-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .hero-right { display: none !important; }
        }
      `}</style>

      {loading ? <Loader /> : (
        <div style={{ animation: "fadeUp 0.4s ease forwards" }}>

          {/* ── Membership Hero Card ── */}
          {membership ? (
            <div className="hero-card" style={{ ...ds.heroCard, borderColor: planColor + "30" }}>
              <div style={{ ...ds.heroGlow, background: `radial-gradient(ellipse 80% 60% at 70% 50%, ${planColor}08, transparent)` }} />

              <div className="hero-left" style={ds.heroLeft}>
                <span style={{
                  ...ds.heroBadge,
                  color: membership.status === "active" ? planColor : "#FF1A1A",
                  borderColor: (membership.status === "active" ? planColor : "#FF1A1A") + "40",
                  background: (membership.status === "active" ? planColor : "#FF1A1A") + "12",
                }}>
                  {membership.status === "active" ? "● ACTIVE" : "● EXPIRED"}
                  {" · "}
                  {membership.plan_type?.toUpperCase().replace("HALFYEARLY", "HALF-YEARLY")} PLAN
                </span>

                <h2 className="hero-title" style={ds.heroTitle}>
                  {membership.status === "active" ? "MEMBERSHIP ACTIVE" : "MEMBERSHIP EXPIRED"}
                </h2>

                <div style={ds.heroMeta}>
                  <div style={ds.heroMetaItem}>
                    <span style={ds.heroMetaLabel}>START DATE</span>
                    <span style={ds.heroMetaValue}>
                      {new Date(membership.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div style={ds.heroMetaDivider} />
                  <div style={ds.heroMetaItem}>
                    <span style={ds.heroMetaLabel}>EXPIRES ON</span>
                    <span style={ds.heroMetaValue}>
                      {new Date(membership.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  {membership.trainer_name && (
                    <>
                      <div style={ds.heroMetaDivider} />
                      <div style={ds.heroMetaItem}>
                        <span style={ds.heroMetaLabel}>TRAINER</span>
                        <span style={ds.heroMetaValue}>🏋️ {membership.trainer_name}</span>
                      </div>
                    </>
                  )}
                </div>

                {totalDays && (
                  <div style={ds.progressWrap}>
                    <div style={ds.progressLabelRow}>
                      <span style={ds.progressLabel}>Membership Progress</span>
                      <span style={{ ...ds.progressLabel, color: planColor }}>{progressPct}%</span>
                    </div>
                    <div style={ds.progressTrack}>
                      <div style={{
                        ...ds.progressFill,
                        width: `${progressPct}%`,
                        background: `linear-gradient(90deg, ${planColor}99, ${planColor})`,
                        boxShadow: `0 0 10px ${planColor}60`,
                      }} />
                    </div>
                  </div>
                )}

                <div className="hero-btns" style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
                  <Link to="/dashboard/membership" style={{ ...ds.heroBtn, background: planColor, color: "#fff" }}>
                    Renew / Upgrade →
                  </Link>
                  <Link to="/dashboard/request" style={ds.heroBtnOutline}>
                    Raise Request
                  </Link>
                </div>
              </div>

              {daysLeft !== null && (
                <div className="hero-right" style={ds.heroRight}>
                  <div style={{ ...ds.daysRing, borderColor: planColor, boxShadow: `0 0 30px ${planColor}30` }}>
                    <span style={{ ...ds.daysNum, color: planColor }}>{daysLeft}</span>
                    <span style={ds.daysLabel}>DAYS<br />LEFT</span>
                  </div>
                  {daysLeft <= 7 && daysLeft > 0 && (
                    <p style={{ ...ds.daysWarning, color: "#FFB800" }}>⚠ Expiring soon!</p>
                  )}
                  {daysLeft === 0 && (
                    <p style={{ ...ds.daysWarning, color: "#FF1A1A" }}>✕ Expired</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={ds.noMembership}>
              <div style={ds.noMemGlow} />
              <span style={ds.noMemIcon}>🏋️</span>
              <h3 style={ds.noMemTitle}>No Active Membership</h3>
              <p style={ds.noMemSub}>Join FitZone and start your transformation today.</p>
              <Link to="/dashboard/membership" style={{ ...ds.primaryBtn, marginTop: "1.5rem", display: "inline-block" }}>
                Browse Plans →
              </Link>
            </div>
          )}

          {/* ── KPI Grid ── */}
          <div className="kpi-grid" style={ds.kpiGrid}>
            <div className="kpi-card" style={{ ...ds.kpiCard, borderTop: "3px solid #22C55E", transition: "all 0.2s" }}>
              <div style={ds.kpiTop}>
                <span style={{ ...ds.kpiIcon, background: "#22C55E15", color: "#22C55E" }}>📋</span>
              </div>
              <p style={{ ...ds.kpiValue, color: "#22C55E" }}>{requests.length}</p>
              <p style={ds.kpiLabel}>Total Requests</p>
            </div>
            <div className="kpi-card" style={{ ...ds.kpiCard, borderTop: "3px solid #FFB800", transition: "all 0.2s" }}>
              <div style={ds.kpiTop}>
                <span style={{ ...ds.kpiIcon, background: "#FFB80015", color: "#FFB800" }}>⏳</span>
              </div>
              <p style={{ ...ds.kpiValue, color: "#FFB800" }}>{pendingRequests}</p>
              <p style={ds.kpiLabel}>Pending Requests</p>
            </div>
            <div className="kpi-card" style={{ ...ds.kpiCard, borderTop: "3px solid #00C2FF", transition: "all 0.2s" }}>
              <div style={ds.kpiTop}>
                <span style={{ ...ds.kpiIcon, background: "#00C2FF15", color: "#00C2FF" }}>✅</span>
              </div>
              <p style={{ ...ds.kpiValue, color: "#00C2FF" }}>{approvedRequests}</p>
              <p style={ds.kpiLabel}>Approved</p>
            </div>
            <div className="kpi-card" style={{ ...ds.kpiCard, borderTop: `3px solid ${planColor}`, transition: "all 0.2s" }}>
              <div style={ds.kpiTop}>
                <span style={{ ...ds.kpiIcon, background: planColor + "15", color: planColor }}>🗓️</span>
              </div>
              <p style={{ ...ds.kpiValue, color: planColor }}>
                {daysLeft !== null ? `${daysLeft}d` : "—"}
              </p>
              <p style={ds.kpiLabel}>Days Remaining</p>
            </div>
          </div>

          {/* ── Expiry alert ── */}
          {daysLeft !== null && daysLeft <= 7 && membership?.status === "active" && (
            <div className="alert-bar" style={ds.alertBar}>
              <span style={{ fontSize: "1.1rem" }}>⚠️</span>
              <span style={{ flex: 1, fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>
                Your <strong>{membership.plan_type}</strong> membership expires in <strong style={{ color: "#FFB800" }}>{daysLeft} day{daysLeft !== 1 ? "s" : ""}</strong>. Renew now to avoid losing access.
              </span>
              <Link to="/dashboard/membership" style={{ fontSize: "13px", fontWeight: 700, color: "#FFB800", textDecoration: "none" }}>
                Renew →
              </Link>
            </div>
          )}

          {/* ── Two-col: Activity + Quick Actions ── */}
          <div className="two-col" style={ds.twoCol}>

            <div style={ds.panel}>
              <div style={ds.panelHeader}>
                <h3 style={ds.panelTitle}>RECENT ACTIVITY</h3>
                <Link to="/dashboard/request" style={ds.viewAll}>View all →</Link>
              </div>
              {recentActivity.length === 0 ? (
                <div style={ds.emptyState}>
                  <span style={ds.emptyIcon}>📭</span>
                  <p style={ds.emptyText}>No activity yet</p>
                  <p style={ds.emptySub}>Raise a request to get started.</p>
                </div>
              ) : (
                <div style={ds.activityList}>
                  {recentActivity.map((a, i) => (
                    <ActivityRow key={i} {...a} />
                  ))}
                </div>
              )}
            </div>

            <div style={ds.panel}>
              <div style={ds.panelHeader}>
                <h3 style={ds.panelTitle}>QUICK ACTIONS</h3>
              </div>
              <div style={ds.quickList}>
                <QuickLink icon="💳" label="My Membership" sub="View plan & pay online"      href="/dashboard/membership" accent={planColor} />
                <QuickLink icon="📋" label="My Requests"   sub="Track all your requests"     href="/dashboard/request"    accent="#FFB800"  />
                <QuickLink icon="👤" label="My Profile"    sub="Update info & password"       href="/dashboard/profile"    accent="#A855F7"  />
                <QuickLink
                  icon="🏋️"
                  label="Trainer Info"
                  sub={membership?.trainer_name ? `Assigned: ${membership.trainer_name}` : "No trainer assigned yet"}
                  href="/dashboard/membership"
                  accent="#00C2FF"
                />
              </div>
            </div>
          </div>

          {/* ── Profile snapshot ── */}
          <div className="profile-snap" style={ds.profileSnap}>
            <div style={ds.snapAvatar}>
              {user?.full_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "M"}
            </div>
            <div style={ds.snapInfo}>
              <h4 style={ds.snapName}>{user?.full_name || user?.username}</h4>
              <p style={ds.snapEmail}>{user?.email}</p>
              {membership && (
                <span style={{
                  ...ds.snapBadge,
                  color: planColor,
                  borderColor: planColor + "40",
                  background: planColor + "10",
                }}>
                  {membership.plan_type?.toUpperCase().replace("HALFYEARLY", "HALF-YEARLY")} MEMBER
                </span>
              )}
            </div>
            <Link className="snap-edit-btn" to="/dashboard/profile" style={ds.snapEditBtn}>
              Edit Profile →
            </Link>
          </div>

          {/* ── CTA Banner ── */}
          <div className="cta-banner" style={ds.ctaBanner}>
            <div style={ds.ctaBannerGlow} />
            <div style={ds.ctaBannerLeft}>
              <h4 style={ds.ctaBannerTitle}>Need help or a custom plan?</h4>
              <p style={ds.ctaBannerSub}>Raise a request and our team will contact you within 24 hours.</p>
            </div>
            <Link className="cta-banner-btn" to="/dashboard/request" style={ds.ctaBannerBtn}>
              Raise a Request →
            </Link>
          </div>

        </div>
      )}
    </DashLayout>
  );
}

// ── Loader ─────────────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
      <div style={{
        width: "36px", height: "36px",
        border: "3px solid rgba(255,26,26,0.2)",
        borderTop: "3px solid #FF1A1A",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
    </div>
  );
}

// ── Styles (unchanged from original) ──────────────────────────────────────────
const ds = {
  primaryBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #FF1A1A, #cc0000)",
    color: "#fff", textDecoration: "none",
    fontWeight: 700, fontSize: "13px",
    borderRadius: "8px",
    boxShadow: "0 4px 15px rgba(255,26,26,0.3)",
  },
  outlineBtn: {
    padding: "10px 20px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.7)", textDecoration: "none",
    fontWeight: 600, fontSize: "13px", borderRadius: "8px",
  },
  heroCard: {
    position: "relative", display: "flex",
    justifyContent: "space-between", alignItems: "center",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid",
    borderRadius: "16px", padding: "2rem",
    marginBottom: "1.5rem", overflow: "hidden", gap: "1.5rem",
    flexWrap: "wrap",
  },
  heroGlow:  { position: "absolute", inset: 0, pointerEvents: "none" },
  heroLeft:  { position: "relative", zIndex: 1, flex: 1, minWidth: "260px" },
  heroBadge: {
    display: "inline-block", fontSize: "10px", fontWeight: 800,
    letterSpacing: "2px", border: "1px solid",
    borderRadius: "100px", padding: "4px 12px", marginBottom: "0.75rem",
  },
  heroTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "1.8rem", letterSpacing: "2px",
    color: "#fff", marginBottom: "1rem",
  },
  heroMeta:       { display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.25rem" },
  heroMetaItem:   { display: "flex", flexDirection: "column", gap: "3px" },
  heroMetaDivider:{ width: "1px", background: "rgba(255,255,255,0.08)", alignSelf: "stretch" },
  heroMetaLabel:  { fontSize: "10px", fontWeight: 700, letterSpacing: "2px", color: "rgba(255,255,255,0.3)" },
  heroMetaValue:  { fontSize: "0.9rem", fontWeight: 600, color: "#fff" },
  progressWrap: { marginBottom: "0.25rem" },
  progressLabelRow: { display: "flex", justifyContent: "space-between", marginBottom: "6px" },
  progressLabel: { fontSize: "11px", fontWeight: 700, letterSpacing: "1px", color: "rgba(255,255,255,0.35)" },
  progressTrack: { height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: "3px", transition: "width 1s ease" },
  heroBtn: {
    padding: "10px 20px", borderRadius: "8px",
    fontWeight: 700, fontSize: "13px",
    textDecoration: "none", display: "inline-block", transition: "all 0.2s",
  },
  heroBtnOutline: {
    padding: "10px 20px", borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.6)",
    fontWeight: 600, fontSize: "13px",
    textDecoration: "none", display: "inline-block",
  },
  heroRight: { flexShrink: 0, position: "relative", zIndex: 1, textAlign: "center" },
  daysRing: {
    width: "110px", height: "110px", borderRadius: "50%",
    border: "3px solid",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
  },
  daysNum: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "2.2rem", letterSpacing: "-1px", lineHeight: 1,
  },
  daysLabel: {
    fontSize: "9px", fontWeight: 700, letterSpacing: "1px",
    color: "rgba(255,255,255,0.35)", textAlign: "center", lineHeight: 1.3,
  },
  daysWarning: { fontSize: "11px", fontWeight: 700, marginTop: "8px", letterSpacing: "0.5px" },
  noMembership: {
    position: "relative", textAlign: "center", padding: "3.5rem 2rem",
    background: "rgba(255,255,255,0.01)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px", marginBottom: "1.5rem", overflow: "hidden",
  },
  noMemGlow: {
    position: "absolute", inset: 0,
    background: "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(255,26,26,0.05), transparent)",
    pointerEvents: "none",
  },
  noMemIcon:  { fontSize: "2.5rem", display: "block", marginBottom: "1rem" },
  noMemTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "#fff", marginBottom: "0.5rem" },
  noMemSub:   { fontSize: "0.9rem", color: "rgba(255,255,255,0.35)" },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "1rem", marginBottom: "1.5rem",
  },
  kpiCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px", padding: "1.25rem",
  },
  kpiTop:   { marginBottom: "0.75rem" },
  kpiIcon: {
    width: "36px", height: "36px", borderRadius: "8px",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
  },
  kpiValue: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", marginBottom: "4px", letterSpacing: "-0.5px" },
  kpiLabel: { fontSize: "12px", color: "rgba(255,255,255,0.35)", fontWeight: 500 },
  kpiSub:   { fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "2px" },
  alertBar: {
    display: "flex", alignItems: "center", gap: "12px",
    background: "rgba(255,184,0,0.06)",
    border: "1px solid rgba(255,184,0,0.2)",
    borderRadius: "10px", padding: "14px 20px", marginBottom: "1.5rem",
  },
  twoCol: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem", marginBottom: "1.5rem",
  },
  panel: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px", overflow: "hidden",
  },
  panelHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "1rem 1.25rem",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  panelTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "2px", color: "rgba(255,255,255,0.5)" },
  viewAll: { fontSize: "12px", color: "#FF1A1A", textDecoration: "none", fontWeight: 600 },
  emptyState: { textAlign: "center", padding: "2.5rem 1rem" },
  emptyIcon: { fontSize: "2rem", display: "block", marginBottom: "0.75rem" },
  emptyText: { fontSize: "0.9rem", fontWeight: 600, color: "rgba(255,255,255,0.35)", marginBottom: "4px" },
  emptySub:  { fontSize: "0.8rem", color: "rgba(255,255,255,0.2)" },
  activityList: { display: "flex", flexDirection: "column" },
  activityRow: {
    display: "flex", alignItems: "center", gap: "0.875rem",
    padding: "1rem 1.25rem",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  activityIcon: {
    width: "36px", height: "36px", flexShrink: 0,
    borderRadius: "8px",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.95rem",
  },
  activityTitle: { fontSize: "0.875rem", fontWeight: 600, color: "#fff", marginBottom: "2px" },
  activityDesc:  { fontSize: "11px", color: "rgba(255,255,255,0.35)", lineHeight: 1.4 },
  activityTime:  { fontSize: "11px", color: "rgba(255,255,255,0.3)", flexShrink: 0, fontWeight: 500 },
  quickList: { display: "flex", flexDirection: "column", padding: "0.5rem", gap: "0.25rem" },
  quickLink: {
    display: "flex", alignItems: "center", gap: "1rem",
    padding: "1rem",
    background: "rgba(255,255,255,0.01)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "10px",
    textDecoration: "none", color: "#fff", transition: "all 0.2s", cursor: "pointer",
  },
  quickIcon: {
    width: "40px", height: "40px", flexShrink: 0,
    borderRadius: "8px",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.15rem",
  },
  quickLabel: { fontSize: "0.875rem", fontWeight: 700, marginBottom: "2px" },
  quickSub:   { fontSize: "11px", color: "rgba(255,255,255,0.35)" },
  quickArrow: { marginLeft: "auto", color: "rgba(255,255,255,0.2)", fontSize: "14px", transition: "color 0.2s" },
  profileSnap: {
    display: "flex", alignItems: "center", gap: "1.25rem",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "14px", padding: "1.25rem 1.5rem",
    marginBottom: "1.5rem", flexWrap: "wrap",
  },
  snapAvatar: {
    width: "52px", height: "52px", flexShrink: 0, borderRadius: "50%",
    background: "rgba(255,26,26,0.15)", border: "2px solid rgba(255,26,26,0.3)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "#FF1A1A",
  },
  snapInfo: { flex: 1 },
  snapName: { fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "3px" },
  snapEmail:{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "6px" },
  snapBadge:{
    display: "inline-block", fontSize: "10px", fontWeight: 800,
    letterSpacing: "1.5px", border: "1px solid",
    borderRadius: "100px", padding: "3px 10px",
  },
  snapEditBtn: {
    padding: "9px 18px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px", color: "rgba(255,255,255,0.6)",
    textDecoration: "none", fontWeight: 600, fontSize: "13px", flexShrink: 0,
  },
  ctaBanner: {
    position: "relative", display: "flex",
    justifyContent: "space-between", alignItems: "center",
    background: "rgba(255,26,26,0.05)",
    border: "1px solid rgba(255,26,26,0.15)",
    borderRadius: "14px", padding: "1.5rem 2rem",
    gap: "1rem", flexWrap: "wrap", overflow: "hidden",
  },
  ctaBannerGlow: {
    position: "absolute", inset: 0,
    background: "radial-gradient(ellipse 50% 80% at 100% 50%, rgba(255,26,26,0.06), transparent)",
    pointerEvents: "none",
  },
  ctaBannerLeft: { position: "relative", zIndex: 1 },
  ctaBannerTitle:{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "4px" },
  ctaBannerSub:  { fontSize: "0.875rem", color: "rgba(255,255,255,0.4)" },
  ctaBannerBtn: {
    position: "relative", zIndex: 1,
    padding: "12px 24px",
    background: "linear-gradient(135deg, #FF1A1A, #cc0000)",
    color: "#fff", textDecoration: "none",
    fontWeight: 700, fontSize: "13px",
    borderRadius: "8px", flexShrink: 0,
    boxShadow: "0 4px 15px rgba(255,26,26,0.3)",
  },
};