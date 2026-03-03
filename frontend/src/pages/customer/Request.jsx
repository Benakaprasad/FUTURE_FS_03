import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashLayout from "../../components/DashLayout";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

// ── Enquiry intents (become leads) ────────────────────────────
const ENQUIRY_INTENTS = [
  { value: "visit_gym",     label: "Visit the Gym",    icon: "🏛️", desc: "Come in and see the facilities" },
  { value: "custom_plan",   label: "Custom Plan",      icon: "🎯", desc: "Discuss a tailored membership" },
  { value: "personal_training", label: "Personal Training", icon: "💪", desc: "1-on-1 coaching enquiry" },
  { value: "group_classes", label: "Group Classes",    icon: "👥", desc: "Yoga, Zumba, HIIT and more" },
  { value: "pricing",       label: "Pricing Query",    icon: "💬", desc: "Ask about costs and offers" },
  { value: "other",         label: "Other",            icon: "📩", desc: "Any other question" },
];

// ── Member account actions (go to requests API) ────────────────
const MEMBER_ACTIONS = [
  { value: "freeze",          label: "Freeze Membership", icon: "❄️", desc: "Temporarily pause your membership" },
  { value: "cancellation",    label: "Cancel Membership", icon: "✕",  desc: "Cancel your active membership" },
  { value: "upgrade",         label: "Upgrade Plan",      icon: "⬆️", desc: "Move to a higher plan" },
  { value: "trainer_request", label: "Trainer Request",   icon: "🏋️", desc: "Request a specific trainer" },
  { value: "other",           label: "Other",             icon: "📋", desc: "Any other account request" },
];

const TIME_SLOTS = [
  { value: "morning",   label: "Morning (6am – 12pm)" },
  { value: "afternoon", label: "Afternoon (12pm – 5pm)" },
  { value: "evening",   label: "Evening (5pm – 10pm)" },
];

const STATUS_COLORS = {
  pending:  { color: "#FFB800", bg: "#FFB80015", border: "#FFB80030" },
  approved: { color: "#22C55E", bg: "#22C55E15", border: "#22C55E30" },
  rejected: { color: "#FF1A1A", bg: "#FF1A1A15", border: "#FF1A1A30" },
  reviewed: { color: "#00C2FF", bg: "#00C2FF15", border: "#00C2FF30" },
};

export default function CustomerRequest() {
  const { user } = useAuth();

  // ── Data ──────────────────────────────────────────────────
  const [requests,   setRequests]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast,      setToast]      = useState(null);

  // ── View state ─────────────────────────────────────────────
  // null | "enquire" | "action"
  const [activeFlow, setActiveFlow] = useState(null);

  // ── Forms ──────────────────────────────────────────────────
  const [enquiryForm, setEnquiryForm] = useState({
    intent: "", preferred_time: "", phone: "", notes: "",
  });
  const [actionForm, setActionForm] = useState({
    request_type: "", notes: "",
  });

  // ── Fetch existing requests ────────────────────────────────
  const fetchRequests = () => {
    setLoading(true);
    api.get("/requests/my")
      .then(({ data }) => setRequests(data.requests || []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Submit enquiry → lead ──────────────────────────────────
  const handleEnquiry = async (e) => {
    e.preventDefault();
    if (!enquiryForm.intent) { showToast("Please select what you're enquiring about.", "error"); return; }
    setSubmitting(true);
    try {
      await api.post("/leads/enquire", {
        name:           user.full_name || user.username,
        email:          user.email,
        phone:          enquiryForm.phone || undefined,
        intent:         enquiryForm.intent,
        preferred_time: enquiryForm.preferred_time || undefined,
        notes:          enquiryForm.notes || undefined,
      });
      showToast("Enquiry sent! Our team will contact you within 24 hours. 🎉");
      setEnquiryForm({ intent: "", preferred_time: "", phone: "", notes: "" });
      setActiveFlow(null);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to send enquiry.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Submit account action → request ───────────────────────
  const handleAction = async (e) => {
    e.preventDefault();
    if (!actionForm.request_type) { showToast("Please select an action type.", "error"); return; }
    setSubmitting(true);
    try {
      await api.post("/requests", {
        message: actionForm.notes,
        request_type: actionForm.request_type,
      });
      showToast("Request submitted! We'll respond within 24 hours.");
      setActionForm({ request_type: "", notes: "" });
      setActiveFlow(null);
      fetchRequests();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to submit request.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount  = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;

  return (
    <DashLayout title="HELP & REQUESTS" subtitle="Get in touch or manage your membership">
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .flow-card:hover   { border-color: rgba(255,26,26,0.35) !important; transform: translateY(-2px); }
        .intent-card:hover { border-color: rgba(255,26,26,0.4) !important; background: rgba(255,26,26,0.06) !important; }
        .intent-card.selected { border-color: #FF1A1A !important; background: rgba(255,26,26,0.1) !important; }
        .time-btn:hover    { border-color: rgba(255,26,26,0.4) !important; }
        .time-btn.selected { border-color: #FF1A1A !important; background: rgba(255,26,26,0.08) !important; color: #FF1A1A !important; }
        textarea:focus, .req-input:focus { border-color: #FF1A1A !important; outline: none; }
        textarea::placeholder, .req-input::placeholder { color: rgba(255,255,255,0.2); }
        @media (max-width: 768px) {
          .flow-grid { grid-template-columns: 1fr !important; }
          .intent-grid { grid-template-columns: repeat(2,1fr) !important; }
          .time-grid { grid-template-columns: 1fr !important; }
          .stats-row { gap: 0.75rem !important; }
          .stat-card { padding: 1rem 0.75rem !important; }
        }
      `}</style>

      {/* ── Stats ── */}
      <div className="stats-row" style={s.statsRow}>
        {[
          { label: "Total Requests", value: requests.length,  color: "#00C2FF" },
          { label: "Pending",        value: pendingCount,     color: "#FFB800" },
          { label: "Approved",       value: approvedCount,    color: "#22C55E" },
        ].map((st, i) => (
          <div key={i} className="stat-card" style={{ ...s.statCard, borderTop: `3px solid ${st.color}` }}>
            <p style={{ ...s.statValue, color: st.color }}>{st.value}</p>
            <p style={s.statLabel}>{st.label}</p>
          </div>
        ))}
      </div>

      {/* ── Two path chooser ── */}
      {!activeFlow && (
        <>
          <p style={s.sectionLabel}>WHAT WOULD YOU LIKE TO DO?</p>
          <div className="flow-grid" style={s.flowGrid}>

            {/* Path 1 — Talk to Us */}
            <div className="flow-card" style={{ ...s.flowCard, borderColor: "rgba(0,194,255,0.2)" }}
              onClick={() => setActiveFlow("enquire")}>
              <div style={{ ...s.flowIcon, background: "rgba(0,194,255,0.1)", color: "#00C2FF" }}>📞</div>
              <div style={s.flowBody}>
                <h3 style={s.flowTitle}>Talk to Us</h3>
                <p style={s.flowDesc}>Want to visit, enquire about pricing, or discuss a custom plan? We'll contact you within 24 hours.</p>
                <span style={{ ...s.flowTag, color: "#00C2FF", background: "rgba(0,194,255,0.08)", borderColor: "rgba(0,194,255,0.2)" }}>
                  Creates an enquiry lead → Admin follows up
                </span>
              </div>
              <span style={s.flowArrow}>→</span>
            </div>

            {/* Path 2 — Member Action */}
            <div className="flow-card" style={{ ...s.flowCard, borderColor: "rgba(255,184,0,0.2)" }}
              onClick={() => setActiveFlow("action")}>
              <div style={{ ...s.flowIcon, background: "rgba(255,184,0,0.1)", color: "#FFB800" }}>⚙️</div>
              <div style={s.flowBody}>
                <h3 style={s.flowTitle}>Account Request</h3>
                <p style={s.flowDesc}>Already a member? Freeze, cancel, upgrade your plan or request a trainer change.</p>
                <span style={{ ...s.flowTag, color: "#FFB800", background: "rgba(255,184,0,0.08)", borderColor: "rgba(255,184,0,0.2)" }}>
                  Requires active membership → Admin reviews
                </span>
              </div>
              <span style={s.flowArrow}>→</span>
            </div>

            {/* Path 3 — Buy a Plan shortcut */}
            <Link to="/dashboard/membership" style={{ ...s.flowCard, textDecoration: "none", borderColor: "rgba(255,26,26,0.2)", cursor: "pointer" }}
              className="flow-card">
              <div style={{ ...s.flowIcon, background: "rgba(255,26,26,0.1)", color: "#FF1A1A" }}>💳</div>
              <div style={s.flowBody}>
                <h3 style={{ ...s.flowTitle, color: "#fff" }}>Buy a Plan</h3>
                <p style={s.flowDesc}>Ready to join? Choose a plan and pay instantly via Razorpay. Membership activates immediately.</p>
                <span style={{ ...s.flowTag, color: "#FF1A1A", background: "rgba(255,26,26,0.08)", borderColor: "rgba(255,26,26,0.2)" }}>
                  Instant payment → Auto membership activation
                </span>
              </div>
              <span style={s.flowArrow}>→</span>
            </Link>

          </div>
        </>
      )}

      {/* ── Enquiry form (Talk to Us) ── */}
      {activeFlow === "enquire" && (
        <div style={s.formCard}>
          <div style={s.formHeader}>
            <div>
              <h3 style={s.formTitle}>TALK TO US</h3>
              <p style={s.formSub}>Tell us what you need — we'll reach out within 24 hours</p>
            </div>
            <button onClick={() => setActiveFlow(null)} style={s.backBtn}>← Back</button>
          </div>

          <form onSubmit={handleEnquiry}>
            {/* Intent */}
            <label style={s.fieldLabel}>What are you enquiring about? *</label>
            <div className="intent-grid" style={s.intentGrid}>
              {ENQUIRY_INTENTS.map((t) => (
                <div key={t.value}
                  className={`intent-card${enquiryForm.intent === t.value ? " selected" : ""}`}
                  onClick={() => setEnquiryForm((p) => ({ ...p, intent: t.value }))}
                  style={{
                    ...s.intentCard,
                    borderColor: enquiryForm.intent === t.value ? "#FF1A1A" : "rgba(255,255,255,0.08)",
                    background:  enquiryForm.intent === t.value ? "rgba(255,26,26,0.1)" : "rgba(255,255,255,0.02)",
                  }}>
                  <span style={s.intentIcon}>{t.icon}</span>
                  <p style={s.intentLabel}>{t.label}</p>
                  <p style={s.intentDesc}>{t.desc}</p>
                </div>
              ))}
            </div>

            {/* Preferred time */}
            <label style={s.fieldLabel}>Preferred time to be contacted</label>
            <div className="time-grid" style={s.timeGrid}>
              {TIME_SLOTS.map((t) => (
                <button key={t.value} type="button"
                  className={`time-btn${enquiryForm.preferred_time === t.value ? " selected" : ""}`}
                  onClick={() => setEnquiryForm((p) => ({
                    ...p, preferred_time: p.preferred_time === t.value ? "" : t.value
                  }))}
                  style={{
                    ...s.timeBtn,
                    borderColor: enquiryForm.preferred_time === t.value ? "#FF1A1A" : "rgba(255,255,255,0.08)",
                    color: enquiryForm.preferred_time === t.value ? "#FF1A1A" : "rgba(255,255,255,0.5)",
                    background: enquiryForm.preferred_time === t.value ? "rgba(255,26,26,0.08)" : "rgba(255,255,255,0.02)",
                  }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Phone */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={s.fieldLabel}>Phone number (optional)</label>
              <input className="req-input" type="tel" placeholder="+91 98765 43210"
                value={enquiryForm.phone}
                onChange={(e) => setEnquiryForm((p) => ({ ...p, phone: e.target.value }))}
                style={s.input} />
            </div>

            {/* Message */}
            <div style={{ marginBottom: "1.75rem" }}>
              <label style={s.fieldLabel}>Anything else you'd like us to know?</label>
              <textarea rows={3} placeholder="e.g. I'm interested in the quarterly plan and want to know about group yoga classes..."
                value={enquiryForm.notes}
                onChange={(e) => setEnquiryForm((p) => ({ ...p, notes: e.target.value }))}
                style={s.textarea} />
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="button" onClick={() => setActiveFlow(null)} style={s.cancelBtn}>Cancel</button>
              <button type="submit" disabled={submitting} style={s.submitBtn}>
                {submitting ? <Spinner /> : "Send Enquiry →"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Account action form ── */}
      {activeFlow === "action" && (
        <div style={s.formCard}>
          <div style={s.formHeader}>
            <div>
              <h3 style={s.formTitle}>ACCOUNT REQUEST</h3>
              <p style={s.formSub}>Submit a request to manage your membership</p>
            </div>
            <button onClick={() => setActiveFlow(null)} style={s.backBtn}>← Back</button>
          </div>

          <form onSubmit={handleAction}>
            <label style={s.fieldLabel}>What do you need? *</label>
            <div className="intent-grid" style={s.intentGrid}>
              {MEMBER_ACTIONS.map((t) => (
                <div key={t.value}
                  className={`intent-card${actionForm.request_type === t.value ? " selected" : ""}`}
                  onClick={() => setActionForm((p) => ({ ...p, request_type: t.value }))}
                  style={{
                    ...s.intentCard,
                    borderColor: actionForm.request_type === t.value ? "#FFB800" : "rgba(255,255,255,0.08)",
                    background:  actionForm.request_type === t.value ? "rgba(255,184,0,0.08)" : "rgba(255,255,255,0.02)",
                  }}>
                  <span style={s.intentIcon}>{t.icon}</span>
                  <p style={s.intentLabel}>{t.label}</p>
                  <p style={s.intentDesc}>{t.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "1.75rem" }}>
              <label style={s.fieldLabel}>Details / Message</label>
              <textarea rows={4} placeholder="Describe your request in detail..."
                value={actionForm.notes}
                onChange={(e) => setActionForm((p) => ({ ...p, notes: e.target.value }))}
                style={s.textarea} />
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="button" onClick={() => setActiveFlow(null)} style={s.cancelBtn}>Cancel</button>
              <button type="submit" disabled={submitting} style={{ ...s.submitBtn, background: "linear-gradient(135deg,#FFB800,#e6a500)", boxShadow: "0 4px 20px rgba(255,184,0,0.25)" }}>
                {submitting ? <Spinner /> : "Submit Request →"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Past account requests ── */}
      {!activeFlow && (
        <>
          <p style={{ ...s.sectionLabel, marginTop: "2.5rem" }}>YOUR ACCOUNT REQUESTS</p>
          {loading ? <Loader /> : requests.length === 0 ? (
            <div style={s.emptyState}>
              <span style={{ fontSize: "2rem", display: "block", marginBottom: "0.75rem" }}>📋</span>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem" }}>No account requests yet.</p>
            </div>
          ) : (
            <div style={s.requestList}>
              {requests.map((r) => {
                const sc = STATUS_COLORS[r.status] || { color: "#fff", bg: "#ffffff10", border: "#ffffff20" };
                const action = MEMBER_ACTIONS.find((a) => a.value === r.request_type || a.value === r.message);
                return (
                  <div key={r.id} style={s.requestCard}>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flex: 1 }}>
                      <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{action?.icon || "📋"}</span>
                      <div>
                        <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", marginBottom: "3px" }}>
                          {action?.label || r.membership_type?.replace(/_/g, " ") || "Account Request"}
                        </p>
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginBottom: "4px" }}>
                          {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        {r.message && (
                          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>"{r.message}"</p>
                        )}
                        {r.admin_notes && (
                          <p style={{ fontSize: "12px", color: "#22C55E", marginTop: "4px" }}>
                            ✓ Staff reply: "{r.admin_notes}"
                          </p>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "1px", padding: "4px 10px", borderRadius: "100px", flexShrink: 0, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
                      {r.status?.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {toast && (
        <div style={{ ...s.toast, background: toast.type === "error" ? "rgba(255,26,26,0.95)" : "rgba(34,197,94,0.95)" }}>
          {toast.type === "error" ? "✕" : "✓"} {toast.msg}
        </div>
      )}
    </DashLayout>
  );
}

function Loader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
      <div style={{ width: "32px", height: "32px", border: "3px solid rgba(255,26,26,0.2)", borderTop: "3px solid #FF1A1A", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );
}

function Spinner() {
  return (
    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
      <span style={{ width: "15px", height: "15px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
      Submitting...
    </span>
  );
}

const s = {
  statsRow:  { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem" },
  statCard:  { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.25rem" },
  statValue: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem", marginBottom: "4px" },
  statLabel: { fontSize: "12px", color: "rgba(255,255,255,0.35)", fontWeight: 500 },

  sectionLabel: { fontSize: "11px", fontWeight: 800, letterSpacing: "2px", color: "rgba(255,255,255,0.25)", marginBottom: "1rem" },

  flowGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem" },
  flowCard: { background: "rgba(255,255,255,0.02)", border: "1px solid", borderRadius: "14px", padding: "1.5rem", cursor: "pointer", display: "flex", flexDirection: "column", gap: "1rem", transition: "all 0.2s", position: "relative" },
  flowIcon: { width: "44px", height: "44px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 },
  flowBody: { flex: 1 },
  flowTitle:{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "1px", color: "#fff", marginBottom: "6px" },
  flowDesc: { fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5, marginBottom: "10px" },
  flowTag:  { fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px", padding: "3px 9px", borderRadius: "100px", border: "1px solid", display: "inline-block" },
  flowArrow:{ position: "absolute", top: "1.5rem", right: "1.5rem", color: "rgba(255,255,255,0.2)", fontSize: "1.1rem" },

  formCard:   { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "2rem", marginBottom: "2rem", animation: "fadeUp 0.25s ease forwards" },
  formHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" },
  formTitle:  { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", letterSpacing: "3px", color: "#fff", marginBottom: "4px" },
  formSub:    { fontSize: "0.85rem", color: "rgba(255,255,255,0.35)" },
  backBtn:    { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 16px", color: "rgba(255,255,255,0.5)", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", flexShrink: 0 },

  fieldLabel: { display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "0.75rem" },
  intentGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "0.75rem", marginBottom: "1.5rem" },
  intentCard: { border: "1px solid", borderRadius: "10px", padding: "1rem", cursor: "pointer", transition: "all 0.2s" },
  intentIcon: { fontSize: "1.3rem", display: "block", marginBottom: "0.5rem" },
  intentLabel:{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", marginBottom: "3px" },
  intentDesc: { fontSize: "11px", color: "rgba(255,255,255,0.3)", lineHeight: 1.4 },

  timeGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.625rem", marginBottom: "1.5rem" },
  timeBtn:  { padding: "10px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", textAlign: "center" },

  input:    { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "11px 14px", color: "#fff", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s" },
  textarea: { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "9px", padding: "12px 14px", color: "#fff", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif", outline: "none", resize: "vertical", transition: "border-color 0.2s" },
  cancelBtn:{ flex: "0 0 auto", padding: "12px 24px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9px", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer" },
  submitBtn:{ flex: 1, padding: "13px", background: "linear-gradient(135deg,#FF1A1A,#cc0000)", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.95rem", border: "none", borderRadius: "9px", cursor: "pointer", boxShadow: "0 4px 20px rgba(255,26,26,0.3)" },

  emptyState:  { textAlign: "center", padding: "3rem", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px" },
  requestList: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  requestCard: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.25rem 1.5rem", gap: "1rem" },
  toast:       { position: "fixed", bottom: "2rem", right: "2rem", padding: "14px 22px", borderRadius: "10px", color: "#fff", fontWeight: 700, fontSize: "0.875rem", boxShadow: "0 8px 30px rgba(0,0,0,0.4)", animation: "slideIn 0.3s ease forwards", zIndex: 9999 },
};