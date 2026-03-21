import { useState, useEffect, useCallback } from "react";
import DashLayout from "../../components/DashLayout";
import { DataTable, Badge, Toast } from "../../components/AdminUi";
import api from "../../api/axios";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get("/payments"),
      api.get("/payments/summary").catch(() => ({ data: {} })),
    ])
      .then(([payRes, sumRes]) => {
        setPayments(payRes.data.payments || []);
        setSummary(sumRes.data);
      })
      .catch(() => showToast("Failed to load.", "error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fmt = (n) =>
    n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

  // ── Table columns ─────────────────────────────────────────
  const cols = [
    {
      key: "customer_name",
      label: "Customer",
      render: (r) => (
        <strong style={{ color: "#fff" }}>{r.customer_name || "—"}</strong>
      ),
    },
    {
      key: "plan_type",
      label: "Plan",
      render: (r) =>
        r.plan_type
          ? r.plan_type.charAt(0).toUpperCase() + r.plan_type.slice(1)
          : "—",
    },
    {
      key: "amount",
      label: "Amount",
      render: (r) => {
        const hasDiscount =
          r.discount_applied && Number(r.discount_applied) > 0;
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            {hasDiscount && (
              <span style={{
                fontSize: "10px",
                color: "rgba(255,255,255,0.25)",
                textDecoration: "line-through",
              }}>
                {fmt(r.original_amount)}
              </span>
            )}
            <span style={{ color: "#22C55E", fontWeight: 700 }}>
              {fmt(r.amount)}
            </span>
          </div>
        );
      },
    },
    {
      key: "discount_applied",
      label: "Discount",
      render: (r) => {
        const discount = Number(r.discount_applied);
        if (!discount) {
          return <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px" }}>—</span>;
        }
        const tierColors = {
          elite:      "#FF1A1A",
          pro:        "#FF6B00",
          solid:      "#FFB800",
          warming_up: "rgba(255,255,255,0.4)",
        };
        const tierKey = r.reward_tier || "";
        const color   = tierColors[tierKey] || "#FF6B00";
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <span style={{ color: "#22C55E", fontWeight: 700, fontSize: "13px" }}>
              -{fmt(discount)}
            </span>
            {tierKey && (
              <span style={{
                fontSize: "9px", fontWeight: 800, letterSpacing: "1px",
                color, background: color + "15",
                border: `1px solid ${color}30`,
                padding: "1px 6px", borderRadius: "100px",
                width: "fit-content",
              }}>
                {tierKey.replace("_", " ").toUpperCase()}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "payment_method",
      label: "Method",
      render: (r) => r.payment_method || "Razorpay",
    },
    {
      key: "payment_status",
      label: "Status",
      render: (r) => <Badge status={r.payment_status || r.status} />,
    },
    {
      key: "razorpay_payment_id",
      label: "Payment ID",
      render: (r) =>
        r.razorpay_payment_id ? (
          <span style={{
            fontFamily: "monospace", fontSize: "11px",
            color: "rgba(255,255,255,0.4)",
          }}>
            {r.razorpay_payment_id.slice(0, 16)}…
          </span>
        ) : "—",
    },
    {
      key: "created_at",
      label: "Date",
      render: (r) =>
        new Date(r.created_at).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
        }),
    },
  ];

  return (
    <DashLayout title="PAYMENTS" subtitle="Revenue and transaction history">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn {
          from { opacity:0; transform:translateY(-10px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {/* ── Revenue summary cards ── */}
      {summary && (
        <div style={ps.summaryGrid}>
          {/* Net revenue (after discounts) */}
          {[
            { label: "Today",          value: fmt(summary.today),          accent: "#00C2FF" },
            { label: "This Month",     value: fmt(summary.monthly),        accent: "#FF6B00" },
            { label: "Total Revenue",  value: fmt(summary.total),          accent: "#22C55E" },
            { label: "Gross (Pre-disc)",value: fmt(summary.gross_revenue), accent: "#A855F7" },
          ].map((s, i) => (
            <div key={i} style={{ ...ps.summaryCard, borderTop: `3px solid ${s.accent}` }}>
              <p style={{ ...ps.summaryValue, color: s.accent }}>{s.value}</p>
              <p style={ps.summaryLabel}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Discount summary row (only if any discounts given) ── */}
      {summary?.total_discounts && Number(summary.total_discounts) > 0 && (
        <div style={ps.discountBanner}>
          <span style={{ fontSize: "0.9rem" }}>🎯</span>
          <span style={ps.discountBannerText}>
            Total reward discounts given:{" "}
            <strong style={{ color: "#FF6B00" }}>
              {fmt(summary.total_discounts)}
            </strong>
            {" "}across{" "}
            <strong style={{ color: "#fff" }}>
              {summary.total_transactions}
            </strong>{" "}
            transactions
          </span>
        </div>
      )}

      <DataTable
        cols={cols}
        rows={payments}
        loading={loading}
        searchKeys={["customer_name", "razorpay_payment_id"]}
        filterKey="payment_status"
        filterOptions={["paid", "pending", "failed", "refunded"].map((s) => ({
          value: s,
          label: s.charAt(0).toUpperCase() + s.slice(1),
        }))}
        emptyText="No payment records yet."
      />

      <Toast toast={toast} />
    </DashLayout>
  );
}

const ps = {
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "1rem",
    marginBottom: "1.25rem",
  },
  summaryCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "1.25rem",
  },
  summaryValue: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "1.8rem",
    letterSpacing: "-0.5px",
    marginBottom: "4px",
  },
  summaryLabel: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.35)",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  discountBanner: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255,107,0,0.05)",
    border: "1px solid rgba(255,107,0,0.18)",
    borderRadius: "10px",
    padding: "12px 16px",
    marginBottom: "1.25rem",
  },
  discountBannerText: {
    fontSize: "0.875rem",
    color: "rgba(255,255,255,0.5)",
    fontFamily: "'DM Sans', sans-serif",
  },
};