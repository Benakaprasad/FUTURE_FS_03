import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import DashLayout from "../../components/DashLayout";
import { DataTable, Toast } from "../../components/AdminUi";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const T = {
  red:    "#FF1A1A", redDim: "rgba(255,26,26,0.12)",
  gold:   "#FFB800", cyan:   "#00C2FF",
  green:  "#22C55E", purple: "#A855F7", orange: "#FF6B00",
  glass:  "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.07)",
  muted:  "rgba(255,255,255,0.35)",
  sub:    "rgba(255,255,255,0.15)",
};

const SPEC_COLORS = {
  "Strength":           T.red,
  "Cardio":             T.orange,
  "HIIT":               T.gold,
  "Yoga":               T.cyan,
  "Zumba":              T.purple,
  "Boxing":             "#EC4899",
  "Functional":         T.green,
  "Personal Training":  T.red,
};

const STATUS_CONFIG = {
  active:   { color: T.green,  bg: "rgba(34,197,94,0.1)",    border: "rgba(34,197,94,0.25)",  label: "Active"   },
  on_leave: { color: T.gold,   bg: "rgba(255,184,0,0.1)",    border: "rgba(255,184,0,0.25)",  label: "On Leave" },
  inactive: { color: T.muted,  bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)", label: "Inactive" },
};

// ── Portal dropdown — escapes any overflow:hidden/auto parent ──
function StatusDropdown({ value, onChange }) {
  const [open,    setOpen]   = useState(false);
  const btnRef              = useRef(null);
  const menuRef             = useRef(null);
  const [pos,     setPos]   = useState({ top: 0, left: 0, width: 0 });
  const cfg = STATUS_CONFIG[value] || STATUS_CONFIG.inactive;

  // Recalculate menu position whenever it opens
  useEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
  }, [open]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (
        btnRef.current  && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown",   onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown",   onKey);
    };
  }, [open]);

  // Close + reposition on scroll/resize
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll",  close, true);
    window.addEventListener("resize",  close);
    return () => {
      window.removeEventListener("scroll",  close, true);
      window.removeEventListener("resize",  close);
    };
  }, [open]);

  return (
    <>
      {/* Trigger pill */}
      <button
        ref={btnRef}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e)     => { e.stopPropagation(); setOpen(o => !o); }}
        style={{
          display:      "flex",
          alignItems:   "center",
          gap:          "6px",
          padding:      "5px 10px 5px 8px",
          borderRadius: "100px",
          background:   cfg.bg,
          border:       `1px solid ${cfg.border}`,
          color:        cfg.color,
          fontSize:     "11px",
          fontWeight:   800,
          cursor:       "pointer",
          fontFamily:   "'DM Sans', sans-serif",
          whiteSpace:   "nowrap",
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
        {cfg.label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke={cfg.color} strokeWidth="3"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Menu rendered in <body> via portal — no overflow clipping */}
      {open && createPortal(
        <div
          ref={menuRef}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position:     "fixed",
            top:          pos.top,
            left:         pos.left,
            minWidth:     "130px",
            background:   "#111",
            border:       "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            overflow:     "hidden",
            zIndex:       99999,
            boxShadow:    "0 8px 32px rgba(0,0,0,0.7)",
          }}
        >
          {Object.entries(STATUS_CONFIG).map(([key, c]) => (
            <button
              key={key}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onChange(key);
                setOpen(false);
              }}
              style={{
                display:    "flex",
                alignItems: "center",
                gap:        "8px",
                width:      "100%",
                padding:    "10px 14px",
                background: key === value ? c.bg : "transparent",
                border:     "none",
                cursor:     "pointer",
                fontFamily: "'DM Sans', sans-serif",
                transition: "background 0.15s",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: key === value ? c.color : "rgba(255,255,255,0.6)" }}>
                {c.label}
              </span>
              {key === value && (
                <span style={{ marginLeft: "auto", fontSize: "10px", color: c.color }}>✓</span>
              )}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

// ── Expandable text block ──────────────────────────────────────
const BIO_LIMIT = 160;

function ExpandableText({ text, label = "BIO" }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text && text.length > BIO_LIMIT;
  const shown  = expanded || !isLong ? text : text.slice(0, BIO_LIMIT).trimEnd() + "…";

  return (
    <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 10, padding: "1rem" }}>
      <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", color: T.sub, marginBottom: 6 }}>
        {label}
      </p>
      <p style={{ fontSize: "0.875rem", color: T.muted, lineHeight: 1.7, margin: 0 }}>
        {shown}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            marginTop:  "8px",
            background: "none",
            border:     "none",
            padding:    0,
            cursor:     "pointer",
            fontSize:   "12px",
            fontWeight: 700,
            color:      T.red,
            fontFamily: "'DM Sans', sans-serif",
            display:    "flex",
            alignItems: "center",
            gap:        "4px",
          }}
        >
          {expanded ? "Show less ↑" : "View full ↓"}
        </button>
      )}
    </div>
  );
}

// ── Trainer drawer ─────────────────────────────────────────────
function TrainerDrawer({ trainer, members, onClose, onStatusChange, onAssign }) {
  const [tab,        setTab]        = useState("profile");
  const [assignForm, setAssignForm] = useState({ member_id: "" });
  const [assigning,  setAssigning]  = useState(false);
  const [toast,      setToast]      = useState(null);

  const specColor = SPEC_COLORS[trainer.specialization] || T.red;

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignForm.member_id) return;
    setAssigning(true);
    try {
      await onAssign(trainer.id, assignForm.member_id);
      setToast({ msg: "Member assigned!", type: "success" });
      setAssignForm({ member_id: "" });
    } catch (err) {
      setToast({ msg: err.response?.data?.error || "Assignment failed.", type: "error" });
    } finally {
      setAssigning(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const unassigned = members.filter(m => !m.trainer_id && m.status === "active");

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", justifyContent: "flex-end", zIndex: 9000, backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        style={{ width: "100%", maxWidth: "460px", height: "100%", background: "#0a0a0a", borderLeft: "1px solid rgba(255,255,255,0.08)", overflowY: "auto", animation: "slideRight 0.3s cubic-bezier(0.16,1,0.3,1)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, background: "#0a0a0a", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: specColor + "15", border: `1px solid ${specColor}30`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.4rem", color: specColor, flexShrink: 0 }}>
                {(trainer.full_name || trainer.username || "T")[0].toUpperCase()}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: 4, flexWrap: "wrap" }}>
                  <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.3rem", letterSpacing: "1px", color: "#fff", margin: 0 }}>
                    {trainer.full_name || trainer.username}
                  </h2>
                  {/* StatusDropdown in sticky header — portal renders above everything */}
                  <StatusDropdown value={trainer.status} onChange={(s) => onStatusChange(trainer.id, s)} />
                </div>
                <p style={{ fontSize: "12px", color: T.muted, margin: 0 }}>{trainer.email}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, fontSize: "1.2rem", cursor: "pointer", flexShrink: 0 }}>✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {[
            { id: "profile", label: "👤 Profile" },
            { id: "assign",  label: "🔗 Assign"  },
            { id: "members", label: `👥 Members (${trainer.current_clients || 0})` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "12px 20px", background: "none", border: "none", cursor: "pointer",
              fontSize: "13px", fontWeight: 700, fontFamily: "'DM Sans',sans-serif",
              color: tab === t.id ? "#fff" : T.muted,
              borderBottom: `2px solid ${tab === t.id ? T.red : "transparent"}`,
              transition: "all 0.2s",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "1.5rem 2rem" }}>

          {/* ── Profile tab ─────────────────────────────────── */}
          {tab === "profile" && (
            <div>
              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "1px", padding: "4px 12px", borderRadius: "100px", background: specColor + "15", color: specColor, border: `1px solid ${specColor}30` }}>
                  {trainer.specialization || "General"}
                </span>
                <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "100px", background: T.glass, color: T.muted, border: `1px solid ${T.border}` }}>
                  {trainer.experience_years || 0} yrs exp
                </span>
                {trainer.hourly_rate && (
                  <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "100px", background: T.glass, color: T.muted, border: `1px solid ${T.border}` }}>
                    ₹{trainer.hourly_rate}/hr
                  </span>
                )}
              </div>

              {/* Capacity bar */}
              <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1rem", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1px", color: T.sub }}>CAPACITY</span>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: T.cyan }}>
                    {trainer.current_clients || 0} / {trainer.max_clients || 10}
                  </span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    height:     "100%",
                    width:      `${Math.min(100, ((trainer.current_clients || 0) / (trainer.max_clients || 10)) * 100)}%`,
                    background: `linear-gradient(90deg, ${T.cyan}80, ${T.cyan})`,
                    borderRadius: 3,
                    transition: "width 1s ease",
                  }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
                {[
                  { label: "Phone",        value: trainer.phone        || "—" },
                  { label: "Availability", value: trainer.availability || "—" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 10, padding: "0.875rem" }}>
                    <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", color: T.sub, marginBottom: 4 }}>{label.toUpperCase()}</p>
                    <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#fff", margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>

              {trainer.certifications && (
                <div style={{ marginBottom: "1.25rem" }}>
                  <ExpandableText text={trainer.certifications} label="CERTIFICATIONS" />
                </div>
              )}

              {trainer.bio && (
                <ExpandableText text={trainer.bio} label="BIO" />
              )}
            </div>
          )}

          {/* ── Assign tab ──────────────────────────────────── */}
          {tab === "assign" && (
            <div>
              <p style={{ fontSize: "0.875rem", color: T.muted, lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Assign an unassigned active member to <strong style={{ color: "#fff" }}>{trainer.full_name || trainer.username}</strong>.
              </p>
              {unassigned.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", background: T.glass, border: `1px solid ${T.border}`, borderRadius: 12 }}>
                  <p style={{ color: T.muted, fontSize: "0.875rem" }}>All active members are already assigned.</p>
                </div>
              ) : (
                <form onSubmit={handleAssign} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", color: T.muted, display: "block", marginBottom: 8, textTransform: "uppercase" }}>
                      Select Member
                    </label>
                    <select required value={assignForm.member_id} onChange={e => setAssignForm({ member_id: e.target.value })}
                      style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, padding: "12px 14px", color: "#fff", fontSize: "0.875rem", fontFamily: "'DM Sans',sans-serif", cursor: "pointer", outline: "none" }}>
                      <option value="">— Choose member —</option>
                      {unassigned.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.full_name || m.username} — {m.membership_type?.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" disabled={assigning || !assignForm.member_id}
                    style={{ padding: "12px", background: assigning ? "rgba(255,26,26,0.3)" : "linear-gradient(135deg,#FF1A1A,#cc0000)", color: "#fff", fontWeight: 700, border: "none", borderRadius: 9, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", opacity: assigning ? 0.6 : 1 }}>
                    {assigning ? "Assigning…" : "Assign Member →"}
                  </button>
                </form>
              )}
              {toast && (
                <div style={{ marginTop: "1rem", padding: "10px 14px", borderRadius: 8, background: toast.type === "error" ? "rgba(255,26,26,0.1)" : "rgba(34,197,94,0.1)", border: `1px solid ${toast.type === "error" ? "rgba(255,26,26,0.3)" : "rgba(34,197,94,0.3)"}`, color: toast.type === "error" ? T.red : T.green, fontSize: "13px", fontWeight: 600 }}>
                  {toast.msg}
                </div>
              )}
            </div>
          )}

          {/* ── Members tab ─────────────────────────────────── */}
          {tab === "members" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {(trainer.assigned_members || []).length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", background: T.glass, border: `1px solid ${T.border}`, borderRadius: 12 }}>
                  <p style={{ color: T.muted, fontSize: "0.875rem" }}>No members assigned yet.</p>
                </div>
              ) : (trainer.assigned_members || []).map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.875rem", background: T.glass, border: `1px solid ${T.border}`, borderRadius: 10, padding: "0.875rem 1rem" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.redDim, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue',sans-serif", fontSize: "13px", color: T.red, flexShrink: 0 }}>
                    {(m.full_name || m.customer_name || "?")[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#fff", margin: 0 }}>{m.full_name || m.customer_name || "—"}</p>
                    <p style={{ fontSize: "11px", color: T.muted, margin: 0 }}>{m.membership_type?.replace(/_/g, " ") || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function AdminTrainers() {
  const { user }   = useAuth();
  const [trainers, setTrainers] = useState([]);
  const [members,  setMembers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(null);
  const [selected, setSelected] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get("/trainers?status=active"),
      api.get("/members?status=active"),
    ])
      .then(([tr, mem]) => {
        setTrainers(tr.data.trainers || []);
        setMembers(mem.data.members  || []);
      })
      .catch(() => showToast("Failed to load.", "error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/trainers/${id}/status`, { status });
      showToast(`Trainer status updated to ${status}.`);
      setTrainers(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
    } catch {
      showToast("Failed to update status.", "error");
    }
  };

  const handleAssign = async (trainerId, memberId) => {
    await api.post("/assignments", { trainer_id: trainerId, member_id: memberId });
    showToast("Member assigned successfully.");
    fetchAll();
  };

  const cols = [
    {
      key: "full_name", label: "Trainer",
      render: (r) => {
        const specColor = SPEC_COLORS[r.specialization] || T.red;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: specColor + "15", border: `1px solid ${specColor}25`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue',sans-serif", fontSize: "13px", color: specColor }}>
              {(r.full_name || r.username || "T")[0].toUpperCase()}
            </div>
            <div>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.875rem", margin: 0 }}>{r.full_name || r.username}</p>
              <p style={{ color: T.muted, fontSize: "11px", margin: 0 }}>{r.email}</p>
            </div>
          </div>
        );
      }
    },
    {
      key: "specialization", label: "Specialization",
      render: (r) => {
        const color = SPEC_COLORS[r.specialization] || T.muted;
        return r.specialization
          ? <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: "100px", background: color + "12", color, border: `1px solid ${color}25` }}>{r.specialization}</span>
          : <span style={{ color: T.sub }}>—</span>;
      }
    },
    {
      key: "experience_years", label: "Exp.",
      render: (r) => r.experience_years
        ? <span style={{ fontSize: "0.875rem", color: T.muted }}>{r.experience_years} yrs</span>
        : <span style={{ color: T.sub }}>—</span>
    },
    {
      key: "current_clients", label: "Members",
      render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.1rem", color: T.cyan }}>{r.current_clients || 0}</span>
          <span style={{ fontSize: "11px", color: T.sub }}>/ {r.max_clients || 10}</span>
        </div>
      )
    },
    {
      key: "certifications", label: "Certifications",
      render: (r) => r.certifications
        ? <span style={{ fontSize: "12px", color: T.muted, maxWidth: "140px", display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.certifications}</span>
        : <span style={{ color: T.sub }}>—</span>
    },
    {
      key: "status", label: "Status",
      render: (r) => <StatusDropdown value={r.status} onChange={(s) => handleStatusChange(r.id, s)} />
    },
  ];

  return (
    <DashLayout
      title="TRAINERS"
      subtitle="Active gym trainers — manage profiles and assignments"
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "13px", color: T.muted }}>
            {trainers.length} active trainer{trainers.length !== 1 ? "s" : ""}
          </span>
        </div>
      }
    >
      <style>{`
        @keyframes spin       { to { transform: rotate(360deg); } }
        @keyframes slideRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeUp     { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <DataTable
        cols={cols}
        rows={trainers}
        loading={loading}
        searchKeys={["full_name", "email", "specialization", "certifications"]}
        filterKey="status"
        filterOptions={Object.entries(STATUS_CONFIG).map(([v, c]) => ({ value: v, label: c.label }))}
        emptyText="No active trainers. Approve applications from the Applications page."
        onRowClick={(row) => setSelected(row)}
      />

      {selected && (
        <TrainerDrawer
          trainer={selected}
          members={members}
          onClose={() => { setSelected(null); fetchAll(); }}
          onStatusChange={handleStatusChange}
          onAssign={handleAssign}
        />
      )}

      <Toast toast={toast} />
    </DashLayout>
  );
}