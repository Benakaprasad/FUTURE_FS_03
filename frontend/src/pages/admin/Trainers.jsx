import { useState, useEffect, useCallback } from "react";
import DashLayout from "../../components/DashLayout";
import { DataTable, Badge, Toast } from "../../components/AdminUI";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

export default function AdminTrainers() {
  const { user }  = useAuth();
  const [trainers, setTrainers] = useState([]);
  const [members,  setMembers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(null);
  const [modal,    setModal]    = useState(null); // { type: view|assign, data }
  const [assignForm, setAssignForm] = useState({ trainer_id: "", member_id: "" });

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get("/trainers"),
      api.get("/members?status=active"),
    ]).then(([tr, mem]) => {
      setTrainers(tr.data.trainers || []);
      setMembers(mem.data.members || []);
    }).catch(() => showToast("Failed to load.", "error")).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleStatusToggle = async (trainer) => {
    try {
      await api.patch(`/trainers/${trainer.id}/status`, { is_active: !trainer.is_active });
      showToast(`Trainer ${trainer.is_active ? "deactivated" : "activated"}.`);
      fetchAll();
    } catch { showToast("Failed to update status.", "error"); }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await api.post("/assignments", assignForm);
      showToast("Trainer assigned successfully.");
      setModal(null);
      fetchAll();
    } catch (err) { showToast(err.response?.data?.error || "Assignment failed.", "error"); }
  };

  const canManage = ["admin", "manager"].includes(user?.role);

  const cols = [
    { key: "full_name",    label: "Name",           render: (r) => <strong style={{ color: "#fff" }}>{r.full_name || r.user_name || "—"}</strong> },
    { key: "specialization", label: "Specialization", render: (r) => r.specialization || "—" },
    { key: "certification",  label: "Certification",  render: (r) => r.certification  || "—" },
    { key: "experience_years", label: "Experience",   render: (r) => r.experience_years ? `${r.experience_years} yrs` : "—" },
    { key: "current_clients", label: "Members",       render: (r) => <span style={{ color: "#00C2FF", fontWeight: 700 }}>{r.current_clients ?? 0}</span> },
    { key: "is_active",    label: "Status",           render: (r) => <Badge status={r.is_active ? "active" : "inactive"} /> },
  ];

  return (
    <DashLayout
      title="TRAINERS"
      subtitle="Manage trainers and member assignments"
      actions={canManage && (
        <button onClick={() => { setAssignForm({ trainer_id: "", member_id: "" }); setModal({ type: "assign" }); }} style={ts.addBtn}>
          + Assign Trainer
        </button>
      )}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } } @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } } select:focus { outline: none; }`}</style>

      <DataTable
        cols={cols} rows={trainers} loading={loading}
        searchKeys={["full_name", "specialization", "certification"]}
        filterKey="is_active"
        filterOptions={[{ value: true, label: "Active" }, { value: false, label: "Inactive" }]}
        emptyText="No trainers yet."
        actions={canManage ? (row) => (
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={() => handleStatusToggle(row)} style={row.is_active ? ts.deactivateBtn : ts.activateBtn}>
              {row.is_active ? "Deactivate" : "Activate"}
            </button>
          </div>
        ) : undefined}
      />

      {/* Assign modal */}
      {modal?.type === "assign" && (
        <div style={ts.overlay}>
          <div style={ts.modal}>
            <div style={ts.modalHeader}>
              <h3 style={ts.modalTitle}>ASSIGN TRAINER</h3>
              <button onClick={() => setModal(null)} style={ts.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleAssign} style={ts.form}>
              <div style={ts.field}>
                <label style={ts.label}>Select Trainer</label>
                <select required value={assignForm.trainer_id} onChange={(e) => setAssignForm((p) => ({ ...p, trainer_id: e.target.value }))} style={ts.select}>
                  <option value="">— Choose trainer —</option>
                  {trainers.filter((t) => t.is_active).map((t) => (
                    <option key={t.id} value={t.id}>{t.full_name || t.user_name} ({t.current_clients || 0} members)</option>
                  ))}
                </select>
              </div>
              <div style={ts.field}>
                <label style={ts.label}>Select Member</label>
                <select required value={assignForm.member_id} onChange={(e) => setAssignForm((p) => ({ ...p, member_id: e.target.value }))} style={ts.select}>
                  <option value="">— Choose member —</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.customer_name} — {m.plan_type}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button type="button" onClick={() => setModal(null)} style={ts.cancelBtn}>Cancel</button>
                <button type="submit" style={ts.saveBtn}>Assign →</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </DashLayout>
  );
}

const ts = {
  addBtn:       { padding: "10px 20px", background: "linear-gradient(135deg, #FF1A1A, #cc0000)", color: "#fff", fontWeight: 700, fontSize: "13px", border: "none", borderRadius: "8px", cursor: "pointer", boxShadow: "0 4px 15px rgba(255,26,26,0.3)" },
  activateBtn:  { padding: "6px 14px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "6px", color: "#22C55E", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  deactivateBtn:{ padding: "6px 14px", background: "rgba(255,26,26,0.08)", border: "1px solid rgba(255,26,26,0.2)", borderRadius: "6px", color: "#FF1A1A", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9000, backdropFilter: "blur(4px)" },
  modal:   { background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "0", maxWidth: "480px", width: "90%", animation: "fadeUp 0.3s ease forwards" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  modalTitle:  { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "3px", color: "#fff" },
  closeBtn:    { background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "18px", cursor: "pointer", padding: "4px" },
  form:        { padding: "1.75rem 2rem", display: "flex", flexDirection: "column", gap: "1.25rem" },
  field:       { display: "flex", flexDirection: "column", gap: "7px" },
  label:       { fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" },
  select:      { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "12px 14px", color: "#fff", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" },
  cancelBtn:   { flex: "0 0 auto", padding: "12px 24px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer" },
  saveBtn:     { flex: 1, padding: "12px", background: "linear-gradient(135deg, #FF1A1A, #cc0000)", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, border: "none", borderRadius: "8px", cursor: "pointer" },
};