import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashLayout from "../../components/DashLayout";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import {
  Phone, Settings, CreditCard, ClipboardList, ChevronRight,
  Clock, CheckCircle, XCircle, Eye, Snowflake, TrendingUp,
  Dumbbell, MessageSquare, ArrowRight, Check, BarChart2, Lock,
} from "lucide-react";

const T = {
  red:    "#FF1A1A", redDim: "rgba(255,26,26,0.12)",
  gold:   "#FFB800", cyan:   "#00C2FF",
  green:  "#22C55E", purple: "#A855F7",
  glass:  "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.07)",
  muted:  "rgba(255,255,255,0.35)",
  sub:    "rgba(255,255,255,0.15)",
};

const ENQUIRY_INTENTS = [
  { value: "visit_gym",         label: "Visit the Gym",     icon: Dumbbell,      desc: "Come in and see our facilities"   },
  { value: "custom_plan",       label: "Custom Plan",       icon: Settings,      desc: "Discuss a tailored membership"    },
  { value: "personal_training", label: "Personal Training", icon: TrendingUp,    desc: "1-on-1 coaching enquiry"          },
  { value: "group_classes",     label: "Group Classes",     icon: BarChart2,     desc: "Yoga, Zumba, HIIT and more"       },
  { value: "pricing",           label: "Pricing Query",     icon: CreditCard,    desc: "Ask about costs and offers"       },
  { value: "other",             label: "Other",             icon: MessageSquare, desc: "Any other question"               },
];

// ── Only shown to active members ──────────────────────────────
const MEMBER_ACTIONS = [
  { value: "freeze",          label: "Freeze Membership", icon: Snowflake,     desc: "Temporarily pause your membership" },
  { value: "cancellation",    label: "Cancel Membership", icon: XCircle,       desc: "Cancel your active membership"     },
  { value: "upgrade",         label: "Upgrade Plan",      icon: TrendingUp,    desc: "Move to a higher plan"             },
  { value: "trainer_request", label: "Trainer Request",   icon: Dumbbell,      desc: "Request a specific trainer"        },
  { value: "other",           label: "Other",             icon: ClipboardList, desc: "Any other account request"         },
];

const TIME_SLOTS = [
  { value: "morning",   label: "Morning",   sub: "6am – 12pm" },
  { value: "afternoon", label: "Afternoon", sub: "12pm – 5pm" },
  { value: "evening",   label: "Evening",   sub: "5pm – 10pm" },
];

const STATUS_MAP = {
  pending:  { color: T.gold,  bg: "rgba(255,184,0,0.1)",  border: "rgba(255,184,0,0.25)",  icon: Clock,       label: "PENDING"  },
  approved: { color: T.green, bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.25)",  icon: CheckCircle, label: "APPROVED" },
  rejected: { color: T.red,   bg: "rgba(255,26,26,0.1)",  border: "rgba(255,26,26,0.25)",  icon: XCircle,     label: "REJECTED" },
  reviewed: { color: T.cyan,  bg: "rgba(0,194,255,0.1)",  border: "rgba(0,194,255,0.25)",  icon: Eye,         label: "REVIEWED" },
};

const inputStyle = {
  width: "100%", background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)", borderRadius: 9,
  padding: "12px 15px", color: "#fff", fontSize: "0.875rem",
  fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "border-color 0.2s",
};

export default function CustomerRequest() {
  const { user } = useAuth();
  const [requests,     setRequests]     = useState([]);
  const [membership,   setMembership]   = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [toast,        setToast]        = useState(null);
  const [activeFlow,   setActiveFlow]   = useState(null);
  const [enquiryDone,  setEnquiryDone]  = useState(false);
  const [enquiryForm,  setEnquiryForm]  = useState({ intent: "", preferred_time: "", phone: "", notes: "" });
  const [actionForm,   setActionForm]   = useState({ request_type: "", notes: "" });

  const hasActiveMembership = membership?.status === "active";

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get("/requests/my").catch(() => ({ data: { requests: [] } })),
      api.get("/members/my").catch(() => ({ data: { members: [] } })),
    ]).then(([reqRes, memRes]) => {
      setRequests(reqRes.data.requests || []);
      const members = memRes.data.members || [];
      setMembership(members.find(m => m.status === "active") || members[0] || null);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Enquiry: creates a Lead via authenticated endpoint ──────
  const handleEnquiry = async (e) => {
    e.preventDefault();
    if (!enquiryForm.intent) { showToast("Please select what you're enquiring about.", "error"); return; }
    setSubmitting(true);
    try {
      await api.post("/leads/enquire", {
        intent:         enquiryForm.intent,
        phone:          enquiryForm.phone   || undefined,
        preferred_time: enquiryForm.preferred_time || undefined,
        notes:          enquiryForm.notes   || undefined,
      });
      setEnquiryDone(true);
      setEnquiryForm({ intent: "", preferred_time: "", phone: "", notes: "" });
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to send enquiry.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Account action: creates a Request (members only) ────────
  const handleAction = async (e) => {
    e.preventDefault();
    if (!actionForm.request_type) { showToast("Please select an action type.", "error"); return; }
    setSubmitting(true);
    try {
      await api.post("/requests", { message: actionForm.notes, request_type: actionForm.request_type });
      showToast("Request submitted! We'll respond within 24 hours.");
      setActionForm({ request_type: "", notes: "" });
      setActiveFlow(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to submit request.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount  = requests.filter(r => r.status === "pending").length;
  const approvedCount = requests.filter(r => r.status === "approved").length;

  return (
    <DashLayout title="HELP & REQUESTS" subtitle="Get in touch or manage your membership">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        .flow-card:hover   { border-color:rgba(255,26,26,0.3)!important; transform:translateY(-3px)!important; }
        .intent-card:hover { border-color:rgba(255,255,255,0.18)!important; }
        .req-input:focus, textarea:focus { border-color:#FF1A1A!important; box-shadow:0 0 0 3px rgba(255,26,26,0.1)!important; }
        .req-input::placeholder, textarea::placeholder { color:rgba(255,255,255,0.2); }
        .flow-card-locked { opacity:0.5; cursor:not-allowed!important; }
        @media(max-width:768px){
          .flow-grid   { grid-template-columns:1fr!important; }
          .intent-grid { grid-template-columns:repeat(2,1fr)!important; }
          .time-grid   { grid-template-columns:1fr!important; }
          .stats-row   { grid-template-columns:1fr 1fr 1fr!important; gap:0.75rem!important; }
        }
      `}</style>

      {/* ── Stats ── */}
      <div className="stats-row" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem", animation: "fadeUp 0.5s ease both" }}>
        {[
          { label: "Total Requests", value: requests.length, color: T.cyan,  icon: ClipboardList },
          { label: "Pending",        value: pendingCount,    color: T.gold,  icon: Clock         },
          { label: "Approved",       value: approvedCount,   color: T.green, icon: CheckCircle   },
        ].map((st, i) => (
          <div key={i} style={{ background: T.glass, border: `1px solid ${T.border}`, borderTop: `2px solid ${st.color}`, borderRadius: 14, padding: "1.25rem" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: st.color + "15", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
              <st.icon size={15} color={st.color} />
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: st.color, marginBottom: 4 }}>{st.value}</div>
            <div style={{ fontSize: "11px", color: T.muted, fontWeight: 600 }}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* ── Flow chooser ── */}
      {!activeFlow && !enquiryDone && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
            <ChevronRight size={13} color={T.muted} />
            <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "2px", color: T.muted }}>WHAT WOULD YOU LIKE TO DO?</span>
          </div>

          <div className="flow-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem" }}>

            {/* Talk to Us — always available */}
            <div className="flow-card" style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 14, padding: "1.5rem", cursor: "pointer", transition: "all 0.2s", animation: "fadeUp 0.5s ease 0.1s both", position: "relative", overflow: "hidden" }}
              onClick={() => setActiveFlow("enquire")}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: T.cyan }} />
              <div style={{ width: 44, height: 44, borderRadius: 12, background: T.cyan + "15", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Phone size={20} color={T.cyan} />
              </div>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "1px", color: "#fff", marginBottom: 6 }}>Talk to Us</h3>
              <p style={{ fontSize: "13px", color: T.muted, lineHeight: 1.5, marginBottom: 12 }}>
                Enquire about pricing, visit, or discuss a custom plan. We'll reach out within 24 hours.
              </p>
              <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px", padding: "3px 10px", borderRadius: 100, border: `1px solid ${T.cyan}30`, color: T.cyan, background: T.cyan + "0a" }}>
                Enquiry → Admin follows up
              </span>
              <ArrowRight size={14} color={T.sub} style={{ position: "absolute", top: "1.5rem", right: "1.5rem" }} />
            </div>

            {/* Account Request — members only */}
            <div
              className={`flow-card${!hasActiveMembership ? " flow-card-locked" : ""}`}
              style={{ background: T.glass, border: `1px solid ${hasActiveMembership ? T.border : "rgba(255,255,255,0.04)"}`, borderRadius: 14, padding: "1.5rem", cursor: hasActiveMembership ? "pointer" : "not-allowed", transition: "all 0.2s", animation: "fadeUp 0.5s ease 0.17s both", position: "relative", overflow: "hidden" }}
              onClick={() => hasActiveMembership && setActiveFlow("action")}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: hasActiveMembership ? T.gold : "rgba(255,255,255,0.08)" }} />
              <div style={{ width: 44, height: 44, borderRadius: 12, background: hasActiveMembership ? T.gold + "15" : "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                {hasActiveMembership
                  ? <Settings size={20} color={T.gold} />
                  : <Lock    size={20} color="rgba(255,255,255,0.2)" />
                }
              </div>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "1px", color: hasActiveMembership ? "#fff" : "rgba(255,255,255,0.25)", marginBottom: 6 }}>
                Account Request
              </h3>
              <p style={{ fontSize: "13px", color: hasActiveMembership ? T.muted : "rgba(255,255,255,0.15)", lineHeight: 1.5, marginBottom: 12 }}>
                {hasActiveMembership
                  ? "Freeze, cancel, upgrade or request a trainer change for your active membership."
                  : "Available once you have an active membership."}
              </p>
              {hasActiveMembership
                ? <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px", padding: "3px 10px", borderRadius: 100, border: `1px solid ${T.gold}30`, color: T.gold, background: T.gold + "0a" }}>Member action → Admin reviews</span>
                : <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px", padding: "3px 10px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.02)" }}>🔒 Active membership required</span>
              }
              {hasActiveMembership && <ArrowRight size={14} color={T.sub} style={{ position: "absolute", top: "1.5rem", right: "1.5rem" }} />}
            </div>

            {/* Buy a Plan — always available */}
            <Link to="/dashboard/membership" className="flow-card" style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 14, padding: "1.5rem", textDecoration: "none", transition: "all 0.2s", animation: "fadeUp 0.5s ease 0.24s both", display: "block", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: T.red }} />
              <div style={{ width: 44, height: 44, borderRadius: 12, background: T.redDim, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <CreditCard size={20} color={T.red} />
              </div>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "1px", color: "#fff", marginBottom: 6 }}>
                {hasActiveMembership ? "Renew / Upgrade" : "Buy a Plan"}
              </h3>
              <p style={{ fontSize: "13px", color: T.muted, lineHeight: 1.5, marginBottom: 12 }}>
                {hasActiveMembership
                  ? "Renew your plan or upgrade to a higher tier anytime."
                  : "Choose a plan and pay instantly via Razorpay. Membership activates immediately."}
              </p>
              <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px", padding: "3px 10px", borderRadius: 100, border: "1px solid rgba(255,26,26,0.3)", color: T.red, background: T.redDim }}>
                Instant payment → Auto activation
              </span>
              <ArrowRight size={14} color={T.sub} style={{ position: "absolute", top: "1.5rem", right: "1.5rem" }} />
            </Link>
          </div>
        </>
      )}

      {/* ── Enquiry submitted confirmation ── */}
      {enquiryDone && (
        <div style={{ textAlign: "center", padding: "3rem 2rem", background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 16, marginBottom: "2rem", animation: "fadeUp 0.4s ease both" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
            <Check size={24} color={T.green} />
          </div>
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "#fff", letterSpacing: "2px", marginBottom: "0.75rem" }}>ENQUIRY RECEIVED</h3>
          <p style={{ fontSize: "0.9rem", color: T.muted, marginBottom: "0.5rem" }}>
            Our team will contact you on your registered phone number within 24 hours.
          </p>
          <p style={{ fontSize: "12px", color: T.sub, marginBottom: "1.5rem" }}>
            In the meantime, you can browse our plans and pay online if you're ready.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setEnquiryDone(false)} style={{ padding: "10px 20px", background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, borderRadius: 8, color: T.muted, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}>
              Submit Another
            </button>
            <Link to="/dashboard/membership" style={{ padding: "10px 20px", background: "linear-gradient(135deg,#FF1A1A,#cc0000)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "13px", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 6 }}>
              Browse Plans <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* ── Enquiry form ── */}
      {activeFlow === "enquire" && (
        <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 16, padding: "2rem", marginBottom: "2rem", animation: "fadeUp 0.3s ease both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Phone size={15} color={T.cyan} />
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "2px", color: "#fff" }}>TALK TO US</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: T.muted }}>Tell us what you need — we'll reach out within 24 hours</p>
            </div>
            <button onClick={() => setActiveFlow(null)} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 16px", color: T.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>← Back</button>
          </div>

          <form onSubmit={handleEnquiry}>
            <FieldLabel>What are you enquiring about? *</FieldLabel>
            <div className="intent-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {ENQUIRY_INTENTS.map((t) => (
                <div key={t.value} className="intent-card"
                  onClick={() => setEnquiryForm(p => ({ ...p, intent: t.value }))}
                  style={{ border: `1px solid ${enquiryForm.intent === t.value ? T.cyan : T.border}`, borderRadius: 10, padding: "0.875rem", cursor: "pointer", transition: "all 0.2s", background: enquiryForm.intent === t.value ? "rgba(0,194,255,0.08)" : T.glass }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: T.cyan + "15", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                    <t.icon size={15} color={enquiryForm.intent === t.value ? T.cyan : T.muted} />
                  </div>
                  <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", marginBottom: 3 }}>{t.label}</p>
                  <p style={{ fontSize: "11px", color: T.muted, lineHeight: 1.4 }}>{t.desc}</p>
                </div>
              ))}
            </div>

            <FieldLabel>Preferred time to be contacted</FieldLabel>
            <div className="time-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.625rem", marginBottom: "1.5rem" }}>
              {TIME_SLOTS.map((t) => (
                <button key={t.value} type="button"
                  onClick={() => setEnquiryForm(p => ({ ...p, preferred_time: p.preferred_time === t.value ? "" : t.value }))}
                  style={{ padding: "10px", background: enquiryForm.preferred_time === t.value ? "rgba(0,194,255,0.08)" : T.glass, border: `1px solid ${enquiryForm.preferred_time === t.value ? T.cyan : T.border}`, borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s", textAlign: "center" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: enquiryForm.preferred_time === t.value ? T.cyan : "#fff" }}>{t.label}</div>
                  <div style={{ fontSize: "11px", color: T.muted, marginTop: 2 }}>{t.sub}</div>
                </button>
              ))}
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <FieldLabel>Phone number (optional — for callback)</FieldLabel>
              <input className="req-input" type="tel" placeholder="+91 98765 43210" value={enquiryForm.phone} onChange={e => setEnquiryForm(p => ({ ...p, phone: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ marginBottom: "1.75rem" }}>
              <FieldLabel>Anything else you'd like us to know?</FieldLabel>
              <textarea rows={3} placeholder="e.g. Interested in quarterly plan, want to know about yoga classes..." value={enquiryForm.notes} onChange={e => setEnquiryForm(p => ({ ...p, notes: e.target.value }))} style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            {/* What happens next */}
            <div style={{ background: "rgba(0,194,255,0.04)", border: "1px solid rgba(0,194,255,0.15)", borderRadius: 10, padding: "0.875rem 1rem", marginBottom: "1.5rem", fontSize: "12px", color: T.muted, lineHeight: 1.6 }}>
              📞 After submitting, our staff will call you within 24 hours. If you're ready, you can also <Link to="/dashboard/membership" style={{ color: T.cyan, textDecoration: "none", fontWeight: 700 }}>buy a plan directly</Link> anytime.
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="button" onClick={() => setActiveFlow(null)} style={{ padding: "12px 24px", background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, borderRadius: 9, color: T.muted, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button type="submit" disabled={submitting} style={{ flex: 1, padding: 13, background: `linear-gradient(135deg, ${T.cyan}, #0099cc)`, color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.95rem", border: "none", borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {submitting ? <><Spin /> Sending…</> : <>Send Enquiry <ArrowRight size={14} /></>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Account action form — members only ── */}
      {activeFlow === "action" && hasActiveMembership && (
        <div style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 16, padding: "2rem", marginBottom: "2rem", animation: "fadeUp 0.3s ease both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Settings size={15} color={T.gold} />
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "2px", color: "#fff" }}>ACCOUNT REQUEST</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: T.muted }}>Submit a request to manage your membership</p>
            </div>
            <button onClick={() => setActiveFlow(null)} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 16px", color: T.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>← Back</button>
          </div>

          <form onSubmit={handleAction}>
            <FieldLabel>What do you need? *</FieldLabel>
            <div className="intent-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {MEMBER_ACTIONS.map((t) => (
                <div key={t.value} className="intent-card"
                  onClick={() => setActionForm(p => ({ ...p, request_type: t.value }))}
                  style={{ border: `1px solid ${actionForm.request_type === t.value ? T.gold : T.border}`, borderRadius: 10, padding: "0.875rem", cursor: "pointer", transition: "all 0.2s", background: actionForm.request_type === t.value ? "rgba(255,184,0,0.08)" : T.glass }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: T.gold + "15", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                    <t.icon size={15} color={actionForm.request_type === t.value ? T.gold : T.muted} />
                  </div>
                  <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", marginBottom: 3 }}>{t.label}</p>
                  <p style={{ fontSize: "11px", color: T.muted, lineHeight: 1.4 }}>{t.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: "1.75rem" }}>
              <FieldLabel>Details / Message</FieldLabel>
              <textarea rows={4} placeholder="Describe your request in detail..." value={actionForm.notes} onChange={e => setActionForm(p => ({ ...p, notes: e.target.value }))} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="button" onClick={() => setActiveFlow(null)} style={{ padding: "12px 24px", background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, borderRadius: 9, color: T.muted, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button type="submit" disabled={submitting} style={{ flex: 1, padding: 13, background: `linear-gradient(135deg,${T.gold},#cc9200)`, color: "#000", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.95rem", border: "none", borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {submitting ? <><Spin dark /> Submitting…</> : <>Submit Request <ArrowRight size={14} /></>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Past requests ── */}
      {!activeFlow && !enquiryDone && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "2rem", marginBottom: "1rem" }}>
            <ChevronRight size={13} color={T.muted} />
            <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "2px", color: T.muted }}>YOUR ACCOUNT REQUESTS</span>
          </div>
          {loading ? <SmallLoader /> : requests.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", background: T.glass, border: `1px solid ${T.border}`, borderRadius: 12 }}>
              <ClipboardList size={32} color={T.sub} style={{ marginBottom: 12 }} />
              <p style={{ color: T.muted, fontSize: "0.875rem" }}>No account requests yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {requests.map((r, i) => {
                const sc      = STATUS_MAP[r.status] || { color: "#fff", bg: T.glass, border: T.border, icon: ClipboardList, label: r.status?.toUpperCase() };
                const action  = MEMBER_ACTIONS.find(a => a.value === r.request_type);
                const IconComp = action?.icon || ClipboardList;
                return (
                  <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: T.glass, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1.25rem 1.5rem", gap: "1rem", animation: `fadeUp 0.4s ease ${i * 0.04}s both` }}>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flex: 1 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 9, background: sc.color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <IconComp size={16} color={sc.color} />
                      </div>
                      <div>
                        <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#fff", marginBottom: 3 }}>
                          {action?.label || r.request_type?.replace(/_/g," ") || "Account Request"}
                        </p>
                        <p style={{ fontSize: "12px", color: T.muted, marginBottom: 4 }}>
                          {new Date(r.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                        </p>
                        {r.message && <p style={{ fontSize: "12px", color: T.muted, fontStyle: "italic" }}>"{r.message}"</p>}
                        {r.admin_notes && (
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginTop: 6 }}>
                            <Check size={12} color={T.green} style={{ flexShrink: 0, marginTop: 1 }} />
                            <p style={{ fontSize: "12px", color: T.green }}>Staff: "{r.admin_notes}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "10px", fontWeight: 800, letterSpacing: "1px", padding: "4px 10px", borderRadius: 100, flexShrink: 0, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
                      <sc.icon size={10} /> {sc.label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: "2rem", right: "2rem", padding: "14px 22px", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: "0.875rem", boxShadow: "0 8px 30px rgba(0,0,0,0.4)", animation: "slideIn 0.3s ease both", zIndex: 9999, background: toast.type === "error" ? "rgba(255,26,26,0.95)" : "rgba(34,197,94,0.95)", display: "flex", alignItems: "center", gap: 10 }}>
          {toast.type === "error" ? "✕" : <Check size={16} />} {toast.msg}
        </div>
      )}
    </DashLayout>
  );
}

function FieldLabel({ children }) {
  return <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "0.75rem" }}>{children}</div>;
}
function Loader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "5rem", gap: 16 }}>
      <div style={{ width: 32, height: 32, border: "2.5px solid rgba(255,26,26,0.15)", borderTop: "2.5px solid #FF1A1A", borderRadius: "50%", animation: "spin 0.75s linear infinite" }} />
      <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.3)" }}>Loading…</span>
    </div>
  );
}
function SmallLoader() {
  return <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}><div style={{ width: 24, height: 24, border: "2px solid rgba(255,26,26,0.15)", borderTop: "2px solid #FF1A1A", borderRadius: "50%", animation: "spin 0.75s linear infinite" }} /></div>;
}
function Spin({ dark }) {
  return <span style={{ width: 14, height: 14, border: `2px solid ${dark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.3)"}`, borderTop: `2px solid ${dark ? "#000" : "#fff"}`, borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />;
}
