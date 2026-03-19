// frontend/src/pages/auth/Register.jsx
// Full replacement — reward fields wired through to backend

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CUSTOMER_STEPS = ["Account", "Personal", "Done"];
const TRAINER_STEPS  = ["Account", "Personal", "Professional", "Done"];

const SPECIALIZATIONS = [
  "Strength Training", "Cardio & Endurance", "Yoga & Flexibility",
  "HIIT & Functional", "Boxing & MMA", "Zumba & Dance",
  "Bodybuilding", "CrossFit", "Pilates", "Sports Conditioning", "Other",
];

const ROLES = [
  { value: "customer", label: "Join as Member",  icon: "🏋️", desc: "Access gym & classes" },
  { value: "trainer",  label: "Join as Trainer", icon: "💪", desc: "Pending admin approval" },
];

// Tier meta for the reward banner shown on the register page
const TIER_META = {
  elite:      { color: "#FF1A1A", label: "Elite",      icon: "👑" },
  pro:        { color: "#FF6B00", label: "Pro",         icon: "🏆" },
  solid:      { color: "#FFB800", label: "Solid",       icon: "⚡" },
  warming_up: { color: "rgba(255,255,255,0.5)", label: "Warming Up", icon: "🔥" },
};

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [params]     = useSearchParams();

  // ── Reward params from game URL ─────────────────────────────
  const rewardTier       = params.get("tier")      || "";     // e.g. "pro"
  const rewardPeakWpm    = params.get("peakWpm")   || "0";
  const rewardBonus      = params.get("bonus")     === "1";
  // accuracy + phrases not in URL — we'll carry them via state if needed
  // For now we derive from tier (good enough for internship scope)

  const prefillGoal = params.get("goal") || "";

  const [step, setStep]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [showPass, setShowPass] = useState(false);

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
    if (step === 0 && !pwValid) { setError("Password does not meet requirements."); return; }
    setStep((p) => p + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        username:  form.username.trim(),
        email:     form.email.trim(),
        password:  form.password,
        full_name: form.full_name.trim() || undefined,
        phone:     form.phone.trim() || undefined,
        role:      form.role,
      };

      // ── Attach reward data for customer registrations ───────
      if (form.role === "customer") {
        payload.reward_tier         = rewardTier       || "warming_up";
        payload.reward_peak_wpm     = Number(rewardPeakWpm) || 0;
        payload.reward_accuracy     = 0;   // not in URL, default safe
        payload.reward_phrases_typed = 0;
        payload.reward_bonus_round  = rewardBonus;
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
      if (form.role === "trainer") {
        setTimeout(() => navigate("/login"), 4000);
      } else {
        setTimeout(() => navigate("/dashboard", { replace: true }), 1800);
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.fields?.length) setError(data.fields.map(f => f.message).join(" · "));
      else setError(data?.error || "Registration failed.");
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  const tierMeta   = TIER_META[rewardTier] || null;
  const hasReward  = !!rewardTier && rewardTier !== "warming_up";
  const hasTier    = !!rewardTier;

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000; }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);} }
        @keyframes spin      { to{transform:rotate(360deg);} }
        @keyframes successPop{ 0%{transform:scale(0.5);opacity:0;}70%{transform:scale(1.1);}100%{transform:scale(1);opacity:1;} }
        @keyframes tierGlow  { 0%,100%{box-shadow:0 0 20px var(--tc,rgba(255,26,26,0.2))} 50%{box-shadow:0 0 40px var(--tc,rgba(255,26,26,0.4))} }
        input:-webkit-autofill,textarea:-webkit-autofill{-webkit-box-shadow:0 0 0 100px #0d0d0d inset!important;-webkit-text-fill-color:#fff!important;}
        .field-input:focus{border-color:#FF1A1A!important;box-shadow:0 0 0 3px rgba(255,26,26,0.12)!important;}
        .field-input::placeholder{color:rgba(255,255,255,0.2);}
        .submit-btn:hover:not(:disabled){background:#cc0000!important;transform:translateY(-1px);box-shadow:0 12px 35px rgba(255,26,26,0.5)!important;}
        .submit-btn:disabled{opacity:0.6;cursor:not-allowed;}
        .back-btn:hover{color:#FF1A1A!important;}
        .auth-link:hover{color:#FF1A1A!important;}
        .role-btn:hover{border-color:rgba(255,26,26,0.4)!important;}
        .spec-btn:hover{border-color:rgba(255,26,26,0.4)!important;}
      `}</style>

      <div style={s.grid} />
      <div style={s.wrap}>

        {/* ── Left panel ── */}
        <div style={s.left}>
          <Link to="/" style={s.logo}>
            <div style={s.logoBox}>FZ</div>
            <div>
              <div style={s.logoName}>FITZONE</div>
              <div style={s.logoSub}>GYM</div>
            </div>
          </Link>

          <div style={s.leftContent}>
            <h1 style={s.leftTitle}>
              JOIN THE<br />
              <span style={s.leftRed}>ZONE.</span>
            </h1>
            <p style={s.leftSub}>
              {form.role === "trainer"
                ? "Share your expertise.\nHelp members reach their goals."
                : "2,400+ members can't be wrong.\nFirst session is free."}
            </p>

            {/* ── Reward tier banner on left panel ── */}
            {hasTier && form.role === "customer" && (
              <div style={{
                ...s.tierBanner,
                border:     `1.5px solid ${tierMeta.color}40`,
                background: `${tierMeta.color}0d`,
                "--tc": `${tierMeta.color}35`,
                animation: "tierGlow 2.5s ease-in-out infinite",
              }}>
                <span style={{ fontSize: "1.4rem" }}>{tierMeta.icon}</span>
                <div>
                  <p style={{ ...s.tierBannerLabel, color: tierMeta.color }}>
                    REWARD LOCKED IN
                  </p>
                  <p style={s.tierBannerTitle}>{tierMeta.label} Tier</p>
                  <p style={s.tierBannerSub}>
                    {hasReward
                      ? "Your discount applies at first payment"
                      : "Perks applied on membership activation"}
                  </p>
                </div>
              </div>
            )}

            {prefillGoal && form.role === "customer" && (
              <div style={s.goalPreview}>
                <span style={s.goalPreviewIcon}>🎯</span>
                <div>
                  <p style={s.goalPreviewLabel}>YOUR GOAL</p>
                  <p style={s.goalPreviewText}>
                    {prefillGoal.charAt(0).toUpperCase() +
                      prefillGoal.slice(1).replace(/-/g, " ")}
                  </p>
                </div>
              </div>
            )}

            <div style={s.perks}>
              {(form.role === "trainer"
                ? [
                    "Set your own hourly rate",
                    "Choose your specialization",
                    "Manage your own schedule",
                    "Build your client base",
                    "Admin reviews & approves your profile",
                  ]
                : [
                    "No joining fee this month",
                    "Free fitness assessment on first visit",
                    "Cancel anytime on monthly plan",
                    "Access to all group classes",
                    ...(hasReward ? [`₹${Number(rewardPeakWpm) >= 100 ? 500 : 300} off your first membership`] : []),
                  ]
              ).map((p, i) => (
                <div key={i} style={s.perk}>
                  <span style={s.perkCheck}>✓</span>
                  <span style={s.perkText}>{p}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={s.circle1} />
          <div style={s.circle2} />
        </div>

        {/* ── Right panel ── */}
        <div style={s.right}>
          <div style={s.card}>

            {/* Role selector */}
            {step === 0 && (
              <div style={s.roleWrap}>
                <p style={s.roleLabel}>I WANT TO</p>
                <div style={s.roleGrid}>
                  {ROLES.map((r) => (
                    <button
                      key={r.value} type="button"
                      className="role-btn"
                      onClick={() => set("role", r.value)}
                      style={{
                        ...s.roleBtn,
                        border:     form.role === r.value ? "2px solid #FF1A1A" : "2px solid rgba(255,255,255,0.08)",
                        background: form.role === r.value ? "rgba(255,26,26,0.1)" : "rgba(255,255,255,0.02)",
                        boxShadow:  form.role === r.value ? "0 0 20px rgba(255,26,26,0.2)" : "none",
                      }}
                    >
                      <span style={{ fontSize: "1.8rem" }}>{r.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: "0.85rem", color: form.role === r.value ? "#fff" : "rgba(255,255,255,0.5)" }}>
                        {r.label}
                      </span>
                      <span style={{ fontSize: "11px", color: form.role === r.value ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)" }}>
                        {r.desc}
                      </span>
                      {form.role === r.value && <span style={s.roleCheck}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step indicator */}
            {!isDoneStep && (
              <div style={s.stepBar}>
                {STEPS.map((label, i) => (
                  <div key={i} style={s.stepItem}>
                    <div style={{
                      ...s.stepDot,
                      background: i <= step ? "#FF1A1A" : "rgba(255,255,255,0.1)",
                      border:     i === step ? "2px solid #FF1A1A" : "2px solid transparent",
                      boxShadow:  i === step ? "0 0 12px rgba(255,26,26,0.5)" : "none",
                    }}>
                      {i < step ? "✓" : i + 1}
                    </div>
                    <span style={{ ...s.stepLabel, color: i <= step ? "#fff" : "rgba(255,255,255,0.3)" }}>
                      {label}
                    </span>
                    {i < STEPS.length - 1 && (
                      <div style={{ ...s.stepLine, background: i < step ? "#FF1A1A" : "rgba(255,255,255,0.08)" }} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div style={s.errorBox}>
                <span>⚠️</span><span>{error}</span>
              </div>
            )}

            {/* STEP 0: Account */}
            {step === 0 && (
              <form onSubmit={handleNext} style={s.form}>
                <div style={s.cardHeader}>
                  <span style={s.cardTag}>STEP 1 OF {totalSteps}</span>
                  <h2 style={s.cardTitle}>Create Account</h2>
                  <p style={s.cardSub}>Set up your login credentials</p>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Username</label>
                  <input className="field-input" type="text" value={form.username}
                    onChange={(e) => set("username", e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                    placeholder="yourname123" required minLength={3} maxLength={50} style={s.input} />
                  <span style={s.hint}>Letters, numbers, underscores only</span>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Email Address</label>
                  <input className="field-input" type="email" value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@example.com" required style={s.input} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Password</label>
                  <div style={s.inputWrap}>
                    <input className="field-input"
                      type={showPass ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      placeholder="••••••••" required
                      style={{ ...s.input, paddingRight: "48px" }} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={s.togglePass}>
                      {showPass ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {form.password.length > 0 && (
                    <div style={s.pwChecks}>
                      {[
                        { key: "length",    label: "8+ characters" },
                        { key: "uppercase", label: "Uppercase" },
                        { key: "lowercase", label: "Lowercase" },
                        { key: "number",    label: "Number" },
                      ].map(({ key, label }) => (
                        <div key={key} style={s.pwCheck}>
                          <span style={{ color: pwChecks[key] ? "#22C55E" : "rgba(255,255,255,0.25)" }}>
                            {pwChecks[key] ? "✓" : "○"}
                          </span>
                          <span style={{ fontSize: "12px", color: pwChecks[key] ? "#22C55E" : "rgba(255,255,255,0.3)" }}>
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit" className="submit-btn" style={s.submitBtn}>
                  Continue →
                </button>
                <p style={s.switchText}>
                  Already have an account?{" "}
                  <Link to="/login" className="auth-link" style={s.switchLink}>Sign in</Link>
                </p>
              </form>
            )}

            {/* STEP 1: Personal */}
            {step === 1 && (
              <form onSubmit={isSubmitStep ? handleSubmit : handleNext} style={s.form}>
                <div style={s.cardHeader}>
                  <span style={s.cardTag}>STEP 2 OF {totalSteps}</span>
                  <h2 style={s.cardTitle}>Personal Info</h2>
                  <p style={s.cardSub}>Tell us a bit about yourself</p>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Full Name</label>
                  <input className="field-input" type="text" value={form.full_name}
                    onChange={(e) => set("full_name", e.target.value)}
                    placeholder="Rahul Kumar" style={s.input} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Phone Number</label>
                  <input className="field-input" type="tel" value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+919876543210" maxLength={15} style={s.input} />
                </div>

                {/* ── Reward summary before submit ── */}
                {isSubmitStep && hasTier && form.role === "customer" && (
                  <div style={{
                    ...s.rewardSummaryBox,
                    border:     `1px solid ${tierMeta.color}30`,
                    background: `${tierMeta.color}08`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "1rem" }}>{tierMeta.icon}</span>
                      <span style={{
                        fontSize: "10px", fontWeight: 800, letterSpacing: "2px",
                        color: tierMeta.color, fontFamily: "'DM Sans', sans-serif",
                      }}>
                        {tierMeta.label.toUpperCase()} REWARD WILL BE SAVED
                      </span>
                    </div>
                    <div style={s.rewardSummaryItems}>
                      <span style={s.rewardSummaryItem}>✓ Free fitness assessment</span>
                      <span style={s.rewardSummaryItem}>✓ No joining fee</span>
                      {Number(rewardPeakWpm) >= 50  && <span style={s.rewardSummaryItem}>✓ 30 days free locker</span>}
                      {Number(rewardPeakWpm) >= 80  && <span style={s.rewardSummaryItem}>✓ ₹{Number(rewardPeakWpm) >= 100 ? 500 : 300} off first membership</span>}
                      {Number(rewardPeakWpm) >= 100 && <span style={s.rewardSummaryItem}>✓ 1 free PT session</span>}
                    </div>
                  </div>
                )}

                <div style={s.twoCol}>
                  <button type="button" className="back-btn" onClick={() => setStep(0)} style={s.backBtn}>
                    ← Back
                  </button>
                  <button type="submit" className="submit-btn" disabled={loading} style={s.submitBtn}>
                    {loading
                      ? <span style={s.spinnerWrap}><span style={s.spinner} />Creating...</span>
                      : isSubmitStep ? "Create Account →" : "Continue →"}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Professional (trainer only — unchanged) */}
            {step === 2 && form.role === "trainer" && (
              <form onSubmit={handleSubmit} style={s.form}>
                <div style={s.cardHeader}>
                  <span style={s.cardTag}>STEP 3 OF {totalSteps}</span>
                  <h2 style={s.cardTitle}>Professional Info</h2>
                  <p style={s.cardSub}>Help admin verify your qualifications</p>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Specialization <span style={{ color: "#FF1A1A" }}>*</span></label>
                  <div style={s.specGrid}>
                    {SPECIALIZATIONS.map((spec) => (
                      <button key={spec} type="button" className="spec-btn"
                        onClick={() => set("specialization", spec)}
                        style={{
                          ...s.specBtn,
                          border:     form.specialization === spec ? "1.5px solid #FF1A1A" : "1.5px solid rgba(255,255,255,0.08)",
                          background: form.specialization === spec ? "rgba(255,26,26,0.1)" : "rgba(255,255,255,0.02)",
                          color:      form.specialization === spec ? "#fff" : "rgba(255,255,255,0.4)",
                        }}>
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Years of Experience <span style={{ color: "#FF1A1A" }}>*</span></label>
                  <input className="field-input" type="number" value={form.experience_years}
                    onChange={(e) => set("experience_years", e.target.value)}
                    placeholder="e.g. 3" min={0} max={50} required style={s.input} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Certifications <span style={{ color: "#FF1A1A" }}>*</span></label>
                  <textarea className="field-input" value={form.certifications}
                    onChange={(e) => set("certifications", e.target.value)}
                    placeholder="e.g. ACE Certified, NASM-CPT..."
                    required rows={3} style={{ ...s.input, resize: "vertical", lineHeight: 1.6 }} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Bio</label>
                  <textarea className="field-input" value={form.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    placeholder="Your training philosophy..." rows={3}
                    style={{ ...s.input, resize: "vertical", lineHeight: 1.6 }} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Availability</label>
                  <input className="field-input" type="text" value={form.availability}
                    onChange={(e) => set("availability", e.target.value)}
                    placeholder="Mon-Fri 6am-2pm" style={s.input} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Hourly Rate (₹)</label>
                  <input className="field-input" type="number" value={form.hourly_rate}
                    onChange={(e) => set("hourly_rate", e.target.value)}
                    placeholder="e.g. 500" min={0} style={s.input} />
                </div>
                <div style={s.twoCol}>
                  <button type="button" className="back-btn" onClick={() => setStep(1)} style={s.backBtn}>
                    ← Back
                  </button>
                  <button type="submit" className="submit-btn"
                    disabled={loading || !form.specialization} style={s.submitBtn}>
                    {loading
                      ? <span style={s.spinnerWrap}><span style={s.spinner} />Submitting...</span>
                      : "Submit Application →"}
                  </button>
                </div>
              </form>
            )}

            {/* Done */}
            {isDoneStep && (
              <div style={s.success}>
                <div style={{
                  ...s.successIcon,
                  background: form.role === "trainer" ? "rgba(255,183,0,0.1)" : "rgba(34,197,94,0.1)",
                  border:     form.role === "trainer" ? "2px solid #FFB700" : "2px solid #22C55E",
                  color:      form.role === "trainer" ? "#FFB700" : "#22C55E",
                }}>
                  {form.role === "trainer" ? "⏳" : "✓"}
                </div>
                <h2 style={s.successTitle}>
                  {form.role === "trainer" ? "APPLICATION SENT!" : "YOU'RE IN!"}
                </h2>
                <p style={s.successText}>
                  {form.role === "trainer"
                    ? "Your trainer profile has been submitted for review."
                    : "Welcome to FitZone Gym. Redirecting to your dashboard..."}
                </p>
                {form.role === "customer" && hasTier && (
                  <div style={{
                    ...s.rewardSummaryBox,
                    border: `1px solid ${tierMeta.color}40`,
                    background: `${tierMeta.color}0a`,
                    marginTop: "1rem",
                  }}>
                    <p style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "2px", color: tierMeta.color, marginBottom: "6px" }}>
                      {tierMeta.icon} YOUR REWARDS ARE SAVED
                    </p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                      Check your dashboard to see all your perks.
                    </p>
                  </div>
                )}
                {form.role !== "trainer" && <div style={s.successSpinner} />}
              </div>
            )}

            <p style={s.backLink}>
              <Link to="/" className="auth-link" style={s.homeLink}>← Back to FitZone Gym</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────
const s = {
  root:       { fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#000", color: "#F5F5F0", display: "flex", position: "relative", overflow: "hidden" },
  grid:       { position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(255,26,26,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,26,26,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" },
  wrap:       { display: "flex", width: "100%", minHeight: "100vh", position: "relative", zIndex: 1 },
  left:       { flex: "1", background: "linear-gradient(135deg, #0a0000 0%, #000 60%)", borderRight: "1px solid rgba(255,26,26,0.1)", padding: "2.5rem", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" },
  logo:       { display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", marginBottom: "auto" },
  logoBox:    { width: "44px", height: "44px", background: "linear-gradient(135deg, #FF1A1A, #991111)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", color: "#fff", boxShadow: "0 4px 20px rgba(255,26,26,0.4)" },
  logoName:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", letterSpacing: "3px", color: "#fff", lineHeight: 1 },
  logoSub:    { fontSize: "9px", letterSpacing: "4px", color: "#FF1A1A", fontWeight: 600 },
  leftContent:{ marginTop: "auto", marginBottom: "auto", animation: "fadeUp 0.8s ease forwards" },
  leftTitle:  { fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem, 5vw, 5.5rem)", lineHeight: 0.9, letterSpacing: "-1px", color: "#fff", marginBottom: "1.5rem" },
  leftRed:    { background: "linear-gradient(135deg, #FF1A1A, #FF6B00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  leftSub:    { color: "rgba(255,255,255,0.45)", fontSize: "1rem", lineHeight: 1.7, marginBottom: "1.5rem", whiteSpace: "pre-line" },

  // Tier banner
  tierBanner:      { display: "flex", alignItems: "center", gap: "12px", borderRadius: "12px", padding: "12px 16px", marginBottom: "1.25rem" },
  tierBannerLabel: { fontSize: "9px", fontWeight: 800, letterSpacing: "3px", fontFamily: "'DM Sans', sans-serif", marginBottom: "2px" },
  tierBannerTitle: { fontSize: "1rem", fontWeight: 700, color: "#fff" },
  tierBannerSub:   { fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" },

  goalPreview:     { display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,26,26,0.08)", border: "1px solid rgba(255,26,26,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "1.5rem" },
  goalPreviewIcon: { fontSize: "1.5rem" },
  goalPreviewLabel:{ fontSize: "10px", fontWeight: 800, letterSpacing: "2px", color: "#FF1A1A", marginBottom: "2px" },
  goalPreviewText: { fontSize: "0.95rem", fontWeight: 600, color: "#fff" },

  perks:     { display: "flex", flexDirection: "column", gap: "10px" },
  perk:      { display: "flex", alignItems: "center", gap: "10px" },
  perkCheck: { color: "#FF1A1A", fontWeight: 800, fontSize: "14px" },
  perkText:  { color: "rgba(255,255,255,0.55)", fontSize: "0.9rem" },

  circle1: { position: "absolute", width: "400px", height: "400px", borderRadius: "50%", border: "1px solid rgba(255,26,26,0.06)", bottom: "-100px", right: "-100px", pointerEvents: "none" },
  circle2: { position: "absolute", width: "250px", height: "250px", borderRadius: "50%", border: "1px solid rgba(255,26,26,0.1)", bottom: "-30px", right: "-30px", pointerEvents: "none" },

  right: { width: "560px", minWidth: "560px", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "2rem", background: "#000", overflowY: "auto", minHeight: "100vh" },
  card:  { width: "100%", maxWidth: "500px", animation: "fadeUp 0.6s 0.1s ease both", paddingTop: "2rem", paddingBottom: "2rem" },

  roleWrap:  { marginBottom: "1.5rem" },
  roleLabel: { fontSize: "10px", fontWeight: 800, letterSpacing: "3px", color: "rgba(255,255,255,0.35)", marginBottom: "0.75rem" },
  roleGrid:  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" },
  roleBtn:   { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "1.1rem 0.75rem", borderRadius: "12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s ease", position: "relative" },
  roleCheck: { position: "absolute", top: "8px", right: "8px", width: "18px", height: "18px", borderRadius: "50%", background: "#FF1A1A", color: "#fff", fontSize: "10px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" },

  stepBar:   { display: "flex", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "4px" },
  stepItem:  { display: "flex", alignItems: "center", gap: "6px" },
  stepDot:   { width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, color: "#fff", transition: "all 0.3s ease", flexShrink: 0 },
  stepLabel: { fontSize: "10px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", transition: "color 0.3s" },
  stepLine:  { width: "24px", height: "2px", borderRadius: "1px", transition: "background 0.3s", margin: "0 4px" },

  errorBox: { display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,26,26,0.08)", border: "1px solid rgba(255,26,26,0.3)", borderRadius: "8px", padding: "12px 16px", marginBottom: "1.5rem", fontSize: "0.9rem", color: "#ff6b6b" },

  form:       { display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "1rem" },
  cardHeader: { marginBottom: "1.5rem" },
  cardTag:    { display: "inline-block", fontSize: "10px", fontWeight: 800, letterSpacing: "4px", color: "#FF1A1A", background: "rgba(255,26,26,0.08)", border: "1px solid rgba(255,26,26,0.2)", padding: "5px 14px", borderRadius: "100px", marginBottom: "1rem" },
  cardTitle:  { fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.5rem", letterSpacing: "2px", color: "#fff", marginBottom: "0.4rem" },
  cardSub:    { fontSize: "0.9rem", color: "rgba(255,255,255,0.4)" },

  field:    { display: "flex", flexDirection: "column", gap: "8px" },
  label:    { fontSize: "12px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" },
  hint:     { fontSize: "11px", color: "rgba(255,255,255,0.2)" },
  inputWrap:{ position: "relative" },
  input:    { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "14px 16px", color: "#fff", fontSize: "0.95rem", fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s, box-shadow 0.2s", outline: "none" },
  togglePass:{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "rgba(255,255,255,0.3)" },

  pwChecks: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "4px" },
  pwCheck:  { display: "flex", alignItems: "center", gap: "6px" },

  specGrid: { display: "flex", flexWrap: "wrap", gap: "8px" },
  specBtn:  { padding: "7px 14px", borderRadius: "100px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 600, transition: "all 0.2s ease" },

  // Reward summary box (step 1 + done step)
  rewardSummaryBox:   { borderRadius: "10px", padding: "14px 16px" },
  rewardSummaryItems: { display: "flex", flexDirection: "column", gap: "4px" },
  rewardSummaryItem:  { fontSize: "12px", color: "rgba(255,255,255,0.55)", fontFamily: "'DM Sans', sans-serif" },

  twoCol:   { display: "flex", gap: "1rem", marginTop: "0.5rem" },
  backBtn:  { flex: "0 0 auto", padding: "15px 20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", transition: "color 0.2s" },
  submitBtn:{ flex: 1, padding: "15px", background: "linear-gradient(135deg, #FF1A1A, #cc0000)", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "1rem", border: "none", borderRadius: "10px", cursor: "pointer", boxShadow: "0 6px 25px rgba(255,26,26,0.35)", transition: "all 0.2s" },

  spinnerWrap: { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" },
  spinner:     { width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" },

  switchText: { textAlign: "center", fontSize: "13px", color: "rgba(255,255,255,0.35)" },
  switchLink: { color: "#FF1A1A", textDecoration: "none", fontWeight: 700 },

  success:      { textAlign: "center", padding: "2rem 0 1rem" },
  successIcon:  { width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", margin: "0 auto 1.5rem", animation: "successPop 0.5s ease forwards" },
  successTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.8rem", letterSpacing: "4px", color: "#fff", marginBottom: "0.75rem" },
  successText:  { color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: "1.5rem", fontSize: "0.95rem" },
  successSpinner:{ width: "24px", height: "24px", border: "2px solid rgba(255,26,26,0.2)", borderTop: "2px solid #FF1A1A", borderRadius: "50%", margin: "0 auto", animation: "spin 0.8s linear infinite" },

  backLink: { textAlign: "center", marginTop: "1.5rem" },
  homeLink: { fontSize: "13px", color: "rgba(255,255,255,0.3)", textDecoration: "none" },
};