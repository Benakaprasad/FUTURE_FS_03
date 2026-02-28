import { useState, useEffect } from "react";
import DashLayout from "../../components/DashLayout";
import api from "../../api/axios";

const REQUEST_TYPES = [
  { value: "new_membership",    label: "New Membership",    icon: "🆕", desc: "Join FitZone for the first time" },
  { value: "renewal",           label: "Renewal",           icon: "🔄", desc: "Renew your existing membership" },
  { value: "upgrade",           label: "Plan Upgrade",      icon: "⬆️", desc: "Move to a higher plan" },
  { value: "trainer_request",   label: "Trainer Request",   icon: "🏋️", desc: "Request a specific trainer" },
  { value: "freeze",            label: "Freeze Membership", icon: "❄️", desc: "Temporarily pause your membership" },
  { value: "cancellation",      label: "Cancellation",      icon: "✕", desc: "Cancel your membership" },
  { value: "other",             label: "Other",             icon: "💬", desc: "Any other request or query" },
];

const STATUS_COLORS = {
  pending:  { color: "#FFB800", bg: "#FFB80015", border: "#FFB80030" },
  approved: { color: "#22C55E", bg: "#22C55E15", border: "#22C55E30" },
  rejected: { color: "#FF1A1A", bg: "#FF1A1A15", border: "#FF1A1A30" },
};

export default function CustomerRequest() {
  const [requests,   setRequests]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast,      setToast]      = useState(null);
  const [showForm,   setShowForm]   = useState(false);

  const [form, setForm] = useState({ request_type: "", notes: "" });

  const fetchRequests = () => {
    setLoading(true);
    api.get("/requests/my")
      .then(({ data }) => setRequests(data.requests || []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.request_type) { showToast("Please select a request type.", "error"); return; }
    setSubmitting(true);
    try {
      await api.post("/requests", form);
      showToast("Request submitted! We'll respond within 24 hours.");
      setForm({ request_type: "", notes: "" });
      setShowForm(false);
      fetchRequests();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to submit request.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount  = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;

  return (
    <DashLayout
      title="MY REQUESTS"
      subtitle="Track and manage your membership requests"
      actions={
        <button onClick={() => setShowForm(!showForm)} style={rqs.newBtn}>
          {showForm ? "✕ Cancel" : "+ New Request"}
        </button>
      }
    >
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .type-card:hover   { border-color: rgba(255,26,26,0.4) !important; background: rgba(255,26,26,0.06) !important; }
        .type-card.selected { border-color: #FF1A1A !important; background: rgba(255,26,26,0.1) !important; }
        textarea:focus, .field-input:focus { border-color: #FF1A1A !important; box-shadow: 0 0 0 3px rgba(255,26,26,0.1) !important; }
        textarea::placeholder { color: rgba(255,255,255,0.2); }

        /* ── Mobile responsive ── */
        @media (max-width: 768px) {

          /* Stats: 3 in a row but smaller */
          .stats-row {
            gap: 0.75rem !important;
          }
          .stat-card {
            padding: 1rem 0.75rem !important;
          }
          .stat-value {
            font-size: 1.8rem !important;
          }
          .stat-label {
            font-size: 11px !important;
          }

          /* Form card */
          .form-card {
            padding: 1.25rem !important;
          }

          /* Type grid: 2 columns on mobile */
          .type-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.625rem !important;
          }
          .type-card {
            padding: 0.875rem 0.625rem !important;
          }
          .type-icon { font-size: 1.2rem !important; }
          .type-label { font-size: 0.78rem !important; }
          .type-desc { display: none !important; }

          /* Form buttons */
          .form-btns {
            flex-direction: column !important;
          }
          .form-btns button {
            width: 100% !important;
          }

          /* Request cards */
          .request-card {
            padding: 1rem !important;
            gap: 0.75rem !important;
          }
          .request-notes {
            display: none !important;
          }
          .request-type-icon {
            font-size: 1.2rem !important;
          }
        }

        /* ── Very small phones ── */
        @media (max-width: 380px) {
          .type-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .stats-row {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>

      {/* ── Stats row ── */}
      <div className="stats-row" style={rqs.statsRow}>
        {[
          { label: "Total Requests",   value: requests.length,  color: "#00C2FF" },
          { label: "Pending",          value: pendingCount,     color: "#FFB800" },
          { label: "Approved",         value: approvedCount,    color: "#22C55E" },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ ...rqs.statCard, borderTop: `3px solid ${s.color}` }}>
            <p className="stat-value" style={{ ...rqs.statValue, color: s.color }}>{s.value}</p>
            <p className="stat-label" style={rqs.statLabel}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── New request form ── */}
      {showForm && (
        <div className="form-card" style={rqs.formCard}>
          <h3 style={rqs.formTitle}>NEW REQUEST</h3>
          <form onSubmit={handleSubmit}>

            <p style={rqs.fieldLabel}>What do you need?</p>
            <div className="type-grid" style={rqs.typeGrid}>
              {REQUEST_TYPES.map((t) => (
                <div
                  key={t.value}
                  className={`type-card${form.request_type === t.value ? " selected" : ""}`}
                  onClick={() => setForm((p) => ({ ...p, request_type: t.value }))}
                  style={{
                    ...rqs.typeCard,
                    borderColor: form.request_type === t.value ? "#FF1A1A" : "rgba(255,255,255,0.08)",
                    background: form.request_type === t.value ? "rgba(255,26,26,0.1)" : "rgba(255,255,255,0.02)",
                    cursor: "pointer",
                  }}
                >
                  <span className="type-icon" style={rqs.typeIcon}>{t.icon}</span>
                  <p className="type-label" style={rqs.typeLabel}>{t.label}</p>
                  <p className="type-desc" style={rqs.typeDesc}>{t.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={rqs.fieldLabel}>Additional Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Any specific details about your request..."
                rows={4}
                style={rqs.textarea}
              />
            </div>

            <div className="form-btns" style={{ display: "flex", gap: "1rem" }}>
              <button type="button" onClick={() => setShowForm(false)} style={rqs.cancelBtn}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} style={rqs.submitBtn}>
                {submitting ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                    <span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                    Submitting...
                  </span>
                ) : "Submit Request →"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Requests list ── */}
      {loading ? <Loader /> : requests.length === 0 ? (
        <div style={rqs.emptyState}>
          <span style={rqs.emptyIcon}>📋</span>
          <p style={rqs.emptyTitle}>No requests yet</p>
          <p style={rqs.emptySub}>Click "+ New Request" above to submit your first request.</p>
        </div>
      ) : (
        <div style={rqs.requestList}>
          {requests.map((r) => {
            const sc = STATUS_COLORS[r.status] || { color: "#fff", bg: "#ffffff10", border: "#ffffff20" };
            const typeInfo = REQUEST_TYPES.find((t) => t.value === r.request_type);
            return (
              <div key={r.id} className="request-card" style={rqs.requestCard}>
                <div style={rqs.requestLeft}>
                  <span className="request-type-icon" style={rqs.requestTypeIcon}>{typeInfo?.icon || "📋"}</span>
                  <div>
                    <p style={rqs.requestType}>{typeInfo?.label || r.request_type?.replace(/_/g, " ") || "Request"}</p>
                    <p style={rqs.requestDate}>
                      {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    {r.notes && <p className="request-notes" style={rqs.requestNotes}>"{r.notes}"</p>}
                    {r.admin_notes && (
                      <p style={{ ...rqs.requestNotes, color: "#22C55E", marginTop: "4px" }}>
                        Staff reply: "{r.admin_notes}"
                      </p>
                    )}
                  </div>
                </div>
                <span style={{ ...rqs.statusBadge, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
                  {r.status?.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <div style={{ ...rqs.toast, background: toast.type === "error" ? "rgba(255,26,26,0.95)" : "rgba(34,197,94,0.95)" }}>
          {toast.type === "error" ? "✕" : "✓"} {toast.msg}
        </div>
      )}
    </DashLayout>
  );
}

function Loader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
      <div style={{ width: "36px", height: "36px", border: "3px solid rgba(255,26,26,0.2)", borderTop: "3px solid #FF1A1A", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );
}

const rqs = {
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" },
  statCard:  { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.25rem" },
  statValue: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem", marginBottom: "4px" },
  statLabel: { fontSize: "12px", color: "rgba(255,255,255,0.35)", fontWeight: 500 },
  formCard:  { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "2rem", marginBottom: "2rem", animation: "fadeUp 0.3s ease forwards" },
  formTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "3px", color: "rgba(255,255,255,0.5)", marginBottom: "1.5rem" },
  fieldLabel:{ fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "0.75rem", display: "block" },
  typeGrid:  { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" },
  typeCard:  { border: "1px solid", borderRadius: "10px", padding: "1rem", transition: "all 0.2s" },
  typeIcon:  { fontSize: "1.4rem", display: "block", marginBottom: "0.5rem" },
  typeLabel: { fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: "3px" },
  typeDesc:  { fontSize: "11px", color: "rgba(255,255,255,0.3)", lineHeight: 1.4 },
  textarea: {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)", borderRadius: "9px",
    padding: "12px 14px", color: "#fff", fontSize: "0.9rem",
    fontFamily: "'DM Sans', sans-serif", outline: "none", resize: "vertical",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  cancelBtn: {
    flex: "0 0 auto", padding: "13px 24px",
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "9px", color: "rgba(255,255,255,0.5)",
    fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer",
  },
  submitBtn: {
    flex: 1, padding: "13px",
    background: "linear-gradient(135deg, #FF1A1A, #cc0000)",
    color: "#fff", fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700, fontSize: "0.95rem",
    border: "none", borderRadius: "9px", cursor: "pointer",
    boxShadow: "0 4px 20px rgba(255,26,26,0.3)",
  },
  emptyState: { textAlign: "center", padding: "4rem 2rem", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "14px" },
  emptyIcon:  { fontSize: "2.5rem", display: "block", marginBottom: "1rem" },
  emptyTitle: { fontSize: "1rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: "6px" },
  emptySub:   { fontSize: "0.875rem", color: "rgba(255,255,255,0.2)" },
  requestList: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  requestCard: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px", padding: "1.25rem 1.5rem", gap: "1rem",
  },
  requestLeft:     { display: "flex", gap: "1rem", alignItems: "flex-start", flex: 1 },
  requestTypeIcon: { fontSize: "1.5rem", flexShrink: 0, marginTop: "2px" },
  requestType:     { fontSize: "0.95rem", fontWeight: 700, color: "#fff", marginBottom: "3px" },
  requestDate:     { fontSize: "12px", color: "rgba(255,255,255,0.35)", marginBottom: "4px" },
  requestNotes:    { fontSize: "12px", color: "rgba(255,255,255,0.4)", fontStyle: "italic" },
  statusBadge:     { fontSize: "10px", fontWeight: 800, letterSpacing: "1px", padding: "4px 10px", borderRadius: "100px", flexShrink: 0 },
  newBtn: {
    padding: "10px 20px", background: "linear-gradient(135deg, #FF1A1A, #cc0000)",
    color: "#fff", fontWeight: 700, fontSize: "13px",
    border: "none", borderRadius: "8px", cursor: "pointer",
    boxShadow: "0 4px 15px rgba(255,26,26,0.3)", transition: "all 0.2s",
  },
  toast: {
    position: "fixed", bottom: "2rem", right: "2rem",
    padding: "14px 22px", borderRadius: "10px",
    color: "#fff", fontWeight: 700, fontSize: "0.875rem",
    boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
    animation: "slideIn 0.3s ease forwards", zIndex: 9999,
  },
};