import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = {
  customer: [
    { icon: "⊞", label: "Overview",   href: "/dashboard" },
    { icon: "🏷️", label: "Membership", href: "/dashboard/membership" },
    { icon: "📋", label: "My Request", href: "/dashboard/request" },
    { icon: "👤", label: "Profile",    href: "/dashboard/profile" },
  ],
  trainer: [
    { icon: "⊞", label: "Overview",   href: "/trainer" },
    { icon: "👥", label: "My Members", href: "/trainer/members" },
    { icon: "📅", label: "Schedule",   href: "/trainer/schedule" },
  ],
  admin: [
    { icon: "⊞", label: "Dashboard",     href: "/admin" },
    { icon: "🎯", label: "Leads",         href: "/admin/leads" },
    { icon: "👥", label: "Members",       href: "/admin/members" },
    { icon: "📋", label: "Requests",      href: "/admin/requests" },
    { icon: "🏋️", label: "Trainers",      href: "/admin/trainers" },
    { icon: "📄", label: "Applications",  href: "/admin/applications" },
    { icon: "💳", label: "Payments",      href: "/admin/payments" },
    { icon: "🔑", label: "Staff",         href: "/admin/users" },
  ],
  manager: [
    { icon: "⊞", label: "Dashboard",    href: "/admin" },
    { icon: "🎯", label: "Leads",        href: "/admin/leads" },
    { icon: "👥", label: "Members",      href: "/admin/members" },
    { icon: "📋", label: "Requests",     href: "/admin/requests" },
    { icon: "🏋️", label: "Trainers",     href: "/admin/trainers" },
    { icon: "📄", label: "Applications", href: "/admin/applications" },
    { icon: "💳", label: "Payments",     href: "/admin/payments" },
  ],
  staff: [
    { icon: "⊞", label: "Dashboard", href: "/admin" },
    { icon: "🎯", label: "Leads",     href: "/admin/leads" },
    { icon: "👥", label: "Members",   href: "/admin/members" },
    { icon: "📋", label: "Requests",  href: "/admin/requests" },
  ],
};

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const location         = useLocation();

  const role    = user?.role || "customer";
  const navRole = ["admin", "manager", "staff"].includes(role) ? role : role;
  const links   = NAV[navRole] || NAV.customer;

  const roleColors = {
    admin:    "#FF1A1A",
    manager:  "#FF6B00",
    staff:    "#FFB800",
    trainer:  "#00C2FF",
    customer: "#22C55E",
  };
  const accent = roleColors[role] || "#FF1A1A";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        .nav-link-item { transition: all 0.2s ease; }
        .nav-link-item:hover { background: rgba(255,255,255,0.06) !important; }
        .logout-btn:hover { background: rgba(255,26,26,0.1) !important; color: #FF1A1A !important; }
        .collapse-btn:hover { background: rgba(255,255,255,0.1) !important; }
      `}</style>

      <aside style={{
        ...s.sidebar,
        width: collapsed ? "72px" : "240px",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}>

        {/* Logo */}
        <div style={s.logoRow}>
          <div style={{ ...s.logoBox, background: `linear-gradient(135deg, ${accent}, ${accent}99)` }}>
            FZ
          </div>
          {!collapsed && (
            <div style={s.logoText}>
              <div style={s.logoName}>FITZONE</div>
              <div style={{ ...s.logoSub, color: accent }}>GYM</div>
            </div>
          )}
          <button
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            style={s.collapseBtn}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div style={{ ...s.roleBadge, color: accent, borderColor: accent + "30", background: accent + "10" }}>
            {role.toUpperCase()}
          </div>
        )}

        {/* Nav links */}
        <nav style={s.nav}>
          {links.map((link) => {
            const active = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className="nav-link-item"
                title={collapsed ? link.label : ""}
                style={{
                  ...s.navLink,
                  background: active ? accent + "15" : "transparent",
                  borderLeft: active ? `3px solid ${accent}` : "3px solid transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.5)",
                  justifyContent: collapsed ? "center" : "flex-start",
                }}
              >
                <span style={{ ...s.navIcon, fontSize: collapsed ? "1.2rem" : "1rem" }}>
                  {link.icon}
                </span>
                {!collapsed && <span style={s.navLabel}>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div style={s.bottom}>
          {!collapsed && (
            <div style={s.userCard}>
              <div style={{ ...s.userAvatar, background: accent + "20", color: accent }}>
                {user?.full_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "?"}
              </div>
              <div style={s.userInfo}>
                <p style={s.userName}>{user?.full_name || user?.username}</p>
                <p style={s.userEmail}>{user?.email}</p>
              </div>
            </div>
          )}
          <button
            className="logout-btn"
            onClick={logout}
            title="Logout"
            style={{
              ...s.logoutBtn,
              justifyContent: collapsed ? "center" : "flex-start",
            }}
          >
            <span>⎋</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

const s = {
  sidebar: {
    position: "fixed", top: 0, left: 0, bottom: 0,
    background: "#050505",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    display: "flex", flexDirection: "column",
    zIndex: 100, overflow: "hidden",
    fontFamily: "'DM Sans', sans-serif",
  },
  logoRow: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "20px 14px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    minHeight: "72px",
  },
  logoBox: {
    width: "38px", height: "38px", flexShrink: 0,
    borderRadius: "8px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "16px", color: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  },
  logoText: { flex: 1, minWidth: 0 },
  logoName: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "17px", letterSpacing: "2px", color: "#fff", lineHeight: 1,
  },
  logoSub: { fontSize: "8px", letterSpacing: "3px", fontWeight: 700 },
  collapseBtn: {
    width: "26px", height: "26px", flexShrink: 0,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "6px",
    color: "rgba(255,255,255,0.4)",
    fontSize: "16px", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "background 0.2s",
    lineHeight: 1,
  },
  roleBadge: {
    margin: "12px 14px",
    padding: "4px 10px",
    fontSize: "9px", fontWeight: 800, letterSpacing: "2px",
    border: "1px solid", borderRadius: "100px",
    width: "fit-content",
  },
  nav: { flex: 1, padding: "8px 8px", display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto" },
  navLink: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "10px 10px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: 500, fontSize: "0.875rem",
    transition: "all 0.2s",
    whiteSpace: "nowrap", overflow: "hidden",
  },
  navIcon: { flexShrink: 0, width: "20px", textAlign: "center" },
  navLabel: { overflow: "hidden", textOverflow: "ellipsis" },
  bottom: {
    borderTop: "1px solid rgba(255,255,255,0.05)",
    padding: "12px 8px",
  },
  userCard: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "10px", marginBottom: "6px",
  },
  userAvatar: {
    width: "34px", height: "34px", flexShrink: 0,
    borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 800, fontSize: "14px",
  },
  userInfo: { minWidth: 0, flex: 1 },
  userName:  { fontSize: "13px", fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  userEmail: { fontSize: "11px", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  logoutBtn: {
    display: "flex", alignItems: "center", gap: "8px",
    width: "100%", padding: "10px",
    background: "none", border: "none",
    borderRadius: "8px",
    color: "rgba(255,255,255,0.35)",
    fontSize: "0.875rem", fontWeight: 500,
    cursor: "pointer", transition: "all 0.2s",
    fontFamily: "'DM Sans', sans-serif",
  },
};