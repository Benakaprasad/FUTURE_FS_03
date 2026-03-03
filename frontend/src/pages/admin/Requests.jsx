import { useState, useEffect, useCallback } from "react";
import DashLayout from "../../components/DashLayout";
import { DataTable, Badge, Toast } from "../../components/AdminUi";
import api from "../../api/axios";

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(null);
  const [confirm,  setConfirm]  = useState(null);
  const [viewing,  setViewing]  = useState(null); // full notes view
  const [form,     setForm]     = useState({
    admin_notes: "", start_date: "", end_date: "", amount_paid: "", membership_type: "",
  });

  const MEMBERSHIP_TYPES = ["monthly","quarterly","half_yearly","annual","student","corporate"];

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRequests = useCallback(() => {
    setLoading(true);
    api.get("/requests")
      .then(({ data }) => setRequests(data.requests || []))
      .catch((err) => showToast(err.response?.data?.error || "Failed to load.", "error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleAction = async () => {
    try {
      const isApprove = confirm.type === "approve";
      const payload = isApprove
        ? {
            admin_notes:     form.admin_notes,
            start_date:      form.start_date,
            end_date:        form.end_date || null,
            amount_paid:     form.amount_paid ? parseFloat(form.amount_paid) : null,
            membership_type: form.membership_type || confirm.membership_type,
          }
        : { admin_notes: form.admin_notes };

      if (isApprove && !form.start_date) {
        showToast("Start date is required to approve.", "error");
        return;
      }

      await api.patch(`/requests/${confirm.id}/${isApprove ? "approve" : "reject"}`, payload);
      showToast(`Request ${isApprove ? "approved" : "rejected"} successfully.`);
      setConfirm(null);
      setForm({ admin_notes: "", start_date: "", end_date: "", amount_paid: "", membership_type: "" });
      fetchRequests();
    } catch (err) {
      showToast(err.response?.data?.error || "Action failed.", "error");
    }
  };

  const cols = [
    {
      key: "customer_name", label: "Customer",
      render: (r) => (
        <div>
          <strong style={{ color: "#fff" }}>{r.customer_name || "—"}</strong>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>{r.customer_email}</div>
        </div>
      )
    },
    {
      key: "membership_type", label: "Plan",
      render: (r) => r.membership_type
        ? <Badge status={r.membership_type} />
        : <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px" }}>Not specified</span>
    },
    {
      key: "message", label: "Customer Notes",
      render: (r) => r.message ? (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "rgba(255,255,255,0.45)", fontStyle: "italic", fontSize: "12px" }}>
            "{r.message.slice(0, 40)}{r.message.length > 40 ? "…" : ""}"
          </span>
          {r.message.length > 40 && (
            <button onClick={() => setViewing(r)} style={rs.viewBtn}>View</button>
          )}
        </div>
      ) : <span style={{ color: "rgba(255,255,255,0.2)" }}>—</span>
    },
    {
      key: "created_at", label: "Date",
      render: (r) => new Date(r.created_at).toLocaleDateString("en-IN")
    },
    {
      key: "status", label: "Status",
      render: (r) => <Badge status={r.status} />
    },
    {
      key: "admin_notes", label: "Admin Reply",
      render: (r) => r.admin_notes
        ? <span style={{ fontSize: "12px", color: "#22C55E", fontStyle: "italic" }}>"{r.admin_notes.slice(0, 40)}{r.admin_notes.length > 40 ? "…" : ""}"</span>
        : <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "12px" }}>—</span>
    },
  ];

  return (
    <DashLayout title="REQUESTS" subtitle="Review and action membership requests">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        textarea:focus, .req-input:focus { border-color: #FF1A1A !important; outline: none; }
        textarea::placeholder, .req-input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>

      <DataTable
        cols={cols} rows={requests} loading={loading}
        searchKeys={["customer_name", "customer_email"]}
        filterKey="status"
        filterOptions={["pending","reviewed","approved","rejected"].map((s) => ({
          value: s, label: s.charAt(0).toUpperCase() + s.slice(1)
        }))}
        emptyText="No requests yet."
        actions={(row) => row.status === "pending" || row.status === "reviewed" ? (
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={() => {
              setConfirm({ type: "approve", id: row.id, name: row.customer_name, membership_type: row.membership_type });
              setForm({ admin_notes: "", start_date: new Date().toISOString().split("T")[0], end_date: "", amount_paid: "", membership_type: row.membership_type || "" });
            }} style={rs.approveBtn}>Approve</button>
            <button onClick={() => {
              setConfirm({ type: "reject", id: row.id, name: row.customer_name });
              setForm({ admin_notes: "", start_date: "", end_date: "", amount_paid: "", membership_type: "" });
            }} style={rs.rejectBtn}>Reject</button>
          </div>
        ) : <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>—</span>}
      />

      {/* ── View full notes modal ── */}
      {viewing && (
        <div style={rs.overlay} onClick={() => setViewing(null)}>
          <div style={rs.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={rs.modalTitle}>CUSTOMER NOTES</h3>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", marginBottom: "1rem" }}>
              From: <strong style={{ color: "#fff" }}>{viewing.customer_name}</strong> · {new Date(viewing.created_at).toLocaleDateString("en-IN")}
            </p>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "1rem", marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, fontStyle: "italic" }}>
                "{viewing.message}"
              </p>
            </div>
            <button onClick={() => setViewing(null)} style={{ ...rs.cancelBtn, width: "100%" }}>Close</button>
          </div>
        </div>
      )}

      {/* ── Approve / Reject modal ── */}
      {confirm && (
        <div style={rs.overlay}>
          <div style={{ ...rs.modal, maxWidth: confirm.type === "approve" ? "520px" : "460px" }}>
            <h3 style={rs.modalTitle}>
              {confirm.type === "approve" ? "APPROVE REQUEST" : "REJECT REQUEST"}
            </h3>
            <p style={rs.modalSub}>
              {confirm.type === "approve"
                ? `Approving request from "${confirm.name}". Fill in membership details below.`
                : `Reject the request from "${confirm.name}"? Add an optional note for the customer.`}
            </p>

            {/* Approve-only fields */}
            {confirm.type === "approve" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.25rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={rs.label}>Start Date *</label>
                    <input type="date" className="req-input" value={form.start_date}
                      onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
                      style={rs.input} />
                  </div>
                  <div>
                    <label style={rs.label}>End Date</label>
                    <input type="date" className="req-input" value={form.end_date}
                      onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
                      style={rs.input} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={rs.label}>Membership Plan</label>
                    <select className="req-input" value={form.membership_type}
                      onChange={(e) => setForm((p) => ({ ...p, membership_type: e.target.value }))}
                      style={{ ...rs.input, cursor: "pointer" }}>
                      <option value="">— Select plan —</option>
                      {MEMBERSHIP_TYPES.map((t) => (
                        <option key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={rs.label}>Amount Paid (₹)</label>
                    <input type="number" className="req-input" placeholder="0" value={form.amount_paid}
                      onChange={(e) => setForm((p) => ({ ...p, amount_paid: e.target.value }))}
                      style={rs.input} />
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={rs.label}>
                {confirm.type === "approve" ? "Note for customer (optional)" : "Reason for rejection (optional)"}
              </label>
              <textarea value={form.admin_notes}
                onChange={(e) => setForm((p) => ({ ...p, admin_notes: e.target.value }))}
                placeholder={confirm.type === "approve" ? "e.g. Welcome! Your membership starts tomorrow." : "e.g. Incomplete information provided."}
                rows={3} style={rs.textarea} />
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setConfirm(null)} style={rs.cancelBtn}>Cancel</button>
              <button onClick={handleAction} style={{
                ...rs.actionBtn,
                background: confirm.type === "approve"
                  ? "linear-gradient(135deg,#22C55E,#16a34a)"
                  : "linear-gradient(135deg,#FF1A1A,#cc0000)"
              }}>
                {confirm.type === "approve" ? "✓ Approve & Create Membership" : "✕ Reject"}
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
  viewBtn:    { padding: "3px 10px", background: "rgba(0,194,255,0.1)", border: "1px solid rgba(0,194,255,0.25)", borderRadius: "4px", color: "#00C2FF", fontSize: "10px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", flexShrink: 0 },
  approveBtn: { padding: "6px 14px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "6px", color: "#22C55E", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  rejectBtn:  { padding: "6px 14px", background: "rgba(255,26,26,0.08)", border: "1px solid rgba(255,26,26,0.2)", borderRadius: "6px", color: "#FF1A1A", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  overlay:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9000, backdropFilter: "blur(4px)" },
  modal:      { background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "2rem", width: "90%", animation: "fadeUp 0.3s ease forwards" },
  modalTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "3px", color: "#fff", marginBottom: "0.5rem" },
  modalSub:   { fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", marginBottom: "1.5rem", lineHeight: 1.6 },
  label:      { display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "6px" },
  input:      { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s" },
  textarea:   { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "12px 14px", color: "#fff", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif", outline: "none", resize: "vertical", transition: "border-color 0.2s" },
  cancelBtn:  { flex: "0 0 auto", padding: "12px 24px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer" },
  actionBtn:  { flex: 1, padding: "12px", border: "none", borderRadius: "8px", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" },
};