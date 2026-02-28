import { useState, useEffect } from "react";
import DashLayout from "../../components/DashLayout";
import { Toast } from "../../components/AdminUI";
import api from "../../api/axios";

const DAYS  = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 5);
const fmt12 = (h) => h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`;

const SESSION_TYPES = [
  { value: "strength",   label: "Strength Training", color: "#FF1A1A" },
  { value: "cardio",     label: "Cardio",            color: "#FF6B00" },
  { value: "hiit",       label: "HIIT",              color: "#FFB800" },
  { value: "yoga",       label: "Yoga",              color: "#A855F7" },
  { value: "zumba",      label: "Zumba",             color: "#EC4899" },
  { value: "boxing",     label: "Boxing",            color: "#EF4444" },
  { value: "functional", label: "Functional",        color: "#22C55E" },
  { value: "personal",   label: "Personal Training", color: "#00C2FF" },
];

export default function TrainerSchedule() {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(null);
  const [modal,    setModal]    = useState(null);
  const [form,     setForm]     = useState({ day: "Monday", start_hour: 6, end_hour: 7, session_type: "strength", notes: "" });

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchSessions = () => {
    setLoading(true);
    api.get("/schedules/me")
      .then(({ data }) => setSessions(data.schedules || []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.post("/schedules", form);
      showToast("Session added to schedule.");
      setModal(null); fetchSessions();
    } catch (err) { showToast(err.response?.data?.error || "Failed to save session.", "error"); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/schedules/${id}`);
      showToast("Session removed."); fetchSessions();
    } catch { showToast("Failed to remove session.", "error"); }
  };

  const sessionColor = (type) => SESSION_TYPES.find((t) => t.value === type)?.color || "#FF1A1A";
  const sessionLabel = (type) => SESSION_TYPES.find((t) => t.value === type)?.label || type;

  return (
    <DashLayout
      title="MY SCHEDULE"
      subtitle="Weekly training timetable"
      actions={
        <button onClick={() => setModal(true)} style={sc.addBtn}>+ Add Session</button>
      }
    >
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        select:focus { outline: none; }
        .field-input:focus { border-color: #00C2FF !important; outline: none; }
        .session-pill:hover .del-btn { opacity: 1 !important; }

        /* ── Mobile: horizontal scroll for schedule grid ── */
        @media (max-width: 768px) {
          .schedule-scroll-wrap {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
            border-radius: 12px;
          }
          .schedule-grid-inner {
            min-width: 640px;
          }
          .sc-day-name {
            font-size: 9px !important;
          }
          .sc-time-label {
            width: 52px !important;
            font-size: 9px !important;
            padding: 8px 6px !important;
          }
          .sc-time-col {
            width: 52px !important;
          }

          /* Modal: full width */
          .sc-modal {
            width: 95% !important;
            max-width: 95% !important;
          }
          .sc-modal-form {
            padding: 1.25rem !important;
          }
          .sc-modal-header {
            padding: 1.25rem !important;
          }
          .sc-form-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div style={{ width: "36px", height: "36px", border: "3px solid rgba(0,194,255,0.2)", borderTop: "3px solid #00C2FF", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <div className="schedule-scroll-wrap" style={sc.gridWrap}>
          <div className="schedule-grid-inner">
            {/* Column headers */}
            <div style={sc.gridHeader}>
              <div className="sc-time-col" style={sc.timeCol} />
              {DAYS.map((d) => (
                <div key={d} style={sc.dayHeader}>
                  <span className="sc-day-name" style={sc.dayName}>{d.slice(0, 3).toUpperCase()}</span>
                </div>
              ))}
            </div>

            {/* Hour rows */}
            <div style={sc.gridBody}>
              {HOURS.map((hour) => (
                <div key={hour} style={sc.hourRow}>
                  <div className="sc-time-label" style={sc.timeLabel}>{fmt12(hour)}</div>
                  {DAYS.map((day) => {
                    const slot = sessions.filter((s) => s.day === day && Number(s.start_hour) === hour);
                    return (
                      <div key={day} style={sc.cell}>
                        {slot.map((s) => (
                          <div key={s.id} className="session-pill" style={{ ...sc.pill, borderLeft: `3px solid ${sessionColor(s.session_type)}`, background: sessionColor(s.session_type) + "18" }}>
                            <span style={{ ...sc.pillLabel, color: sessionColor(s.session_type) }}>{sessionLabel(s.session_type)}</span>
                            <span style={sc.pillTime}>{fmt12(s.start_hour)} – {fmt12(s.end_hour)}</span>
                            <button className="del-btn" onClick={() => handleDelete(s.id)} style={sc.delBtn}>x</button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Add session modal ── */}
      {modal && (
        <div style={sc.overlay}>
          <div className="sc-modal" style={sc.modal}>
            <div className="sc-modal-header" style={sc.modalHeader}>
              <h3 style={sc.modalTitle}>ADD SESSION</h3>
              <button onClick={() => setModal(null)} style={sc.closeBtn}>x</button>
            </div>
            <form onSubmit={handleSave} className="sc-modal-form" style={sc.form}>
              <div style={sc.field}>
                <label style={sc.label}>Day</label>
                <select value={form.day} onChange={(e) => setForm((p) => ({ ...p, day: e.target.value }))} style={sc.select}>
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="sc-form-row" style={sc.formRow}>
                <div style={sc.field}>
                  <label style={sc.label}>Start Time</label>
                  <select value={form.start_hour} onChange={(e) => setForm((p) => ({ ...p, start_hour: Number(e.target.value) }))} style={sc.select}>
                    {HOURS.map((h) => <option key={h} value={h}>{fmt12(h)}</option>)}
                  </select>
                </div>
                <div style={sc.field}>
                  <label style={sc.label}>End Time</label>
                  <select value={form.end_hour} onChange={(e) => setForm((p) => ({ ...p, end_hour: Number(e.target.value) }))} style={sc.select}>
                    {HOURS.filter((h) => h > form.start_hour).map((h) => <option key={h} value={h}>{fmt12(h)}</option>)}
                  </select>
                </div>
              </div>
              <div style={sc.field}>
                <label style={sc.label}>Session Type</label>
                <select value={form.session_type} onChange={(e) => setForm((p) => ({ ...p, session_type: e.target.value }))} style={sc.select}>
                  {SESSION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div style={sc.field}>
                <label style={sc.label}>Notes (optional)</label>
                <input className="field-input" type="text" placeholder="e.g. Beginner friendly" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} style={sc.input} />
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button type="button" onClick={() => setModal(null)} style={sc.cancelBtn}>Cancel</button>
                <button type="submit" style={sc.saveBtn}>Add to Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </DashLayout>
  );
}

const sc = {
  addBtn:   { padding: "10px 20px", background: "rgba(0,194,255,0.15)", border: "1px solid rgba(0,194,255,0.3)", color: "#00C2FF", fontWeight: 700, fontSize: "13px", borderRadius: "8px", cursor: "pointer" },
  gridWrap: { background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "auto" },
  gridHeader: { display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, background: "#050505", zIndex: 10 },
  timeCol:    { width: "72px", flexShrink: 0 },
  dayHeader:  { flex: 1, padding: "14px 8px", textAlign: "center", borderLeft: "1px solid rgba(255,255,255,0.04)" },
  dayName:    { fontSize: "11px", fontWeight: 800, letterSpacing: "2px", color: "rgba(255,255,255,0.4)" },
  gridBody:   { display: "flex", flexDirection: "column" },
  hourRow:    { display: "flex", minHeight: "64px", borderBottom: "1px solid rgba(255,255,255,0.03)" },
  timeLabel:  { width: "72px", flexShrink: 0, padding: "8px 12px", fontSize: "11px", color: "rgba(255,255,255,0.25)", fontWeight: 600, display: "flex", alignItems: "flex-start", paddingTop: "10px" },
  cell:       { flex: 1, borderLeft: "1px solid rgba(255,255,255,0.03)", padding: "4px", display: "flex", flexDirection: "column", gap: "3px" },
  pill:       { position: "relative", padding: "6px 8px", borderRadius: "6px", cursor: "default" },
  pillLabel:  { display: "block", fontSize: "11px", fontWeight: 700 },
  pillTime:   { display: "block", fontSize: "10px", color: "rgba(255,255,255,0.35)" },
  delBtn:     { position: "absolute", top: "4px", right: "4px", background: "none", border: "none", color: "rgba(255,26,26,0.6)", fontSize: "10px", cursor: "pointer", opacity: 0, transition: "opacity 0.2s", padding: "2px 4px" },
  overlay:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9000, backdropFilter: "blur(4px)" },
  modal:      { background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "0", maxWidth: "460px", width: "90%", animation: "fadeUp 0.3s ease forwards" },
  modalHeader:{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  modalTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "3px", color: "#fff" },
  closeBtn:   { background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "18px", cursor: "pointer", padding: "4px" },
  form:       { padding: "1.75rem 2rem", display: "flex", flexDirection: "column", gap: "1.25rem" },
  formRow:    { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  field:      { display: "flex", flexDirection: "column", gap: "7px" },
  label:      { fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" },
  select:     { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "12px 14px", color: "#fff", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" },
  input:      { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "12px 14px", color: "#fff", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "border-color 0.2s" },
  cancelBtn:  { flex: "0 0 auto", padding: "12px 24px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer" },
  saveBtn:    { flex: 1, padding: "12px", background: "rgba(0,194,255,0.15)", border: "1px solid rgba(0,194,255,0.35)", color: "#00C2FF", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, borderRadius: "8px", cursor: "pointer", fontSize: "0.95rem" },
};