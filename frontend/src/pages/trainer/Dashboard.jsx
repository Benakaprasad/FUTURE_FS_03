import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashLayout from "../../components/DashLayout";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

function StatCard({ icon, label, value, accent }) {
  return (
    <div style={{ ...ts.statCard, borderTop: `3px solid ${accent}` }}>
      <span style={{ ...ts.statIcon, color: accent }}>{icon}</span>
      <p style={ts.statValue}>{value ?? "—"}</p>
      <p style={ts.statLabel}>{label}</p>
    </div>
  );
}

// ── Shared screen shell (logo + sign out) ─────────────────────
function StatusScreen({ children }) {
  const { logout } = useAuth();
  return (
    <div style={{ minHeight:"100vh", background:"#000", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans', sans-serif", padding:"1.5rem", position:"relative", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);} }
        @keyframes spin    { to{transform:rotate(360deg);} }
        @keyframes shimmer { 0%{background-position:200% center;} 100%{background-position:-200% center;} }
      `}</style>

      {/* Grid bg */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", backgroundImage:"linear-gradient(rgba(255,26,26,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,26,26,0.03) 1px, transparent 1px)", backgroundSize:"60px 60px" }} />

      <div style={{ position:"relative", zIndex:1, maxWidth:"520px", width:"100%", animation:"fadeUp 0.6s ease forwards" }}>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"2.5rem", justifyContent:"center" }}>
          <div style={{ width:"40px", height:"40px", background:"linear-gradient(135deg,#FF1A1A,#991111)", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Bebas Neue',sans-serif", fontSize:"16px", color:"#fff", boxShadow:"0 4px 20px rgba(255,26,26,0.4)" }}>FZ</div>
          <div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"18px", letterSpacing:"3px", color:"#fff", lineHeight:1 }}>FITZONE</div>
            <div style={{ fontSize:"9px", letterSpacing:"4px", color:"#FF1A1A", fontWeight:600 }}>GYM</div>
          </div>
        </div>

        {children}

        <button onClick={logout} style={{ width:"100%", marginTop:"1rem", padding:"13px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", color:"rgba(255,255,255,0.35)", fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:"0.875rem", cursor:"pointer" }}>
          Sign Out
        </button>
        <p style={{ textAlign:"center", marginTop:"1.25rem", fontSize:"12px", color:"rgba(255,255,255,0.15)" }}>FitZone Gym · All rights reserved</p>
      </div>
    </div>
  );
}

// ── Pending Screen ────────────────────────────────────────────
function PendingScreen({ user }) {
  return (
    <StatusScreen>
      <div style={{ background:"#0a0a0a", border:"1px solid rgba(255,183,0,0.2)", borderRadius:"20px", overflow:"hidden", boxShadow:"0 30px 80px rgba(0,0,0,0.8)" }}>
        <div style={{ height:"4px", background:"linear-gradient(90deg,#FFB700,#ff8c00,#FFB700)", backgroundSize:"200% 100%", animation:"shimmer 2s linear infinite" }} />
        <div style={{ padding:"2.5rem" }}>

          {/* Animated spinner as icon */}
          <div style={{ width:"72px", height:"72px", borderRadius:"50%", background:"rgba(255,183,0,0.08)", border:"2px solid rgba(255,183,0,0.25)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.5rem" }}>
            <div style={{ width:"32px", height:"32px", border:"3px solid rgba(255,183,0,0.2)", borderTop:"3px solid #FFB700", borderRadius:"50%", animation:"spin 1.2s linear infinite" }} />
          </div>

          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"2.2rem", letterSpacing:"3px", color:"#fff", textAlign:"center", marginBottom:"0.5rem" }}>UNDER REVIEW</h1>
          <p style={{ fontSize:"0.875rem", color:"rgba(255,255,255,0.35)", textAlign:"center", marginBottom:"2rem" }}>
            Hi {user?.full_name || user?.username}, your application is being reviewed.
          </p>

          <div style={{ background:"rgba(255,183,0,0.05)", border:"1px solid rgba(255,183,0,0.15)", borderRadius:"12px", padding:"1.25rem", marginBottom:"1.5rem" }}>
            <p style={{ fontSize:"10px", fontWeight:800, letterSpacing:"2px", color:"#FFB700", marginBottom:"0.75rem" }}>YOUR APPLICATION STATUS</p>
            <p style={{ fontSize:"0.9rem", color:"rgba(255,255,255,0.6)", lineHeight:1.8 }}>
              Thank you for submitting your trainer application to FitZone Gym. Our management team is currently reviewing your qualifications, certifications, and experience.
            </p>
            <p style={{ fontSize:"0.9rem", color:"rgba(255,255,255,0.6)", lineHeight:1.8, marginTop:"0.75rem" }}>
              You'll have full access to your trainer dashboard once approved. This usually takes 1–2 business days.
            </p>
          </div>

          <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"12px", padding:"1.25rem" }}>
            <p style={{ fontSize:"10px", fontWeight:800, letterSpacing:"2px", color:"rgba(255,255,255,0.3)", marginBottom:"1rem" }}>WHAT HAPPENS NEXT</p>
            {[
              { icon:"🔍", label:"Review in progress",              active: true  },
              { icon:"✅", label:"Admin approves your profile",     active: false },
              { icon:"🚀", label:"Full dashboard access granted",   active: false },
            ].map((step, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom: i < 2 ? "0.875rem" : 0 }}>
                <div style={{ width:"32px", height:"32px", flexShrink:0, borderRadius:"50%", background: step.active ? "rgba(255,183,0,0.1)" : "rgba(255,255,255,0.04)", border:`1px solid ${step.active ? "rgba(255,183,0,0.3)" : "rgba(255,255,255,0.08)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px" }}>
                  {step.icon}
                </div>
                <span style={{ fontSize:"0.875rem", color: step.active ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)", fontWeight: step.active ? 600 : 400, flex:1 }}>{step.label}</span>
                {step.active && <span style={{ fontSize:"11px", fontWeight:800, color:"#FFB700", background:"rgba(255,183,0,0.1)", border:"1px solid rgba(255,183,0,0.2)", padding:"2px 8px", borderRadius:"100px", flexShrink:0 }}>IN PROGRESS</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </StatusScreen>
  );
}

// ── Rejection Screen ──────────────────────────────────────────
function RejectionScreen({ profile, user }) {
  return (
    <StatusScreen>
      <div style={{ background:"#0a0a0a", border:"1px solid rgba(255,26,26,0.2)", borderRadius:"20px", overflow:"hidden", boxShadow:"0 30px 80px rgba(0,0,0,0.8)" }}>
        <div style={{ height:"4px", background:"linear-gradient(90deg,#FF1A1A,#cc0000,#FF1A1A)" }} />
        <div style={{ padding:"2.5rem" }}>

          <div style={{ width:"72px", height:"72px", borderRadius:"50%", background:"rgba(255,26,26,0.08)", border:"2px solid rgba(255,26,26,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem", margin:"0 auto 1.5rem" }}>❌</div>

          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"2.2rem", letterSpacing:"3px", color:"#fff", textAlign:"center", marginBottom:"0.5rem" }}>APPLICATION REVIEWED</h1>
          <p style={{ fontSize:"0.875rem", color:"rgba(255,255,255,0.35)", textAlign:"center", marginBottom:"2rem" }}>
            Hi {user?.full_name || user?.username}, we've completed our review.
          </p>

          {/* Thank you note */}
          <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"12px", padding:"1.25rem", marginBottom:"1.25rem" }}>
            <p style={{ fontSize:"10px", fontWeight:800, letterSpacing:"2px", color:"rgba(255,255,255,0.3)", marginBottom:"0.75rem" }}>A NOTE FROM THE TEAM</p>
            <p style={{ fontSize:"0.9rem", color:"rgba(255,255,255,0.6)", lineHeight:1.8 }}>
              Thank you for taking the time to fill out your trainer application and sharing your qualifications with us. We truly appreciate the effort you put into submitting your certifications and experience.
            </p>
            <p style={{ fontSize:"0.9rem", color:"rgba(255,255,255,0.6)", lineHeight:1.8, marginTop:"0.75rem" }}>
              After careful review, we are unable to move forward with your application at this time. We encourage you to continue building your credentials and apply again in the future.
            </p>
          </div>

          {/* Admin reason — only shown if provided */}
          {profile?.notes && (
            <div style={{ background:"rgba(255,26,26,0.05)", border:"1px solid rgba(255,26,26,0.2)", borderRadius:"12px", padding:"1.25rem", marginBottom:"1.25rem" }}>
              <p style={{ fontSize:"10px", fontWeight:800, letterSpacing:"2px", color:"#FF1A1A", marginBottom:"0.75rem" }}>REASON FROM MANAGEMENT</p>
              <p style={{ fontSize:"0.9rem", color:"rgba(255,255,255,0.65)", lineHeight:1.8, fontStyle:"italic" }}>"{profile.notes}"</p>
            </div>
          )}

          {/* What to do */}
          <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"12px", padding:"1.25rem" }}>
            <p style={{ fontSize:"10px", fontWeight:800, letterSpacing:"2px", color:"rgba(255,255,255,0.3)", marginBottom:"0.75rem" }}>WHAT YOU CAN DO</p>
            {[
              "Obtain additional certifications in your specialization",
              "Gain more hands-on training experience",
              "Reapply once you've strengthened your qualifications",
            ].map((item, i) => (
              <div key={i} style={{ display:"flex", gap:"10px", alignItems:"flex-start", marginBottom: i < 2 ? "8px" : 0 }}>
                <span style={{ color:"rgba(255,255,255,0.25)", fontSize:"12px", marginTop:"2px", flexShrink:0 }}>→</span>
                <span style={{ fontSize:"0.85rem", color:"rgba(255,255,255,0.45)", lineHeight:1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StatusScreen>
  );
}

// ── Main Dashboard (active trainers only) ─────────────────────
export default function TrainerDashboard() {
  const { user } = useAuth();
  const [profile,  setProfile]  = useState(null);
  const [members,  setMembers]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/trainers/me").catch(() => ({ data: {} })),
      api.get("/trainers/me/members").catch(() => ({ data: { members: [] } })),
    ]).then(([profRes, memRes]) => {
      setProfile(profRes.data.trainer || profRes.data);
      setMembers(memRes.data.members || []);
    }).finally(() => setLoading(false));
  }, []);

  // Loading state
  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#000", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width:"36px", height:"36px", border:"3px solid rgba(0,194,255,0.2)", borderTop:"3px solid #00C2FF", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
    </div>
  );

  // ── Gate: pending ──
  if (profile?.status === "inactive") return <PendingScreen user={user} />;

  // ── Gate: rejected ──
  if (profile?.status === "on_leave") return <RejectionScreen profile={profile} user={user} />;

  // ── Active dashboard ──
  const activeMembers   = members.filter((m) => m.membership_status === "active");
  const expiringMembers = members.filter((m) => {
    if (!m.membership_end_date) return false;
    const days = Math.ceil((new Date(m.membership_end_date) - new Date()) / 86400000);
    return days >= 0 && days <= 7;
  });
  const greetHour = new Date().getHours();
  const greet = greetHour < 12 ? "Good Morning" : greetHour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <DashLayout
      title={`${greet}, ${user?.full_name?.split(" ")[0] || "Coach"} 💪`}
      subtitle="Your training overview"
      actions={<Link to="/trainer/members" style={ts.primaryBtn}>View All Members</Link>}
    >
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @media (max-width: 768px) {
          .trainer-profile-card { flex-direction: column !important; padding: 1.25rem !important; gap: 1rem !important; align-items: flex-start !important; }
          .trainer-profile-name { font-size: 1.4rem !important; }
          .trainer-schedule-btn { width: 100% !important; text-align: center !important; margin-left: 0 !important; }
          .trainer-stats-grid   { grid-template-columns: 1fr 1fr !important; gap: 0.75rem !important; }
          .trainer-alert        { padding: 10px 12px !important; font-size: 0.8rem !important; }
          .trainer-member-card  { padding: 0.875rem 1rem !important; }
          .trainer-quick-grid   { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Profile card */}
      <div className="trainer-profile-card" style={ts.profileCard}>
        <div style={ts.profileAvatar}>{user?.full_name?.[0]?.toUpperCase() || "T"}</div>
        <div style={ts.profileInfo}>
          <span style={ts.profileBadge}>{profile?.specialization || "Trainer"}</span>
          <h2 className="trainer-profile-name" style={ts.profileName}>{user?.full_name || user?.username}</h2>
          <p style={ts.profileRole}>{profile?.certifications || "Certified Trainer"}</p>
          <div style={ts.profileMeta}>
            {profile?.experience_years && <span style={ts.profileMetaItem}>⭐ {profile.experience_years} years experience</span>}
          </div>
        </div>
        <Link className="trainer-schedule-btn" to="/trainer/schedule" style={ts.scheduleBtn}>📅 View Schedule</Link>
      </div>

      {/* Stats */}
      <div className="trainer-stats-grid" style={ts.statsGrid}>
        <StatCard icon="👥" label="Assigned Members"  value={members.length}         accent="#00C2FF" />
        <StatCard icon="✅" label="Active Members"    value={activeMembers.length}   accent="#22C55E" />
        <StatCard icon="⚠️" label="Expiring (7 days)" value={expiringMembers.length} accent="#FFB800" />
        <StatCard icon="📅" label="Experience"        value={profile?.experience_years ? `${profile.experience_years} yrs` : "—"} accent="#A855F7" />
      </div>

      {/* Expiry alert */}
      {expiringMembers.length > 0 && (
        <div className="trainer-alert" style={ts.alertBar}>
          <span>⚠️</span>
          <span style={{ flex:1, fontSize:"0.9rem", color:"rgba(255,255,255,0.7)" }}>
            <strong>{expiringMembers.length} members</strong> expiring in the next 7 days.
          </span>
          <Link to="/trainer/members" style={{ fontSize:"13px", fontWeight:700, color:"#FFB800", textDecoration:"none" }}>View →</Link>
        </div>
      )}

      {/* Members */}
      <div style={ts.sectionHeader}>
        <h3 style={ts.sectionTitle}>MY MEMBERS ({members.length})</h3>
        <Link to="/trainer/members" style={ts.viewAll}>View all →</Link>
      </div>
      {members.length === 0 ? (
        <div style={ts.emptyState}>
          <span style={ts.emptyIcon}>👥</span>
          <p style={ts.emptyText}>No members assigned yet.</p>
          <p style={ts.emptySub}>Ask your manager to assign members to you.</p>
        </div>
      ) : (
        <div style={ts.memberGrid}>
          {members.slice(0, 6).map((m) => {
            const days = m.membership_end_date ? Math.max(0, Math.ceil((new Date(m.membership_end_date) - new Date()) / 86400000)) : null;
            const statusColor = m.membership_status === "active" ? "#22C55E" : "#FF1A1A";
            return (
              <div key={m.id} className="trainer-member-card" style={ts.memberCard}>
                <div style={{ ...ts.memberAvatar, background: statusColor + "20", color: statusColor }}>
                  {m.customer_name?.[0]?.toUpperCase() || "M"}
                </div>
                <div style={ts.memberInfo}>
                  <p style={ts.memberName}>{m.customer_name || "Member"}</p>
                  <p style={ts.memberPlan}>{m.plan_type?.toUpperCase() || "—"} PLAN</p>
                </div>
                <div style={ts.memberRight}>
                  {days !== null ? (
                    <span style={{ ...ts.daysTag, color: days <= 7 ? "#FFB800" : "rgba(255,255,255,0.4)", borderColor: days <= 7 ? "#FFB80030" : "rgba(255,255,255,0.1)", background: days <= 7 ? "#FFB80010" : "transparent" }}>
                      {days}d left
                    </span>
                  ) : (
                    <span style={{ ...ts.daysTag, color: statusColor, borderColor: statusColor + "30", background: statusColor + "10" }}>
                      {m.membership_status?.toUpperCase() || "—"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick actions */}
      <div style={{ ...ts.sectionHeader, marginTop:"2.5rem" }}>
        <h3 style={ts.sectionTitle}>QUICK ACTIONS</h3>
      </div>
      <div className="trainer-quick-grid" style={ts.quickGrid}>
        {[
          { icon:"👥", label:"All My Members", sub:"View full list",    href:"/trainer/members",  accent:"#00C2FF" },
          { icon:"📅", label:"Schedule",       sub:"Session timetable", href:"/trainer/schedule", accent:"#A855F7" },
        ].map((q, i) => (
          <Link key={i} to={q.href} style={ts.quickCard}>
            <span style={{ ...ts.quickIcon, color: q.accent, background: q.accent + "15" }}>{q.icon}</span>
            <div>
              <p style={ts.quickLabel}>{q.label}</p>
              <p style={ts.quickSub}>{q.sub}</p>
            </div>
            <span style={{ color:"rgba(255,255,255,0.2)", marginLeft:"auto" }}>→</span>
          </Link>
        ))}
      </div>
    </DashLayout>
  );
}

const ts = {
  profileCard:    { display:"flex", alignItems:"center", gap:"1.5rem", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"16px", padding:"1.75rem", marginBottom:"1.5rem", flexWrap:"wrap" },
  profileAvatar:  { width:"72px", height:"72px", flexShrink:0, borderRadius:"50%", background:"rgba(0,194,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Bebas Neue',sans-serif", fontSize:"2rem", color:"#00C2FF", border:"2px solid rgba(0,194,255,0.3)" },
  profileInfo:    { flex:1, minWidth:"200px" },
  profileBadge:   { display:"inline-block", fontSize:"10px", fontWeight:800, letterSpacing:"2px", color:"#00C2FF", background:"rgba(0,194,255,0.1)", border:"1px solid rgba(0,194,255,0.25)", padding:"3px 10px", borderRadius:"100px", marginBottom:"0.5rem" },
  profileName:    { fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.8rem", letterSpacing:"1px", color:"#fff", marginBottom:"4px" },
  profileRole:    { fontSize:"0.875rem", color:"rgba(255,255,255,0.4)", marginBottom:"0.75rem" },
  profileMeta:    { display:"flex", gap:"1rem", flexWrap:"wrap" },
  profileMetaItem:{ fontSize:"12px", color:"rgba(255,255,255,0.4)", fontWeight:600 },
  scheduleBtn:    { padding:"10px 18px", marginLeft:"auto", background:"rgba(0,194,255,0.1)", border:"1px solid rgba(0,194,255,0.25)", borderRadius:"8px", color:"#00C2FF", textDecoration:"none", fontWeight:700, fontSize:"13px", flexShrink:0 },
  statsGrid:      { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:"1rem", marginBottom:"1.5rem" },
  statCard:       { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"12px", padding:"1.25rem" },
  statIcon:       { fontSize:"1.4rem", display:"block", marginBottom:"0.75rem" },
  statValue:      { fontFamily:"'Bebas Neue',sans-serif", fontSize:"2rem", color:"#fff", marginBottom:"4px" },
  statLabel:      { fontSize:"12px", color:"rgba(255,255,255,0.35)", fontWeight:500 },
  alertBar:       { display:"flex", alignItems:"center", gap:"12px", background:"rgba(255,184,0,0.06)", border:"1px solid rgba(255,184,0,0.2)", borderRadius:"10px", padding:"14px 20px", marginBottom:"1.5rem" },
  sectionHeader:  { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" },
  sectionTitle:   { fontFamily:"'Bebas Neue',sans-serif", fontSize:"1rem", letterSpacing:"3px", color:"rgba(255,255,255,0.4)" },
  viewAll:        { fontSize:"13px", color:"#00C2FF", textDecoration:"none", fontWeight:600 },
  emptyState:     { textAlign:"center", padding:"3rem", background:"rgba(255,255,255,0.01)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:"12px" },
  emptyIcon:      { fontSize:"2.5rem", display:"block", marginBottom:"1rem" },
  emptyText:      { fontSize:"1rem", fontWeight:600, color:"rgba(255,255,255,0.4)", marginBottom:"4px" },
  emptySub:       { fontSize:"0.875rem", color:"rgba(255,255,255,0.2)" },
  memberGrid:     { display:"flex", flexDirection:"column", gap:"0.75rem" },
  memberCard:     { display:"flex", alignItems:"center", gap:"1rem", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:"10px", padding:"1rem 1.25rem" },
  memberAvatar:   { width:"40px", height:"40px", flexShrink:0, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:"16px" },
  memberInfo:     { flex:1, minWidth:0 },
  memberName:     { fontSize:"0.9rem", fontWeight:600, color:"#fff", marginBottom:"2px" },
  memberPlan:     { fontSize:"11px", color:"rgba(255,255,255,0.3)", fontWeight:700, letterSpacing:"1px" },
  memberRight:    { flexShrink:0 },
  daysTag:        { fontSize:"11px", fontWeight:700, padding:"4px 10px", borderRadius:"100px", border:"1px solid" },
  quickGrid:      { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:"1rem" },
  quickCard:      { display:"flex", alignItems:"center", gap:"1rem", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"12px", padding:"1.25rem", textDecoration:"none", color:"#fff", transition:"all 0.2s" },
  quickIcon:      { width:"44px", height:"44px", flexShrink:0, borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem" },
  quickLabel:     { fontSize:"0.9rem", fontWeight:600, marginBottom:"2px" },
  quickSub:       { fontSize:"12px", color:"rgba(255,255,255,0.35)" },
  primaryBtn:     { padding:"10px 20px", background:"rgba(0,194,255,0.15)", border:"1px solid rgba(0,194,255,0.3)", color:"#00C2FF", textDecoration:"none", fontWeight:700, fontSize:"13px", borderRadius:"8px" },
};