import { useState, useEffect } from "react";
import DashLayout from "../../components/DashLayout";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { User, Phone, Mail, Lock, Eye, EyeOff, Check, Shield, Calendar, UserCheck, Activity } from "lucide-react";

const T = {
  red: "#FF1A1A", redDim: "rgba(255,26,26,0.12)",
  green: "#22C55E", glass: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.07)", muted: "rgba(255,255,255,0.35)",
  sub: "rgba(255,255,255,0.15)",
};

function Field({ label, icon: Icon, children, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: T.muted }}>
        <Icon size={11} color={T.muted} /> {label}
      </label>
      {children}
      {hint && <span style={{ fontSize: "11px", color: T.sub }}>{hint}</span>}
    </div>
  );
}

const inputStyle = {
  width: "100%", background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)", borderRadius: 9,
  padding: "12px 15px", color: "#fff", fontSize: "0.9rem",
  fontFamily: "'DM Sans', sans-serif", outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

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

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleSaveProfile = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api.put("/customers/me", profile); showToast("Profile updated successfully."); }
    catch (err) { showToast(err.response?.data?.error || "Failed to update profile.", "error"); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) { showToast("New passwords do not match.", "error"); return; }
    setPwSaving(true);
    try {
      await api.post("/auth/change-password", { current_password: pwForm.current_password, new_password: pwForm.new_password });
      showToast("Password changed successfully.");
      setPwForm({ current_password: "", new_password: "", confirm: "" });
    } catch (err) { showToast(err.response?.data?.error || "Failed to change password.", "error"); }
    finally { setPwSaving(false); }
  };

  const pwChecks = {
    length:    pwForm.new_password.length >= 8,
    uppercase: /[A-Z]/.test(pwForm.new_password),
    number:    /[0-9]/.test(pwForm.new_password),
  };
  const pwStrength = Object.values(pwChecks).filter(Boolean).length;

  return (
    <DashLayout title="MY PROFILE" subtitle="Manage your personal information">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        .field-input:focus { border-color:#FF1A1A!important; box-shadow:0 0 0 3px rgba(255,26,26,0.1)!important; outline:none; }
        .field-input::placeholder { color:rgba(255,255,255,0.2); }
        .save-btn:hover:not(:disabled){ background:#cc0000!important; transform:translateY(-1px); }
        .save-btn:disabled{ opacity:0.55; cursor:not-allowed; }
        @media(max-width:768px){
          .profile-grid { grid-template-columns:1fr!important; }
          .avatar-card  { padding:1rem!important; }
          .pw-checks    { grid-template-columns:1fr 1fr!important; }
        }
      `}</style>

      {loading ? <Loader /> : (
        <div className="profile-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "start" }}>

          {/* ── Left column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Avatar card */}
            <div className="avatar-card" style={{ display: "flex", alignItems: "center", gap: "1.25rem", background: T.glass, border: `1px solid ${T.border}`, borderRadius: 14, padding: "1.5rem", animation: "fadeUp 0.5s ease both" }}>
              <div style={{ width: 64, height: 64, flexShrink: 0, borderRadius: "50%", background: T.redDim, border: "2px solid rgba(255,26,26,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", color: T.red, position: "relative" }}>
                {profile.full_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "?"}
                {user?.is_email_verified && (
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderRadius: "50%", background: T.green, border: "2px solid #0f0f0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check size={10} strokeWidth={3} color="#fff" />
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: 4 }}>{profile.full_name || user?.username}</div>
                <div style={{ fontSize: "12px", color: T.muted, marginBottom: 8 }}>{user?.email}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "11px", fontWeight: 700, color: T.green, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", padding: "3px 10px", borderRadius: 100 }}>
                  <Shield size={10} /> {user?.is_email_verified ? "Email Verified" : "Email Unverified"}
                </div>
              </div>
            </div>

            {/* Profile form */}
            <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 14, padding: "1.75rem", animation: "fadeUp 0.5s ease 0.08s both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.5rem" }}>
                <User size={14} color={T.muted} />
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.95rem", letterSpacing: "3px", color: T.muted }}>PERSONAL INFORMATION</span>
              </div>
              <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <Field label="Full Name" icon={User}>
                  <input className="field-input" type="text" value={profile.full_name}
                    onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                    placeholder="Your full name" style={inputStyle} />
                </Field>
                <Field label="Phone Number" icon={Phone}>
                  <input className="field-input" type="tel" value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 98765 43210" style={inputStyle} />
                </Field>
                <Field label="Email Address" icon={Mail} hint="Email cannot be changed. Contact support.">
                  <input type="email" value={user?.email || ""} disabled style={{ ...inputStyle, opacity: 0.4, cursor: "not-allowed" }} />
                </Field>
                <Field label="Username" icon={UserCheck}>
                  <input type="text" value={user?.username || ""} disabled style={{ ...inputStyle, opacity: 0.4, cursor: "not-allowed" }} />
                </Field>
                <button type="submit" className="save-btn" disabled={saving} style={{ padding: 13, background: "linear-gradient(135deg,#FF1A1A,#cc0000)", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.95rem", border: "none", borderRadius: 9, cursor: "pointer", boxShadow: "0 4px 20px rgba(255,26,26,0.3)", transition: "all 0.2s", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {saving ? <><Spin/> Saving…</> : <><Check size={15}/> Save Changes</>}
                </button>
              </form>
            </div>
          </div>

          {/* ── Right column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Password form */}
            <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 14, padding: "1.75rem", animation: "fadeUp 0.5s ease 0.12s both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.5rem" }}>
                <Lock size={14} color={T.muted} />
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.95rem", letterSpacing: "3px", color: T.muted }}>CHANGE PASSWORD</span>
              </div>
              <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {[
                  { key: "current_password", label: "Current Password",  placeholder: "Enter current password" },
                  { key: "new_password",      label: "New Password",      placeholder: "Enter new password" },
                  { key: "confirm",           label: "Confirm Password",  placeholder: "Re-enter new password" },
                ].map(({ key, label, placeholder }) => (
                  <Field key={key} label={label} icon={Lock}>
                    <div style={{ position: "relative" }}>
                      <input className="field-input" type={showPw[key] ? "text" : "password"}
                        value={pwForm[key]} onChange={(e) => setPwForm((p) => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder} required style={{ ...inputStyle, paddingRight: 44 }} />
                      <button type="button" onClick={() => setShowPw((p) => ({ ...p, [key]: !p[key] }))}
                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex", alignItems: "center", padding: 4 }}>
                        {showPw[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </Field>
                ))}

                {/* Password strength */}
                {pwForm.new_password.length > 0 && (
                  <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 9, padding: "0.875rem" }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                      {[0,1,2].map((i) => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < pwStrength ? (pwStrength === 1 ? T.red : pwStrength === 2 ? T.gold : T.green) : "rgba(255,255,255,0.08)", transition: "background 0.3s" }} />
                      ))}
                    </div>
                    <div className="pw-checks" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                      {[{ key: "length", label: "8+ chars" }, { key: "uppercase", label: "Uppercase" }, { key: "number", label: "Number" }].map(({ key, label }) => (
                        <div key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <div style={{ width: 14, height: 14, borderRadius: "50%", background: pwChecks[key] ? T.green + "20" : "rgba(255,255,255,0.05)", border: `1px solid ${pwChecks[key] ? T.green : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {pwChecks[key] && <Check size={8} strokeWidth={3} color={T.green} />}
                          </div>
                          <span style={{ fontSize: "11px", color: pwChecks[key] ? T.green : T.sub }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button type="submit" className="save-btn" disabled={pwSaving} style={{ padding: 13, background: "linear-gradient(135deg,#FF1A1A,#cc0000)", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.95rem", border: "none", borderRadius: 9, cursor: "pointer", boxShadow: "0 4px 20px rgba(255,26,26,0.3)", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {pwSaving ? <><Spin/> Saving…</> : <><Lock size={14}/> Change Password</>}
                </button>
              </form>
            </div>

            {/* Account info */}
            <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 14, padding: "1.75rem", animation: "fadeUp 0.5s ease 0.18s both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem" }}>
                <Activity size={14} color={T.muted} />
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.95rem", letterSpacing: "3px", color: T.muted }}>ACCOUNT DETAILS</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {[
                  { icon: Calendar,  label: "Member Since",   value: user?.created_at ? new Date(user.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}) : "—" },
                  { icon: UserCheck, label: "Account Role",   value: user?.role?.toUpperCase() || "—" },
                  { icon: Shield,    label: "Account Status", value: user?.is_active ? "Active" : "Inactive", color: user?.is_active ? T.green : T.red },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < 2 ? `1px solid ${T.border}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <item.icon size={13} color={T.muted} />
                      <span style={{ fontSize: "12px", color: T.muted, fontWeight: 600 }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: "0.875rem", color: item.color || "#fff", fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: "2rem", right: "2rem", padding: "14px 22px", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: "0.875rem", boxShadow: "0 8px 30px rgba(0,0,0,0.4)", animation: "slideIn 0.3s ease both", zIndex: 9999, background: toast.type === "error" ? "rgba(255,26,26,0.95)" : "rgba(34,197,94,0.95)", display: "flex", alignItems: "center", gap: 10 }}>
          {toast.type === "error" ? "✕" : <Check size={16} />} {toast.msg}
        </div>
      )}
    </DashLayout>
  );
}

function Loader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "5rem", gap: 16 }}>
      <div style={{ width: 32, height: 32, border: "2.5px solid rgba(255,26,26,0.15)", borderTop: "2.5px solid #FF1A1A", borderRadius: "50%", animation: "spin 0.75s linear infinite" }} />
      <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.3)" }}>Loading profile…</span>
    </div>
  );
}

function Spin() {
  return <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />;
}