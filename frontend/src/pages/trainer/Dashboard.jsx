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
      actions={
        <Link to="/trainer/members" style={ts.primaryBtn}>View All Members</Link>
      }
    >
      {loading ? <Loader /> : (
        <>
          {/* ── Trainer profile card ── */}
          <div style={ts.profileCard}>
            <div style={ts.profileAvatar}>
              {user?.full_name?.[0]?.toUpperCase() || "T"}
            </div>
            <div style={ts.profileInfo}>
              <span style={ts.profileBadge}>{profile?.specialization || "Trainer"}</span>
              <h2 style={ts.profileName}>{user?.full_name || user?.username}</h2>
              <p style={ts.profileRole}>{profile?.certification || "Certified Trainer"}</p>
              <div style={ts.profileMeta}>
                {profile?.experience_years && (
                  <span style={ts.profileMetaItem}>⭐ {profile.experience_years} years experience</span>
                )}
                {profile?.is_active !== undefined && (
                  <span style={{
                    ...ts.profileMetaItem,
                    color: profile.is_active ? "#22C55E" : "#FF1A1A",
                  }}>
                    {profile.is_active ? "● Active" : "● Inactive"}
                  </span>
                )}
              </div>
            </div>
            <Link to="/trainer/schedule" style={ts.scheduleBtn}>
              📅 View Schedule
            </Link>
          </div>

          {/* ── Stats ── */}
          <div style={ts.statsGrid}>
            <StatCard icon="👥" label="Assigned Members" value={members.length}         accent="#00C2FF" />
            <StatCard icon="✅" label="Active Members"   value={activeMembers.length}   accent="#22C55E" />
            <StatCard icon="⚠️" label="Expiring (7 days)" value={expiringMembers.length} accent="#FFB800" />
            <StatCard icon="📅" label="Experience"       value={profile?.experience_years ? `${profile.experience_years} yrs` : "—"} accent="#A855F7" />
          </div>

          {/* ── Expiring alert ── */}
          {expiringMembers.length > 0 && (
            <div style={ts.alertBar}>
              <span>⚠️</span>
              <span style={{ flex: 1, fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>
                <strong>{expiringMembers.length} members</strong> have memberships expiring in the next 7 days. Follow up with them.
              </span>
              <Link to="/trainer/members" style={{ fontSize: "13px", fontWeight: 700, color: "#FFB800", textDecoration: "none" }}>
                View →
              </Link>
            </div>
          )}

          {/* ── Members list ── */}
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
                const days = m.membership_end_date
                  ? Math.max(0, Math.ceil((new Date(m.membership_end_date) - new Date()) / 86400000))
                  : null;
                const statusColor = m.membership_status === "active" ? "#22C55E" : "#FF1A1A";

                return (
                  <div key={m.id} style={ts.memberCard}>
                    <div style={{ ...ts.memberAvatar, background: statusColor + "20", color: statusColor }}>
                      {m.customer_name?.[0]?.toUpperCase() || "M"}
                    </div>
                    <div style={ts.memberInfo}>
                      <p style={ts.memberName}>{m.customer_name || "Member"}</p>
                      <p style={ts.memberPlan}>{m.plan_type?.toUpperCase() || "—"} PLAN</p>
                    </div>
                    <div style={ts.memberRight}>
                      {days !== null ? (
                        <span style={{
                          ...ts.daysTag,
                          color: days <= 7 ? "#FFB800" : "rgba(255,255,255,0.4)",
                          borderColor: days <= 7 ? "#FFB80030" : "rgba(255,255,255,0.1)",
                          background: days <= 7 ? "#FFB80010" : "transparent",
                        }}>
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

          {/* ── Quick actions ── */}
          <div style={{ ...ts.sectionHeader, marginTop: "2.5rem" }}>
            <h3 style={ts.sectionTitle}>QUICK ACTIONS</h3>
          </div>
          <div style={ts.quickGrid}>
            {[
              { icon: "👥", label: "All My Members",  sub: "View full list",         href: "/trainer/members",  accent: "#00C2FF" },
              { icon: "📅", label: "Schedule",        sub: "Session timetable",       href: "/trainer/schedule", accent: "#A855F7" },
            ].map((q, i) => (
              <Link key={i} to={q.href} style={ts.quickCard}>
                <span style={{ ...ts.quickIcon, color: q.accent, background: q.accent + "15" }}>{q.icon}</span>
                <div>
                  <p style={ts.quickLabel}>{q.label}</p>
                  <p style={ts.quickSub}>{q.sub}</p>
                </div>
                <span style={{ color: "rgba(255,255,255,0.2)", marginLeft: "auto" }}>→</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </DashLayout>
  );
}

function Loader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
      <div style={{
        width: "36px", height: "36px",
        border: "3px solid rgba(0,194,255,0.2)",
        borderTop: "3px solid #00C2FF",
        borderRadius: "50%", animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const ts = {
  profileCard: {
    display: "flex", alignItems: "center", gap: "1.5rem",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px", padding: "1.75rem",
    marginBottom: "1.5rem", flexWrap: "wrap",
  },
  profileAvatar: {
    width: "72px", height: "72px", flexShrink: 0, borderRadius: "50%",
    background: "rgba(0,194,255,0.15)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "2rem", color: "#00C2FF",
    border: "2px solid rgba(0,194,255,0.3)",
  },
  profileInfo: { flex: 1, minWidth: "200px" },
  profileBadge: {
    display: "inline-block",
    fontSize: "10px", fontWeight: 800, letterSpacing: "2px",
    color: "#00C2FF", background: "rgba(0,194,255,0.1)",
    border: "1px solid rgba(0,194,255,0.25)",
    padding: "3px 10px", borderRadius: "100px",
    marginBottom: "0.5rem",
  },
  profileName: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "1.8rem", letterSpacing: "1px", color: "#fff",
    marginBottom: "4px",
  },
  profileRole: { fontSize: "0.875rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.75rem" },
  profileMeta: { display: "flex", gap: "1rem", flexWrap: "wrap" },
  profileMetaItem: { fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 600 },
  scheduleBtn: {
    padding: "10px 18px", marginLeft: "auto",
    background: "rgba(0,194,255,0.1)",
    border: "1px solid rgba(0,194,255,0.25)",
    borderRadius: "8px", color: "#00C2FF",
    textDecoration: "none", fontWeight: 700, fontSize: "13px",
    transition: "all 0.2s", flexShrink: 0,
  },

  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" },
  statCard: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.25rem" },
  statIcon:  { fontSize: "1.4rem", display: "block", marginBottom: "0.75rem" },
  statValue: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "#fff", marginBottom: "4px" },
  statLabel: { fontSize: "12px", color: "rgba(255,255,255,0.35)", fontWeight: 500 },

  alertBar: {
    display: "flex", alignItems: "center", gap: "12px",
    background: "rgba(255,184,0,0.06)",
    border: "1px solid rgba(255,184,0,0.2)",
    borderRadius: "10px", padding: "14px 20px",
    marginBottom: "1.5rem",
  },

  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
  sectionTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "1rem", letterSpacing: "3px", color: "rgba(255,255,255,0.4)",
  },
  viewAll: { fontSize: "13px", color: "#00C2FF", textDecoration: "none", fontWeight: 600 },

  emptyState: { textAlign: "center", padding: "3rem", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px" },
  emptyIcon:  { fontSize: "2.5rem", display: "block", marginBottom: "1rem" },
  emptyText:  { fontSize: "1rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "4px" },
  emptySub:   { fontSize: "0.875rem", color: "rgba(255,255,255,0.2)" },

  memberGrid: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  memberCard: {
    display: "flex", alignItems: "center", gap: "1rem",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "10px", padding: "1rem 1.25rem",
  },
  memberAvatar: {
    width: "40px", height: "40px", flexShrink: 0, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 800, fontSize: "16px",
  },
  memberInfo: { flex: 1, minWidth: 0 },
  memberName: { fontSize: "0.9rem", fontWeight: 600, color: "#fff", marginBottom: "2px" },
  memberPlan: { fontSize: "11px", color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "1px" },
  memberRight: { flexShrink: 0 },
  daysTag: { fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "100px", border: "1px solid" },

  quickGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" },
  quickCard: {
    display: "flex", alignItems: "center", gap: "1rem",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px", padding: "1.25rem",
    textDecoration: "none", color: "#fff", transition: "all 0.2s",
  },
  quickIcon:  { width: "44px", height: "44px", flexShrink: 0, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" },
  quickLabel: { fontSize: "0.9rem", fontWeight: 600, marginBottom: "2px" },
  quickSub:   { fontSize: "12px", color: "rgba(255,255,255,0.35)" },

  primaryBtn: {
    padding: "10px 20px",
    background: "rgba(0,194,255,0.15)",
    border: "1px solid rgba(0,194,255,0.3)",
    color: "#00C2FF", textDecoration: "none",
    fontWeight: 700, fontSize: "13px", borderRadius: "8px",
  },
};