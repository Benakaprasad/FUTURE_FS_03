import { useState, useEffect, useCallback } from "react";
import DashLayout from "../../components/DashLayout";
import { DataTable, Badge, Toast } from "../../components/AdminUI";
import api from "../../api/axios";

export default function TrainerMembers() {
  const [members,  setMembers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(null);
  const [selected, setSelected] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetch = useCallback(() => {
    setLoading(true);
    api.get("/trainers/me/members")
      .then(({ data }) => setMembers(data.members || []))
      .catch(() => showToast("Failed to load.", "error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const cols = [
    { key: "customer_name", label: "Member", render: (r) => (
        <button onClick={() => setSelected(r)} style={{ background: "none", border: "none", color: "#00C2FF", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem", padding: 0, fontFamily: "'DM Sans', sans-serif" }}>
          {r.customer_name || "—"}
        </button>
      )
    },
    { key: "phone",             label: "Phone",  render: (r) => r.phone || <span style={{ color: "rgba(255,255,255,0.25)" }}>—</span> },
    { key: "plan_type",         label: "Plan",   render: (r) => <Badge status={r.plan_type} /> },
    { key: "membership_status", label: "Status", render: (r) => <Badge status={r.membership_status} /> },
    { key: "membership_end_date", label: "Expires", render: (r) => {
        if (!r.membership_end_date) return "—";
        const days = Math.ceil((new Date(r.membership_end_date) - new Date()) / 86400000);
        return (
          <span style={{ color: days <= 7 && days >= 0 ? "#FFB800" : "rgba(255,255,255,0.6)" }}>
            {new Date(r.membership_end_date).toLocaleDateString("en-IN")}
            {days >= 0 && days <= 7 && <span style={{ marginLeft: "6px", fontSize: "10px", fontWeight: 700, color: "#FFB800" }}>({days}d)</span>}
          </span>
        );
      }
    },
  ];

  return (
    <DashLayout title="MY MEMBERS" subtitle="All members assigned to you">
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

        @media (max-width: 768px) {
          .tm-table-wrap {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
          }
          .tm-table-wrap table {
            min-width: 520px;
          }
          .tm-panel {
            width: 95% !important;
            max-width: 95% !important;
          }
          .tm-panel-header {
            padding: 1.25rem !important;
          }
          .tm-panel-body {
            padding: 1.25rem !important;
          }
        }
      `}</style>

      <div className="tm-table-wrap">
        <DataTable
          cols={cols} rows={members} loading={loading}
          searchKeys={["customer_name", "phone"]}
          filterKey="membership_status"
          filterOptions={["active", "expired", "frozen"].map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
          emptyText="No members assigned yet."
        />
      </div>

      {selected && (
        <div style={tm.overlay}>
          <div className="tm-panel" style={tm.panel}>
            <div className="tm-panel-header" style={tm.panelHeader}>
              <div>
                <div style={tm.panelAvatar}>{selected.customer_name?.[0]?.toUpperCase() || "M"}</div>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={tm.panelName}>{selected.customer_name}</h3>
                <p style={tm.panelEmail}>{selected.email || "—"}</p>
                <p style={tm.panelPhone}>{selected.phone || "—"}</p>
              </div>
              <button onClick={() => setSelected(null)} style={tm.closeBtn}>x</button>
            </div>
            <div className="tm-panel-body" style={tm.panelBody}>
              {[
                { label: "Plan",    value: selected.plan_type?.toUpperCase() },
                { label: "Status",  value: selected.membership_status?.toUpperCase() },
                { label: "Started", value: selected.membership_start_date ? new Date(selected.membership_start_date).toLocaleDateString("en-IN") : "—" },
                { label: "Expires", value: selected.membership_end_date   ? new Date(selected.membership_end_date).toLocaleDateString("en-IN")   : "—" },
              ].map((item, i) => (
                <div key={i} style={tm.panelRow}>
                  <span style={tm.panelRowLabel}>{item.label}</span>
                  <span style={tm.panelRowValue}>{item.value || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </DashLayout>
  );
}

const tm = {
  overlay:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9000, backdropFilter: "blur(4px)" },
  panel:       { background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", maxWidth: "440px", width: "90%", overflow: "hidden", animation: "fadeUp 0.3s ease forwards" },
  panelHeader: { display: "flex", alignItems: "center", gap: "1rem", padding: "1.5rem 1.75rem", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,194,255,0.04)" },
  panelAvatar: { width: "52px", height: "52px", borderRadius: "50%", background: "rgba(0,194,255,0.15)", border: "2px solid rgba(0,194,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "#00C2FF", flexShrink: 0 },
  panelName:   { fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "4px" },
  panelEmail:  { fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "2px" },
  panelPhone:  { fontSize: "12px", color: "rgba(255,255,255,0.4)" },
  closeBtn:    { background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "18px", cursor: "pointer", padding: "4px", marginLeft: "auto", alignSelf: "flex-start" },
  panelBody:   { padding: "1.5rem 1.75rem", display: "flex", flexDirection: "column", gap: "0" },
  panelRow:    { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" },
  panelRowLabel: { fontSize: "12px", color: "rgba(255,255,255,0.35)", fontWeight: 600 },
  panelRowValue: { fontSize: "0.875rem", color: "#fff", fontWeight: 600 },
};