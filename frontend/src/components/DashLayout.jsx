import { useState } from "react";
import Sidebar from "./Sidebar";

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
      `}</style>

      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main style={{
        ...s.main,
        marginLeft: collapsed ? "72px" : "240px",
        transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}>
        {/* Top bar */}
        <div style={s.topBar}>
          <div>
            <h1 style={s.pageTitle}>{title}</h1>
            {subtitle && <p style={s.pageSubtitle}>{subtitle}</p>}
          </div>
          {actions && <div style={s.actions}>{actions}</div>}
        </div>

        {/* Content */}
        <div style={s.content}>
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