import { useState, useEffect, useCallback } from "react";
import DashLayout from "../../components/DashLayout";
import { DataTable, Badge, Toast, Loader, ConfirmModal } from "../../components/AdminUi";
import api from "../../api/axios";

const STATUSES = ["new", "contacted", "interested", "converted", "lost"];

export default function AdminLeads() {
  const [leads,   setLeads]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);
  const [modal,   setModal]   = useState(null); // { type, data }
  const [confirm, setConfirm] = useState(null);

  const [form, setForm] = useState({ full_name: "", email: "", phone: "", source: "", notes: "", status: "new" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchLeads = useCallback(() => {
    setLoading(true);
    api.get("/leads")
      .then(({ data }) => setLeads(data.leads || []))
      .catch(() => showToast("Failed to load leads.", "error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const openAdd  = () => { setForm({ full_name: "", email: "", phone: "", source: "", notes: "", status: "new" }); setModal({ type: "add" }); };
  const openEdit = (lead) => { setForm({ ...lead }); setModal({ type: "edit", data: lead }); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modal.type === "add") {
        await api.post("/leads", form);
        showToast("Lead added successfully.");
      } else {
        await api.put(`/leads/${modal.data.id}`, form);
        showToast("Lead updated.");
      }
      setModal(null);
      fetchLeads();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to save lead.", "error");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/leads/${id}/status`, { status });
      showToast(`Status updated to ${status}.`);
      fetchLeads();
    } catch {
      showToast("Failed to update status.", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/leads/${confirm.id}`);
      showToast("Lead deleted.");
      setConfirm(null);
      fetchLeads();
    } catch {
      showToast("Failed to delete lead.", "error");
    }
  };

  const cols = [
    { key: "full_name", label: "Name",   render: (r) => <strong style={{ color: "#fff" }}>{r.full_name || "—"}</strong> },
    { key: "email",     label: "Email",  render: (r) => <span style={{ color: "rgba(255,255,255,0.55)" }}>{r.email || "—"}</span> },
    { key: "phone",     label: "Phone" },
    { key: "source",    label: "Source", render: (r) => r.source || "—" },
    { key: "status",    label: "Status", render: (r) => (
        <select
          value={r.status}
          onChange={(e) => handleStatusChange(r.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          style={ls.statusSelect}
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      )
    },
    { key: "created_at", label: "Date", render: (r) => new Date(r.created_at).toLocaleDateString("en-IN") },
  ];

  return (
    <DashLayout
      title="LEADS"
      subtitle="Track and manage all gym enquiries"
      actions={
        <button onClick={openAdd} style={ls.addBtn}>+ Add Lead</button>
      }
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .field-input:focus { border-color: #FF1A1A !important; outline: none; }
        .field-input::placeholder { color: rgba(255,255,255,0.2); }
        .action-btn:hover { opacity: 0.8; }
      `}</style>

      <DataTable
        cols={cols}
        rows={leads}
        loading={loading}
        searchKeys={["full_name", "email", "phone"]}
        filterKey="status"
        filterOptions={STATUSES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
        emptyText="No leads yet. Add your first enquiry."
        actions={(row) => (
          <div style={{ display: "flex", gap: "6px" }}>
            <button className="action-btn" onClick={() => openEdit(row)} style={ls.editBtn}>Edit</button>
            <button className="action-btn" onClick={() => setConfirm({ id: row.id, name: row.full_name })} style={ls.deleteBtn}>Delete</button>
          </div>
        )}
      />

      {/* ── Add / Edit modal ── */}
      {modal && (
        <div style={ls.overlay}>
          <div style={ls.modal}>
            <div style={ls.modalHeader}>
              <h3 style={ls.modalTitle}>{modal.type === "add" ? "ADD LEAD" : "EDIT LEAD"}</h3>
              <button onClick={() => setModal(null)} style={ls.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleSave} style={ls.form}>
              <div style={ls.formGrid}>
                {[
                  { key: "full_name", label: "Full Name",    placeholder: "Rahul Kumar",        required: true },
                  { key: "email",     label: "Email",        placeholder: "rahul@example.com",  type: "email" },
                  { key: "phone",     label: "Phone",        placeholder: "+91 98765 43210" },
                  { key: "source",    label: "Source",       placeholder: "Walk-in / Instagram / Referral" },
                ].map(({ key, label, placeholder, type, required }) => (
                  <div key={key} style={ls.field}>
                    <label style={ls.label}>{label}</label>
                    <input
                      className="field-input"
                      type={type || "text"}
                      placeholder={placeholder}
                      value={form[key] || ""}
                      onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                      required={required}
                      style={ls.input}
                    />
                  </div>
                ))}
              </div>
              <div style={ls.field}>
                <label style={ls.label}>Status</label>
                <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} style={ls.select}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div style={ls.field}>
                <label style={ls.label}>Notes</label>
                <textarea
                  placeholder="Any additional notes..."
                  value={form.notes || ""}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  style={ls.textarea}
                />
              </div>
              <div style={ls.formActions}>
                <button type="button" onClick={() => setModal(null)} style={ls.cancelBtn}>Cancel</button>
                <button type="submit" style={ls.saveBtn}>{modal.type === "add" ? "Add Lead" : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirm}
        title="DELETE LEAD"
        message={`Are you sure you want to delete "${confirm?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
        confirmLabel="Delete"
        danger
      />

      <Toast toast={toast} />
    </DashLayout>
  );
}

const ls = {
  addBtn: { padding: "10px 20px", background: "linear-gradient(135deg, #FF1A1A, #cc0000)", color: "#fff", fontWeight: 700, fontSize: "13px", border: "none", borderRadius: "8px", cursor: "pointer", boxShadow: "0 4px 15px rgba(255,26,26,0.3)" },
  editBtn: { padding: "6px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "rgba(255,255,255,0.7)", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  deleteBtn: { padding: "6px 14px", background: "rgba(255,26,26,0.08)", border: "1px solid rgba(255,26,26,0.2)", borderRadius: "6px", color: "#FF1A1A", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  statusSelect: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "5px 10px", color: "#fff", fontSize: "12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },

  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9000, backdropFilter: "blur(4px)" },
  modal:   { background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "0", maxWidth: "560px", width: "90%", animation: "fadeUp 0.3s ease forwards", maxHeight: "90vh", overflow: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  modalTitle:  { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "3px", color: "#fff" },
  closeBtn:    { background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "18px", cursor: "pointer", padding: "4px" },

  form:     { padding: "1.75rem 2rem", display: "flex", flexDirection: "column", gap: "1.25rem" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  field:    { display: "flex", flexDirection: "column", gap: "7px" },
  label:    { fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" },
  input:    { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "12px 14px", color: "#fff", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "border-color 0.2s" },
  select:   { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "12px 14px", color: "#fff", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", outline: "none" },
  textarea: { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "12px 14px", color: "#fff", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif", outline: "none", resize: "vertical", transition: "border-color 0.2s" },
  formActions: { display: "flex", gap: "0.75rem", paddingTop: "0.5rem" },
  cancelBtn: { flex: "0 0 auto", padding: "12px 24px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer" },
  saveBtn: { flex: 1, padding: "12px", background: "linear-gradient(135deg, #FF1A1A, #cc0000)", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.95rem", border: "none", borderRadius: "8px", cursor: "pointer" },
};