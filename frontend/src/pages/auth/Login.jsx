import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [params]     = useSearchParams();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

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
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        @keyframes spin   { to { transform: rotate(360deg); } }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #0d0d0d inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff;
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
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .toggle-pass:hover { color: #FF1A1A !important; }
        .auth-link:hover { color: #FF1A1A !important; }
      `}</style>

      {/* Background grid */}
      <div style={s.grid} />
      <div style={s.diag} />

      <div style={s.wrap}>

        {/* Left panel — branding */}
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
              WELCOME<br />
              <span style={s.leftRed}>BACK.</span>
            </h1>
            <p style={s.leftSub}>
              Your zone is waiting.<br />
              Pick up where you left off.
            </p>

            <div style={s.leftStats}>
              {[
                { value: "2,400+", label: "Members" },
                { value: "48",     label: "Trainers" },
                { value: "24/7",   label: "Access" },
              ].map((stat, i) => (
                <div key={i} style={s.leftStat}>
                  <span style={s.leftStatVal}>{stat.value}</span>
                  <span style={s.leftStatLabel}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative circles */}
          <div style={s.circle1} />
          <div style={s.circle2} />
        </div>

        {/* Right panel — form */}
        <div style={s.right}>
          <div style={s.card}>

            <div style={s.cardHeader}>
              <span style={s.cardTag}>MEMBER LOGIN</span>
              <h2 style={s.cardTitle}>Sign In</h2>
              <p style={s.cardSub}>Enter your credentials to access your account</p>
            </div>

            {/* Error */}
            {error && (
              <div style={s.errorBox}>
                <span style={s.errorIcon}>!</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={s.form}>

              {/* Email */}
              <div style={s.field}>
                <label style={s.label}>Email Address</label>
                <input
                  className="field-input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  style={s.input}
                />
              </div>

              {/* Password */}
              <div style={s.field}>
                <div style={s.labelRow}>
                  <label style={s.label}>Password</label>
                  <Link to="/forgot-password" className="auth-link" style={s.forgotLink}>
                    Forgot password?
                  </Link>
                </div>
                <div style={s.inputWrap}>
                  <input
                    className="field-input"
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    style={{ ...s.input, paddingRight: "48px" }}
                  />
                  <button
                    type="button"
                    className="toggle-pass"
                    onClick={() => setShowPass(!showPass)}
                    style={s.togglePass}
                  >
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
                style={s.submitBtn}
              >
                {loading ? (
                  <span style={s.spinnerWrap}>
                    <span style={s.spinner} />
                    Signing in...
                  </span>
                ) : (
                  "Sign In →"
                )}
              </button>

            </form>

            {/* Divider */}
            <div style={s.divider}>
              <div style={s.dividerLine} />
              <span style={s.dividerText}>New to FitZone?</span>
              <div style={s.dividerLine} />
            </div>

            <Link to="/register" style={s.registerBtn}>
              Create an Account
            </Link>

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
  diag: {
    position: "fixed", inset: 0,
    background: "linear-gradient(135deg, transparent 50%, rgba(255,26,26,0.02) 100%)",
    pointerEvents: "none",
  },
  wrap: {
    display: "flex",
    width: "100%",
    minHeight: "100vh",
    position: "relative",
    zIndex: 1,
  },

  // LEFT
  left: {
    flex: "1",
    background: "linear-gradient(135deg, #0a0000 0%, #000 60%)",
    borderRight: "1px solid rgba(255,26,26,0.1)",
    padding: "2.5rem",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    minHeight: "100vh",
  },
  logo: {
    display: "flex", alignItems: "center", gap: "12px",
    textDecoration: "none", marginBottom: "auto",
  },
  logoBox: {
    width: "44px", height: "44px",
    background: "linear-gradient(135deg, #FF1A1A, #991111)",
    borderRadius: "8px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "18px", color: "#fff",
    boxShadow: "0 4px 20px rgba(255,26,26,0.4)",
  },
  logoName: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "20px", letterSpacing: "3px", color: "#fff", lineHeight: 1,
  },
  logoSub: {
    fontSize: "9px", letterSpacing: "4px", color: "#FF1A1A", fontWeight: 600,
  },
  leftContent: {
    marginTop: "auto", marginBottom: "auto",
    animation: "fadeUp 0.8s ease forwards",
  },
  leftTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "clamp(3.5rem, 6vw, 6rem)",
    lineHeight: 0.9, letterSpacing: "-1px",
    color: "#fff", marginBottom: "1.5rem",
  },
  leftRed: {
    background: "linear-gradient(135deg, #FF1A1A, #FF6B00)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  leftSub: {
    color: "rgba(255,255,255,0.45)",
    fontSize: "1rem", lineHeight: 1.7,
    marginBottom: "3rem",
  },
  leftStats: {
    display: "flex", gap: "2rem",
  },
  leftStat: {
    display: "flex", flexDirection: "column", gap: "4px",
  },
  leftStatVal: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "2rem", color: "#fff", letterSpacing: "-1px",
  },
  leftStatLabel: {
    fontSize: "11px", letterSpacing: "2px",
    color: "rgba(255,255,255,0.35)", fontWeight: 600,
    textTransform: "uppercase",
  },
  circle1: {
    position: "absolute",
    width: "400px", height: "400px",
    borderRadius: "50%",
    border: "1px solid rgba(255,26,26,0.06)",
    bottom: "-100px", right: "-100px",
    pointerEvents: "none",
  },
  circle2: {
    position: "absolute",
    width: "250px", height: "250px",
    borderRadius: "50%",
    border: "1px solid rgba(255,26,26,0.1)",
    bottom: "-30px", right: "-30px",
    pointerEvents: "none",
  },

  // RIGHT
  right: {
    width: "480px",
    minWidth: "480px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    background: "#000",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    animation: "fadeUp 0.6s 0.1s ease both",
  },
  cardHeader: { marginBottom: "2rem" },
  cardTag: {
    display: "inline-block",
    fontSize: "10px", fontWeight: 800,
    letterSpacing: "4px", color: "#FF1A1A",
    background: "rgba(255,26,26,0.08)",
    border: "1px solid rgba(255,26,26,0.2)",
    padding: "5px 14px", borderRadius: "100px",
    marginBottom: "1rem",
  },
  cardTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "2.8rem", letterSpacing: "2px",
    color: "#fff", marginBottom: "0.5rem",
  },
  cardSub: {
    fontSize: "0.9rem", color: "rgba(255,255,255,0.4)",
  },

  errorBox: {
    display: "flex", alignItems: "center", gap: "10px",
    background: "rgba(255,26,26,0.08)",
    border: "1px solid rgba(255,26,26,0.3)",
    borderRadius: "8px", padding: "12px 16px",
    marginBottom: "1.5rem",
    fontSize: "0.9rem", color: "#ff6b6b",
  },
  errorIcon: {
    width: "20px", height: "20px",
    borderRadius: "50%",
    background: "#FF1A1A",
    color: "#fff", fontWeight: 800,
    fontSize: "12px",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },

  form: { display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "1.5rem" },
  field: { display: "flex", flexDirection: "column", gap: "8px" },
  labelRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  label: {
    fontSize: "12px", fontWeight: 700,
    letterSpacing: "1px", textTransform: "uppercase",
    color: "rgba(255,255,255,0.5)",
  },
  forgotLink: {
    fontSize: "12px", color: "rgba(255,255,255,0.35)",
    textDecoration: "none", transition: "color 0.2s",
  },
  inputWrap: { position: "relative" },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    padding: "14px 16px",
    color: "#fff",
    fontSize: "0.95rem",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
  },
  togglePass: {
    position: "absolute", right: "12px", top: "50%",
    transform: "translateY(-50%)",
    background: "none", border: "none",
    cursor: "pointer", fontSize: "16px",
    color: "rgba(255,255,255,0.3)",
    transition: "color 0.2s", padding: "4px",
  },
  submitBtn: {
    width: "100%",
    padding: "15px",
    background: "linear-gradient(135deg, #FF1A1A, #cc0000)",
    color: "#fff",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    fontSize: "1rem",
    letterSpacing: "0.5px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    boxShadow: "0 6px 25px rgba(255,26,26,0.35)",
    transition: "all 0.2s",
    marginTop: "0.5rem",
  },
  spinnerWrap: { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" },
  spinner: {
    width: "18px", height: "18px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },

  divider: {
    display: "flex", alignItems: "center", gap: "12px",
    marginBottom: "1rem",
  },
  dividerLine: { flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" },
  dividerText: { fontSize: "12px", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" },

  registerBtn: {
    display: "block",
    width: "100%",
    padding: "14px",
    textAlign: "center",
    textDecoration: "none",
    color: "rgba(255,255,255,0.7)",
    fontWeight: 600,
    fontSize: "0.95rem",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    transition: "all 0.2s",
    marginBottom: "1.5rem",
  },
  backLink: { textAlign: "center" },
  homeLink: {
    fontSize: "13px", color: "rgba(255,255,255,0.3)",
    textDecoration: "none", transition: "color 0.2s",
  },
};