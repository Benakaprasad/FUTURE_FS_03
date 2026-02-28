import { useState, useEffect, useCallback } from "react";
import DashLayout from "../../components/DashLayout";
import { DataTable, Badge, Toast, ConfirmModal } from "../../components/AdminUI";
import api from "../../api/axios";

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);
  const [modal,   setModal]   = useState(null);
  const [confirm, setConfirm] = useState(null);

  const emptyForm = { username: "", email: "", password: "", full_name: "", phone: "", role: "staff" };
  const [form, setForm] = useState(emptyForm);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchUsers = useCallback(() => {
    setLoading(true);
    api.get("/users").then(({ data }) => setUsers(data.users || [])).catch(() => showToast("Failed to load.", "error")).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users", form);
      showToast("User created successfully.");
      setModal(null); setForm(emptyForm); fetchUsers();
    } catch (err) { showToast(err.response?.data?.error || "Failed to create user.", "error"); }
  };

  const handleToggleActive = async (user) => {
    try {
      await api.patch(`/users/${user.id}/status`, { is_active: !user.is_active });
      showToast(`User ${user.is_active ? "deactivated" : "activated"}.`);
      fetchUsers();
    } catch { showToast("Failed to update status.", "error"); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${confirm.id}`);
      showToast("User deleted.");
      setConfirm(null); fetchUsers();
    } catch { showToast("Failed to delete user.", "error"); }
  };

  const cols = [
    { key: "username",  label: "Username",  render: (r) => <strong style={{ color: "#fff" }}>{r.username || "—"}</strong> },
    { key: "full_name", label: "Full Name" },
    { key: "email",     label: "Email",     render: (r) => <span style={{ color: "rgba(255,255,255,0.55)" }}>{r.email}</span> },
    { key: "phone",     label: "Phone",     render: (r) => r.phone || "—" },
    { key: "role",      label: "Role",      render: (r) => <Badge status={r.role} /> },
    { key: "is_active", label: "Status",    render: (r) => <Badge status={r.is_active ? "active" : "inactive"} /> },
    { key: "created_at",label: "Created",   render: (r) => new Date(r.created_at).toLocaleDateString("en-IN") },
  ];

  const ROLES = ["staff", "manager", "admin"];

  return (
    <DashLayout
      title="STAFF MANAGEMENT"
      subtitle="Admin only — manage staff and admin accounts"
      actions={
        <button onClick={() => { setForm(emptyForm); setModal({ type: "add" }); }} style={us.addBtn}>
          + Add Staff
        </button>
      }
    >
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes slideIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} .field-input:focus{border-color:#FF1A1A!important;outline:none} .field-input::placeholder{color:rgba(255,255,255,0.2)}`}</style>

      <div style={us.warningBar}>
        <span>⚠️</span>
        <span>This page is restricted to <strong>admins only</strong>. Changes here affect system access and permissions.</span>
      </div>

      <DataTable
        cols={cols} rows={users} loading={loading}
        searchKeys={["username", "email", "full_name"]}
        filterKey="role"
        filterOptions={["admin","manager","staff","trainer","customer"].map((r) => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) }))}
        emptyText="No users found."
        actions={(row) => (
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={() => handleToggleActive(row)} style={row.is_active ? us.deactivateBtn : us.activateBtn}>
              {row.is_active ? "Deactivate" : "Activate"}
            </button>
            {row.role !== "admin" && (
              <button onClick={() => setConfirm({ id: row.id, name: row.username })} style={us.deleteBtn}>Delete</button>
            )}
          </div>
        )}
      />

      {/* Add modal */}
      {modal && (
        <div style={us.overlay}>
          <div style={us.modal}>
            <div style={us.modalHeader}>
              <h3 style={us.modalTitle}>ADD STAFF ACCOUNT</h3>
              <button onClick={() => setModal(null)} style={us.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleCreate} style={us.form}>
              <div style={us.formGrid}>
                {[
                  { key: "username",  label: "Username",    placeholder: "jsmith",         required: true },
                  { key: "full_name", label: "Full Name",   placeholder: "John Smith" },
                  { key: "email",     label: "Email",       placeholder: "john@fitzone.in", required: true, type: "email" },
                  { key: "phone",     label: "Phone",       placeholder: "+91 98765 43210" },
                ].map(({ key, label, placeholder, required, type }) => (
                  <div key={key} style={us.field}>
                    <label style={us.label}>{label}</label>
                    <input className="field-input" type={type || "text"} placeholder={placeholder} value={form[key] || ""} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} required={required} style={us.input} />
                  </div>
                ))}
              </div>

              <div style={us.formRow}>
                <div style={us.field}>
                  <label style={us.label}>Role</label>
                  <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} style={us.select}>
                    {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </div>
                <div style={us.field}>
                  <label style={us.label}>Temporary Password</label>
                  <input className="field-input" type="password" placeholder="Min 8 characters" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required minLength={8} style={us.input} />
                </div>
              </div>

              <p style={us.noteText}>Staff will be prompted to change their password on first login.</p>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button type="button" onClick={() => setModal(null)} style={us.cancelBtn}>Cancel</button>
                <button type="submit" style={us.saveBtn}>Create Account →</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirm}
        title="DELETE USER"
        message={`Delete account "${confirm?.name}"? This is permanent and cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
        confirmLabel="Delete User"
        danger
      />

      <Toast toast={toast} />
    </DashLayout>
  );
}

const us = {
  addBtn:       { padding: "10px 20px", background: "linear-gradient(135deg, #FF1A1A, #cc0000)", color: "#fff", fontWeight: 700, fontSize: "13px", border: "none", borderRadius: "8px", cursor: "pointer", boxShadow: "0 4px 15px rgba(255,26,26,0.3)" },
  warningBar:   { display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,184,0,0.06)", border: "1px solid rgba(255,184,0,0.2)", borderRadius: "10px", padding: "12px 20px", marginBottom: "1.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.6)" },
  activateBtn:  { padding: "6px 14px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "6px", color: "#22C55E", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  deactivateBtn:{ padding: "6px 14px", background: "rgba(255,184,0,0.08)", border: "1px solid rgba(255,184,0,0.2)", borderRadius: "6px", color: "#FFB800", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  deleteBtn:    { padding: "6px 14px", background: "rgba(255,26,26,0.08)", border: "1px solid rgba(255,26,26,0.2)", borderRadius: "6px", color: "#FF1A1A", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9000, backdropFilter: "blur(4px)" },
  modal:   { background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "0", maxWidth: "560px", width: "90%", animation: "fadeUp 0.3s ease forwards", maxHeight: "90vh", overflow: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  modalTitle:  { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "3px", color: "#fff" },
  closeBtn:    { background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "18px", cursor: "pointer", padding: "4px" },
  form:        { padding: "1.75rem 2rem", display: "flex", flexDirection: "column", gap: "1.25rem" },
  formGrid:    { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  formRow:     { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  field:       { display: "flex", flexDirection: "column", gap: "7px" },
  label:       { fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" },
  input:       { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "12px 14px", color: "#fff", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "border-color 0.2s" },
  select:      { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "12px 14px", color: "#fff", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" },
  noteText:    { fontSize: "12px", color: "rgba(255,255,255,0.3)", fontStyle: "italic" },
  cancelBtn:   { flex: "0 0 auto", padding: "12px 24px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer" },
  saveBtn:     { flex: 1, padding: "12px", background: "linear-gradient(135deg, #FF1A1A, #cc0000)", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, border: "none", borderRadius: "8px", cursor: "pointer" },
};