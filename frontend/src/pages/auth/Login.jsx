import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const IconDumbbell = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4v16M18 4v16M3 8h3M18 8h3M3 16h3M18 16h3M6 8h12M6 16h12"/>
  </svg>
);
const IconShield = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);
const IconUser = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconTrainer = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M6 20v-2a6 6 0 0112 0v2"/>
    <path d="M15 13l2 4-2 1-1-3-2 3-1-1 2-4"/>
  </svg>
);
const IconLock = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const IconEye = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconArrow = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconFlame = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="M12 2c0 0-4 4.5-4 9a4 4 0 008 0c0-1.5-.5-3-1.5-4.5C14 8 14.5 10 13 11.5c-.5.5-1 .5-1 .5s1-2-1-4.5C10.5 6 12 2 12 2z"/>
  </svg>
);
const IconBolt = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconTarget = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IconStar = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [params]   = useSearchParams();

  const [form, setForm]         = useState({ email: "", password: "" });
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [activeField, setActiveField] = useState(null);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const dest = params.get("redirect");
      if (dest) return navigate(dest, { replace: true });
      const map = {
        admin: "/admin", manager: "/admin", staff: "/admin",
        trainer: "/trainer", customer: "/dashboard",
      };
      navigate(map[user.role] || "/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Barlow', sans-serif", minHeight: "100vh", background: "#050505", color: "#F5F5F0", display: "flex", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700;800;900&family=Barlow+Condensed:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #050505; overflow-x: hidden; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes scanDown {
          0%   { transform: translateY(-100%); opacity: 0.6; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes energyPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(255,26,26,0); }
          50%     { box-shadow: 0 0 0 8px rgba(255,26,26,0.1); }
        }
        @keyframes lineGrow {
          from { width: 0; }
          to   { width: 100%; }
        }
        @keyframes counterUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glitch {
        0%,89%,100% { clip-path: none; transform: none; opacity: 1; }
        90%  { clip-path: polygon(0 15%, 100% 15%, 100% 35%, 0 35%); transform: translateX(-3px); opacity: 0.9; }
        92%  { clip-path: polygon(0 55%, 100% 55%, 100% 75%, 0 75%); transform: translateX(3px); opacity: 0.9; }
        94%  { clip-path: none; transform: translateX(-1px); }
        96%  { transform: none; }
      }

        .fz-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 4px;
          padding: 14px 16px 14px 48px;
          color: #fff;
          font-size: 0.95rem;
          font-family: 'Barlow', sans-serif;
          font-weight: 500;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          outline: none;
          letter-spacing: 0.3px;
        }
        .fz-input:focus {
          border-color: #FF1A1A;
          background: rgba(255,26,26,0.04);
          box-shadow: 0 0 0 3px rgba(255,26,26,0.08), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .fz-input::placeholder { color: rgba(255,255,255,0.18); font-weight: 400; }
        .fz-input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #0d0505 inset !important;
          -webkit-text-fill-color: #fff !important;
        }

        .fz-submit {
          width: 100%;
          padding: 15px 24px;
          background: #FF1A1A;
          color: #fff;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 1.05rem;
          letter-spacing: 3px;
          text-transform: uppercase;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: background 0.2s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .fz-submit::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          pointer-events: none;
        }
        .fz-submit:hover:not(:disabled) {
          background: #e01515;
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(255,26,26,0.45);
        }
        .fz-submit:active:not(:disabled) { transform: translateY(0); }
        .fz-submit:disabled { opacity: 0.55; cursor: not-allowed; }

        .fz-eye-btn {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.3); padding: 4px;
          transition: color 0.2s;
          display: flex; align-items: center; justify-content: center;
        }
        .fz-eye-btn:hover { color: rgba(255,255,255,0.7); }

        .fz-role-card {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 4px;
          transition: border-color 0.2s, background 0.2s;
        }
        .fz-role-card:hover {
          border-color: rgba(255,26,26,0.3);
          background: rgba(255,26,26,0.03);
        }

        .fz-forgot { color: rgba(255,255,255,0.35); font-size: 12px; text-decoration: none; transition: color 0.2s; font-family: 'Barlow', sans-serif; }
        .fz-forgot:hover { color: #FF1A1A; }
        .fz-auth-link { color: #FF1A1A; text-decoration: none; font-weight: 700; transition: opacity 0.2s; }
        .fz-auth-link:hover { opacity: 0.8; }
        .fz-back-link { color: rgba(255,255,255,0.25); text-decoration: none; font-size: 13px; transition: color 0.2s; font-family: 'Barlow', sans-serif; }
        .fz-back-link:hover { color: rgba(255,255,255,0.6); }

        .fz-register-btn {
          display: block; width: 100%; padding: 13px;
          text-align: center; text-decoration: none;
          color: rgba(255,255,255,0.6); font-weight: 600; font-size: 0.9rem;
          border: 1.5px solid rgba(255,255,255,0.1); border-radius: 4px;
          transition: all 0.2s; font-family: 'Barlow', sans-serif;
          letter-spacing: 0.5px;
        }
        .fz-register-btn:hover {
          border-color: rgba(255,26,26,0.4);
          color: #fff;
          background: rgba(255,26,26,0.06);
        }

        @media (max-width: 768px) {
          .fz-left-panel { display: none !important; }
          .fz-right-panel {
            width: 100% !important;
            min-width: 100% !important;
            padding: 0 !important;
          }
          .fz-mobile-header { display: flex !important; }
          .fz-card {
            border-radius: 0 !important;
            border-left: none !important;
            border-right: none !important;
            border-top: none !important;
            min-height: 100vh !important;
            padding: 0 1.5rem 2rem !important;
          }
        }
      `}</style>

      {/* ── Noise texture overlay ── */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      {/* ── Grid lines ── */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "linear-gradient(rgba(255,26,26,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,26,26,0.04) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      {/* ── Scan line effect ── */}
      <div style={{
        position: "fixed", left: 0, right: 0, height: "2px",
        background: "linear-gradient(90deg, transparent, rgba(255,26,26,0.4), transparent)",
        animation: "scanDown 6s linear infinite",
        zIndex: 0, pointerEvents: "none",
      }} />

      <div style={{ display: "flex", width: "100%", minHeight: "100vh", position: "relative", zIndex: 1 }}>

        {/* ══ LEFT PANEL ══ */}
        <div className="fz-left-panel" style={{
          flex: 1,
          background: "linear-gradient(160deg, #0a0000 0%, #0d0000 40%, #050505 100%)",
          borderRight: "1px solid rgba(255,26,26,0.12)",
          padding: "0",
          display: "flex", flexDirection: "column",
          position: "relative", overflow: "hidden",
        }}>
          {/* Red accent bar top */}
          <div style={{ height: "3px", background: "linear-gradient(90deg, #FF1A1A, #FF6B00, transparent)", flexShrink: 0 }} />

          <div style={{ padding: "2.5rem 2.75rem", display: "flex", flexDirection: "column", height: "100%", flex: 1 }}>

            {/* Logo */}
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none", marginBottom: "auto" }}>
              <div style={{ width: "46px", height: "46px", background: "linear-gradient(135deg, #FF1A1A, #991111)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", color: "#fff", letterSpacing: "1px", boxShadow: "0 4px 20px rgba(255,26,26,0.4)", flexShrink: 0 }}>
                FZ
              </div>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", letterSpacing: "4px", color: "#fff", lineHeight: 1 }}>FITZONE</div>
                <div style={{ fontSize: "9px", letterSpacing: "5px", color: "#FF1A1A", fontWeight: 700, fontFamily: "'Barlow', sans-serif" }}>GYM · EST. 2018</div>
              </div>
            </Link>

            {/* Main content */}
            <div style={{
              marginTop: "auto", marginBottom: "auto",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateX(-20px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
            }}>

              {/* Headline with glitch */}
              <h1 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(4rem, 6vw, 7rem)",
                lineHeight: 0.88, letterSpacing: "-1px",
                color: "#fff", marginBottom: "1.75rem",
                marginTop: "1.5rem",
                animation: "glitch 8s ease-in-out infinite",
              }}>
                WELCOME<br />
                <span style={{
                  background: "linear-gradient(135deg, #FF1A1A 0%, #FF6B00 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>BACK.</span>
              </h1>

              <p style={{
                color: "rgba(255,255,255,0.4)", fontSize: "0.95rem",
                lineHeight: 1.75, marginBottom: "2.5rem",
                fontFamily: "'Barlow', sans-serif", fontWeight: 400,
                maxWidth: "320px",
              }}>
                Your training data, membership status, and assigned trainer — all in one place.
              </p>

              {/* Stats row */}
              <div style={{ display: "flex", gap: "0", marginBottom: "2.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {[
                  { value: "2,400+", label: "Members", icon: <IconFlame size={14} color="#FF1A1A" /> },
                  { value: "48",     label: "Trainers", icon: <IconBolt size={14} color="#FF6B00" /> },
                  { value: "7+",     label: "Years",    icon: <IconStar size={14} color="#FFB800" /> },
                ].map((stat, i) => (
                  <div key={i} style={{
                    flex: 1, padding: "1.25rem 0",
                    borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    paddingLeft: i > 0 ? "1.25rem" : "0",
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "none" : "translateY(12px)",
                    transition: `opacity 0.5s ease ${0.2 + i * 0.1}s, transform 0.5s ease ${0.2 + i * 0.1}s`,
                    animation: mounted ? `counterUp 0.5s ease ${0.3 + i * 0.1}s both` : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>{stat.icon}</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem", color: "#fff", letterSpacing: "-1px", lineHeight: 1 }}>{stat.value}</div>
                    <div style={{ fontSize: "10px", letterSpacing: "2px", color: "rgba(255,255,255,0.3)", fontWeight: 700, fontFamily: "'Barlow', sans-serif", textTransform: "uppercase", marginTop: "2px" }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Who can login */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <p style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "4px", color: "rgba(255,255,255,0.2)", fontFamily: "'Barlow', sans-serif", textTransform: "uppercase", marginBottom: "4px" }}>ACCESS LEVELS</p>
                {[
                  { Icon: IconUser,    role: "Members",       desc: "Dashboard & membership",    color: "#00C2FF" },
                  { Icon: IconTrainer, role: "Trainers",      desc: "Schedule & client management", color: "#22C55E" },
                  { Icon: IconShield,  role: "Admin / Staff", desc: "Provided credentials only", color: "#FF1A1A" },
                ].map((item, i) => (
                  <div key={i} className="fz-role-card" style={{
                    opacity: mounted ? 1 : 0,
                    transition: `opacity 0.5s ease ${0.4 + i * 0.08}s`,
                  }}>
                    <div style={{
                      width: "34px", height: "34px", borderRadius: "8px",
                      background: `${item.color}15`,
                      border: `1px solid ${item.color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <item.Icon size={16} color={item.color} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: "13px", color: "rgba(255,255,255,0.8)", letterSpacing: "0.3px" }}>{item.role}</div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{item.desc}</div>
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom tagline */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "2rem" }}>
              <IconTarget size={14} color="rgba(255,255,255,0.4)" />
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", letterSpacing: "3px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Train Hard · Transform Strong</span>
            </div>
          </div>

          {/* Decorative corner element */}
          <div style={{
            position: "absolute", bottom: 0, right: 0,
            width: "200px", height: "200px",
            borderTop: "1px solid rgba(255,26,26,0.08)",
            borderLeft: "1px solid rgba(255,26,26,0.08)",
            borderRadius: "200px 0 0 0",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: 0, right: 0,
            width: "100px", height: "100px",
            borderTop: "1px solid rgba(255,26,26,0.12)",
            borderLeft: "1px solid rgba(255,26,26,0.12)",
            borderRadius: "100px 0 0 0",
            pointerEvents: "none",
          }} />
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="fz-right-panel" style={{
          width: "460px", minWidth: "460px",
          background: "#050505",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "2rem",
          borderLeft: "1px solid rgba(255,255,255,0.04)",
          overflowY: "auto",
        }}>

          {/* Mobile header — hidden on desktop */}
          <div className="fz-mobile-header" style={{
            display: "none",
            alignItems: "center", gap: "12px",
            padding: "1.5rem 1.5rem 0",
            width: "100%",
          }}>
            <div style={{ width: "46px", height: "46px", background: "linear-gradient(135deg, #FF1A1A, #991111)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", color: "#fff", letterSpacing: "1px", boxShadow: "0 4px 20px rgba(255,26,26,0.4)", flexShrink: 0 }}>
              FZ
            </div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "3px", color: "#fff" }}>FITZONE GYM</div>
              <div style={{ fontSize: "9px", letterSpacing: "3px", color: "#FF1A1A", fontWeight: 700, fontFamily: "'Barlow', sans-serif" }}>MEMBER PORTAL</div>
            </div>
          </div>

          <div className="fz-card" style={{
            width: "100%", maxWidth: "400px",
            padding: "2.5rem 0",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(20px)",
            transition: "opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s",
          }}>

            {/* Card header */}
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
                <div style={{ width: "3px", height: "20px", background: "#FF1A1A", borderRadius: "8px" }} />
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "10px", fontWeight: 800, letterSpacing: "4px", color: "#FF1A1A", textTransform: "uppercase" }}>Sign In</span>
              </div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "3rem", letterSpacing: "3px", color: "#fff", lineHeight: 1, marginBottom: "0.5rem" }}>
                YOUR ZONE<br />AWAITS.
              </h2>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>
                Members, trainers &amp; staff — enter your credentials
              </p>
              {/* Animated underline */}
              <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginTop: "1.25rem", position: "relative", overflow: "hidden" }}>
                <div style={{
                  position: "absolute", top: 0, left: 0, height: "100%",
                  background: "linear-gradient(90deg, #FF1A1A, #FF6B00)",
                  animation: mounted ? "lineGrow 0.8s ease 0.3s both" : "none",
                  width: mounted ? "100%" : "0",
                  transition: "width 0.8s ease 0.3s",
                }} />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                background: "rgba(255,26,26,0.08)",
                border: "1px solid rgba(255,26,26,0.25)",
                borderLeft: "3px solid #FF1A1A",
                borderRadius: "8px", padding: "12px 14px",
                marginBottom: "1.5rem",
                animation: "fadeSlideUp 0.3s ease",
              }}>
                <div style={{
                  width: "22px", height: "22px", borderRadius: "50%",
                  background: "rgba(255,26,26,0.2)", border: "1px solid rgba(255,26,26,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{ color: "#FF1A1A", fontSize: "12px", fontWeight: 900 }}>!</span>
                </div>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", color: "#ff7070", fontWeight: 500 }}>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "1.5rem" }}>

              {/* Email field */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontFamily: "'Barlow', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                    color: activeField === "email" ? "#FF1A1A" : "rgba(255,255,255,0.2)",
                    transition: "color 0.2s", pointerEvents: "none",
                  }}>
                    <IconUser size={16} color="currentColor" />
                  </div>
                  <input
                    className="fz-input"
                    type="email" name="email"
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setActiveField("email")}
                    onBlur={() => setActiveField(null)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontFamily: "'Barlow', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
                    Password
                  </label>
                  <Link to="/forgot-password" className="fz-forgot">Forgot password?</Link>
                </div>
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                    color: activeField === "password" ? "#FF1A1A" : "rgba(255,255,255,0.2)",
                    transition: "color 0.2s", pointerEvents: "none",
                  }}>
                    <IconLock size={16} color="currentColor" />
                  </div>
                  <input
                    className="fz-input"
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onFocus={() => setActiveField("password")}
                    onBlur={() => setActiveField(null)}
                    placeholder="••••••••"
                    required
                    style={{ paddingRight: "48px" }}
                  />
                  <button type="button" className="fz-eye-btn" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <IconEyeOff size={17} /> : <IconEye size={17} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" className="fz-submit" disabled={loading} style={{ marginTop: "0.25rem" }}>
                {loading ? (
                  <>
                    <div style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Enter the Zone</span>
                    <IconArrow size={17} color="#fff" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.2)", letterSpacing: "1px" }}>NEW TO FITZONE?</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
            </div>

            <Link to="/register" className="fz-register-btn" style={{ marginBottom: "1.25rem" }}>
              Create an Account
            </Link>

            {/* Admin note */}
            <div style={{
              display: "flex", alignItems: "flex-start", gap: "10px",
              background: "rgba(255,255,255,0.015)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "8px", padding: "12px 14px",
              marginBottom: "2rem",
            }}>
              <div style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0, marginTop: "1px" }}>
                <IconShield size={15} color="currentColor" />
              </div>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.25)", lineHeight: 1.5 }}>
                Admin &amp; staff accounts are issued by FitZone management. No public registration required.
              </span>
            </div>

            <div style={{ textAlign: "center" }}>
              <Link to="/" className="fz-back-link">← Back to FitZone Gym</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}