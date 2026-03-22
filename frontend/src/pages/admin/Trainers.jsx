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
  "Strength":          T.red,
  "Cardio":            T.orange,
  "HIIT":              T.gold,
  "Yoga":              T.cyan,
  "Zumba":             T.purple,
  "Boxing":            "#EC4899",
  "Functional":        T.green,
  "Personal Training": T.red,
};

const STATUS_CONFIG = {
  active:   { color: T.green, bg: "rgba(34,197,94,0.1)",    border: "rgba(34,197,94,0.25)",  label: "Active"   },
  on_leave: { color: T.gold,  bg: "rgba(255,184,0,0.1)",    border: "rgba(255,184,0,0.25)",  label: "On Leave" },
  inactive: { color: T.muted, bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)", label: "Inactive" },
};

// ─────────────────────────────────────────────────────────────
// FIX 3 — STATUS DROPDOWN
// Portal-based so it escapes overflow:auto clipping.
// stopPropagation on BOTH onMouseDown and onClick on every
// button so the DataTable row click never fires when the user
// is interacting with the dropdown.
// ─────────────────────────────────────────────────────────────
function StatusDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const btnRef          = useRef(null);
  const menuRef         = useRef(null);
  const [pos, setPos]   = useState({ top: 0, left: 0 });
  const cfg = STATUS_CONFIG[value] || STATUS_CONFIG.active;

  // Recalculate position every time menu opens
  useEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left });
  }, [open]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (btnRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown",   onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown",   onKey);
    };
  }, [open]);

  // Close on scroll or resize so menu doesn't float detached
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <>
      {/* Trigger pill */}
      <button
        ref={btnRef}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "5px 10px 5px 8px", borderRadius: "100px",
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          color: cfg.color, fontSize: "11px", fontWeight: 800,
          cursor: "pointer", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap",
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
        {cfg.label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="3"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Menu portal — renders in <body>, never clipped */}
      {open && createPortal(
        <div
          ref={menuRef}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: "fixed", top: pos.top, left: pos.left,
            minWidth: "140px", background: "#111",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "10px", overflow: "hidden",
            zIndex: 99999, boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
          }}
        >
          {Object.entries(STATUS_CONFIG).map(([key, c]) => (
            <button
              key={key}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onChange(key);   // always call — even if same value, lets parent decide
                setOpen(false);
              }}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                width: "100%", padding: "10px 14px",
                background: key === value ? c.bg : "transparent",
                border: "none", cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif", transition: "background 0.15s",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: key === value ? c.color : "rgba(255,255,255,0.65)" }}>
                {c.label}
              </span>
              {key === value && (
                <span style={{ marginLeft: "auto", fontSize: "11px", color: c.color }}>✓</span>
              )}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// FULL PROFILE MODAL
// Portal-based so it renders above the drawer (zIndex 99998).
// Shows every field, bio, certifications, cover letter, docs,
// assigned members, and timestamps.
// ─────────────────────────────────────────────────────────────
function ProfileModal({ trainer, onClose }) {
  const specColor  = SPEC_COLORS[trainer.specialization] || T.red;
  const statusCfg  = STATUS_CONFIG[trainer.status] || STATUS_CONFIG.inactive;
  const isInactive = trainer.status === "inactive";

  const fields = [
    { label: "Full name",      value: trainer.full_name      },
    { label: "Email",          value: trainer.email          },
    { label: "Phone",          value: trainer.phone          },
    { label: "Specialization", value: trainer.specialization },
    { label: "Experience",     value: trainer.experience_years ? `${trainer.experience_years} years` : null },
    { label: "Hourly rate",    value: trainer.hourly_rate    ? `₹${trainer.hourly_rate}/hr` : null },
    { label: "Availability",   value: trainer.availability   },
    { label: "Max clients",    value: trainer.max_clients    },
  ].filter(f => f.value);

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.82)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 99998, backdropFilter: "blur(6px)", padding: "24px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "620px",
          maxHeight: "90vh", overflowY: "auto",
          background: "#0d0d0d",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "18px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.9)",
          animation: "profileIn 0.28s cubic-bezier(0.16,1,0.3,1) forwards",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "1.75rem 2rem 1.25rem",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          position: "sticky", top: 0, background: "#0d0d0d",
          borderRadius: "18px 18px 0 0", zIndex: 1,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              {trainer.profile_image_url ? (
                <img src={trainer.profile_image_url} alt={trainer.full_name}
                  style={{ width: 60, height: 60, borderRadius: 14, objectFit: "cover", border: `2px solid ${specColor}40`, flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: 60, height: 60, borderRadius: 14, flexShrink: 0,
                  background: specColor + "18", border: `1px solid ${specColor}35`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.6rem", color: specColor,
                }}>
                  {(trainer.full_name || "T")[0].toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: 4 }}>
                  <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.5rem", letterSpacing: "1.5px", color: "#fff", margin: 0 }}>
                    {trainer.full_name || trainer.username}
                  </h2>
                  <span style={{
                    fontSize: "10px", fontWeight: 800, padding: "3px 10px", borderRadius: "100px",
                    background: statusCfg.bg, border: `1px solid ${statusCfg.border}`, color: statusCfg.color,
                    letterSpacing: "0.5px",
                  }}>
                    {statusCfg.label.toUpperCase()}
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: T.muted, margin: 0 }}>{trainer.email}</p>
              </div>
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "8px", width: 32, height: 32, cursor: "pointer",
              color: T.muted, fontSize: "14px", display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0,
            }}>✕</button>
          </div>

          {isInactive && (
            <div style={{
              marginTop: "1rem", padding: "10px 14px", borderRadius: "10px",
              background: "rgba(255,26,26,0.07)", border: "1px solid rgba(255,26,26,0.2)",
              display: "flex", alignItems: "center", gap: "10px",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div>
                <p style={{ fontSize: "12px", fontWeight: 700, color: T.red, margin: 0 }}>Trainer is inactive</p>
                <p style={{ fontSize: "11px", color: "rgba(255,100,100,0.7)", margin: 0 }}>
                  Previously assigned members have been unassigned. Record preserved for audit and payment history.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem 2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Tags */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {trainer.specialization && (
              <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "1px", padding: "4px 12px", borderRadius: "100px", background: specColor + "15", color: specColor, border: `1px solid ${specColor}30` }}>
                {trainer.specialization}
              </span>
            )}
            {trainer.experience_years && (
              <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "100px", background: T.glass, color: T.muted, border: `1px solid ${T.border}` }}>
                {trainer.experience_years} yrs experience
              </span>
            )}
            {trainer.hourly_rate && (
              <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "100px", background: T.glass, color: T.muted, border: `1px solid ${T.border}` }}>
                ₹{trainer.hourly_rate}/hr
              </span>
            )}
          </div>

          {/* Info grid */}
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", color: T.sub, marginBottom: "10px" }}>PROFILE DETAILS</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {fields.map(({ label, value }) => (
                <div key={label} style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 10, padding: "0.875rem" }}>
                  <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.2px", color: T.sub, margin: "0 0 4px" }}>{label.toUpperCase()}</p>
                  <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#fff", margin: 0 }}>{String(value)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Capacity bar */}
          <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1px", color: T.sub }}>MEMBER CAPACITY</span>
              <span style={{ fontSize: "12px", fontWeight: 800, color: isInactive ? T.muted : T.cyan }}>
                {trainer.current_clients || 0} / {trainer.max_clients || 10}
              </span>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${Math.min(100, ((trainer.current_clients || 0) / (trainer.max_clients || 10)) * 100)}%`,
                background: isInactive ? "rgba(255,255,255,0.15)" : `linear-gradient(90deg, ${T.cyan}80, ${T.cyan})`,
                borderRadius: 3, transition: "width 1s ease",
              }} />
            </div>
          </div>

          {/* Certifications */}
          {trainer.certifications && (
            <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 10, padding: "1rem" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", color: T.sub, marginBottom: 8 }}>CERTIFICATIONS</p>
              <p style={{ fontSize: "0.875rem", color: T.muted, lineHeight: 1.7, margin: 0 }}>{trainer.certifications}</p>
            </div>
          )}

          {/* Bio — full, no truncation inside modal */}
          {trainer.bio && (
            <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 10, padding: "1rem" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", color: T.sub, marginBottom: 8 }}>BIO</p>
              <p style={{ fontSize: "0.875rem", color: T.muted, lineHeight: 1.7, margin: 0 }}>{trainer.bio}</p>
            </div>
          )}

          {/* Cover letter */}
          {trainer.cover_letter && (
            <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 10, padding: "1rem" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", color: T.sub, marginBottom: 8 }}>APPLICATION — COVER LETTER</p>
              <p style={{ fontSize: "0.875rem", color: T.muted, lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>{trainer.cover_letter}</p>
            </div>
          )}

          {/* Uploaded documents */}
          {trainer.documents && trainer.documents.length > 0 && (
            <div>
              <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", color: T.sub, marginBottom: "10px" }}>UPLOADED DOCUMENTS</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {trainer.documents.map((doc, i) => (
                  <a key={i} href={doc.url} target="_blank" rel="noreferrer"
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "10px 14px", background: T.glass,
                      border: `1px solid ${T.border}`, borderRadius: 10,
                      textDecoration: "none",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span style={{ fontSize: "13px", color: T.muted, flex: 1 }}>{doc.name || `Document ${i + 1}`}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.sub} strokeWidth="2" strokeLinecap="round">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Assigned members */}
          {(trainer.assigned_members || []).length > 0 && (
            <div>
              <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", color: T.sub, marginBottom: "10px" }}>
                ASSIGNED MEMBERS ({trainer.assigned_members.length})
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {trainer.assigned_members.map((m, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: T.glass, border: `1px solid ${T.border}`, borderRadius: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.redDim, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue',sans-serif", fontSize: "12px", color: T.red, flexShrink: 0 }}>
                      {(m.full_name || m.customer_name || "?")[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#fff", margin: 0 }}>{m.full_name || m.customer_name || "—"}</p>
                      <p style={{ fontSize: "11px", color: T.muted, margin: 0 }}>{m.membership_type?.replace(/_/g, " ") || "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", paddingTop: "4px", borderTop: `1px solid ${T.border}` }}>
            {trainer.created_at && (
              <div>
                <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1px", color: T.sub, margin: "8px 0 2px" }}>JOINED</p>
                <p style={{ fontSize: "12px", color: T.muted, margin: 0 }}>
                  {new Date(trainer.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            )}
            {trainer.updated_at && (
              <div>
                <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1px", color: T.sub, margin: "8px 0 2px" }}>LAST UPDATED</p>
                <p style={{ fontSize: "12px", color: T.muted, margin: 0 }}>
                  {new Date(trainer.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─────────────────────────────────────────────────────────────
// TRAINER DRAWER
// FIX 1 — "View Profile" button: always visible in header
// FIX 2 — "Assign Member" button: always visible in header,
//          red when active, greyed when inactive/at capacity
// FIX 3 — sticky header zIndex raised to 10 so buttons are
//          never hidden behind scrolling content
// ─────────────────────────────────────────────────────────────
function TrainerDrawer({ trainer, members, onClose, onStatusChange, onAssign }) {
  const [tab,        setTab]        = useState("profile");
  const [assignForm, setAssignForm] = useState({ member_id: "" });
  const [assigning,  setAssigning]  = useState(false);
  const [toast,      setToast]      = useState(null);
  const [showModal,  setShowModal]  = useState(false);

  const specColor  = SPEC_COLORS[trainer.specialization] || T.red;
  const isInactive = trainer.status === "inactive";
  const atCapacity = (trainer.current_clients || 0) >= (trainer.max_clients || 10);
  const assignDisabled = isInactive || atCapacity;
  const unassigned = members.filter(m => !m.trainer_id && m.status === "active");

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

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", justifyContent: "flex-end", zIndex: 9000, backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        {/* Panel */}
        <div
          style={{ width: "100%", maxWidth: "460px", height: "100%", background: "#0a0a0a", borderLeft: "1px solid rgba(255,255,255,0.08)", overflowY: "auto", animation: "slideRight 0.3s cubic-bezier(0.16,1,0.3,1)" }}
          onClick={(e) => e.stopPropagation()}
        >

          {/* ── STICKY HEADER ── zIndex:10 so it always sits above scrolled content */}
          <div style={{
            padding: "1.5rem 2rem 1.25rem",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            position: "sticky", top: 0,
            background: "#0a0a0a",
            zIndex: 10,        // FIX: was 1, raised to 10
          }}>

            {/* Inactive ribbon */}
            {isInactive && (
              <div style={{ marginBottom: "12px", padding: "8px 12px", borderRadius: 8, background: "rgba(255,26,26,0.07)", border: "1px solid rgba(255,26,26,0.18)", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style={{ fontSize: "11px", color: "rgba(255,100,100,0.85)", fontWeight: 600, margin: 0 }}>
                  Inactive · Members unassigned · Record preserved
                </p>
              </div>
            )}

            {/* Name row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {trainer.profile_image_url ? (
                  <img src={trainer.profile_image_url} alt={trainer.full_name}
                    style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover", border: `1px solid ${specColor}30`, flexShrink: 0, opacity: isInactive ? 0.5 : 1 }} />
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: specColor + "15", border: `1px solid ${specColor}30`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.4rem", color: specColor, flexShrink: 0, opacity: isInactive ? 0.5 : 1 }}>
                    {(trainer.full_name || "T")[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: 4, flexWrap: "wrap" }}>
                    <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.3rem", letterSpacing: "1px", color: isInactive ? T.muted : "#fff", margin: 0 }}>
                      {trainer.full_name || trainer.username}
                    </h2>
                    <StatusDropdown value={trainer.status} onChange={(s) => onStatusChange(trainer.id, s)} />
                  </div>
                  <p style={{ fontSize: "12px", color: T.muted, margin: 0 }}>{trainer.email}</p>
                </div>
              </div>
              <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, fontSize: "1.2rem", cursor: "pointer", flexShrink: 0, padding: "4px" }}>✕</button>
            </div>

            {/* ── FIX 1 & 2 — ACTION BUTTONS ROW ─────────────────────────
                Both buttons are ALWAYS rendered.
                "View Profile" → opens full profile modal
                "Assign Member" → red when available, grey when disabled
            ──────────────────────────────────────────────────────────── */}
            <div style={{ marginTop: "14px", display: "flex", gap: "8px" }}>

              {/* View Profile button */}
              <button
                onClick={() => setShowModal(true)}
                style={{
                  flex: 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                  padding: "10px 0",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "12px", fontWeight: 700,
                  fontFamily: "'DM Sans',sans-serif",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                View Profile
              </button>

              {/* Assign Member button */}
              <button
                onClick={() => { if (!assignDisabled) setTab("assign"); }}
                disabled={assignDisabled}
                title={
                  isInactive   ? "Cannot assign to an inactive trainer"
                  : atCapacity ? "Trainer is at maximum client capacity"
                  :              "Assign a member to this trainer"
                }
                style={{
                  flex: 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                  padding: "10px 0",
                  background:   assignDisabled ? "rgba(255,255,255,0.03)" : "linear-gradient(135deg, #FF1A1A, #cc1010)",
                  border:       assignDisabled ? "1px solid rgba(255,255,255,0.08)" : "none",
                  borderRadius: "10px",
                  color:        assignDisabled ? "rgba(255,255,255,0.3)" : "#fff",
                  fontSize:     "12px", fontWeight: 700,
                  fontFamily:   "'DM Sans',sans-serif",
                  cursor:       assignDisabled ? "not-allowed" : "pointer",
                  boxShadow:    assignDisabled ? "none" : "0 4px 14px rgba(255,26,26,0.35)",
                  transition:   "all 0.2s",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
                {isInactive ? "Inactive" : atCapacity ? "At capacity" : "Assign Member"}
              </button>

            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {[
              { id: "profile", label: "👤 Profile",  disabled: false },
              { id: "assign",  label: "🔗 Assign",   disabled: isInactive },
              { id: "members", label: `👥 Members (${trainer.current_clients || 0})`, disabled: false },
            ].map(t => (
              <button key={t.id}
                onClick={() => { if (!t.disabled) setTab(t.id); }}
                style={{
                  padding: "12px 20px", background: "none", border: "none",
                  cursor: t.disabled ? "not-allowed" : "pointer",
                  fontSize: "13px", fontWeight: 700, fontFamily: "'DM Sans',sans-serif",
                  color: t.disabled ? T.sub : tab === t.id ? "#fff" : T.muted,
                  borderBottom: `2px solid ${tab === t.id && !t.disabled ? T.red : "transparent"}`,
                  transition: "all 0.2s", opacity: t.disabled ? 0.4 : 1,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ padding: "1.5rem 2rem" }}>

            {/* Profile tab */}
            {tab === "profile" && (
              <div>
                <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                  {trainer.specialization && (
                    <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "1px", padding: "4px 12px", borderRadius: "100px", background: specColor + "15", color: specColor, border: `1px solid ${specColor}30` }}>
                      {trainer.specialization}
                    </span>
                  )}
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
                    <span style={{ fontSize: "12px", fontWeight: 800, color: isInactive ? T.muted : T.cyan }}>
                      {trainer.current_clients || 0} / {trainer.max_clients || 10}
                    </span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min(100, ((trainer.current_clients || 0) / (trainer.max_clients || 10)) * 100)}%`,
                      background: isInactive ? "rgba(255,255,255,0.15)" : `linear-gradient(90deg, ${T.cyan}80, ${T.cyan})`,
                      borderRadius: 3, transition: "width 1s ease",
                    }} />
                  </div>
                </div>

                {/* Phone + availability */}
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

                {/* Bio preview with "View full →" */}
                {trainer.bio && (
                  <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 10, padding: "1rem" }}>
                    <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", color: T.sub, marginBottom: 6 }}>BIO</p>
                    <p style={{
                      fontSize: "0.875rem", color: T.muted, lineHeight: 1.7, margin: 0,
                      display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {trainer.bio}
                    </p>
                    {trainer.bio.length > 100 && (
                      <button
                        onClick={() => setShowModal(true)}
                        style={{ marginTop: 8, background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "12px", fontWeight: 700, color: T.red, fontFamily: "'DM Sans',sans-serif" }}
                      >
                        View full →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Assign tab */}
            {tab === "assign" && !isInactive && (
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
                      <select
                        required
                        value={assignForm.member_id}
                        onChange={e => setAssignForm({ member_id: e.target.value })}
                        style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, padding: "12px 14px", color: "#fff", fontSize: "0.875rem", fontFamily: "'DM Sans',sans-serif", cursor: "pointer", outline: "none" }}
                      >
                        <option value="">— Choose member —</option>
                        {unassigned.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.full_name || m.username} — {m.membership_type?.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={assigning || !assignForm.member_id}
                      style={{ padding: "12px", background: assigning ? "rgba(255,26,26,0.3)" : "linear-gradient(135deg,#FF1A1A,#cc0000)", color: "#fff", fontWeight: 700, border: "none", borderRadius: 9, cursor: assigning ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", opacity: assigning ? 0.6 : 1 }}
                    >
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

            {/* Members tab */}
            {tab === "members" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {isInactive && (
                  <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(255,26,26,0.06)", border: "1px solid rgba(255,26,26,0.15)", fontSize: "12px", color: "rgba(255,120,120,0.8)", fontWeight: 600 }}>
                    Members were unassigned when this trainer was set to inactive.
                  </div>
                )}
                {(trainer.assigned_members || []).length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem", background: T.glass, border: `1px solid ${T.border}`, borderRadius: 12 }}>
                    <p style={{ color: T.muted, fontSize: "0.875rem" }}>No members currently assigned.</p>
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

      {/* Full profile modal — portal above the drawer */}
      {showModal && <ProfileModal trainer={trainer} onClose={() => setShowModal(false)} />}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
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
      api.get("/trainers"),
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

  // ── FIX 3 — STATUS CHANGE
  // Shows the exact error from the server if the API call fails,
  // so you can see what went wrong instead of a generic message.
  // Also re-fetches after every status change so the UI is always
  // in sync with the database.
  const handleStatusChange = async (id, status) => {
    try {
      const res = await api.patch(`/trainers/${id}/status`, { status });
      const unassigned = res.data?.members_unassigned;

      if (status === "inactive" && unassigned > 0) {
        showToast(`Trainer inactive. ${unassigned} member${unassigned !== 1 ? "s" : ""} unassigned.`);
      } else {
        const label = { active: "Active", on_leave: "On Leave", inactive: "Inactive" }[status] || status;
        showToast(`Status updated to ${label}.`);
      }

      setTrainers(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
      fetchAll();
    } catch (err) {
      // Show the actual server error so the developer can diagnose it
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || "Failed to update status.";
      showToast(msg, "error");
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
        const sc = SPEC_COLORS[r.specialization] || T.red;
        const dim = r.status === "inactive";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", opacity: dim ? 0.55 : 1 }}>
            {r.profile_image_url ? (
              <img src={r.profile_image_url} alt={r.full_name}
                style={{ width: 36, height: 36, borderRadius: 9, objectFit: "cover", border: `1px solid ${sc}25`, flexShrink: 0 }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: sc + "15", border: `1px solid ${sc}25`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue',sans-serif", fontSize: "13px", color: sc }}>
                {(r.full_name || r.username || "T")[0].toUpperCase()}
              </div>
            )}
            <div>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.875rem", margin: 0 }}>{r.full_name || r.username}</p>
              <p style={{ color: T.muted, fontSize: "11px", margin: 0 }}>{r.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "specialization", label: "Specialization",
      render: (r) => {
        const color = SPEC_COLORS[r.specialization] || T.muted;
        return r.specialization
          ? <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: "100px", background: color + "12", color, border: `1px solid ${color}25` }}>{r.specialization}</span>
          : <span style={{ color: T.sub }}>—</span>;
      },
    },
    {
      key: "experience_years", label: "Exp.",
      render: (r) => r.experience_years
        ? <span style={{ fontSize: "0.875rem", color: T.muted }}>{r.experience_years} yrs</span>
        : <span style={{ color: T.sub }}>—</span>,
    },
    {
      key: "current_clients", label: "Members",
      render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.1rem", color: r.status === "inactive" ? T.sub : T.cyan }}>
            {r.current_clients || 0}
          </span>
          <span style={{ fontSize: "11px", color: T.sub }}>/ {r.max_clients || 10}</span>
        </div>
      ),
    },
    {
      key: "certifications", label: "Certifications",
      render: (r) => r.certifications
        ? <span style={{ fontSize: "12px", color: T.muted, maxWidth: "140px", display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.certifications}</span>
        : <span style={{ color: T.sub }}>—</span>,
    },
    {
      key: "status", label: "Status",
      render: (r) => (
        <StatusDropdown value={r.status} onChange={(s) => handleStatusChange(r.id, s)} />
      ),
    },
  ];

  return (
    <DashLayout
      title="TRAINERS"
      subtitle="Manage trainer profiles, status and member assignments"
      actions={
        <span style={{ fontSize: "13px", color: T.muted }}>
          {trainers.filter(t => t.status === "active").length} active
          {" · "}
          {trainers.filter(t => t.status === "on_leave").length} on leave
          {" · "}
          {trainers.filter(t => t.status === "inactive").length} inactive
        </span>
      }
    >
      <style>{`
        @keyframes spin       { to { transform: rotate(360deg); } }
        @keyframes slideRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes profileIn  { from { opacity: 0; transform: scale(0.95) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes fadeUp     { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <DataTable
        cols={cols}
        rows={trainers}
        loading={loading}
        searchKeys={["full_name", "email", "specialization", "certifications"]}
        filterKey="status"
        filterOptions={Object.entries(STATUS_CONFIG).map(([v, c]) => ({ value: v, label: c.label }))}
        emptyText="No trainers found. Approve applications from the Applications page."
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