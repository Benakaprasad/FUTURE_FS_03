import { useState } from "react";
import Sidebar from "./Sidebar";
// RESPONSIVE: mobile styles added via className + CSS in <style> block. Zero logic changes.

export default function DashLayout({ children, title, subtitle, actions }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }

        /* ── Responsive: mobile ── */
        @media (max-width: 768px) {
          .dash-main {
            margin-left: 0 !important;
            padding-bottom: 80px; /* space for bottom nav */
          }
          .dash-topbar {
            padding: 16px 16px !important;
          }
          .dash-content {
            padding: 16px !important;
          }
          .dash-title {
            font-size: 1.4rem !important;
          }
          .dash-subtitle {
            font-size: 0.75rem !important;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 220px;
          }
          .dash-actions {
            width: 100%;
            justify-content: flex-start !important;
          }
        }

        /* ── Responsive: tablet ── */
        @media (min-width: 769px) and (max-width: 1024px) {
          .dash-main {
            margin-left: 72px !important;
          }
          .dash-content {
            padding: 20px !important;
          }
        }
      `}</style>

      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main
        className="dash-main"
        style={{
          ...s.main,
          marginLeft: collapsed ? "72px" : "240px",
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Top bar */}
        <div className="dash-topbar" style={s.topBar}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 className="dash-title" style={s.pageTitle}>{title}</h1>
            {subtitle && <p className="dash-subtitle" style={s.pageSubtitle}>{subtitle}</p>}
          </div>
          {actions && <div className="dash-actions" style={s.actions}>{actions}</div>}
        </div>

        {/* Content */}
        <div className="dash-content" style={s.content}>
          {children}
        </div>
      </main>
    </div>
  );
}

const s = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    minHeight: "100vh",
    background: "#000",
    color: "#F5F5F0",
  },
  main: {
    minHeight: "100vh",
    display: "flex", flexDirection: "column",
  },
  topBar: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    padding: "24px 32px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    background: "#050505",
    position: "sticky", top: 0, zIndex: 50,
    gap: "1rem", flexWrap: "wrap",
  },
  pageTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "1.8rem", letterSpacing: "2px",
    color: "#fff", lineHeight: 1,
  },
  pageSubtitle: {
    fontSize: "0.85rem",
    color: "rgba(255,255,255,0.35)",
    marginTop: "4px",
  },
  actions: { display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" },
  content: { flex: 1, padding: "32px" },
};