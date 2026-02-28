import { useState, useEffect, useCallback } from "react";
import DashLayout from "../../components/DashLayout";
import { DataTable, Badge, Toast } from "../../components/AdminUI";
import api from "../../api/axios";

export default function AdminPayments() {
  const [payments,  setPayments]  = useState([]);
  const [summary,   setSummary]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetch = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get("/payments"),
      api.get("/payments/summary").catch(() => ({ data: {} })),
    ]).then(([payRes, sumRes]) => {
      setPayments(payRes.data.payments || []);
      setSummary(sumRes.data);
    }).catch(() => showToast("Failed to load.", "error")).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const fmt = (n) => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

  const cols = [
    { key: "customer_name",   label: "Customer",    render: (r) => <strong style={{ color: "#fff" }}>{r.customer_name || "—"}</strong> },
    { key: "plan_type",       label: "Plan",        render: (r) => r.plan_type ? r.plan_type.charAt(0).toUpperCase() + r.plan_type.slice(1) : "—" },
    { key: "amount",          label: "Amount",      render: (r) => <span style={{ color: "#22C55E", fontWeight: 700 }}>{fmt(r.amount)}</span> },
    { key: "payment_method",  label: "Method",      render: (r) => r.payment_method || "Razorpay" },
    { key: "payment_status",  label: "Status",      render: (r) => <Badge status={r.payment_status || r.status} /> },
    { key: "razorpay_payment_id", label: "Payment ID", render: (r) => r.razorpay_payment_id ? <span style={{ fontFamily: "monospace", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{r.razorpay_payment_id.slice(0, 16)}…</span> : "—" },
    { key: "created_at",      label: "Date",        render: (r) => new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
  ];

  return (
    <DashLayout title="PAYMENTS" subtitle="Revenue and transaction history">
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes slideIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* ── Revenue summary cards ── */}
      {summary && (
        <div style={ps.summaryGrid}>
          {[
            { label: "Today",       value: fmt(summary.today),     accent: "#00C2FF" },
            { label: "This Week",   value: fmt(summary.weekly),    accent: "#A855F7" },
            { label: "This Month",  value: fmt(summary.monthly),   accent: "#FF6B00" },
            { label: "Total",       value: fmt(summary.total),     accent: "#22C55E" },
          ].map((s, i) => (
            <div key={i} style={{ ...ps.summaryCard, borderTop: `3px solid ${s.accent}` }}>
              <p style={{ ...ps.summaryValue, color: s.accent }}>{s.value}</p>
              <p style={ps.summaryLabel}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <DataTable
        cols={cols} rows={payments} loading={loading}
        searchKeys={["customer_name", "razorpay_payment_id"]}
        filterKey="payment_status"
        filterOptions={["paid","pending","failed","refunded"].map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
        emptyText="No payment records yet."
      />

      <Toast toast={toast} />
    </DashLayout>
  );
}

const ps = {
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" },
  summaryCard: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.25rem" },
  summaryValue:{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", letterSpacing: "-0.5px", marginBottom: "4px" },
  summaryLabel:{ fontSize: "12px", color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" },
};