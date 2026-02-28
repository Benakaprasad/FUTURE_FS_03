import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const STEPS = ["Account", "Personal", "Done"];

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [params]     = useSearchParams();

  const prefillName = params.get("name") || "";
  const prefillGoal = params.get("goal") || "";

  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    username:   "",
    email:      "",
    password:   "",
    full_name:  prefillName,
    phone:      "",
    goal:       prefillGoal,
  });

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  // Live password validation
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
    if (step === 0 && !pwValid) {
      setError("Password does not meet requirements.");
      return;
    }
    setStep((p) => p + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({
        username:  form.username,
        email:     form.email,
        password:  form.password,
        full_name: form.full_name,
        phone:     form.phone,
      });
      setStep(2);
      setTimeout(() => navigate("/dashboard", { replace: true }), 1800);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes successPop { 0% { transform:scale(0.5); opacity:0; } 70% { transform:scale(1.1); } 100% { transform:scale(1); opacity:1; } }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #0d0d0d inset !important;
          -webkit-text-fill-color: #fff !important;
        }
        .field-input:focus {
          border-color: #FF1A1A !important;
          box-shadow: 0 0 0 3px rgba(255,26,26,0.12) !important;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.2); }
        .submit-btn:hover:not(:disabled) {
          background: #cc0000 !important;
          transform: translateY(-1px);
          box-shadow: 0 12px 35px rgba(255,26,26,0.5) !important;
        }
        .submit-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .back-btn:hover { color: #FF1A1A !important; }
        .auth-link:hover { color: #FF1A1A !important; }
      `}</style>

      <div style={s.grid} />

      <div style={s.wrap}>

        {/* Left branding */}
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
              2,400+ members can't be wrong.<br />
              First session is free.
            </p>

            {prefillGoal && (
              <div style={s.goalPreview}>
                <span style={s.goalPreviewIcon}>🎯</span>
                <div>
                  <p style={s.goalPreviewLabel}>YOUR GOAL</p>
                  <p style={s.goalPreviewText}>
                    {prefillGoal.charAt(0).toUpperCase() + prefillGoal.slice(1).replace(/-/g, " ")}
                  </p>
                </div>
              </div>
            )}

            <div style={s.perks}>
              {[
                "No joining fee this month",
                "Free first session",
                "Cancel anytime",
                "Access to all group classes",
              ].map((perk, i) => (
                <div key={i} style={s.perk}>
                  <span style={s.perkCheck}>✓</span>
                  <span style={s.perkText}>{perk}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={s.circle1} />
          <div style={s.circle2} />
        </div>

        {/* Right form */}
        <div style={s.right}>
          <div style={s.card}>

            {/* Step indicator */}
            <div style={s.stepBar}>
              {STEPS.map((label, i) => (
                <div key={i} style={s.stepItem}>
                  <div style={{
                    ...s.stepDot,
                    background: i <= step ? "#FF1A1A" : "rgba(255,255,255,0.1)",
                    border: i === step ? "2px solid #FF1A1A" : "2px solid transparent",
                    boxShadow: i === step ? "0 0 12px rgba(255,26,26,0.5)" : "none",
                  }}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span style={{
                    ...s.stepLabel,
                    color: i <= step ? "#fff" : "rgba(255,255,255,0.3)",
                  }}>{label}</span>
                  {i < STEPS.length - 1 && (
                    <div style={{
                      ...s.stepLine,
                      background: i < step ? "#FF1A1A" : "rgba(255,255,255,0.08)",
                    }} />
                  )}
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div style={s.errorBox}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* ── Step 0: Account ── */}
            {step === 0 && (
              <form onSubmit={handleNext} style={s.form}>
                <div style={s.cardHeader}>
                  <span style={s.cardTag}>STEP 1 OF 2</span>
                  <h2 style={s.cardTitle}>Create Account</h2>
                  <p style={s.cardSub}>Set up your login credentials</p>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Username</label>
                  <input className="field-input" type="text"
                    value={form.username}
                    onChange={(e) => set("username", e.target.value)}
                    placeholder="yourname123"
                    required minLength={3} maxLength={50}
                    style={s.input}
                  />
                  <span style={s.hint}>Letters, numbers, underscores only</span>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Email Address</label>
                  <input className="field-input" type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@example.com"
                    required style={s.input}
                  />
                </div>

                <div style={s.field}>
                  <label style={s.label}>Password</label>
                  <div style={s.inputWrap}>
                    <input className="field-input"
                      type={showPass ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      placeholder="••••••••"
                      required style={{ ...s.input, paddingRight: "48px" }}
                    />
                    <button type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={s.togglePass}>
                      {showPass ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {/* Live checks */}
                  {form.password.length > 0 && (
                    <div style={s.pwChecks}>
                      {[
                        { key: "length",    label: "8+ characters" },
                        { key: "uppercase", label: "Uppercase letter" },
                        { key: "lowercase", label: "Lowercase letter" },
                        { key: "number",    label: "Number" },
                      ].map(({ key, label }) => (
                        <div key={key} style={s.pwCheck}>
                          <span style={{ color: pwChecks[key] ? "#22C55E" : "rgba(255,255,255,0.25)" }}>
                            {pwChecks[key] ? "✓" : "○"}
                          </span>
                          <span style={{
                            fontSize: "12px",
                            color: pwChecks[key] ? "#22C55E" : "rgba(255,255,255,0.3)",
                          }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button type="submit" className="submit-btn" style={s.submitBtn}>
                  Continue →
                </button>

                <p style={s.switchText}>
                  Already a member?{" "}
                  <Link to="/login" className="auth-link" style={s.switchLink}>Sign in</Link>
                </p>
              </form>
            )}

            {/* ── Step 1: Personal ── */}
            {step === 1 && (
              <form onSubmit={handleSubmit} style={s.form}>
                <div style={s.cardHeader}>
                  <span style={s.cardTag}>STEP 2 OF 2</span>
                  <h2 style={s.cardTitle}>Personal Info</h2>
                  <p style={s.cardSub}>Help us personalise your experience</p>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Full Name</label>
                  <input className="field-input" type="text"
                    value={form.full_name}
                    onChange={(e) => set("full_name", e.target.value)}
                    placeholder="Rahul Kumar"
                    style={s.input}
                  />
                </div>

                <div style={s.field}>
                  <label style={s.label}>Phone Number</label>
                  <input className="field-input" type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    style={s.input}
                  />
                </div>

                <div style={s.twoCol}>
                  <button type="button" className="back-btn"
                    onClick={() => setStep(0)}
                    style={s.backBtn}>
                    ← Back
                  </button>
                  <button type="submit" className="submit-btn"
                    disabled={loading} style={s.submitBtn}>
                    {loading ? (
                      <span style={s.spinnerWrap}>
                        <span style={s.spinner} />
                        Creating...
                      </span>
                    ) : "Create Account →"}
                  </button>
                </div>
              </form>
            )}

            {/* ── Step 2: Success ── */}
            {step === 2 && (
              <div style={s.success}>
                <div style={s.successIcon}>✓</div>
                <h2 style={s.successTitle}>YOU'RE IN!</h2>
                <p style={s.successText}>
                  Welcome to FitZone Gym.<br />
                  Redirecting to your dashboard...
                </p>
                <div style={s.successSpinner} />
              </div>
            )}

            <p style={s.backLink}>
              <Link to="/" className="auth-link" style={s.homeLink}>
                ← Back to FitZone Gym
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    minHeight: "100vh",
    background: "#000",
    color: "#F5F5F0",
    display: "flex",
    position: "relative",
    overflow: "hidden",
  },
  grid: {
    position: "fixed", inset: 0,
    backgroundImage: "linear-gradient(rgba(255,26,26,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,26,26,0.03) 1px, transparent 1px)",
    backgroundSize: "60px 60px",
    pointerEvents: "none",
  },
  wrap: { display: "flex", width: "100%", minHeight: "100vh", position: "relative", zIndex: 1 },

  left: {
    flex: "1",
    background: "linear-gradient(135deg, #0a0000 0%, #000 60%)",
    borderRight: "1px solid rgba(255,26,26,0.1)",
    padding: "2.5rem",
    display: "flex", flexDirection: "column",
    position: "relative", overflow: "hidden",
  },
  logo: { display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", marginBottom: "auto" },
  logoBox: {
    width: "44px", height: "44px",
    background: "linear-gradient(135deg, #FF1A1A, #991111)",
    borderRadius: "8px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", color: "#fff",
    boxShadow: "0 4px 20px rgba(255,26,26,0.4)",
  },
  logoName: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", letterSpacing: "3px", color: "#fff", lineHeight: 1 },
  logoSub:  { fontSize: "9px", letterSpacing: "4px", color: "#FF1A1A", fontWeight: 600 },
  leftContent: { marginTop: "auto", marginBottom: "auto", animation: "fadeUp 0.8s ease forwards" },
  leftTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "clamp(3rem, 5vw, 5.5rem)",
    lineHeight: 0.9, letterSpacing: "-1px",
    color: "#fff", marginBottom: "1.5rem",
  },
  leftRed: {
    background: "linear-gradient(135deg, #FF1A1A, #FF6B00)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
  },
  leftSub: { color: "rgba(255,255,255,0.45)", fontSize: "1rem", lineHeight: 1.7, marginBottom: "2rem" },
  goalPreview: {
    display: "flex", alignItems: "center", gap: "12px",
    background: "rgba(255,26,26,0.08)",
    border: "1px solid rgba(255,26,26,0.2)",
    borderRadius: "10px", padding: "12px 16px",
    marginBottom: "2rem",
  },
  goalPreviewIcon: { fontSize: "1.5rem" },
  goalPreviewLabel: { fontSize: "10px", fontWeight: 800, letterSpacing: "2px", color: "#FF1A1A", marginBottom: "2px" },
  goalPreviewText: { fontSize: "0.95rem", fontWeight: 600, color: "#fff" },
  perks: { display: "flex", flexDirection: "column", gap: "10px" },
  perk:  { display: "flex", alignItems: "center", gap: "10px" },
  perkCheck: { color: "#FF1A1A", fontWeight: 800, fontSize: "14px" },
  perkText:  { color: "rgba(255,255,255,0.55)", fontSize: "0.9rem" },
  circle1: { position: "absolute", width: "400px", height: "400px", borderRadius: "50%", border: "1px solid rgba(255,26,26,0.06)", bottom: "-100px", right: "-100px", pointerEvents: "none" },
  circle2: { position: "absolute", width: "250px", height: "250px", borderRadius: "50%", border: "1px solid rgba(255,26,26,0.1)", bottom: "-30px", right: "-30px", pointerEvents: "none" },

  right: {
    width: "520px", minWidth: "520px",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "2rem", background: "#000",
  },
  card: { width: "100%", maxWidth: "460px", animation: "fadeUp 0.6s 0.1s ease both" },

  stepBar: { display: "flex", alignItems: "center", marginBottom: "2rem" },
  stepItem: { display: "flex", alignItems: "center", gap: "8px" },
  stepDot: {
    width: "32px", height: "32px", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "12px", fontWeight: 800, color: "#fff",
    transition: "all 0.3s ease", flexShrink: 0,
  },
  stepLabel: { fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", transition: "color 0.3s" },
  stepLine: { width: "32px", height: "2px", borderRadius: "1px", transition: "background 0.3s", margin: "0 8px" },

  errorBox: {
    display: "flex", alignItems: "center", gap: "10px",
    background: "rgba(255,26,26,0.08)", border: "1px solid rgba(255,26,26,0.3)",
    borderRadius: "8px", padding: "12px 16px", marginBottom: "1.5rem",
    fontSize: "0.9rem", color: "#ff6b6b",
  },

  form: { display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "1rem" },
  cardHeader: { marginBottom: "1.75rem" },
  cardTag: {
    display: "inline-block", fontSize: "10px", fontWeight: 800,
    letterSpacing: "4px", color: "#FF1A1A",
    background: "rgba(255,26,26,0.08)", border: "1px solid rgba(255,26,26,0.2)",
    padding: "5px 14px", borderRadius: "100px", marginBottom: "1rem",
  },
  cardTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.5rem", letterSpacing: "2px", color: "#fff", marginBottom: "0.4rem" },
  cardSub: { fontSize: "0.9rem", color: "rgba(255,255,255,0.4)" },

  field: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "12px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" },
  hint:  { fontSize: "11px", color: "rgba(255,255,255,0.2)" },
  inputWrap: { position: "relative" },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px", padding: "14px 16px",
    color: "#fff", fontSize: "0.95rem",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
  },
  togglePass: {
    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer", fontSize: "16px",
    color: "rgba(255,255,255,0.3)", transition: "color 0.2s", padding: "4px",
  },
  pwChecks: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "4px" },
  pwCheck:  { display: "flex", alignItems: "center", gap: "6px" },

  twoCol: { display: "flex", gap: "1rem", marginTop: "0.5rem" },
  backBtn: {
    flex: "0 0 auto",
    padding: "15px 20px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "rgba(255,255,255,0.5)",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700, fontSize: "0.95rem",
    cursor: "pointer", transition: "color 0.2s",
  },
  submitBtn: {
    flex: 1, padding: "15px",
    background: "linear-gradient(135deg, #FF1A1A, #cc0000)",
    color: "#fff", fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700, fontSize: "1rem",
    border: "none", borderRadius: "10px",
    cursor: "pointer", boxShadow: "0 6px 25px rgba(255,26,26,0.35)",
    transition: "all 0.2s",
  },
  spinnerWrap: { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" },
  spinner: {
    width: "18px", height: "18px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff", borderRadius: "50%",
    display: "inline-block", animation: "spin 0.7s linear infinite",
  },

  switchText: { textAlign: "center", fontSize: "13px", color: "rgba(255,255,255,0.35)" },
  switchLink: { color: "#FF1A1A", textDecoration: "none", fontWeight: 700 },

  success: { textAlign: "center", padding: "2rem 0 1rem" },
  successIcon: {
    width: "80px", height: "80px", borderRadius: "50%",
    background: "rgba(34,197,94,0.1)", border: "2px solid #22C55E",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "2rem", color: "#22C55E",
    margin: "0 auto 1.5rem",
    animation: "successPop 0.5s ease forwards",
  },
  successTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "3rem", letterSpacing: "4px", color: "#fff", marginBottom: "0.75rem" },
  successText: { color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: "1.5rem" },
  successSpinner: {
    width: "24px", height: "24px",
    border: "2px solid rgba(255,26,26,0.2)", borderTop: "2px solid #FF1A1A",
    borderRadius: "50%", margin: "0 auto",
    animation: "spin 0.8s linear infinite",
  },

  backLink: { textAlign: "center", marginTop: "1.5rem" },
  homeLink: { fontSize: "13px", color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" },
};