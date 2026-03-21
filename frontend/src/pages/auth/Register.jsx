import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const IconDumbbell = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4v16M18 4v16M3 8h3M18 8h3M3 16h3M18 16h3M6 8h12M6 16h12"/>
  </svg>
);
const IconUser = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconMail = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconLock = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const IconPhone = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 11.5a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l.46-.46a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);
const IconEye = ({ size = 17, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = ({ size = 17, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconArrow = ({ size = 17, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconCheck = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconCheckCircle = ({ size = 40, color = "#22C55E" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconClock = ({ size = 40, color = "#FFB800" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconBolt = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconFlame = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="M12 2c0 0-4 4.5-4 9a4 4 0 008 0c0-1.5-.5-3-1.5-4.5C14 8 14.5 10 13 11.5c-.5.5-1 .5-1 .5s1-2-1-4.5C10.5 6 12 2 12 2z"/>
  </svg>
);
const IconTrophy = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/>
    <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0012 0V2z"/>
  </svg>
);
const IconGift = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
    <line x1="12" y1="22" x2="12" y2="7"/>
    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
  </svg>
);
const IconTarget = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IconClipboard = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);
const IconCalendar = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconDollar = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
  </svg>
);
const IconStar = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconCrown = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="M12 1L8 9 2 6l3 13h14l3-13-6 3-4-8z"/>
    <rect x="5" y="20" width="14" height="2" rx="1"/>
  </svg>
);

const CUSTOMER_STEPS = ["Account", "Personal", "Done"];
const TRAINER_STEPS  = ["Account", "Personal", "Professional", "Done"];
const SPECIALIZATIONS = [
  "Strength Training","Cardio & Endurance","Yoga & Flexibility",
  "HIIT & Functional","Boxing & MMA","Zumba & Dance",
  "Bodybuilding","CrossFit","Pilates","Sports Conditioning","Other",
];
const ROLES = [
  { value: "customer", label: "Join as Member",  icon: <IconUser size={22} color="#00C2FF" />,    desc: "Access gym & classes",      color: "#00C2FF" },
  { value: "trainer",  label: "Join as Trainer", icon: <IconDumbbell size={22} color="#22C55E" />, desc: "Pending admin approval",    color: "#22C55E" },
];
const TIER_META = {
  elite:      { color: "#FF1A1A", label: "Elite",      icon: <IconCrown size={18} color="#FF1A1A" /> },
  pro:        { color: "#FF6B00", label: "Pro",         icon: <IconTrophy size={18} color="#FF6B00" /> },
  solid:      { color: "#FFB800", label: "Solid",       icon: <IconBolt size={18} color="#FFB800" /> },
  warming_up: { color: "rgba(255,255,255,0.5)", label: "Warming Up", icon: <IconFlame size={18} color="rgba(255,255,255,0.5)" /> },
};

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [params]     = useSearchParams();

  const rewardTier    = params.get("tier")    || "";
  const rewardPeakWpm = params.get("peakWpm") || "0";
  const rewardBonus   = params.get("bonus")   === "1";
  const prefillGoal   = params.get("goal")    || "";

  const [step, setStep]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [activeField, setActiveField] = useState(null);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const [form, setForm] = useState({
    username: "", email: "", password: "", role: "customer",
    full_name: "", phone: "", goal: prefillGoal,
    specialization: "", experience_years: "", certifications: "",
    bio: "", availability: "", hourly_rate: "",
  });
  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const STEPS      = form.role === "trainer" ? TRAINER_STEPS : CUSTOMER_STEPS;
  const totalSteps = STEPS.length - 1;
  const isDoneStep = step === STEPS.length - 1;
  const isSubmitStep = form.role === "trainer" ? step === 2 : step === 1;

  const pwChecks = {
    length:    form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number:    /[0-9]/.test(form.password),
  };
  const pwValid = Object.values(pwChecks).every(Boolean);

  const handleNext = (e) => {
    e.preventDefault();
    setError("");
    if (step === 0 && !pwValid) { setError("Password does not meet all requirements."); return; }
    setStep((p) => p + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        username: form.username.trim(), email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim() || undefined,
        phone: form.phone.trim() || undefined,
        role: form.role,
      };
      if (form.role === "customer") {
        payload.reward_tier          = rewardTier || "warming_up";
        payload.reward_peak_wpm      = Number(rewardPeakWpm) || 0;
        payload.reward_accuracy      = 0;
        payload.reward_phrases_typed = 0;
        payload.reward_bonus_round   = rewardBonus;
      }
      if (form.role === "trainer") {
        if (form.specialization)   payload.specialization   = form.specialization;
        if (form.experience_years) payload.experience_years = parseInt(form.experience_years);
        if (form.certifications)   payload.certifications   = form.certifications.trim();
        if (form.bio)              payload.bio              = form.bio.trim();
        if (form.availability)     payload.availability     = form.availability.trim();
        if (form.hourly_rate)      payload.hourly_rate      = parseFloat(form.hourly_rate);
      }
      await register(payload);
      setStep(STEPS.length - 1);
      if (form.role === "trainer") setTimeout(() => navigate("/login"), 4000);
      else setTimeout(() => navigate("/dashboard", { replace: true }), 1800);
    } catch (err) {
      const data = err.response?.data;
      if (data?.fields?.length) setError(data.fields.map(f => f.message).join(" · "));
      else setError(data?.error || "Registration failed.");
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  const tierMeta  = TIER_META[rewardTier] || null;
  const hasReward = !!rewardTier && rewardTier !== "warming_up";
  const hasTier   = !!rewardTier;

  const inputStyle = (field) => ({
    width: "100%",
    background: activeField === field ? "rgba(255,26,26,0.04)" : "rgba(255,255,255,0.03)",
    border: `1.5px solid ${activeField === field ? "#FF1A1A" : "rgba(255,255,255,0.08)"}`,
    borderRadius: "8px",
    padding: "13px 16px 13px 44px",
    color: "#fff",
    fontSize: "0.9rem",
    fontFamily: "'Barlow', sans-serif",
    fontWeight: 500,
    transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
    outline: "none",
    boxShadow: activeField === field ? "0 0 0 3px rgba(255,26,26,0.08)" : "none",
  });

  return (
    <div style={{ fontFamily: "'Barlow', sans-serif", minHeight: "100vh", background: "#050505", color: "#F5F5F0", display: "flex", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700;800;900&family=Barlow+Condensed:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #050505; overflow-x: hidden; }

        @keyframes fadeUp    { from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);} }
        @keyframes fadeIn    { from{opacity:0;}to{opacity:1;} }
        @keyframes spin      { to{transform:rotate(360deg);} }
        @keyframes successPop{ 0%{transform:scale(0.4);opacity:0;}60%{transform:scale(1.1);}100%{transform:scale(1);opacity:1;} }
        @keyframes lineGrow  { from{width:0;}to{width:100%;} }
        @keyframes scanDown  { 0%{transform:translateY(-100%);opacity:0.6;}100%{transform:translateY(100vh);opacity:0;} }
        @keyframes glitch {
        0%,89%,100% { clip-path: none; transform: none; opacity: 1; }
        90%  { clip-path: polygon(0 15%, 100% 15%, 100% 35%, 0 35%); transform: translateX(-3px); opacity: 0.9; }
        92%  { clip-path: polygon(0 55%, 100% 55%, 100% 75%, 0 75%); transform: translateX(3px); opacity: 0.9; }
        94%  { clip-path: none; transform: translateX(-1px); }
        96%  { transform: none; }
      }
        @keyframes tierGlow  { 0%,100%{opacity:0.6;}50%{opacity:1;} }

        .fz-input-r {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 4px;
          padding: 13px 16px 13px 44px;
          color: #fff;
          font-size: 0.9rem;
          font-family: 'Barlow', sans-serif;
          font-weight: 500;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .fz-input-r:focus {
          border-color: #FF1A1A;
          background: rgba(255,26,26,0.04);
          box-shadow: 0 0 0 3px rgba(255,26,26,0.08);
        }
        .fz-input-r::placeholder { color: rgba(255,255,255,0.18); font-weight: 400; }
        .fz-input-r:-webkit-autofill,
        .fz-textarea:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #0d0505 inset !important;
          -webkit-text-fill-color: #fff !important;
        }
        .fz-textarea {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 4px;
          padding: 12px 16px;
          color: #fff;
          font-size: 0.9rem;
          font-family: 'Barlow', sans-serif;
          font-weight: 500;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          line-height: 1.6;
        }
        .fz-textarea:focus {
          border-color: #FF1A1A;
          background: rgba(255,26,26,0.04);
        }
        .fz-textarea::placeholder { color: rgba(255,255,255,0.18); }

        .fz-submit-r {
          padding: 14px 24px;
          background: #FF1A1A;
          color: #fff;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 1rem;
          letter-spacing: 3px;
          text-transform: uppercase;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .fz-submit-r::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          pointer-events: none;
        }
        .fz-submit-r:hover:not(:disabled) {
          background: #e01515;
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(255,26,26,0.45);
        }
        .fz-submit-r:disabled { opacity: 0.55; cursor: not-allowed; }

        .fz-back-r {
          padding: 14px 20px;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 4px;
          color: rgba(255,255,255,0.5);
          font-family: 'Barlow', sans-serif;
          font-weight: 600; font-size: 0.9rem;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; gap: 8px;
          flex-shrink: 0;
        }
        .fz-back-r:hover { border-color: rgba(255,255,255,0.2); color: #fff; }

        .fz-role-btn {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 1.25rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Barlow', sans-serif;
          transition: all 0.2s ease;
          position: relative;
        }
        .fz-role-btn:hover { transform: translateY(-2px); }

        .fz-spec-btn {
          padding: 7px 14px;
          border-radius: 3px;
          cursor: pointer;
          font-family: 'Barlow', sans-serif;
          font-size: 12px; font-weight: 600;
          transition: all 0.2s ease;
          letter-spacing: 0.3px;
        }
        .fz-spec-btn:hover { border-color: rgba(255,26,26,0.5) !important; color: #fff !important; }

        .fz-auth-link-r { color: #FF1A1A; text-decoration: none; font-weight: 700; transition: opacity 0.2s; }
        .fz-auth-link-r:hover { opacity: 0.8; }
        .fz-back-link-r { color: rgba(255,255,255,0.25); text-decoration: none; font-size: 13px; transition: color 0.2s; }
        .fz-back-link-r:hover { color: rgba(255,255,255,0.6); }

        .fz-eye-r {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.3); padding: 4px;
          transition: color 0.2s;
          display: flex; align-items: center;
        }
        .fz-eye-r:hover { color: rgba(255,255,255,0.7); }

        @media (max-width: 768px) {
          .fz-left-r { display: none !important; }
          .fz-right-r {
            width: 100% !important;
            min-width: 100% !important;
          }
          .fz-mob-header { display: flex !important; }
          .fz-card-r { padding: 0 1.5rem 2rem !important; }
        }
      `}</style>

      {/* Background effects */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "linear-gradient(rgba(255,26,26,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,26,26,0.04) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />
      <div style={{ position: "fixed", left: 0, right: 0, height: "2px",
        background: "linear-gradient(90deg, transparent, rgba(255,26,26,0.4), transparent)",
        animation: "scanDown 6s linear infinite", zIndex: 0, pointerEvents: "none",
      }} />

      <div style={{ display: "flex", width: "100%", minHeight: "100vh", position: "relative", zIndex: 1 }}>

        {/* ══ LEFT PANEL ══ */}
        <div className="fz-left-r" style={{
          flex: 1,
          background: "linear-gradient(160deg, #0a0000 0%, #0d0000 40%, #050505 100%)",
          borderRight: "1px solid rgba(255,26,26,0.12)",
          display: "flex", flexDirection: "column",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ height: "3px", background: "linear-gradient(90deg, #FF1A1A, #FF6B00, transparent)", flexShrink: 0 }} />

          <div style={{ padding: "2.5rem 2.75rem", display: "flex", flexDirection: "column", flex: 1 }}>
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
            <div style={{ marginTop: "auto", marginBottom: "auto", opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateX(-20px)", transition: "opacity 0.7s, transform 0.7s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
                <div style={{ width: "32px", height: "2px", background: "#FF1A1A" }} />
                <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "4px", color: "#FF1A1A", fontFamily: "'Barlow', sans-serif" }}>NEW MEMBER</span>
              </div>

              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3.5rem, 5.5vw, 6.5rem)", lineHeight: 0.88, letterSpacing: "-1px", color: "#fff", marginBottom: "1.75rem", animation: "glitch 8s ease-in-out infinite" }}>
                JOIN THE<br />
                <span style={{ background: "linear-gradient(135deg, #FF1A1A 0%, #FF6B00 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>ZONE.</span>
              </h1>

              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", lineHeight: 1.75, marginBottom: "2rem", fontFamily: "'Barlow', sans-serif", maxWidth: "300px" }}>
                {form.role === "trainer"
                  ? "Share your expertise. Build your client base. Set your own schedule."
                  : "2,400+ members can't be wrong. Your transformation starts today."}
              </p>

              {/* Reward tier banner */}
              {hasTier && form.role === "customer" && tierMeta && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "14px 16px", borderRadius: "8px",
                  border: `1.5px solid ${tierMeta.color}40`,
                  background: `${tierMeta.color}0a`,
                  marginBottom: "1.5rem",
                  animation: "tierGlow 2s ease-in-out infinite",
                }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: `${tierMeta.color}18`, border: `1px solid ${tierMeta.color}35`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {tierMeta.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "3px", color: tierMeta.color, fontFamily: "'Barlow', sans-serif", marginBottom: "2px" }}>REWARD LOCKED IN</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "#fff", letterSpacing: "2px" }}>{tierMeta.label} Tier</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontFamily: "'Barlow', sans-serif" }}>{hasReward ? "Discount applies at first payment" : "Perks activated on membership"}</div>
                  </div>
                </div>
              )}

              {/* Goal preview */}
              {prefillGoal && form.role === "customer" && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,26,26,0.06)", border: "1px solid rgba(255,26,26,0.18)", borderRadius: "8px", padding: "12px 16px", marginBottom: "1.5rem" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,26,26,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <IconTarget size={16} color="#FF1A1A" />
                  </div>
                  <div>
                    <div style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "2px", color: "#FF1A1A", fontFamily: "'Barlow', sans-serif" }}>YOUR GOAL</div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", fontFamily: "'Barlow', sans-serif" }}>
                      {prefillGoal.charAt(0).toUpperCase() + prefillGoal.slice(1).replace(/-/g, " ")}
                    </div>
                  </div>
                </div>
              )}

              {/* Perks list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(form.role === "trainer"
                  ? ["Set your own hourly rate", "Choose your specialization", "Manage your own schedule", "Build your client base", "Admin reviews & approves your profile"]
                  : ["No joining fee this month", "Free fitness assessment on first visit", "Cancel anytime on monthly plan", "Access to all group classes", ...(hasReward ? [`₹${Number(rewardPeakWpm) >= 100 ? 500 : 300} off your first membership`] : [])]
                ).map((perk, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", opacity: mounted ? 1 : 0, transition: `opacity 0.4s ease ${0.3 + i * 0.07}s` }}>
                    <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "rgba(255,26,26,0.15)", border: "1px solid rgba(255,26,26,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <IconCheck size={10} color="#FF1A1A" />
                    </div>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "2rem" }}>
              <IconTarget size={14} color="rgba(255,255,255,0.4)" />
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", letterSpacing: "3px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Train Hard · Transform Strong</span>
            </div>
          </div>

          {/* Decorative corner */}
          <div style={{ position: "absolute", bottom: 0, right: 0, width: "200px", height: "200px", borderTop: "1px solid rgba(255,26,26,0.08)", borderLeft: "1px solid rgba(255,26,26,0.08)", borderRadius: "200px 0 0 0", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 0, right: 0, width: "100px", height: "100px", borderTop: "1px solid rgba(255,26,26,0.12)", borderLeft: "1px solid rgba(255,26,26,0.12)", borderRadius: "100px 0 0 0", pointerEvents: "none" }} />
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="fz-right-r" style={{
          width: "520px", minWidth: "520px",
          background: "#050505",
          display: "flex", flexDirection: "column",
          alignItems: "center",
          borderLeft: "1px solid rgba(255,255,255,0.04)",
          overflowY: "auto", minHeight: "100vh",
          padding: "2rem",
        }}>

          {/* Mobile header */}
          <div className="fz-mob-header" style={{ display: "none", alignItems: "center", gap: "12px", padding: "1.5rem 0 0", width: "100%", marginBottom: "0.5rem" }}>
            <div style={{ width: "46px", height: "46px", background: "linear-gradient(135deg, #FF1A1A, #991111)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", color: "#fff", letterSpacing: "1px", boxShadow: "0 4px 20px rgba(255,26,26,0.4)", flexShrink: 0 }}>
              FZ
            </div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "3px", color: "#fff" }}>FITZONE GYM</div>
              <div style={{ fontSize: "9px", letterSpacing: "3px", color: "#FF1A1A", fontWeight: 700, fontFamily: "'Barlow', sans-serif" }}>NEW MEMBER</div>
            </div>
          </div>

          <div className="fz-card-r" style={{
            width: "100%", maxWidth: "460px",
            paddingTop: "2rem", paddingBottom: "2rem",
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.6s ease 0.1s",
          }}>

            {/* Role selector — step 0 only */}
            {step === 0 && (
              <div style={{ marginBottom: "1.75rem" }}>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: "9px", fontWeight: 800, letterSpacing: "4px", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: "0.75rem" }}>I WANT TO</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {ROLES.map((r) => (
                    <button key={r.value} type="button" className="fz-role-btn"
                      onClick={() => set("role", r.value)}
                      style={{
                        border: form.role === r.value ? `2px solid ${r.color}` : "2px solid rgba(255,255,255,0.07)",
                        background: form.role === r.value ? `${r.color}10` : "rgba(255,255,255,0.02)",
                        boxShadow: form.role === r.value ? `0 0 20px ${r.color}20` : "none",
                      }}
                    >
                      <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: `${r.color}18`, border: `1.5px solid ${r.color}35`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {r.icon}
                      </div>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: "0.8rem", color: form.role === r.value ? "#fff" : "rgba(255,255,255,0.5)", letterSpacing: "0.3px" }}>{r.label}</span>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "11px", color: form.role === r.value ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.2)" }}>{r.desc}</span>
                      {form.role === r.value && (
                        <div style={{ position: "absolute", top: "8px", right: "8px", width: "18px", height: "18px", borderRadius: "50%", background: r.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <IconCheck size={9} color="#fff" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step progress bar */}
            {!isDoneStep && (
              <div style={{ marginBottom: "1.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
                  {STEPS.slice(0, -1).map((label, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 2 ? 1 : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{
                          width: "26px", height: "26px", borderRadius: "50%",
                          background: i < step ? "#FF1A1A" : i === step ? "transparent" : "rgba(255,255,255,0.06)",
                          border: i === step ? "2px solid #FF1A1A" : i < step ? "none" : "2px solid rgba(255,255,255,0.1)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, fontSize: "11px", fontWeight: 800, color: "#fff",
                          boxShadow: i === step ? "0 0 12px rgba(255,26,26,0.4)" : "none",
                          transition: "all 0.3s",
                        }}>
                          {i < step ? <IconCheck size={11} color="#fff" /> : <span style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{i + 1}</span>}
                        </div>
                        <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: i <= step ? "#fff" : "rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}>{label}</span>
                      </div>
                      {i < STEPS.length - 2 && (
                        <div style={{ flex: 1, height: "1px", background: i < step ? "#FF1A1A" : "rgba(255,255,255,0.07)", margin: "0 10px", transition: "background 0.3s" }} />
                      )}
                    </div>
                  ))}
                </div>
                {/* Progress line */}
                <div style={{ height: "2px", background: "rgba(255,255,255,0.06)", borderRadius: "8px", marginTop: "1rem", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "linear-gradient(90deg, #FF1A1A, #FF6B00)", borderRadius: "8px", width: `${(step / totalSteps) * 100}%`, transition: "width 0.4s ease" }} />
                </div>
              </div>
            )}

            {/* Card header */}
            {!isDoneStep && (
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
                  <div style={{ width: "3px", height: "18px", background: "#FF1A1A", borderRadius: "8px" }} />
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "9px", fontWeight: 800, letterSpacing: "4px", color: "#FF1A1A", textTransform: "uppercase" }}>
                    STEP {step + 1} OF {totalSteps}
                  </span>
                </div>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.5rem", letterSpacing: "3px", color: "#fff", marginBottom: "0.3rem" }}>
                  {step === 0 ? "CREATE ACCOUNT" : step === 1 ? "PERSONAL INFO" : "PROFESSIONAL INFO"}
                </h2>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.35)" }}>
                  {step === 0 ? "Set up your login credentials" : step === 1 ? "Tell us a bit about yourself" : "Help admin verify your qualifications"}
                </p>
                <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginTop: "1rem", position: "relative" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, height: "100%", background: "linear-gradient(90deg, #FF1A1A, #FF6B00)", width: mounted ? "100%" : "0", transition: "width 0.8s ease 0.2s" }} />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,26,26,0.08)", border: "1px solid rgba(255,26,26,0.25)", borderLeft: "3px solid #FF1A1A", borderRadius: "8px", padding: "12px 14px", marginBottom: "1.5rem", animation: "fadeUp 0.3s ease" }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(255,26,26,0.2)", border: "1px solid rgba(255,26,26,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#FF1A1A", fontSize: "11px", fontWeight: 900 }}>!</span>
                </div>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.85rem", color: "#ff7070" }}>{error}</span>
              </div>
            )}

            {/* ── STEP 0: Account ── */}
            {step === 0 && (
              <form onSubmit={handleNext} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                {/* Username */}
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <label style={{ fontFamily: "'Barlow', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Username</label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)", pointerEvents: "none" }}><IconUser size={15} /></div>
                    <input className="fz-input-r" type="text" value={form.username}
                      onChange={(e) => set("username", e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                      placeholder="yourname123" required minLength={3} maxLength={50} />
                  </div>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.18)" }}>Letters, numbers, underscores only</span>
                </div>

                {/* Email */}
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <label style={{ fontFamily: "'Barlow', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Email Address</label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)", pointerEvents: "none" }}><IconMail size={15} /></div>
                    <input className="fz-input-r" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" required />
                  </div>
                </div>

                {/* Password */}
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <label style={{ fontFamily: "'Barlow', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Password</label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)", pointerEvents: "none" }}><IconLock size={15} /></div>
                    <input className="fz-input-r" type={showPass ? "text" : "password"} value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      placeholder="••••••••" required style={{ paddingRight: "46px" }} />
                    <button type="button" className="fz-eye-r" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                  {/* Password checks */}
                  {form.password.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "4px" }}>
                      {[
                        { key: "length",    label: "8+ characters" },
                        { key: "uppercase", label: "Uppercase letter" },
                        { key: "lowercase", label: "Lowercase letter" },
                        { key: "number",    label: "Number" },
                      ].map(({ key, label }) => (
                        <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: pwChecks[key] ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${pwChecks[key] ? "#22C55E" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                            {pwChecks[key] && <IconCheck size={8} color="#22C55E" />}
                          </div>
                          <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "11px", color: pwChecks[key] ? "#22C55E" : "rgba(255,255,255,0.25)", transition: "color 0.2s" }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button type="submit" className="fz-submit-r" style={{ marginTop: "0.5rem" }}>
                  <span>Continue</span>
                  <IconArrow size={16} color="#fff" />
                </button>

                <p style={{ textAlign: "center", fontFamily: "'Barlow', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.3)", marginTop: "0.25rem" }}>
                  Already have an account?{" "}
                  <Link to="/login" className="fz-auth-link-r">Sign in</Link>
                </p>
              </form>
            )}

            {/* ── STEP 1: Personal ── */}
            {step === 1 && (
              <form onSubmit={isSubmitStep ? handleSubmit : handleNext} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                {/* Full name */}
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <label style={{ fontFamily: "'Barlow', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Full Name</label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)", pointerEvents: "none" }}><IconUser size={15} /></div>
                    <input className="fz-input-r" type="text" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Rahul Kumar" />
                  </div>
                </div>

                {/* Phone */}
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <label style={{ fontFamily: "'Barlow', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Phone Number</label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)", pointerEvents: "none" }}><IconPhone size={15} /></div>
                    <input className="fz-input-r" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+919876543210" maxLength={15} />
                  </div>
                </div>

                {/* Reward summary */}
                {isSubmitStep && hasTier && form.role === "customer" && tierMeta && (
                  <div style={{ borderRadius: "8px", padding: "14px 16px", border: `1px solid ${tierMeta.color}30`, background: `${tierMeta.color}06` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                      {tierMeta.icon}
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "10px", fontWeight: 800, letterSpacing: "2px", color: tierMeta.color, textTransform: "uppercase" }}>
                        {tierMeta.label} Reward Will Be Saved
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      {[
                        "✓ Free fitness assessment",
                        "✓ No joining fee",
                        ...(Number(rewardPeakWpm) >= 50  ? ["✓ 30 days free locker"] : []),
                        ...(Number(rewardPeakWpm) >= 80  ? [`✓ ₹${Number(rewardPeakWpm) >= 100 ? 500 : 300} off first membership`] : []),
                        ...(Number(rewardPeakWpm) >= 100 ? ["✓ 1 free PT session"] : []),
                      ].map((item, i) => (
                        <span key={i} style={{ fontFamily: "'Barlow', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{item}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "0.5rem" }}>
                  <button type="button" className="fz-back-r" onClick={() => setStep(0)}>
                    ← Back
                  </button>
                  <button type="submit" className="fz-submit-r" disabled={loading} style={{ flex: 1 }}>
                    {loading ? (
                      <><div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /><span>Creating...</span></>
                    ) : (
                      <><span>{isSubmitStep ? "Create Account" : "Continue"}</span><IconArrow size={16} color="#fff" /></>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ── STEP 2: Professional (trainer) ── */}
            {step === 2 && form.role === "trainer" && (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                {/* Specialization */}
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <label style={{ fontFamily: "'Barlow', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
                    Specialization <span style={{ color: "#FF1A1A" }}>*</span>
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {SPECIALIZATIONS.map((spec) => (
                      <button key={spec} type="button" className="fz-spec-btn"
                        onClick={() => set("specialization", spec)}
                        style={{
                          border: form.specialization === spec ? "1.5px solid #FF1A1A" : "1.5px solid rgba(255,255,255,0.08)",
                          background: form.specialization === spec ? "rgba(255,26,26,0.12)" : "rgba(255,255,255,0.02)",
                          color: form.specialization === spec ? "#fff" : "rgba(255,255,255,0.4)",
                        }}>
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <label style={{ fontFamily: "'Barlow', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
                    Years of Experience <span style={{ color: "#FF1A1A" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)", pointerEvents: "none" }}><IconStar size={15} color="rgba(255,255,255,0.2)" /></div>
                    <input className="fz-input-r" type="number" value={form.experience_years} onChange={(e) => set("experience_years", e.target.value)} placeholder="e.g. 3" min={0} max={50} required />
                  </div>
                </div>

                {/* Certifications */}
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <label style={{ fontFamily: "'Barlow', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
                    Certifications <span style={{ color: "#FF1A1A" }}>*</span>
                  </label>
                  <textarea className="fz-textarea" value={form.certifications} onChange={(e) => set("certifications", e.target.value)} placeholder="e.g. ACE Certified, NASM-CPT..." required rows={3} />
                </div>

                {/* Bio */}
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <label style={{ fontFamily: "'Barlow', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Bio</label>
                  <textarea className="fz-textarea" value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Your training philosophy..." rows={3} />
                </div>

                {/* Availability */}
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <label style={{ fontFamily: "'Barlow', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Availability</label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)", pointerEvents: "none" }}><IconCalendar size={15} /></div>
                    <input className="fz-input-r" type="text" value={form.availability} onChange={(e) => set("availability", e.target.value)} placeholder="Mon-Fri 6am-2pm" />
                  </div>
                </div>

                {/* Hourly rate */}
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <label style={{ fontFamily: "'Barlow', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Hourly Rate (₹)</label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)", pointerEvents: "none" }}><IconDollar size={15} /></div>
                    <input className="fz-input-r" type="number" value={form.hourly_rate} onChange={(e) => set("hourly_rate", e.target.value)} placeholder="e.g. 500" min={0} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "0.5rem" }}>
                  <button type="button" className="fz-back-r" onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="fz-submit-r" disabled={loading || !form.specialization} style={{ flex: 1 }}>
                    {loading ? (
                      <><div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /><span>Submitting...</span></>
                    ) : (
                      <><span>Submit Application</span><IconArrow size={16} color="#fff" /></>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ── DONE STEP ── */}
            {isDoneStep && (
              <div style={{ textAlign: "center", padding: "2.5rem 0 1.5rem", animation: "fadeUp 0.5s ease" }}>
                <div style={{
                  width: "80px", height: "80px", borderRadius: "50%",
                  background: form.role === "trainer" ? "rgba(255,184,0,0.1)" : "rgba(34,197,94,0.1)",
                  border: `2px solid ${form.role === "trainer" ? "#FFB700" : "#22C55E"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  animation: "successPop 0.5s ease forwards",
                  boxShadow: `0 0 40px ${form.role === "trainer" ? "rgba(255,184,0,0.2)" : "rgba(34,197,94,0.2)"}`,
                }}>
                  {form.role === "trainer"
                    ? <IconClock size={36} color="#FFB800" />
                    : <IconCheckCircle size={36} color="#22C55E" />
                  }
                </div>

                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "3rem", letterSpacing: "4px", color: "#fff", marginBottom: "0.75rem" }}>
                  {form.role === "trainer" ? "APPLICATION SENT!" : "YOU'RE IN!"}
                </h2>
                <p style={{ fontFamily: "'Barlow', sans-serif", color: "rgba(255,255,255,0.4)", lineHeight: 1.75, marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                  {form.role === "trainer"
                    ? "Your application is under review. Visit our gym with your original documents to complete verification — once approved, you can log in"
                    : "Welcome to FitZone Gym. Redirecting to your dashboard..."}
                </p>

                {form.role === "customer" && hasTier && tierMeta && (
                  <div style={{ borderRadius: "8px", padding: "16px", border: `1px solid ${tierMeta.color}40`, background: `${tierMeta.color}0a`, marginTop: "1rem", textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      {tierMeta.icon}
                      <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: "10px", fontWeight: 800, letterSpacing: "2px", color: tierMeta.color, textTransform: "uppercase" }}>
                        Your Rewards Are Saved
                      </p>
                    </div>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                      Check your dashboard to see all your perks and apply them.
                    </p>
                  </div>
                )}

                {form.role !== "trainer" && (
                  <div style={{ width: "24px", height: "24px", border: "2px solid rgba(255,26,26,0.2)", borderTop: "2px solid #FF1A1A", borderRadius: "50%", margin: "1.5rem auto 0", animation: "spin 0.8s linear infinite" }} />
                )}
              </div>
            )}

            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <Link to="/" className="fz-back-link-r">← Back to FitZone Gym</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}