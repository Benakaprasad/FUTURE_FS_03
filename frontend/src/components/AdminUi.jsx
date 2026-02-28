import { useState } from "react";

// ── Badge ──────────────────────────────────────────────────────────────────────
export function Badge({ status, colorMap }) {
  const defaults = {
    active:    { color: "#22C55E", bg: "#22C55E15", border: "#22C55E30" },
    pending:   { color: "#FFB800", bg: "#FFB80015", border: "#FFB80030" },
    expired:   { color: "#FF1A1A", bg: "#FF1A1A15", border: "#FF1A1A30" },
    approved:  { color: "#22C55E", bg: "#22C55E15", border: "#22C55E30" },
    rejected:  { color: "#FF1A1A", bg: "#FF1A1A15", border: "#FF1A1A30" },
    new:       { color: "#00C2FF", bg: "#00C2FF15", border: "#00C2FF30" },
    contacted: { color: "#A855F7", bg: "#A855F715", border: "#A855F730" },
    converted: { color: "#22C55E", bg: "#22C55E15", border: "#22C55E30" },
    inactive:  { color: "rgba(255,255,255,0.35)", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)" },
    frozen:    { color: "#00C2FF", bg: "#00C2FF15", border: "#00C2FF30" },
    admin:     { color: "#FF1A1A", bg: "#FF1A1A15", border: "#FF1A1A30" },
    manager:   { color: "#FF6B00", bg: "#FF6B0015", border: "#FF6B0030" },
    staff:     { color: "#FFB800", bg: "#FFB80015", border: "#FFB80030" },
    trainer:   { color: "#00C2FF", bg: "#00C2FF15", border: "#00C2FF30" },
    customer:  { color: "#22C55E", bg: "#22C55E15", border: "#22C55E30" },
  };
  const map = { ...defaults, ...(colorMap || {}) };
  const c = map[status?.toLowerCase()] || { color: "#fff", bg: "#ffffff08", border: "#ffffff15" };
  return (
    <span style={{
      fontSize: "10px", fontWeight: 800, letterSpacing: "1px",
      padding: "3px 9px", borderRadius: "100px",
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      whiteSpace: "nowrap",
    }}>
      {status?.toUpperCase()}
    </span>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────
export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position: "fixed", bottom: "2rem", right: "2rem",
      padding: "14px 22px", borderRadius: "10px",
      color: "#fff", fontWeight: 700, fontSize: "0.875rem",
      background: toast.type === "error" ? "rgba(255,26,26,0.95)" : "rgba(34,197,94,0.95)",
      boxShadow: "0 8px 30px rgba(0,0,0,0.4)", zIndex: 9999,
      animation: "slideIn 0.3s ease forwards",
    }}>
      {toast.type === "error" ? "✕" : "✓"} {toast.msg}
    </div>
  );
}

// ── Loader ─────────────────────────────────────────────────────────────────────
export function Loader({ color = "#FF1A1A" }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
      <div style={{
        width: "36px", height: "36px",
        border: `3px solid ${color}30`, borderTop: `3px solid ${color}`,
        borderRadius: "50%", animation: "spin 0.8s linear infinite",
      }} />
    </div>
  );
}

// ── Confirm modal ──────────────────────────────────────────────────────────────
export function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", danger = false }) {
  if (!open) return null;
  return (
    <div style={mt.overlay}>
      <div style={mt.modal}>
        <h3 style={mt.modalTitle}>{title}</h3>
        <p style={mt.modalMessage}>{message}</p>
        <div style={mt.modalActions}>
          <button onClick={onCancel} style={mt.cancelBtn}>Cancel</button>
          <button onClick={onConfirm} style={{
            ...mt.confirmBtn,
            background: danger ? "linear-gradient(135deg, #FF1A1A, #cc0000)" : "linear-gradient(135deg, #22C55E, #16a34a)",
          }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DataTable ──────────────────────────────────────────────────────────────────
export function DataTable({
  cols,         // [{ key, label, render?, width? }]
  rows,         // array of objects
  loading,
  searchKeys,   // keys to search in
  filterKey,    // key to filter by
  filterOptions,// [{ value, label }]
  actions,      // (row) => JSX
  emptyText,
  pageSize = 15,
}) {
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all");
  const [page,    setPage]    = useState(1);

  const filtered = rows.filter((row) => {
    const matchSearch = !search || (searchKeys || []).some((k) =>
      String(row[k] || "").toLowerCase().includes(search.toLowerCase())
    );
    const matchFilter = filter === "all" || row[filterKey] === filter;
    return matchSearch && matchFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        .dt-row:hover td { background: rgba(255,255,255,0.02) !important; }
        .dt-search:focus { border-color: #FF1A1A !important; outline: none; }
        .dt-search::placeholder { color: rgba(255,255,255,0.2); }
        .dt-filter { cursor: pointer; transition: all 0.2s; }
        .dt-filter:hover { border-color: rgba(255,26,26,0.4) !important; }
      `}</style>

      {/* Controls */}
      <div style={dt.controls}>
        {(searchKeys?.length > 0) && (
          <div style={dt.searchWrap}>
            <span style={dt.searchIcon}>🔍</span>
            <input
              className="dt-search"
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={dt.searchInput}
            />
          </div>
        )}
        {filterOptions && (
          <select
            className="dt-filter"
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            style={dt.filterSelect}
          >
            <option value="all">All</option>
            {filterOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        )}
        <span style={dt.countLabel}>{filtered.length} results</span>
      </div>

      {/* Table */}
      {loading ? (
        <Loader />
      ) : paginated.length === 0 ? (
        <div style={dt.empty}>
          <p style={dt.emptyTitle}>{emptyText || "No records found"}</p>
          {search && <p style={dt.emptySub}>Try adjusting your search or filter.</p>}
        </div>
      ) : (
        <div style={dt.tableWrap}>
          <table style={dt.table}>
            <thead>
              <tr>
                {cols.map((c) => (
                  <th key={c.key} style={{ ...dt.th, width: c.width }}>{c.label}</th>
                ))}
                {actions && <th style={dt.th}>ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {paginated.map((row, i) => (
                <tr key={row.id || i} className="dt-row">
                  {cols.map((c) => (
                    <td key={c.key} style={dt.td}>
                      {c.render ? c.render(row) : (row[c.key] ?? "—")}
                    </td>
                  ))}
                  {actions && (
                    <td style={{ ...dt.td, whiteSpace: "nowrap" }}>
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={dt.pagination}>
          <button onClick={() => setPage(1)}      disabled={page === 1}          style={dt.pageBtn}>«</button>
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}       style={dt.pageBtn}>‹</button>
          <span style={dt.pageInfo}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} style={dt.pageBtn}>›</button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages} style={dt.pageBtn}>»</button>
        </div>
      )}
    </div>
  );
}

const dt = {
  controls:    { display: "flex", gap: "0.75rem", marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" },
  searchWrap:  { position: "relative", flex: "1", minWidth: "200px", maxWidth: "340px" },
  searchIcon:  { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", pointerEvents: "none" },
  searchInput: { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "10px 12px 10px 36px", color: "#fff", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s" },
  filterSelect:{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "10px 14px", color: "#fff", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" },
  countLabel:  { fontSize: "12px", color: "rgba(255,255,255,0.3)", marginLeft: "auto", fontWeight: 600 },
  tableWrap:   { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden" },
  table:       { width: "100%", borderCollapse: "collapse" },
  th:          { padding: "12px 16px", fontSize: "10px", fontWeight: 800, letterSpacing: "1.5px", color: "rgba(255,255,255,0.3)", textAlign: "left", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.05)", whiteSpace: "nowrap", background: "rgba(255,255,255,0.01)" },
  td:          { padding: "14px 16px", fontSize: "0.875rem", color: "rgba(255,255,255,0.75)", borderBottom: "1px solid rgba(255,255,255,0.03)", verticalAlign: "middle" },
  empty:       { padding: "4rem", textAlign: "center", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px" },
  emptyTitle:  { color: "rgba(255,255,255,0.3)", fontWeight: 600, marginBottom: "4px" },
  emptySub:    { fontSize: "12px", color: "rgba(255,255,255,0.2)" },
  pagination:  { display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "1.25rem" },
  pageBtn:     { padding: "8px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", ["&:disabled"]: { opacity: 0.3, cursor: "not-allowed" } },
  pageInfo:    { fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: "0 0.5rem" },
};

const mt = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9000, backdropFilter: "blur(4px)" },
  modal:   { background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "2rem", maxWidth: "420px", width: "90%" },
  modalTitle:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "2px", color: "#fff", marginBottom: "0.75rem" },
  modalMessage: { fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: "2rem" },
  modalActions: { display: "flex", gap: "0.75rem" },
  cancelBtn: { flex: 1, padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" },
  confirmBtn: { flex: 1, padding: "12px", border: "none", borderRadius: "8px", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" },
};