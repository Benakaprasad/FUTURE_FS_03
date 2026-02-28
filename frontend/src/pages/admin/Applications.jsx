import { useState, useEffect, useCallback } from "react";
import DashLayout from "../../components/DashLayout";
import { DataTable, Badge, Toast } from "../../components/AdminUI";
import api from "../../api/axios";

// ═══════════════════════════════════════════════════════════
// APPLICATIONS PAGE
// ═══════════════════════════════════════════════════════════
export function AdminApplications() {
  const [apps,    setApps]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [notes,   setNotes]   = useState("");

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetch = useCallback(() => {
    setLoading(true);
    api.get("/trainer-applications").then(({ data }) => setApps(data.applications || [])).catch(() => showToast("Failed to load.", "error")).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleAction = async () => {
    try {
      const ep = confirm.type === "approve"
        ? `/trainer-applications/${confirm.id}/approve`
        : `/trainer-applications/${confirm.id}/reject`;
      await api.patch(ep, { notes });
      showToast(`Application ${confirm.type === "approve" ? "approved" : "rejected"}. ${confirm.type === "approve" ? "Trainer account created." : ""}`);
      setConfirm(null); setNotes(""); fetch();
    } catch (err) { showToast(err.response?.data?.error || "Action failed.", "error"); }
  };

  const cols = [
    { key: "full_name",      label: "Applicant",      render: (r) => <strong style={{ color: "#fff" }}>{r.full_name || "—"}</strong> },
    { key: "email",          label: "Email",          render: (r) => <span style={{ color: "rgba(255,255,255,0.55)" }}>{r.email || "—"}</span> },
    { key: "phone",          label: "Phone" },
    { key: "specialization", label: "Specialization", render: (r) => r.specialization || "—" },
    { key: "experience_years", label: "Experience",   render: (r) => r.experience_years ? `${r.experience_years} yrs` : "—" },
    { key: "certification",  label: "Certification",  render: (r) => r.certification || "—" },
    { key: "status",         label: "Status",         render: (r) => <Badge status={r.status} /> },
    { key: "created_at",     label: "Applied",        render: (r) => new Date(r.created_at).toLocaleDateString("en-IN") },
  ];

  return (
    <DashLayout title="APPLICATIONS" subtitle="Trainer job applications">
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes slideIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} textarea:focus{border-color:#FF1A1A!important;outline:none} textarea::placeholder{color:rgba(255,255,255,0.2)}`}</style>

      <DataTable cols={cols} rows={apps} loading={loading} searchKeys={["full_name","email","specialization"]} filterKey="status" filterOptions={["pending","approved","rejected"].map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} emptyText="No applications yet."
        actions={(row) => row.status === "pending" ? (
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={() => { setConfirm({ type: "approve", id: row.id, name: row.full_name }); setNotes(""); }} style={apStyle.approveBtn}>Approve</button>
            <button onClick={() => { setConfirm({ type: "reject",  id: row.id, name: row.full_name }); setNotes(""); }} style={apStyle.rejectBtn}>Reject</button>
          </div>
        ) : <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>—</span>}
      />

      {confirm && (
        <div style={apStyle.overlay}>
          <div style={apStyle.modal}>
            <h3 style={apStyle.modalTitle}>{confirm.type === "approve" ? "APPROVE APPLICATION" : "REJECT APPLICATION"}</h3>
            <p style={apStyle.modalSub}>
              {confirm.type === "approve"
                ? `Approving "${confirm.name}" will create a trainer account and add them to the team.`
                : `Reject the application from "${confirm.name}"?`}
            </p>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={apStyle.label}>Notes (optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add feedback for the applicant..." rows={3} style={apStyle.textarea} />
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setConfirm(null)} style={apStyle.cancelBtn}>Cancel</button>
              <button onClick={handleAction} style={{ ...apStyle.actionBtn, background: confirm.type === "approve" ? "linear-gradient(135deg,#22C55E,#16a34a)" : "linear-gradient(135deg,#FF1A1A,#cc0000)" }}>
                {confirm.type === "approve" ? "✓ Approve & Create Account" : "✕ Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </DashLayout>
  );
}

const apStyle = {
  approveBtn: { padding: "6px 14px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "6px", color: "#22C55E", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  rejectBtn:  { padding: "6px 14px", background: "rgba(255,26,26,0.08)", border: "1px solid rgba(255,26,26,0.2)", borderRadius: "6px", color: "#FF1A1A", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9000, backdropFilter: "blur(4px)" },
  modal:   { background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "2rem", maxWidth: "480px", width: "90%", animation: "fadeUp 0.3s ease forwards" },
  modalTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "3px", color: "#fff", marginBottom: "0.5rem" },
  modalSub:   { fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", marginBottom: "1.5rem", lineHeight: 1.6 },
  label:      { display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "7px" },
  textarea:   { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "12px 14px", color: "#fff", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif", outline: "none", resize: "vertical", transition: "border-color 0.2s" },
  cancelBtn:  { flex: "0 0 auto", padding: "12px 24px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer" },
  actionBtn:  { flex: 1, padding: "12px", border: "none", borderRadius: "8px", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" },
};