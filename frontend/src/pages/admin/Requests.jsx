import { useState, useEffect, useCallback } from "react";
import DashLayout from "../../components/DashLayout";
import { DataTable, Badge, Toast, ConfirmModal } from "../../components/AdminUi";
import api from "../../api/axios";

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(null);
  const [confirm,  setConfirm]  = useState(null); // { type: approve|reject, id, name }
  const [notes,    setNotes]    = useState("");

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetch = useCallback(() => {
    setLoading(true);
    api.get("/requests").then(({ data }) => setRequests(data.requests || [])).catch(() => showToast("Failed to load.", "error")).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleAction = async () => {
    try {
      const endpoint = confirm.type === "approve" ? `/requests/${confirm.id}/approve` : `/requests/${confirm.id}/reject`;
      await api.patch(endpoint, { admin_notes: notes });
      showToast(`Request ${confirm.type === "approve" ? "approved" : "rejected"} successfully.`);
      setConfirm(null); setNotes(""); fetch();
    } catch (err) { showToast(err.response?.data?.error || "Action failed.", "error"); }
  };

  const cols = [
    { key: "customer_name", label: "Customer", render: (r) => <strong style={{ color: "#fff" }}>{r.customer_name || r.user_name || "—"}</strong> },
    { key: "request_type",  label: "Type",     render: (r) => (r.request_type || "—").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) },
    { key: "notes",         label: "Notes",    render: (r) => r.notes ? <span style={{ color: "rgba(255,255,255,0.45)", fontStyle: "italic" }}>"{r.notes.slice(0, 50)}{r.notes.length > 50 ? "…" : ""}"</span> : <span style={{ color: "rgba(255,255,255,0.2)" }}>—</span> },
    { key: "created_at",    label: "Date",     render: (r) => new Date(r.created_at).toLocaleDateString("en-IN") },
    { key: "status",        label: "Status",   render: (r) => <Badge status={r.status} /> },
  ];

  return (
    <DashLayout title="REQUESTS" subtitle="Review and action membership requests">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } } @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } } textarea:focus { border-color: #FF1A1A !important; outline: none; } textarea::placeholder { color: rgba(255,255,255,0.2); }`}</style>

      <DataTable
        cols={cols} rows={requests} loading={loading}
        searchKeys={["customer_name", "request_type"]}
        filterKey="status"
        filterOptions={["pending","approved","rejected"].map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
        emptyText="No requests yet."
        actions={(row) => row.status === "pending" ? (
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={() => { setConfirm({ type: "approve", id: row.id, name: row.customer_name || row.user_name }); setNotes(""); }} style={rs.approveBtn}>Approve</button>
            <button onClick={() => { setConfirm({ type: "reject",  id: row.id, name: row.customer_name || row.user_name }); setNotes(""); }} style={rs.rejectBtn}>Reject</button>
          </div>
        ) : <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>—</span>}
      />

      {/* Action modal */}
      {confirm && (
        <div style={rs.overlay}>
          <div style={rs.modal}>
            <h3 style={rs.modalTitle}>{confirm.type === "approve" ? "APPROVE REQUEST" : "REJECT REQUEST"}</h3>
            <p style={rs.modalSub}>
              {confirm.type === "approve"
                ? `Approve the request from "${confirm.name}"? This will create or activate their membership.`
                : `Reject the request from "${confirm.name}"?`}
            </p>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={rs.label}>Admin Notes (optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add a note for the customer..." rows={3} style={rs.textarea} />
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setConfirm(null)} style={rs.cancelBtn}>Cancel</button>
              <button onClick={handleAction} style={{ ...rs.actionBtn, background: confirm.type === "approve" ? "linear-gradient(135deg,#22C55E,#16a34a)" : "linear-gradient(135deg,#FF1A1A,#cc0000)" }}>
                {confirm.type === "approve" ? "✓ Approve" : "✕ Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </DashLayout>
  );
}

const rs = {
  approveBtn: { padding: "6px 14px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "6px", color: "#22C55E", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  rejectBtn:  { padding: "6px 14px", background: "rgba(255,26,26,0.08)", border: "1px solid rgba(255,26,26,0.2)", borderRadius: "6px", color: "#FF1A1A", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9000, backdropFilter: "blur(4px)" },
  modal:   { background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "2rem", maxWidth: "460px", width: "90%", animation: "fadeUp 0.3s ease forwards" },
  modalTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "3px", color: "#fff", marginBottom: "0.5rem" },
  modalSub:   { fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", marginBottom: "1.5rem", lineHeight: 1.6 },
  label:      { display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "7px" },
  textarea:   { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "12px 14px", color: "#fff", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif", outline: "none", resize: "vertical", transition: "border-color 0.2s" },
  cancelBtn:  { flex: "0 0 auto", padding: "12px 24px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer" },
  actionBtn:  { flex: 1, padding: "12px", border: "none", borderRadius: "8px", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" },
};