import { useState, useEffect, useCallback } from "react";
import DashLayout from "../../components/DashLayout";
import { DataTable, Badge, Toast, ConfirmModal } from "../../components/AdminUi";
import api from "../../api/axios";

// ── Must match DB CHECK constraint exactly ─────────────────────
const STATUSES         = ["new", "contacted", "converted", "dropped"];
const MEMBERSHIP_TYPES = ["monthly","quarterly","half_yearly","annual","student","corporate"];

const SOURCE_CONFIG = {
  chatbot:          { label: "💬 CHATBOT",    color: "#A855F7", bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.25)"  },
  website:          { label: "🌐 WEBSITE",    color: "#00C2FF", bg: "rgba(0,194,255,0.1)",   border: "rgba(0,194,255,0.25)"   },
  "walk-in":        { label: "🚶 WALK-IN",    color: "#FFB800", bg: "rgba(255,184,0,0.1)",   border: "rgba(255,184,0,0.25)"   },
  referral:         { label: "🤝 REFERRAL",   color: "#22C55E", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)"   },
  social:           { label: "📱 SOCIAL",     color: "#FF6B00", bg: "rgba(255,107,0,0.1)",   border: "rgba(255,107,0,0.25)"   },
  phone:            { label: "📞 PHONE",      color: "#FF1A1A", bg: "rgba(255,26,26,0.1)",   border: "rgba(255,26,26,0.25)"   },
  other:            { label: "· OTHER",       color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)" },
};

export default function AdminLeads() {
  const [leads,   setLeads]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);
  const [modal,   setModal]   = useState(null);
  const [confirm, setConfirm] = useState(null);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", source: "walk-in", notes: "", status: "new",
  });

  const [convertForm, setConvertForm] = useState({
    membership_type: "monthly",
    start_date:      new Date().toISOString().split("T")[0],
    end_date:        "",
    amount_paid:     "",
    payment_status:  "pending",
    admission_notes: "",
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchLeads = useCallback(() => {
    setLoading(true);
    api.get("/leads")
      .then(({ data }) => setLeads(data.leads || []))
      .catch(() => showToast("Failed to load leads.", "error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const openAdd     = () => { setForm({ name: "", email: "", phone: "", source: "walk-in", notes: "", status: "new" }); setModal({ type: "add" }); };
  const openEdit    = (lead) => { setForm({ ...lead }); setModal({ type: "edit", data: lead }); };
  const openConvert = (lead) => {
    setConvertForm({ membership_type: "monthly", start_date: new Date().toISOString().split("T")[0], end_date: "", amount_paid: "", payment_status: "pending", admission_notes: "" });
    setModal({ type: "convert", data: lead });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modal.type === "add") { await api.post("/leads", form); showToast("Lead added."); }
      else { await api.put(`/leads/${modal.data.id}`, form); showToast("Lead updated."); }
      setModal(null); fetchLeads();
    } catch (err) { showToast(err.response?.data?.error || "Failed to save.", "error"); }
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/leads/${modal.data.id}/convert`, convertForm);
      showToast(`🎉 ${modal.data.name} is now a member!`);
      setModal(null); fetchLeads();
    } catch (err) { showToast(err.response?.data?.error || "Conversion failed.", "error"); }
  };

  const handleStatusChange = async (id, status) => {
    try { await api.patch(`/leads/${id}/status`, { status }); fetchLeads(); }
    catch { showToast("Failed to update status.", "error"); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/leads/${confirm.id}`); showToast("Lead deleted."); setConfirm(null); fetchLeads(); }
    catch { showToast("Failed to delete.", "error"); }
  };

  const calcEndDate = (type, start) => {
    if (!start) return "";
    const d   = new Date(start);
    const map = { monthly: 1, quarterly: 3, half_yearly: 6, annual: 12, student: 1, corporate: 12 };
    d.setMonth(d.getMonth() + (map[type] || 1));
    return d.toISOString().split("T")[0];
  };

  const cols = [
    {
      key: "name", label: "Lead",
      render: (r) => {
        const isRegistered = !!r.user_id;
        const src = SOURCE_CONFIG[r.source] || SOURCE_CONFIG.other;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
              background: isRegistered ? "rgba(34,197,94,0.15)" : src.bg,
              color:      isRegistered ? "#22C55E"              : src.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: 800,
              border: `1px solid ${isRegistered ? "rgba(34,197,94,0.3)" : src.border}`,
            }}>
              {r.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.875rem" }}>{r.name || "—"}</p>
                {/* ── REGISTERED USER badge ── */}
                {isRegistered && (
                  <span style={{
                    fontSize: "9px", fontWeight: 800, letterSpacing: "1px",
                    padding: "2px 7px", borderRadius: "100px",
                    background: "rgba(34,197,94,0.1)",
                    border: "1px solid rgba(34,197,94,0.3)",
                    color: "#22C55E",
                  }}>HAS ACCOUNT</span>
                )}
              </div>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px" }}>{r.email}</p>
            </div>
          </div>
        );
      }
    },
    {
      key: "phone", label: "Phone",
      render: (r) => r.phone
        ? <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>{r.phone}</span>
        : <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px" }}>—</span>
    },
    {
      key: "source", label: "Source",
      render: (r) => {
        const cfg = SOURCE_CONFIG[r.source] || SOURCE_CONFIG.other;
        return (
          <span style={{
            fontSize: "10px", fontWeight: 700, padding: "3px 9px", borderRadius: "100px",
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
            letterSpacing: "0.5px", whiteSpace: "nowrap",
          }}>{cfg.label}</span>
        );
      }
    },
    {
      key: "notes", label: "Notes",
      render: (r) => r.notes
        ? <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>
            "{r.notes.slice(0,50)}{r.notes.length > 50 ? "…" : ""}"
          </span>
        : <span style={{ color: "rgba(255,255,255,0.15)" }}>—</span>
    },
    {
      key: "status", label: "Status",
      render: (r) => r.status === "converted"
        ? <Badge status="converted" />
        : (
          <select value={r.status}
            onChange={(e) => handleStatusChange(r.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            style={ls.statusSelect}>
            {STATUSES.filter(s => s !== "converted").map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        )
    },
    {
      key: "created_at", label: "Date",
      render: (r) => new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    },
  ];

  return (
    <DashLayout
      title="LEADS"
      subtitle="Track enquiries and convert them to members"
      actions={<button onClick={openAdd} style={ls.addBtn}>+ Add Lead</button>}
    >
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
        .field-input:focus  { border-color:#FF1A1A!important; outline:none; }
        .field-input::placeholder { color:rgba(255,255,255,0.2); }
        .action-btn:hover   { opacity:0.8; }
        .convert-btn:hover  { background:rgba(34,197,94,0.2)!important; }
      `}</style>

      <DataTable
        cols={cols} rows={leads} loading={loading}
        searchKeys={["name","email","phone"]}
        filterKey="status"
        filterOptions={STATUSES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
        emptyText="No leads yet."
        actions={(row) => (
          <div style={{ display: "flex", gap: "6px" }}>
            {row.status !== "converted" && (
              <button className="convert-btn" onClick={() => openConvert(row)} style={ls.convertBtn}>
                ✓ Convert
              </button>
            )}
            <button className="action-btn" onClick={() => openEdit(row)} style={ls.editBtn}>Edit</button>
            <button className="action-btn" onClick={() => setConfirm({ id: row.id, name: row.name })} style={ls.deleteBtn}>Delete</button>
          </div>
        )}
      />

      {/* ── Add / Edit modal ── */}
      {modal && (modal.type === "add" || modal.type === "edit") && (
        <div style={ls.overlay}>
          <div style={ls.modal}>
            <div style={ls.modalHeader}>
              <h3 style={ls.modalTitle}>{modal.type === "add" ? "ADD LEAD" : "EDIT LEAD"}</h3>
              <button onClick={() => setModal(null)} style={ls.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleSave} style={ls.form}>
              <div style={ls.formGrid}>
                {[
                  { key: "name",  label: "Full Name", placeholder: "Rahul Kumar",        required: true  },
                  { key: "email", label: "Email",     placeholder: "rahul@example.com",  type: "email"   },
                  { key: "phone", label: "Phone",     placeholder: "+91 98765 43210"                      },
                ].map(({ key, label, placeholder, type, required }) => (
                  <div key={key} style={ls.field}>
                    <label style={ls.label}>{label}</label>
                    <input className="field-input" type={type || "text"} placeholder={placeholder}
                      value={form[key] || ""} required={required} style={ls.input}
                      onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} />
                  </div>
                ))}
                <div style={ls.field}>
                  <label style={ls.label}>Source</label>
                  <select value={form.source} onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))} style={ls.select}>
                    {["walk-in","website","referral","social","phone","other"].map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={ls.field}>
                <label style={ls.label}>Status</label>
                <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} style={ls.select}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div style={ls.field}>
                <label style={ls.label}>Notes</label>
                <textarea className="field-input" placeholder="Additional notes..." value={form.notes || ""} rows={3} style={ls.textarea}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
              </div>
              <div style={ls.formActions}>
                <button type="button" onClick={() => setModal(null)} style={ls.cancelBtn}>Cancel</button>
                <button type="submit" style={ls.saveBtn}>{modal.type === "add" ? "Add Lead" : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Convert to Member modal ── */}
      {modal?.type === "convert" && (
        <div style={ls.overlay}>
          <div style={{ ...ls.modal, maxWidth: "560px" }}>
            <div style={ls.modalHeader}>
              <div>
                <h3 style={ls.modalTitle}>CONVERT TO MEMBER</h3>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", marginTop: "4px" }}>
                  {modal.data.name} · {modal.data.email}
                  {modal.data.user_id && (
                    <span style={{ marginLeft: "8px", fontSize: "10px", fontWeight: 800, color: "#22C55E", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", padding: "2px 8px", borderRadius: "100px" }}>
                      HAS ACCOUNT
                    </span>
                  )}
                </p>
              </div>
              <button onClick={() => setModal(null)} style={ls.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleConvert} style={ls.form}>
              {/* Plan selector */}
              <div style={ls.field}>
                <label style={ls.label}>Membership Plan *</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.5rem" }}>
                  {MEMBERSHIP_TYPES.map((t) => (
                    <button key={t} type="button"
                      onClick={() => setConvertForm((p) => ({ ...p, membership_type: t, end_date: calcEndDate(t, p.start_date) }))}
                      style={{
                        padding: "10px 6px", borderRadius: "8px", fontSize: "12px", fontWeight: 700,
                        cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
                        border: convertForm.membership_type === t ? "2px solid #22C55E" : "1px solid rgba(255,255,255,0.08)",
                        background: convertForm.membership_type === t ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.02)",
                        color: convertForm.membership_type === t ? "#22C55E" : "rgba(255,255,255,0.5)",
                      }}>
                      {t.replace(/_/g," ").replace(/\b\w/g, c => c.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div style={ls.field}>
                  <label style={ls.label}>Start Date *</label>
                  <input type="date" className="field-input" value={convertForm.start_date} style={ls.input}
                    onChange={(e) => setConvertForm((p) => ({ ...p, start_date: e.target.value, end_date: calcEndDate(p.membership_type, e.target.value) }))} />
                </div>
                <div style={ls.field}>
                  <label style={ls.label}>End Date</label>
                  <input type="date" className="field-input" value={convertForm.end_date} style={ls.input}
                    onChange={(e) => setConvertForm((p) => ({ ...p, end_date: e.target.value }))} />
                </div>
              </div>

              {/* Payment */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div style={ls.field}>
                  <label style={ls.label}>Amount Paid (₹)</label>
                  <input type="number" className="field-input" placeholder="0" value={convertForm.amount_paid} style={ls.input}
                    onChange={(e) => setConvertForm((p) => ({ ...p, amount_paid: e.target.value }))} />
                </div>
                <div style={ls.field}>
                  <label style={ls.label}>Payment Status</label>
                  <select className="field-input" value={convertForm.payment_status} style={{ ...ls.input, cursor: "pointer" }}
                    onChange={(e) => setConvertForm((p) => ({ ...p, payment_status: e.target.value }))}>
                    {["pending","paid","partial"].map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={ls.field}>
                <label style={ls.label}>Admission Notes</label>
                <textarea className="field-input" placeholder="e.g. Walk-in converted after trial. Interested in yoga."
                  value={convertForm.admission_notes} rows={2} style={ls.textarea}
                  onChange={(e) => setConvertForm((p) => ({ ...p, admission_notes: e.target.value }))} />
              </div>

              <div style={{
                background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)",
                borderRadius: "10px", padding: "0.875rem 1rem",
                fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6,
              }}>
                {modal.data.user_id
                  ? "✓ This person already has an account. Membership will be added directly to their profile."
                  : "ℹ️ No account found. One will be created automatically using their email. They can reset their password on first login."}
              </div>

              <div style={ls.formActions}>
                <button type="button" onClick={() => setModal(null)} style={ls.cancelBtn}>Cancel</button>
                <button type="submit" style={{ ...ls.saveBtn, background: "linear-gradient(135deg,#22C55E,#16a34a)", boxShadow: "0 4px 15px rgba(34,197,94,0.3)" }}>
                  ✓ Convert to Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirm}
        title="DELETE LEAD"
        message={`Delete "${confirm?.name}"? This cannot be undone.`}
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
  addBtn:       { padding: "10px 20px", background: "linear-gradient(135deg,#FF1A1A,#cc0000)", color: "#fff", fontWeight: 700, fontSize: "13px", border: "none", borderRadius: "8px", cursor: "pointer", boxShadow: "0 4px 15px rgba(255,26,26,0.3)" },
  convertBtn:   { padding: "6px 14px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "6px", color: "#22C55E", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" },
  editBtn:      { padding: "6px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "rgba(255,255,255,0.7)", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  deleteBtn:    { padding: "6px 14px", background: "rgba(255,26,26,0.08)", border: "1px solid rgba(255,26,26,0.2)", borderRadius: "6px", color: "#FF1A1A", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  statusSelect: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "5px 10px", color: "#fff", fontSize: "12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  overlay:      { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9000, backdropFilter: "blur(4px)" },
  modal:        { background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "0", maxWidth: "580px", width: "90%", animation: "fadeUp 0.3s ease forwards", maxHeight: "90vh", overflowY: "auto" },
  modalHeader:  { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "1.5rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  modalTitle:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "3px", color: "#fff" },
  closeBtn:     { background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "18px", cursor: "pointer", padding: "4px" },
  form:         { padding: "1.75rem 2rem", display: "flex", flexDirection: "column", gap: "1.25rem" },
  formGrid:     { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  field:        { display: "flex", flexDirection: "column", gap: "7px" },
  label:        { fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" },
  input:        { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "11px 14px", color: "#fff", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "border-color 0.2s" },
  select:       { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "11px 14px", color: "#fff", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", outline: "none" },
  textarea:     { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "12px 14px", color: "#fff", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif", outline: "none", resize: "vertical" },
  formActions:  { display: "flex", gap: "0.75rem", paddingTop: "0.5rem" },
  cancelBtn:    { flex: "0 0 auto", padding: "12px 24px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer" },
  saveBtn:      { flex: 1, padding: "12px", background: "linear-gradient(135deg,#FF1A1A,#cc0000)", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.95rem", border: "none", borderRadius: "8px", cursor: "pointer" },
};