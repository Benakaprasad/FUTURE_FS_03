import { useState, useEffect, useCallback } from "react";
import DashLayout from "../../components/DashLayout";
import { DataTable, Toast } from "../../components/AdminUi";
import api from "../../api/axios";

const T = {
  red:    "#FF1A1A",
  gold:   "#FFB800",
  cyan:   "#00C2FF",
  green:  "#22C55E",
  purple: "#A855F7",
  orange: "#FF6B00",
  glass:  "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.07)",
  muted:  "rgba(255,255,255,0.35)",
  sub:    "rgba(255,255,255,0.15)",
};

const PLAN_COLORS = {
  student:     T.cyan,
  monthly:     T.orange,
  quarterly:   T.red,
  half_yearly: T.gold,
  annual:      T.green,
  corporate:   T.purple,
};

const STATUS_CONFIG = {
  active:    { color: T.green,  bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.25)",  label: "Active"    },
  expired:   { color: T.red,    bg: "rgba(255,26,26,0.1)",  border: "rgba(255,26,26,0.25)",  label: "Expired"   },
  frozen:    { color: T.cyan,   bg: "rgba(0,194,255,0.1)",  border: "rgba(0,194,255,0.25)",  label: "Frozen"    },
  cancelled: { color: T.muted,  bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)", label: "Cancelled" },
};

// ── Styled status dropdown ─────────────────────────────────────
function StatusDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[value] || STATUS_CONFIG.expired;

  return (
    <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", gap: "6px",
        padding: "5px 10px 5px 8px", borderRadius: "100px",
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        color: cfg.color, fontSize: "11px", fontWeight: 800,
        letterSpacing: "0.5px", cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
        {cfg.label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="3" style={{ marginLeft: 2, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 999 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0,
            background: "#111", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px", overflow: "hidden", zIndex: 1000,
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)", minWidth: "130px",
          }}>
            {Object.entries(STATUS_CONFIG).map(([key, c]) => (
              <button key={key} onClick={() => { onChange(key); setOpen(false); }} style={{
                display: "flex", alignItems: "center", gap: "8px",
                width: "100%", padding: "10px 14px",
                background: key === value ? c.bg : "transparent",
                border: "none", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                transition: "background 0.15s",
              }}
                onMouseEnter={e => { if (key !== value) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={e => { if (key !== value) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                <span style={{ fontSize: "12px", fontWeight: 700, color: key === value ? c.color : "rgba(255,255,255,0.6)" }}>{c.label}</span>
                {key === value && <span style={{ marginLeft: "auto", fontSize: "10px", color: c.color }}>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Plan badge ─────────────────────────────────────────────────
function PlanBadge({ plan }) {
  const color = PLAN_COLORS[plan] || T.muted;
  return (
    <span style={{
      fontSize: "10px", fontWeight: 800, letterSpacing: "1px",
      padding: "3px 9px", borderRadius: "100px",
      background: color + "15", color, border: `1px solid ${color}30`,
    }}>
      {plan?.replace(/_/g, " ").toUpperCase() || "—"}
    </span>
  );
}

// ── Member detail drawer ───────────────────────────────────────
function MemberDrawer({ member, onClose, onStatusChange }) {
  if (!member) return null;
  const name      = member.full_name || member.username || "—";
  const planColor = PLAN_COLORS[member.membership_type] || T.red;
  const statusCfg = STATUS_CONFIG[member.status] || STATUS_CONFIG.expired;
  const daysLeft  = member.end_date
    ? Math.max(0, Math.ceil((new Date(member.end_date) - new Date()) / 86400000))
    : null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", justifyContent: "flex-end", zIndex: 9000, backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div style={{ width: "100%", maxWidth: "440px", height: "100%", background: "#0a0a0a", borderLeft: "1px solid rgba(255,255,255,0.08)", overflowY: "auto", animation: "slideRight 0.3s cubic-bezier(0.16,1,0.3,1)" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, background: "#0a0a0a", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: planColor + "15", border: `2px solid ${planColor}30`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.3rem", color: planColor, flexShrink: 0 }}>
                {name[0].toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.3rem", letterSpacing: "1px", color: "#fff", marginBottom: 4 }}>{name}</h2>
                <p style={{ fontSize: "12px", color: T.muted }}>{member.email}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, fontSize: "1.2rem", cursor: "pointer", padding: "4px" }}>✕</button>
          </div>
        </div>

        <div style={{ padding: "1.5rem 2rem" }}>
          {/* Status + plan */}
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <PlanBadge plan={member.membership_type} />
            <StatusDropdown value={member.status} onChange={(s) => onStatusChange(member.id, s)} />
            {daysLeft !== null && (
              <span style={{ fontSize: "11px", fontWeight: 700, color: daysLeft <= 7 ? T.gold : T.muted }}>
                {daysLeft <= 7 ? `⚠ ${daysLeft}d left` : `${daysLeft} days left`}
              </span>
            )}
          </div>

          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            {[
              { label: "Start Date",  value: member.start_date ? new Date(member.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
              { label: "End Date",    value: member.end_date   ? new Date(member.end_date).toLocaleDateString("en-IN",   { day: "numeric", month: "short", year: "numeric" }) : "—" },
              { label: "Amount Paid", value: member.amount_paid ? `₹${Number(member.amount_paid).toLocaleString("en-IN")}` : "—" },
              { label: "Payment",     value: member.payment_status || "—" },
              { label: "Phone",       value: member.phone || "—" },
              { label: "Trainer",     value: member.trainer_name || "Unassigned" },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 10, padding: "0.875rem" }}>
                <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", color: T.sub, marginBottom: 4 }}>{label.toUpperCase()}</p>
                <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#fff" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Admission notes */}
          {member.admission_notes && (
            <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 10, padding: "1rem", marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", color: T.sub, marginBottom: 6 }}>ADMISSION NOTES</p>
              <p style={{ fontSize: "0.875rem", color: T.muted, lineHeight: 1.6 }}>{member.admission_notes}</p>
            </div>
          )}

          {/* Progress bar */}
          {member.start_date && member.end_date && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1px", color: T.sub }}>MEMBERSHIP PROGRESS</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: planColor }}>
                  {Math.round(((new Date() - new Date(member.start_date)) / (new Date(member.end_date) - new Date(member.start_date))) * 100)}%
                </span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${Math.min(100, Math.round(((new Date() - new Date(member.start_date)) / (new Date(member.end_date) - new Date(member.start_date))) * 100))}%`,
                  background: `linear-gradient(90deg, ${planColor}80, ${planColor})`,
                  borderRadius: 2,
                }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminMembers() {
  const [members,  setMembers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(null);
  const [selected, setSelected] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMembers = useCallback(() => {
    setLoading(true);
    api.get("/members")
      .then(({ data }) => setMembers(data.members || []))
      .catch(() => showToast("Failed to load.", "error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/members/${id}/status`, { status });
      showToast(`Status updated to ${status}.`);
      // Update in-place so drawer stays open with new status
      setMembers(prev => prev.map(m => m.id === id ? { ...m, status } : m));
      if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
    } catch {
      showToast("Failed to update status.", "error");
    }
  };

  const cols = [
    {
      key: "full_name", label: "Member",
      render: (r) => {
        const name      = r.full_name || r.username || "—";
        const planColor = PLAN_COLORS[r.membership_type] || T.red;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: planColor + "15", border: `1px solid ${planColor}25`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue',sans-serif", fontSize: "13px", color: planColor }}>
              {name[0].toUpperCase()}
            </div>
            <div>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.875rem" }}>{name}</p>
              <p style={{ color: T.muted, fontSize: "11px" }}>{r.email}</p>
            </div>
          </div>
        );
      }
    },
    {
      key: "membership_type", label: "Plan",
      render: (r) => <PlanBadge plan={r.membership_type} />
    },
    {
      key: "start_date", label: "Started",
      render: (r) => <span style={{ fontSize: "0.875rem", color: T.muted }}>{new Date(r.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
    },
    {
      key: "end_date", label: "Expires",
      render: (r) => {
        const days = Math.ceil((new Date(r.end_date) - new Date()) / 86400000);
        return (
          <div>
            <span style={{ fontSize: "0.875rem", color: days < 7 && days >= 0 ? T.gold : T.muted }}>
              {new Date(r.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            {days >= 0 && days < 7 && (
              <div style={{ fontSize: "10px", fontWeight: 800, color: T.gold, marginTop: 2 }}>⚠ {days}d left</div>
            )}
          </div>
        );
      }
    },
    {
      key: "trainer_name", label: "Trainer",
      render: (r) => r.trainer_name
        ? <span style={{ fontSize: "0.875rem", color: "#fff", fontWeight: 600 }}>{r.trainer_name}</span>
        : <span style={{ fontSize: "11px", color: T.sub, fontStyle: "italic" }}>Unassigned</span>
    },
    {
      key: "status", label: "Status",
      render: (r) => (
        <StatusDropdown
          value={r.status}
          onChange={(s) => handleStatusChange(r.id, s)}
        />
      )
    },
  ];

  return (
    <DashLayout title="MEMBERS" subtitle="All gym memberships">
      <style>{`
        @keyframes spin       { to { transform: rotate(360deg); } }
        @keyframes slideRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeUp     { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .member-row:hover { background: rgba(255,255,255,0.02) !important; cursor: pointer; }
      `}</style>

      <DataTable
        cols={cols}
        rows={members}
        loading={loading}
        searchKeys={["full_name", "email", "username", "membership_type", "trainer_name"]}
        filterKey="status"
        filterOptions={Object.entries(STATUS_CONFIG).map(([v, c]) => ({ value: v, label: c.label }))}
        emptyText="No members yet."
        onRowClick={(row) => setSelected(row)}
      />

      {selected && (
        <MemberDrawer
          member={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      <Toast toast={toast} />
    </DashLayout>
  );
}