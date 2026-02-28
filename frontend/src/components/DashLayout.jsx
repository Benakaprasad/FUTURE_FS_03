import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useNotifications } from "../context/NotificationContext";

// ── Notification Bell + Dropdown ──────────────────────────────
function NotificationBell() {
  const { notifications, unreadCount, silenced, markRead, markAllRead, toggleSilence } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const typeIcon = (type) => ({
    trainer_registration:  "💪",
    customer_registration: "🏋️",
    membership_request:    "📋",
    payment:               "💳",
    expiry:                "⚠️",
    system:                "🔔",
  }[type] || "🔔");

  const timeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date)) / 60000);
    if (mins < 1)  return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell button */}
      <button onClick={() => setOpen(o => !o)} style={{
        position: "relative", width: "40px", height: "40px",
        background: open ? "rgba(255,26,26,0.1)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${open ? "rgba(255,26,26,0.3)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: "10px", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.1rem", transition: "all 0.2s",
      }}>
        {silenced ? "🔕" : "🔔"}
        {!silenced && unreadCount > 0 && (
          <span style={{
            position: "absolute", top: "-4px", right: "-4px",
            minWidth: "18px", height: "18px", background: "#FF1A1A",
            borderRadius: "100px", fontSize: "10px", fontWeight: 800, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 4px", boxShadow: "0 0 0 2px #000",
            animation: "notifPulse 2s ease infinite",
          }}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="notif-dropdown" style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0,
          width: "380px", maxHeight: "520px",
          background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
          zIndex: 9999, display: "flex", flexDirection: "column",
          animation: "dropDown 0.2s ease forwards", overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "2px", color: "#fff" }}>
                NOTIFICATIONS
              </span>
              {unreadCount > 0 && (
                <span style={{
                  background: "rgba(255,26,26,0.15)", border: "1px solid rgba(255,26,26,0.3)",
                  borderRadius: "100px", padding: "2px 8px",
                  fontSize: "10px", fontWeight: 800, color: "#FF1A1A",
                }}>
                  {unreadCount} NEW
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button onClick={toggleSilence} style={{
                background: silenced ? "rgba(255,26,26,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${silenced ? "rgba(255,26,26,0.3)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: "8px", padding: "5px 10px",
                color: silenced ? "#FF1A1A" : "rgba(255,255,255,0.4)",
                fontSize: "11px", fontWeight: 700, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {silenced ? "🔕 Muted" : "🔔 Mute"}
              </button>
              {unreadCount > 0 && (
                <button onClick={markAllRead} style={{
                  background: "none", border: "none", color: "#FF1A1A",
                  fontSize: "11px", fontWeight: 700, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap",
                }}>
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Silenced banner */}
          {silenced && (
            <div style={{
              background: "rgba(255,26,26,0.06)", borderBottom: "1px solid rgba(255,26,26,0.1)",
              padding: "10px 18px",
            }}>
              <span style={{ fontSize: "12px", color: "rgba(255,26,26,0.7)" }}>
                🔕 Notifications muted — badge counter hidden
              </span>
            </div>
          )}

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔔</div>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem" }}>No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <div key={n.id} onClick={() => !n.is_read && markRead(n.id)} style={{
                  display: "flex", gap: "12px", padding: "14px 18px",
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                  background: n.is_read ? "transparent" : "rgba(255,26,26,0.03)",
                  cursor: n.is_read ? "default" : "pointer",
                  transition: "background 0.2s", position: "relative",
                }}>
                  {!n.is_read && (
                    <div style={{
                      position: "absolute", left: "6px", top: "50%", transform: "translateY(-50%)",
                      width: "5px", height: "5px", borderRadius: "50%", background: "#FF1A1A",
                    }} />
                  )}
                  <div style={{
                    width: "36px", height: "36px", flexShrink: 0, borderRadius: "10px",
                    background: n.is_read ? "rgba(255,255,255,0.04)" : "rgba(255,26,26,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
                  }}>
                    {typeIcon(n.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: "0.8rem", fontWeight: n.is_read ? 500 : 700,
                      color: n.is_read ? "rgba(255,255,255,0.55)" : "#fff",
                      marginBottom: "3px", lineHeight: 1.4,
                    }}>
                      {n.title}
                    </p>
                    <p style={{
                      fontSize: "11px", color: "rgba(255,255,255,0.3)", lineHeight: 1.4,
                      marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {n.message}
                    </p>
                    <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", fontWeight: 600 }}>
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 20 && (
            <div style={{ padding: "12px 18px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center", flexShrink: 0 }}>
              <Link to="/admin/notifications" onClick={() => setOpen(false)}
                style={{ fontSize: "12px", color: "#FF1A1A", textDecoration: "none", fontWeight: 700 }}>
                View all {notifications.length} notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── DashLayout ─────────────────────────────────────────────────
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
        @keyframes notifPulse { 0%,100%{box-shadow:0 0 0 2px #000,0 0 0 4px rgba(255,26,26,0.3);} 50%{box-shadow:0 0 0 2px #000,0 0 0 6px rgba(255,26,26,0);} }
        @keyframes dropDown  { from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);} }
        @keyframes spin      { to{transform:rotate(360deg);} }
        @keyframes slideIn   { from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);} }
        @media (max-width: 768px) {
          .dash-main    { margin-left: 0 !important; padding-bottom: 80px; }
          .dash-topbar  { padding: 16px !important; }
          .dash-content { padding: 16px !important; }
          .dash-title   { font-size: 1.4rem !important; }
          .dash-subtitle{ font-size:0.75rem!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px; }
          .dash-actions { width:100%;justify-content:flex-start!important; }
          .notif-dropdown{ width:320px!important;right:-60px!important; }
        }
        @media (min-width:769px) and (max-width:1024px) {
          .dash-main    { margin-left: 72px !important; }
          .dash-content { padding: 20px !important; }
        }
      `}</style>

      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className="dash-main" style={{
        ...s.main, marginLeft: collapsed ? "72px" : "240px",
        transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div className="dash-topbar" style={s.topBar}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 className="dash-title" style={s.pageTitle}>{title}</h1>
            {subtitle && <p className="dash-subtitle" style={s.pageSubtitle}>{subtitle}</p>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {actions && <div className="dash-actions" style={s.actions}>{actions}</div>}
            <NotificationBell />
          </div>
        </div>
        <div className="dash-content" style={s.content}>{children}</div>
      </main>
    </div>
  );
}

const s = {
  root:       { fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#000", color: "#F5F5F0" },
  main:       { minHeight: "100vh", display: "flex", flexDirection: "column" },
  topBar:     { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#050505", position: "sticky", top: 0, zIndex: 100, gap: "1rem", flexWrap: "wrap" },
  pageTitle:  { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", letterSpacing: "2px", color: "#fff", lineHeight: 1 },
  pageSubtitle:{ fontSize: "0.85rem", color: "rgba(255,255,255,0.35)", marginTop: "4px" },
  actions:    { display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" },
  content:    { flex: 1, padding: "32px" },
};