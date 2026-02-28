import { useState, useEffect } from "react";
import DashLayout from "../../components/DashLayout";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

export default function CustomerProfile() {
  const { user } = useAuth();

  const [profile,  setProfile]  = useState({ full_name: "", phone: "" });
  const [pwForm,   setPwForm]   = useState({ current_password: "", new_password: "", confirm: "" });
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [toast,    setToast]    = useState(null);
  const [showPw,   setShowPw]   = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    api.get("/customers/me")
      .then(({ data }) => setProfile({ full_name: data.customer?.full_name || "", phone: data.customer?.phone || "" }))
      .catch(() => setProfile({ full_name: user?.full_name || "", phone: "" }))
      .finally(() => setLoading(false));
  }, [user]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/customers/me", profile);
      showToast("Profile updated successfully.");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) {
      showToast("New passwords do not match.", "error");
      return;
    }
    setPwSaving(true);
    try {
      await api.post("/auth/change-password", {
        current_password: pwForm.current_password,
        new_password:     pwForm.new_password,
      });
      showToast("Password changed successfully.");
      setPwForm({ current_password: "", new_password: "", confirm: "" });
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to change password.", "error");
    } finally {
      setPwSaving(false);
    }
  };

  const pwChecks = {
    length:    pwForm.new_password.length >= 8,
    uppercase: /[A-Z]/.test(pwForm.new_password),
    number:    /[0-9]/.test(pwForm.new_password),
  };

  return (
    <DashLayout title="MY PROFILE" subtitle="Manage your personal information">
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        .save-btn:hover:not(:disabled) { background: #cc0000 !important; transform: translateY(-1px); }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .field-input:focus { border-color: #FF1A1A !important; box-shadow: 0 0 0 3px rgba(255,26,26,0.1) !important; }
        .field-input::placeholder { color: rgba(255,255,255,0.2); }

        /* ── Mobile responsive ── */
        @media (max-width: 768px) {

          /* Two column grid → single column */
          .profile-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }

          /* Avatar card: tighter on mobile */
          .avatar-card {
            padding: 1.1rem !important;
            gap: 0.875rem !important;
          }
          .avatar-circle {
            width: 52px !important;
            height: 52px !important;
            font-size: 1.4rem !important;
          }
          .avatar-name { font-size: 0.9rem !important; }

          /* Cards */
          .profile-card {
            padding: 1.25rem !important;
          }

          /* Password checks: 1 column */
          .pw-checks {
            grid-template-columns: 1fr 1fr !important;
          }

          /* Info rows */
          .info-row {
            padding: 10px 0 !important;
          }
        }
      `}</style>

      {loading ? <Loader /> : (
        <div className="profile-grid" style={ps.grid}>

          {/* ── Left: profile info ── */}
          <div style={ps.col}>

            {/* Avatar card */}
            <div className="avatar-card" style={ps.avatarCard}>
              <div className="avatar-circle" style={ps.avatarCircle}>
                {profile.full_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <h3 className="avatar-name" style={ps.avatarName}>{profile.full_name || user?.username}</h3>
                <p style={ps.avatarEmail}>{user?.email}</p>
                <span style={ps.avatarBadge}>
                  {user?.is_email_verified ? "✓ Email Verified" : "⚠ Email Unverified"}
                </span>
              </div>
            </div>

            {/* Edit profile form */}
            <div className="profile-card" style={ps.card}>
              <h3 style={ps.cardTitle}>PERSONAL INFORMATION</h3>
              <form onSubmit={handleSaveProfile} style={ps.form}>
                <div style={ps.field}>
                  <label style={ps.label}>Full Name</label>
                  <input className="field-input" type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                    placeholder="Your full name"
                    style={ps.input}
                  />
                </div>
                <div style={ps.field}>
                  <label style={ps.label}>Phone Number</label>
                  <input className="field-input" type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    style={ps.input}
                  />
                </div>
                <div style={ps.field}>
                  <label style={ps.label}>Email Address</label>
                  <input type="email" value={user?.email || ""} disabled
                    style={{ ...ps.input, opacity: 0.4, cursor: "not-allowed" }}
                  />
                  <span style={ps.hint}>Email cannot be changed. Contact support.</span>
                </div>
                <div style={ps.field}>
                  <label style={ps.label}>Username</label>
                  <input type="text" value={user?.username || ""} disabled
                    style={{ ...ps.input, opacity: 0.4, cursor: "not-allowed" }}
                  />
                </div>
                <button type="submit" className="save-btn" disabled={saving} style={ps.saveBtn}>
                  {saving ? <Spinner /> : "Save Changes"}
                </button>
              </form>
            </div>
          </div>

          {/* ── Right: change password ── */}
          <div style={ps.col}>
            <div className="profile-card" style={ps.card}>
              <h3 style={ps.cardTitle}>CHANGE PASSWORD</h3>
              <form onSubmit={handleChangePassword} style={ps.form}>
                {[
                  { key: "current_password", label: "Current Password",  placeholder: "Enter current password" },
                  { key: "new_password",      label: "New Password",      placeholder: "Enter new password" },
                  { key: "confirm",           label: "Confirm Password",  placeholder: "Re-enter new password" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} style={ps.field}>
                    <label style={ps.label}>{label}</label>
                    <div style={ps.inputWrap}>
                      <input
                        className="field-input"
                        type={showPw[key] ? "text" : "password"}
                        value={pwForm[key]}
                        onChange={(e) => setPwForm((p) => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        required
                        style={{ ...ps.input, paddingRight: "44px" }}
                      />
                      <button type="button"
                        onClick={() => setShowPw((p) => ({ ...p, [key]: !p[key] }))}
                        style={ps.eyeBtn}>
                        {showPw[key] ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>
                ))}

                {pwForm.new_password.length > 0 && (
                  <div className="pw-checks" style={ps.pwChecks}>
                    {[
                      { key: "length",    label: "8+ characters" },
                      { key: "uppercase", label: "Uppercase letter" },
                      { key: "number",    label: "Number" },
                    ].map(({ key, label }) => (
                      <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ color: pwChecks[key] ? "#22C55E" : "rgba(255,255,255,0.2)", fontSize: "12px" }}>
                          {pwChecks[key] ? "✓" : "○"}
                        </span>
                        <span style={{ fontSize: "12px", color: pwChecks[key] ? "#22C55E" : "rgba(255,255,255,0.3)" }}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <button type="submit" className="save-btn" disabled={pwSaving} style={ps.saveBtn}>
                  {pwSaving ? <Spinner /> : "Change Password"}
                </button>
              </form>
            </div>

            {/* Account info card */}
            <div className="profile-card" style={ps.card}>
              <h3 style={ps.cardTitle}>ACCOUNT DETAILS</h3>
              <div style={ps.infoList}>
                {[
                  { label: "Member Since", value: user?.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—" },
                  { label: "Account Role",  value: user?.role?.toUpperCase() || "—" },
                  { label: "Account Status", value: user?.is_active ? "Active" : "Inactive" },
                ].map((item, i) => (
                  <div className="info-row" key={i} style={ps.infoRow}>
                    <span style={ps.infoLabel}>{item.label}</span>
                    <span style={ps.infoValue}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {toast && (
        <div style={{
          ...ps.toast,
          background: toast.type === "error" ? "rgba(255,26,26,0.95)" : "rgba(34,197,94,0.95)",
        }}>
          {toast.type === "error" ? "✕" : "✓"} {toast.msg}
        </div>
      )}
    </DashLayout>
  );
}

function Loader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
      <div style={{ width: "36px", height: "36px", border: "3px solid rgba(255,26,26,0.2)", borderTop: "3px solid #FF1A1A", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );
}

function Spinner() {
  return (
    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
      <span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
      Saving...
    </span>
  );
}

const ps = {
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "start" },
  col:  { display: "flex", flexDirection: "column", gap: "1.5rem" },
  avatarCard: {
    display: "flex", alignItems: "center", gap: "1.25rem",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "14px", padding: "1.5rem",
  },
  avatarCircle: {
    width: "64px", height: "64px", flexShrink: 0, borderRadius: "50%",
    background: "rgba(255,26,26,0.15)",
    border: "2px solid rgba(255,26,26,0.3)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", color: "#FF1A1A",
  },
  avatarName:  { fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "4px" },
  avatarEmail: { fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "8px" },
  avatarBadge: { fontSize: "11px", fontWeight: 700, color: "#22C55E", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", padding: "3px 10px", borderRadius: "100px" },
  card: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "1.75rem" },
  cardTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "3px", color: "rgba(255,255,255,0.4)", marginBottom: "1.5rem" },
  form:  { display: "flex", flexDirection: "column", gap: "1.25rem" },
  field: { display: "flex", flexDirection: "column", gap: "7px" },
  label: { fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" },
  hint:  { fontSize: "11px", color: "rgba(255,255,255,0.2)" },
  inputWrap: { position: "relative" },
  input: {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)", borderRadius: "9px",
    padding: "13px 15px", color: "#fff", fontSize: "0.9rem",
    fontFamily: "'DM Sans', sans-serif", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  eyeBtn: { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "15px", color: "rgba(255,255,255,0.3)", padding: "4px" },
  pwChecks: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px" },
  saveBtn: {
    padding: "13px", background: "linear-gradient(135deg, #FF1A1A, #cc0000)",
    color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.95rem",
    border: "none", borderRadius: "9px", cursor: "pointer",
    boxShadow: "0 4px 20px rgba(255,26,26,0.3)", transition: "all 0.2s", marginTop: "0.5rem",
  },
  infoList: { display: "flex", flexDirection: "column", gap: "0" },
  infoRow:  { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" },
  infoLabel:{ fontSize: "12px", color: "rgba(255,255,255,0.35)", fontWeight: 600 },
  infoValue:{ fontSize: "0.9rem", color: "#fff", fontWeight: 600 },
  toast: {
    position: "fixed", bottom: "2rem", right: "2rem",
    padding: "14px 22px", borderRadius: "10px",
    color: "#fff", fontWeight: 700, fontSize: "0.875rem",
    boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
    animation: "slideIn 0.3s ease forwards", zIndex: 9999,
  },
};