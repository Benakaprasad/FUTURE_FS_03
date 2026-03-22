import { useState, useEffect, useCallback } from "react";
import DashLayout from "../../components/DashLayout";
import { DataTable, Badge, Toast } from "../../components/AdminUi";
import api from "../../api/axios";

// ── Colours ───────────────────────────────────────────────────
const T = {
  red:    "#FF1A1A", gold:  "#FFB800",
  cyan:   "#00C2FF", green: "#22C55E",
  purple: "#A855F7",
  glass:  "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.07)",
  muted:  "rgba(255,255,255,0.35)",
  sub:    "rgba(255,255,255,0.15)",
};

// ── What each request_type means to the admin ─────────────────
const REQUEST_META = {
  freeze:          { label: "Freeze Membership",  color: T.cyan,   action: "freeze"   },
  cancellation:    { label: "Cancel Membership",  color: T.red,    action: "cancel"   },
  upgrade:         { label: "Upgrade Plan",        color: T.gold,   action: "upgrade"  },
  trainer_request: { label: "Trainer Request",    color: T.purple, action: "trainer"  },
  other:           { label: "Other Request",      color: T.muted,  action: "generic"  },
  // legacy / no request_type = new membership enquiry
  null:            { label: "Membership Enquiry", color: T.green,  action: "membership"},
};

const MEMBERSHIP_TYPES = [
  "monthly", "quarterly", "half_yearly", "annual", "student", "corporate",
];

// ── Helper ────────────────────────────────────────────────────
function fmtType(t) {
  return (t || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export default function AdminRequests() {
  const [requests,  setRequests]  = useState([]);
  const [trainers,  setTrainers]  = useState([]);   // for trainer assignment
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);
  const [confirm,   setConfirm]   = useState(null); // { type, id, row }
  const [viewing,   setViewing]   = useState(null); // full notes view
  const [form,      setForm]      = useState(emptyForm());

  function emptyForm() {
    return {
      admin_notes: "", start_date: "", end_date: "",
      amount_paid: "", membership_type: "", trainer_id: "",
    };
  }

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRequests = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get("/requests"),
      api.get("/trainers?status=active"),
    ])
      .then(([rRes, tRes]) => {
        setRequests(rRes.data.requests || []);
        setTrainers(tRes.data.trainers || []);
      })
      .catch(() => showToast("Failed to load.", "error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // ── Open the right modal for each request type ────────────
  const openConfirm = (type, row) => {
    setConfirm({ type, id: row.id, row });
    setForm({
      ...emptyForm(),
      start_date:      new Date().toISOString().split("T")[0],
      membership_type: row.membership_type || "",
    });
  };

  // ── Main action dispatcher ────────────────────────────────
  const handleAction = async () => {
    const { type, id, row } = confirm;
    const isApprove = type === "approve";

    try {
      // ── Approve paths — each request_type triggers extra ops ──
      if (isApprove) {
        const reqType = row.request_type;

        // 1. FREEZE → set member status to frozen
        if (reqType === "freeze") {
          if (!row.member_id) throw new Error("No member linked to this request.");
          await api.patch(`/members/${row.member_id}/status`, { status: "frozen" });
          await api.patch(`/requests/${id}/approve`, { admin_notes: form.admin_notes });
          showToast("Membership frozen. Member notified.");
        }

        // 2. CANCELLATION → set member status to cancelled
        else if (reqType === "cancellation") {
          if (!row.member_id) throw new Error("No member linked to this request.");
          await api.patch(`/members/${row.member_id}/status`, { status: "cancelled" });
          await api.patch(`/requests/${id}/approve`, { admin_notes: form.admin_notes });
          showToast("Membership cancelled. Member notified.");
        }

        // 3. UPGRADE → update membership_type + dates + amount
        else if (reqType === "upgrade") {
          if (!form.membership_type) { showToast("Select the new plan to upgrade to.", "error"); return; }
          if (!form.start_date)      { showToast("Start date is required.", "error"); return; }
          if (row.member_id) {
            await api.patch(`/members/${row.member_id}`, {
              membership_type: form.membership_type,
              start_date:      form.start_date,
              end_date:        form.end_date || null,
            });
          }
          await api.patch(`/requests/${id}/approve`, {
            admin_notes:     form.admin_notes,
            membership_type: form.membership_type,
            start_date:      form.start_date,
            end_date:        form.end_date || null,
            amount_paid:     form.amount_paid ? parseFloat(form.amount_paid) : null,
          });
          showToast("Plan upgraded successfully.");
        }

        // 4. TRAINER REQUEST → assign trainer to member
        else if (reqType === "trainer_request") {
          if (!form.trainer_id) { showToast("Select a trainer to assign.", "error"); return; }
          if (!row.member_id)   throw new Error("No member linked to this request.");
          await api.post("/assignments", {
            trainer_id: form.trainer_id,
            member_id:  row.member_id,
          });
          await api.patch(`/requests/${id}/approve`, { admin_notes: form.admin_notes });
          showToast("Trainer assigned. Member notified.");
        }

        // 5. OTHER / generic + new membership enquiry
        else {
          if (!form.start_date) { showToast("Start date is required.", "error"); return; }
          await api.patch(`/requests/${id}/approve`, {
            admin_notes:     form.admin_notes,
            start_date:      form.start_date,
            end_date:        form.end_date || null,
            amount_paid:     form.amount_paid ? parseFloat(form.amount_paid) : null,
            membership_type: form.membership_type || row.membership_type,
          });
          showToast("Request approved.");
        }
      }

      // ── Reject path — same for all types ──────────────────
      else {
        await api.patch(`/requests/${id}/reject`, { admin_notes: form.admin_notes });
        showToast("Request rejected.");
      }

      setConfirm(null);
      setForm(emptyForm());
      fetchRequests();
    } catch (err) {
      showToast(err.response?.data?.error || err.message || "Action failed.", "error");
    }
  };

  // ── Table columns ──────────────────────────────────────────
  const cols = [
    {
      key: "customer_name", label: "Customer",
      render: (r) => (
        <div>
          <strong style={{ color: "#fff" }}>{r.customer_name || "—"}</strong>
          <div style={{ fontSize: "11px", color: T.sub, marginTop: 2 }}>{r.customer_email}</div>
        </div>
      ),
    },
    {
      key: "request_type", label: "Type",
      render: (r) => {
        const meta  = REQUEST_META[r.request_type] || REQUEST_META.null;
        return (
          <span style={{
            fontSize: "11px", fontWeight: 700, padding: "3px 10px",
            borderRadius: "100px", whiteSpace: "nowrap",
            background: meta.color + "15",
            color:      meta.color,
            border:     `1px solid ${meta.color}30`,
          }}>
            {meta.label}
          </span>
        );
      },
    },
    {
      key: "membership_type", label: "Plan",
      render: (r) => r.membership_type
        ? <Badge status={r.membership_type} />
        : <span style={{ color: T.sub, fontSize: "12px" }}>—</span>,
    },
    {
      key: "message", label: "Customer Notes",
      render: (r) => r.message ? (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: T.muted, fontStyle: "italic", fontSize: "12px" }}>
            "{r.message.slice(0, 38)}{r.message.length > 38 ? "…" : ""}"
          </span>
          {r.message.length > 38 && (
            <button onClick={() => setViewing(r)} style={rs.viewBtn}>View</button>
          )}
        </div>
      ) : <span style={{ color: T.sub }}>—</span>,
    },
    {
      key: "created_at", label: "Date",
      render: (r) => new Date(r.created_at).toLocaleDateString("en-IN"),
    },
    {
      key: "status", label: "Status",
      render: (r) => <Badge status={r.status} />,
    },
    {
      key: "admin_notes", label: "Admin Reply",
      render: (r) => r.admin_notes
        ? <span style={{ fontSize: "12px", color: T.green, fontStyle: "italic" }}>"{r.admin_notes.slice(0, 36)}{r.admin_notes.length > 36 ? "…" : ""}"</span>
        : <span style={{ color: T.sub, fontSize: "12px" }}>—</span>,
    },
  ];

  // ── Derive modal config from request type ─────────────────
  const modalConfig = confirm ? getModalConfig(confirm.row) : null;

  return (
    <DashLayout title="REQUESTS" subtitle="Review and action membership requests from members">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        textarea:focus,.req-input:focus { border-color:#FF1A1A!important; outline:none; }
        textarea::placeholder,.req-input::placeholder { color:rgba(255,255,255,0.2); }
        select.req-input option { background:#111; color:#fff; }
      `}</style>

      <DataTable
        cols={cols}
        rows={requests}
        loading={loading}
        searchKeys={["customer_name", "customer_email"]}
        filterKey="status"
        filterOptions={["pending","reviewed","approved","rejected"].map(s => ({
          value: s, label: s.charAt(0).toUpperCase() + s.slice(1),
        }))}
        emptyText="No requests yet."
        actions={(row) => row.status === "pending" || row.status === "reviewed" ? (
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={() => openConfirm("approve", row)} style={rs.approveBtn}>Approve</button>
            <button onClick={() => openConfirm("reject",  row)} style={rs.rejectBtn}>Reject</button>
          </div>
        ) : <span style={{ fontSize: "12px", color: T.sub }}>—</span>}
      />

      {/* ── View full notes modal ───────────────────────────── */}
      {viewing && (
        <div style={rs.overlay} onClick={() => setViewing(null)}>
          <div style={rs.modal} onClick={e => e.stopPropagation()}>
            <h3 style={rs.modalTitle}>CUSTOMER NOTES</h3>
            <p style={{ fontSize: "13px", color: T.muted, marginBottom: "1rem" }}>
              From: <strong style={{ color: "#fff" }}>{viewing.customer_name}</strong>
              {" · "}{new Date(viewing.created_at).toLocaleDateString("en-IN")}
            </p>
            <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 10, padding: "1rem", marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, fontStyle: "italic" }}>
                "{viewing.message}"
              </p>
            </div>
            <button onClick={() => setViewing(null)} style={{ ...rs.cancelBtn, width: "100%" }}>Close</button>
          </div>
        </div>
      )}

      {/* ── Type-aware Approve / Reject modal ──────────────── */}
      {confirm && modalConfig && (
        <div style={rs.overlay}>
          <div style={{ ...rs.modal, maxWidth: confirm.type === "approve" ? "540px" : "460px" }}>

            {/* Modal header with type badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.5rem" }}>
              <h3 style={{ ...rs.modalTitle, margin: 0 }}>
                {confirm.type === "approve" ? "APPROVE REQUEST" : "REJECT REQUEST"}
              </h3>
              <span style={{
                fontSize: "10px", fontWeight: 800, padding: "3px 10px",
                borderRadius: "100px",
                background: modalConfig.color + "15",
                color:      modalConfig.color,
                border:     `1px solid ${modalConfig.color}30`,
              }}>
                {modalConfig.typeLabel}
              </span>
            </div>

            <p style={rs.modalSub}>{modalConfig.subtitle}</p>

            {/* ── Freeze: just confirm + note ─────────────── */}
            {confirm.type === "approve" && modalConfig.action === "freeze" && (
              <InfoBanner color={T.cyan}>
                Member's status will be set to <strong>Frozen</strong>. They will not be billed until reactivated.
              </InfoBanner>
            )}

            {/* ── Cancel: warning + note ──────────────────── */}
            {confirm.type === "approve" && modalConfig.action === "cancel" && (
              <InfoBanner color={T.red}>
                Member's status will be set to <strong>Cancelled</strong>. This cannot be undone automatically.
              </InfoBanner>
            )}

            {/* ── Upgrade: plan selector + dates ──────────── */}
            {confirm.type === "approve" && modalConfig.action === "upgrade" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.25rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={rs.label}>New Plan *</label>
                    <select className="req-input" value={form.membership_type}
                      onChange={e => setForm(p => ({ ...p, membership_type: e.target.value }))}
                      style={{ ...rs.input, cursor: "pointer" }}>
                      <option value="">— Select plan —</option>
                      {MEMBERSHIP_TYPES.map(t => (
                        <option key={t} value={t}>{fmtType(t)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={rs.label}>Amount Paid (₹)</label>
                    <input type="number" className="req-input" placeholder="0"
                      value={form.amount_paid}
                      onChange={e => setForm(p => ({ ...p, amount_paid: e.target.value }))}
                      style={rs.input} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={rs.label}>Start Date *</label>
                    <input type="date" className="req-input" value={form.start_date}
                      onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
                      style={rs.input} />
                  </div>
                  <div>
                    <label style={rs.label}>End Date</label>
                    <input type="date" className="req-input" value={form.end_date}
                      onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
                      style={rs.input} />
                  </div>
                </div>
              </div>
            )}

            {/* ── Trainer request: pick trainer ───────────── */}
            {confirm.type === "approve" && modalConfig.action === "trainer" && (
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={rs.label}>Assign Trainer *</label>
                {trainers.length === 0 ? (
                  <InfoBanner color={T.gold}>No active trainers available. Add trainers first.</InfoBanner>
                ) : (
                  <select className="req-input" value={form.trainer_id}
                    onChange={e => setForm(p => ({ ...p, trainer_id: e.target.value }))}
                    style={{ ...rs.input, cursor: "pointer" }}>
                    <option value="">— Select trainer —</option>
                    {trainers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.full_name} — {t.specialization} ({t.current_clients}/{t.max_clients} clients)
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* ── Generic / new membership: full form ─────── */}
            {confirm.type === "approve" && (modalConfig.action === "generic" || modalConfig.action === "membership") && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.25rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={rs.label}>Start Date *</label>
                    <input type="date" className="req-input" value={form.start_date}
                      onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
                      style={rs.input} />
                  </div>
                  <div>
                    <label style={rs.label}>End Date</label>
                    <input type="date" className="req-input" value={form.end_date}
                      onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
                      style={rs.input} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={rs.label}>Membership Plan</label>
                    <select className="req-input" value={form.membership_type}
                      onChange={e => setForm(p => ({ ...p, membership_type: e.target.value }))}
                      style={{ ...rs.input, cursor: "pointer" }}>
                      <option value="">— Select plan —</option>
                      {MEMBERSHIP_TYPES.map(t => (
                        <option key={t} value={t}>{fmtType(t)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={rs.label}>Amount Paid (₹)</label>
                    <input type="number" className="req-input" placeholder="0"
                      value={form.amount_paid}
                      onChange={e => setForm(p => ({ ...p, amount_paid: e.target.value }))}
                      style={rs.input} />
                  </div>
                </div>
              </div>
            )}

            {/* ── Admin note — always shown ────────────────── */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={rs.label}>
                {confirm.type === "approve" ? "Note for member (optional)" : "Reason for rejection (optional)"}
              </label>
              <textarea rows={3}
                value={form.admin_notes}
                onChange={e => setForm(p => ({ ...p, admin_notes: e.target.value }))}
                placeholder={modalConfig.notePlaceholder}
                style={rs.textarea} />
            </div>

            {/* ── Buttons ──────────────────────────────────── */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setConfirm(null)} style={rs.cancelBtn}>Cancel</button>
              <button onClick={handleAction} style={{
                ...rs.actionBtn,
                background: confirm.type === "approve"
                  ? modalConfig.approveGradient
                  : "linear-gradient(135deg,#FF1A1A,#cc0000)",
              }}>
                {confirm.type === "approve" ? modalConfig.approveLabel : "✕ Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </DashLayout>
  );
}

// ── Derive modal text/colours from the row's request_type ────
function getModalConfig(row) {
  const t = row?.request_type;
  const name = row?.customer_name || "this member";

  const configs = {
    freeze: {
      action:          "freeze",
      typeLabel:       "Freeze Membership",
      color:           "#00C2FF",
      subtitle:        `Freeze the membership for "${name}". They keep their data but lose gym access until reactivated.`,
      approveLabel:    "❄ Freeze Membership",
      approveGradient: "linear-gradient(135deg,#00C2FF,#0099cc)",
      notePlaceholder: "e.g. Frozen as requested. Contact us to reactivate.",
    },
    cancellation: {
      action:          "cancel",
      typeLabel:       "Cancel Membership",
      color:           "#FF1A1A",
      subtitle:        `Cancel the membership for "${name}". Their member record will be marked cancelled.`,
      approveLabel:    "✕ Confirm Cancellation",
      approveGradient: "linear-gradient(135deg,#FF1A1A,#cc0000)",
      notePlaceholder: "e.g. Membership cancelled as per your request.",
    },
    upgrade: {
      action:          "upgrade",
      typeLabel:       "Upgrade Plan",
      color:           "#FFB800",
      subtitle:        `Upgrade the membership plan for "${name}". Select the new plan and update the dates.`,
      approveLabel:    "↑ Approve Upgrade",
      approveGradient: "linear-gradient(135deg,#FFB800,#cc9200)",
      notePlaceholder: "e.g. Upgraded to Annual plan. Enjoy the benefits!",
    },
    trainer_request: {
      action:          "trainer",
      typeLabel:       "Trainer Request",
      color:           "#A855F7",
      subtitle:        `Assign a trainer to "${name}" as requested.`,
      approveLabel:    "✓ Assign Trainer",
      approveGradient: "linear-gradient(135deg,#A855F7,#7c3aed)",
      notePlaceholder: "e.g. Assigned you to Arjun Reddy for strength training.",
    },
  };

  return configs[t] || {
    action:          t ? "generic" : "membership",
    typeLabel:       t ? "Other Request" : "Membership Enquiry",
    color:           t ? "#888" : "#22C55E",
    subtitle:        `Approving request from "${name}". Fill in membership details to activate.`,
    approveLabel:    "✓ Approve & Activate",
    approveGradient: "linear-gradient(135deg,#22C55E,#16a34a)",
    notePlaceholder: "e.g. Welcome! Your membership is now active.",
  };
}

// ── Info banner helper ────────────────────────────────────────
function InfoBanner({ color, children }) {
  return (
    <div style={{
      padding: "10px 14px", borderRadius: 10, marginBottom: "1.25rem",
      background: color + "10",
      border:     `1px solid ${color}30`,
      fontSize:   "13px",
      color:      color === "#FF1A1A" ? "rgba(255,120,120,0.9)" : color,
      lineHeight: 1.6,
    }}>
      {children}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────
const rs = {
  viewBtn:    { padding: "3px 10px", background: "rgba(0,194,255,0.1)", border: "1px solid rgba(0,194,255,0.25)", borderRadius: "4px", color: "#00C2FF", fontSize: "10px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", flexShrink: 0 },
  approveBtn: { padding: "6px 14px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "6px", color: "#22C55E", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" },
  rejectBtn:  { padding: "6px 14px", background: "rgba(255,26,26,0.08)", border: "1px solid rgba(255,26,26,0.2)", borderRadius: "6px", color: "#FF1A1A", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" },
  overlay:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9000, backdropFilter: "blur(4px)" },
  modal:      { background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "2rem", width: "90%", animation: "fadeUp 0.3s ease forwards", maxHeight: "90vh", overflowY: "auto" },
  modalTitle: { fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.4rem", letterSpacing: "3px", color: "#fff", marginBottom: "0.5rem" },
  modalSub:   { fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", marginBottom: "1.5rem", lineHeight: 1.6 },
  label:      { display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "6px" },
  input:      { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "0.875rem", fontFamily: "'DM Sans',sans-serif", transition: "border-color 0.2s", boxSizing: "border-box" },
  textarea:   { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "12px 14px", color: "#fff", fontSize: "0.875rem", fontFamily: "'DM Sans',sans-serif", outline: "none", resize: "vertical", transition: "border-color 0.2s", boxSizing: "border-box" },
  cancelBtn:  { flexShrink: 0, padding: "12px 24px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, cursor: "pointer" },
  actionBtn:  { flex: 1, padding: "12px", border: "none", borderRadius: "8px", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" },
};