import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashLayout from "../../components/DashLayout";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  FunnelChart, Funnel, LabelList,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

// ── Tooltip styles ─────────────────────────────────────────────────────────────
const tooltipStyle = {
  contentStyle: {
    background: "#0d0d0d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#fff",
  },
  itemStyle: { color: "rgba(255,255,255,0.7)" },
  labelStyle: { color: "rgba(255,255,255,0.4)", marginBottom: "4px" },
};

// ── Chart card wrapper ─────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, span = 1 }) {
  return (
    <div style={{
      ...as.chartCard,
      gridColumn: span === 2 ? "span 2" : "span 1",
    }}>
      <div style={as.chartHeader}>
        <div>
          <h3 style={as.chartTitle}>{title}</h3>
          {subtitle && <p style={as.chartSub}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ── KPI card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, delta, accent, href }) {
  const positive = delta >= 0;
  return (
    <Link to={href || "#"} style={{ ...as.kpiCard, borderTop: `3px solid ${accent}`, textDecoration: "none" }}>
      <div style={as.kpiTop}>
        <span style={{ ...as.kpiIcon, background: accent + "15", color: accent }}>{icon}</span>
        {delta !== undefined && (
          <span style={{ ...as.kpiDelta, color: positive ? "#22C55E" : "#FF1A1A" }}>
            {positive ? "▲" : "▼"} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p style={as.kpiValue}>{value ?? "—"}</p>
      <p style={as.kpiLabel}>{label}</p>
    </Link>
  );
}

// ── Mini table ─────────────────────────────────────────────────────────────────
function MiniTable({ title, cols, rows, href, emptyText }) {
  return (
    <div style={as.miniTable}>
      <div style={as.miniTableHeader}>
        <h3 style={as.miniTableTitle}>{title}</h3>
        {href && <Link to={href} style={as.viewAll}>View all →</Link>}
      </div>
      {rows.length === 0 ? (
        <p style={as.emptyText}>{emptyText || "No data yet"}</p>
      ) : (
        <table style={as.table}>
          <thead>
            <tr>{cols.map((c) => <th key={c} style={as.th}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={as.tr}>
                {row.map((cell, j) => <td key={j} style={as.td}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Status badge ───────────────────────────────────────────────────────────────
function Badge({ status }) {
  const colors = {
    active:    { bg: "#22C55E15", color: "#22C55E",  border: "#22C55E30" },
    pending:   { bg: "#FFB80015", color: "#FFB800",  border: "#FFB80030" },
    expired:   { bg: "#FF1A1A15", color: "#FF1A1A",  border: "#FF1A1A30" },
    approved:  { bg: "#22C55E15", color: "#22C55E",  border: "#22C55E30" },
    rejected:  { bg: "#FF1A1A15", color: "#FF1A1A",  border: "#FF1A1A30" },
    new:       { bg: "#00C2FF15", color: "#00C2FF",  border: "#00C2FF30" },
    contacted: { bg: "#A855F715", color: "#A855F7",  border: "#A855F730" },
    converted: { bg: "#22C55E15", color: "#22C55E",  border: "#22C55E30" },
  };
  const c = colors[status?.toLowerCase()] || { bg: "#ffffff10", color: "#fff", border: "#ffffff20" };
  return (
    <span style={{
      fontSize: "10px", fontWeight: 800, letterSpacing: "1px",
      padding: "3px 8px", borderRadius: "100px",
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>
      {status?.toUpperCase()}
    </span>
  );
}

// ── Plan colors ────────────────────────────────────────────────────────────────
const PLAN_COLORS = {
  student:     "#00C2FF",
  monthly:     "#FF6B00",
  quarterly:   "#FF1A1A",
  half_yearly: "#FFB800",
  annual:      "#22C55E",
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth();

  const [stats,      setStats]     = useState(null);
  const [leads,      setLeads]     = useState([]);
  const [requests,   setReqs]      = useState([]);
  const [expiring,   setExpiring]  = useState([]);
  const [revenue,    setRevenue]   = useState(null);
  const [members,    setMembers]   = useState([]);
  const [trainers,   setTrainers]  = useState([]);
  const [loading,    setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/leads/stats").catch(() => ({ data: {} })),
      api.get("/leads?limit=5").catch(() => ({ data: { leads: [] } })),
      api.get("/requests?limit=5").catch(() => ({ data: { requests: [] } })),
      api.get("/members/expiring?days=7").catch(() => ({ data: { members: [] } })),
      api.get("/payments").catch(() => ({ data: {} })),
      api.get("/members?limit=200").catch(() => ({ data: { members: [] } })),
      api.get("/trainers?limit=50").catch(() => ({ data: { trainers: [] } })),
    ]).then(([statsRes, leadsRes, reqRes, expRes, revRes, memRes, trainerRes]) => {
      setStats(statsRes.data);
      setLeads(leadsRes.data.leads || []);
      setReqs(reqRes.data.requests || []);
      setExpiring(expRes.data.members || []);
      setRevenue(revRes.data);
      setMembers(memRes.data.members || []);
      setTrainers(trainerRes.data.trainers || []);
    }).finally(() => setLoading(false));
  }, []);

const canSeeFinance = user?.role === "admin";

  // ── Revenue chart data — last 6 months from stats ─────────────────────────
  const revenueData = revenue?.monthly_breakdown
    ? revenue.monthly_breakdown.map((m) => ({
        month: new Date(m.month + "-01").toLocaleDateString("en-IN", { month: "short" }),
        revenue: Number(m.total) || 0,
      }))
    : Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return {
          month: d.toLocaleDateString("en-IN", { month: "short" }),
          revenue: 0,
        };
      });

  // ── Lead funnel data ───────────────────────────────────────────────────────
  const funnelData = [
    { name: "New",       value: stats?.new_leads    || 0, fill: "#00C2FF" },
    { name: "Contacted", value: stats?.contacted    || 0, fill: "#A855F7" },
    { name: "Qualified", value: stats?.qualified    || 0, fill: "#FFB800" },
    { name: "Converted", value: stats?.converted    || 0, fill: "#22C55E" },
  ];

  // ── Membership plan breakdown ──────────────────────────────────────────────
  const planCounts = members.reduce((acc, m) => {
    const plan = m.plan_type || "unknown";
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {});
  const planData = Object.entries(planCounts).map(([name, value]) => ({
    name: name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    value,
    color: PLAN_COLORS[name] || "#888",
  }));

  // ── Trainer workload ───────────────────────────────────────────────────────
  const trainerData = trainers
    .map((t) => ({
      name: t.full_name?.split(" ")[0] || t.username,
      assignments: t.assignment_count || 0,
    }))
    .sort((a, b) => b.assignments - a.assignments)
    .slice(0, 8);

  return (
    <DashLayout
      title="DASHBOARD"
      subtitle={`Welcome back, ${user?.full_name || user?.username} · ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`}
      actions={
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to="/admin/leads"   style={as.outlineBtn}>+ New Lead</Link>
          <Link to="/admin/members" style={as.primaryBtn}>+ Add Member</Link>
        </div>
      }
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {loading ? <Loader /> : (
        <>
          {/* ── KPI grid ── */}
          <div style={as.kpiGrid}>
            <KpiCard icon="👥" label="Total Leads"       value={stats?.total}        accent="#00C2FF" href="/admin/leads" />
            <KpiCard icon="🆕" label="New Leads"         value={stats?.new_leads}    accent="#A855F7" href="/admin/leads" />
            <KpiCard icon="✅" label="Converted"         value={stats?.converted}    accent="#22C55E" href="/admin/leads" />
            <KpiCard icon="📋" label="Pending Requests"  value={requests.filter(r => r.status === "pending").length} accent="#FFB800" href="/admin/requests" />
            {canSeeFinance && (
              <KpiCard icon="💰" label="Revenue (Month)"
                value={revenue?.monthly ? `₹${Number(revenue.monthly).toLocaleString("en-IN")}` : "—"}
                accent="#FF1A1A" href="/admin/payments"
              />
            )}
            <KpiCard icon="⚠️" label="Expiring (7 days)" value={expiring.length}    accent="#FF6B00" href="/admin/members" />
          </div>

          {/* ── Analytics section ── */}
          <div style={as.analyticsGrid}>

            {/* 1. Revenue trend — full width */}
            {canSeeFinance && (
              <ChartCard
                title="REVENUE TREND"
                subtitle="Monthly revenue — last 6 months"
                span={2}
              >
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={revenueData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#FF1A1A" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#FF1A1A" stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]}
                      {...tooltipStyle}
                    />
                    <Area
                      type="monotone" dataKey="revenue"
                      stroke="#FF1A1A" strokeWidth={2}
                      fill="url(#revGrad)"
                      dot={{ fill: "#FF1A1A", strokeWidth: 0, r: 3 }}
                      activeDot={{ r: 5, fill: "#FF1A1A" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {/* 2. Lead funnel */}
            <ChartCard title="LEAD FUNNEL" subtitle="Conversion pipeline">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={funnelData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} width={68} />
                  <Tooltip
                    formatter={(v) => [v, "Leads"]}
                    {...tooltipStyle}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {funnelData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* 3. Membership plan breakdown */}
            <ChartCard title="PLAN BREAKDOWN" subtitle="Active members by plan">
              {planData.length === 0 ? (
                <div style={as.chartEmpty}>No member data yet</div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <ResponsiveContainer width="55%" height={200}>
                    <PieChart>
                      <Pie
                        data={planData}
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {planData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v, n) => [v, n]}
                        {...tooltipStyle}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                    {planData.map((p, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", flex: 1 }}>{p.name}</span>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: p.color }}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ChartCard>

            {/* 4. Trainer workload */}
            <ChartCard title="TRAINER WORKLOAD" subtitle="Active assignments per trainer" span={2}>
              {trainerData.length === 0 ? (
                <div style={as.chartEmpty}>No trainer data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={trainerData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(v) => [v, "Assignments"]}
                      {...tooltipStyle}
                    />
                    <Bar dataKey="assignments" fill="#A855F7" radius={[4, 4, 0, 0]}>
                      {trainerData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={i === 0 ? "#FF1A1A" : i === 1 ? "#FF6B00" : "#A855F7"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

          </div>

          {/* ── Alert: expiring memberships ── */}
          {expiring.length > 0 && (
            <div style={as.alertBar}>
              <span style={as.alertIcon}>⚠️</span>
              <span style={as.alertText}>
                <strong>{expiring.length} memberships</strong> expiring in the next 7 days.
              </span>
              <Link to="/admin/members" style={as.alertLink}>Review →</Link>
            </div>
          )}

          {/* ── Two column tables ── */}
          <div style={as.twoCol}>
            <MiniTable
              title="RECENT LEADS"
              href="/admin/leads"
              cols={["Name", "Phone", "Source", "Status"]}
              rows={leads.map((l) => [
                l.full_name || "—",
                l.phone || "—",
                l.source || "—",
                <Badge key="s" status={l.status} />,
              ])}
            />
            <MiniTable
              title="PENDING REQUESTS"
              href="/admin/requests"
              cols={["Customer", "Type", "Date", "Status"]}
              rows={requests.map((r) => [
                r.customer_name || r.user_name || "—",
                (r.request_type || "—").replace(/_/g, " "),
                new Date(r.created_at).toLocaleDateString("en-IN"),
                <Badge key="s" status={r.status} />,
              ])}
            />
          </div>

          {/* ── Expiring members table ── */}
          {expiring.length > 0 && (
            <MiniTable
              title="EXPIRING MEMBERSHIPS (NEXT 7 DAYS)"
              href="/admin/members"
              cols={["Member", "Plan", "Expires On", "Days Left"]}
              rows={expiring.map((m) => {
                const days = Math.max(0, Math.ceil((new Date(m.end_date) - new Date()) / 86400000));
                return [
                  m.customer_name || "—",
                  m.plan_type?.toUpperCase() || "—",
                  new Date(m.end_date).toLocaleDateString("en-IN"),
                  <span key="d" style={{ color: days <= 3 ? "#FF1A1A" : "#FFB800", fontWeight: 700 }}>
                    {days}d
                  </span>,
                ];
              })}
            />
          )}

          {/* ── Quick nav tiles ── */}
          <div style={as.quickNav}>
            {[
              { icon: "🎯", label: "Leads",       sub: "Track & convert enquiries",    href: "/admin/leads",        accent: "#00C2FF" },
              { icon: "👥", label: "Members",      sub: "Active & expired memberships", href: "/admin/members",      accent: "#22C55E" },
              { icon: "📋", label: "Requests",     sub: "Approve / reject requests",    href: "/admin/requests",     accent: "#FFB800" },
              { icon: "🏋️", label: "Trainers",     sub: "Manage trainer assignments",   href: "/admin/trainers",     accent: "#A855F7" },
              { icon: "📄", label: "Applications", sub: "Trainer job applications",     href: "/admin/applications", accent: "#FF6B00" },
              ...(canSeeFinance ? [
                { icon: "💳", label: "Payments",   sub: "Revenue & transaction logs",   href: "/admin/payments",     accent: "#FF1A1A" },
              ] : []),
              ...(user?.role === "admin" ? [
                { icon: "🔑", label: "Staff",      sub: "Manage staff accounts",        href: "/admin/users",        accent: "#EC4899" },
              ] : []),
            ].map((item, i) => (
              <Link key={i} to={item.href} style={as.quickTile}>
                <span style={{ ...as.quickTileIcon, color: item.accent, background: item.accent + "12" }}>
                  {item.icon}
                </span>
                <div>
                  <p style={as.quickTileLabel}>{item.label}</p>
                  <p style={as.quickTileSub}>{item.sub}</p>
                </div>
                <span style={as.quickTileArrow}>→</span>
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
        border: "3px solid rgba(255,26,26,0.2)",
        borderTop: "3px solid #FF1A1A",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
    </div>
  );
}

const as = {
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "1rem", marginBottom: "1.5rem",
  },
  kpiCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px", padding: "1.25rem",
    transition: "all 0.2s", cursor: "pointer", display: "block",
  },
  kpiTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" },
  kpiIcon: { width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" },
  kpiDelta: { fontSize: "11px", fontWeight: 700 },
  kpiValue: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "#fff", letterSpacing: "-0.5px", marginBottom: "4px" },
  kpiLabel: { fontSize: "12px", color: "rgba(255,255,255,0.35)", fontWeight: 500 },

  // ── Analytics ──
  analyticsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  chartCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "1.25rem",
  },
  chartHeader: {
    marginBottom: "1rem",
  },
  chartTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "1rem", letterSpacing: "2px",
    color: "rgba(255,255,255,0.6)",
    marginBottom: "2px",
  },
  chartSub: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.25)",
  },
  chartEmpty: {
    height: "180px",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "rgba(255,255,255,0.2)", fontSize: "0.875rem",
  },

  alertBar: {
    display: "flex", alignItems: "center", gap: "12px",
    background: "rgba(255,107,0,0.08)",
    border: "1px solid rgba(255,107,0,0.25)",
    borderRadius: "10px", padding: "14px 20px",
    marginBottom: "1.5rem",
  },
  alertIcon: { fontSize: "1.1rem", flexShrink: 0 },
  alertText: { flex: 1, fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" },
  alertLink: { fontSize: "13px", fontWeight: 700, color: "#FF6B00", textDecoration: "none" },

  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" },
  miniTable: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px", overflow: "hidden",
    marginBottom: "1.5rem",
  },
  miniTableHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "1rem 1.25rem",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  miniTableTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "1rem", letterSpacing: "2px",
    color: "rgba(255,255,255,0.6)",
  },
  viewAll: { fontSize: "12px", color: "#FF1A1A", textDecoration: "none", fontWeight: 600 },
  emptyText: { padding: "2rem", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: "0.875rem" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "10px 16px",
    fontSize: "10px", fontWeight: 800, letterSpacing: "1px",
    color: "rgba(255,255,255,0.3)", textAlign: "left",
    textTransform: "uppercase",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  tr: { borderBottom: "1px solid rgba(255,255,255,0.03)" },
  td: { padding: "12px 16px", fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" },

  quickNav: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" },
  quickTile: {
    display: "flex", alignItems: "center", gap: "1rem",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px", padding: "1.25rem",
    textDecoration: "none", color: "#fff",
    transition: "all 0.2s",
  },
  quickTileIcon: { width: "44px", height: "44px", flexShrink: 0, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" },
  quickTileLabel: { fontSize: "0.9rem", fontWeight: 700, marginBottom: "2px" },
  quickTileSub:   { fontSize: "12px", color: "rgba(255,255,255,0.35)" },
  quickTileArrow: { marginLeft: "auto", color: "rgba(255,255,255,0.2)" },

  primaryBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #FF1A1A, #cc0000)",
    color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "13px",
    borderRadius: "8px", boxShadow: "0 4px 15px rgba(255,26,26,0.3)",
  },
  outlineBtn: {
    padding: "10px 20px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.7)", textDecoration: "none",
    fontWeight: 600, fontSize: "13px", borderRadius: "8px",
  },
};