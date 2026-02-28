import { useState, useEffect, useCallback } from "react";
import DashLayout from "../../components/DashLayout";
import { DataTable, Badge, Toast, ConfirmModal } from "../../components/AdminUI";
import api from "../../api/axios";

export default function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);
  const [confirm, setConfirm] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchMembers = useCallback(() => {
    setLoading(true);
    api.get("/members").then(({ data }) => setMembers(data.members || [])).catch(() => showToast("Failed to load.", "error")).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/members/${id}/status`, { status });
      showToast(`Status updated to ${status}.`);
      fetchMembers();
    } catch { showToast("Failed to update status.", "error"); }
  };

  const cols = [
    { key: "customer_name", label: "Member",  render: (r) => <strong style={{ color: "#fff" }}>{r.customer_name || "—"}</strong> },
    { key: "plan_type",     label: "Plan",     render: (r) => <Badge status={r.plan_type} /> },
    { key: "start_date",    label: "Started",  render: (r) => new Date(r.start_date).toLocaleDateString("en-IN") },
    { key: "end_date",      label: "Expires",  render: (r) => {
        const days = Math.ceil((new Date(r.end_date) - new Date()) / 86400000);
        return (
          <span style={{ color: days < 7 ? "#FFB800" : "rgba(255,255,255,0.6)" }}>
            {new Date(r.end_date).toLocaleDateString("en-IN")}
            {days >= 0 && days < 7 && <span style={{ marginLeft: "6px", fontSize: "10px", color: "#FFB800", fontWeight: 700 }}>({days}d left)</span>}
          </span>
        );
      }
    },
    { key: "trainer_name",  label: "Trainer",  render: (r) => r.trainer_name || <span style={{ color: "rgba(255,255,255,0.25)" }}>Unassigned</span> },
    { key: "status",        label: "Status",   render: (r) => (
        <select value={r.status} onChange={(e) => handleStatusChange(r.id, e.target.value)} style={ms.statusSelect}>
          {["active","expired","frozen","cancelled"].map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      )
    },
  ];

  return (
    <DashLayout title="MEMBERS" subtitle="All gym memberships">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <DataTable cols={cols} rows={members} loading={loading} searchKeys={["customer_name", "plan_type", "trainer_name"]} filterKey="status" filterOptions={["active","expired","frozen","cancelled"].map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} emptyText="No members yet." />
      <Toast toast={toast} />
    </DashLayout>
  );
}

const ms = { statusSelect: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "5px 10px", color: "#fff", fontSize: "12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" } };