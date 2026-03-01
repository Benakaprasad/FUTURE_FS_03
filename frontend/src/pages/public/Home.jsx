import React, { useState, useEffect, useRef, useCallback } from "react";

// ── Data ─────────────────────────────────────────────────────────────────────

const PHRASES = [
  "TRAIN HARD.",
  "PUSH LIMITS.",
  "BURN STRONGER.",
  "NO EXCUSES.",
  "EVERY REP COUNTS.",
  "YOUR ZONE.",
  "RISE DAILY.",
  "FIT FOR LIFE.",
  "THIS IS FITZONE.",
];

const SESSIONS = [
  {
    image: "/images/sessions/strength-training.png",
    imageAlt: "Strength Training — Add your image at: frontend/public/images/sessions/strength-training.jpg",
    title: "Strength Training",
    desc: "Free weights & machines. Muscle building programs from beginner to advanced splits.",
    tag: "All Levels",
    color: "#FF1A1A",
  },
  {
    image: "/images/sessions/cardio-conditioning.png",
    imageAlt: "Cardio Conditioning — Add your image at: frontend/public/images/sessions/cardio-conditioning.jpg",
    title: "Cardio Conditioning",
    desc: "Treadmills, rowers, cycling. Fat-loss focused programs designed for real results.",
    tag: "Fat Loss",
    color: "#FF6B00",
  },
  {
    image: "/images/sessions/hiit.png",
    imageAlt: "HIIT — Add your image at: frontend/public/images/sessions/hiit.jpg",
    title: "HIIT",
    desc: "30-minute fat-burn circuit sessions. High intensity interval training that works.",
    tag: "30 Min",
    color: "#FFB800",
  },
  {
    image: "/images/sessions/functional-training.png",
    imageAlt: "Functional Training — Add your image at: frontend/public/images/sessions/functional-training.jpg",
    title: "Functional Training",
    desc: "Kettlebells, battle ropes, TRX. Mobility & endurance focus for real-world strength.",
    tag: "Endurance",
    color: "#00C2FF",
  },
  {
    image: "/images/sessions/yoga.png",
    imageAlt: "Yoga — Add your image at: frontend/public/images/sessions/yoga.jpg",
    title: "Yoga",
    desc: "Morning flexibility & stress relief. Weekend power yoga for body and mind.",
    tag: "Morning",
    color: "#A855F7",
  },
  {
    image: "/images/sessions/zumba.png",
    imageAlt: "Zumba — Add your image at: frontend/public/images/sessions/zumba.jpg",
    title: "Zumba",
    desc: "Evening dance fitness sessions. High-energy group class that never feels like work.",
    tag: "Group",
    color: "#EC4899",
  },
  {
    image: "/images/sessions/boxing.png",
    imageAlt: "Boxing & Conditioning — Add your image at: frontend/public/images/sessions/boxing.jpg",
    title: "Boxing & Conditioning",
    desc: "Bag work, pad training, core strengthening. Build power and mental toughness.",
    tag: "Power",
    color: "#FF1A1A",
  },
  {
    image: "/images/sessions/personal-training.png",
    imageAlt: "Personal Training — Add your image at: frontend/public/images/sessions/personal-training.jpg",
    title: "Personal Training",
    desc: "1-on-1 customized programs with diet guidance and body transformation tracking.",
    tag: "1-on-1",
    color: "#22C55E",
  },
];

const TRAINERS = [
  {
    name: "Arjun Reddy",
    role: "Head Strength Coach",
    exp: "8+ years",
    cert: "ISSA Certified",
    spec: "Muscle Building & Fat Loss",
    image: "/images/trainers/male1.jpeg",
    imageAlt: "Trainer 1 — Add your image at: frontend/public/images/trainers/male1.jpeg",
    color: "#FF1A1A",
  },
  {
    name: "Sneha Rao",
    role: "Yoga & Mobility Coach",
    exp: "6+ years",
    cert: "RYT-200 Certified",
    spec: "Flexibility & Rehabilitation",
    image: "/images/trainers/female1.jpeg",
    imageAlt: "Trainer 2 — Add your image at: frontend/public/images/trainers/female1.jpeg",
    color: "#A855F7",
  },
  {
    name: "Vikram Shetty",
    role: "HIIT & Functional Specialist",
    exp: "5+ years",
    cert: "CrossFit Level 1",
    spec: "Weight Loss & Conditioning",
    image: "/images/trainers/male2.jpeg",
    imageAlt: "Trainer 3 — Add your image at: frontend/public/images/trainers/male2.jpeg",
    color: "#00C2FF",
  },
  {
    name: "Aditi Sharma",
    role: "Zumba & Group Fitness",
    exp: "4+ years",
    cert: "Licensed Zumba Instructor",
    spec: "Dance Fitness & Cardio",
    image: "/images/trainers/female2.jpeg",
    imageAlt: "Trainer 4 — Add your image at: frontend/public/images/trainers/female2.jpeg",
    color: "#EC4899",
  },
];

const PLANS = [
  {
    name: "Student Special",
    price: "₹999",
    period: "/month",
    note: "Valid ID Required",
    features: ["Full gym access", "Group classes", "Locker access", "Student community"],
    highlight: false,
    color: "#00C2FF",
  },
  {
    name: "Monthly",
    price: "₹1,500",
    period: "/month",
    note: "No commitment",
    features: ["Full gym access", "All group classes", "Locker access", "Fitness assessment"],
    highlight: false,
    color: "#FF6B00",
  },
  {
    name: "Quarterly",
    price: "₹3,999",
    period: "/3 months",
    note: "Save ₹501",
    features: ["Full gym access", "All group classes", "1 PT session/month", "Diet consultation", "Progress tracking"],
    highlight: true,
    color: "#FF1A1A",
  },
  {
    name: "Half-Yearly",
    price: "₹6,999",
    period: "/6 months",
    note: "Save ₹2,001",
    features: ["Full gym access", "All group classes", "2 PT sessions/month", "Diet & nutrition plan", "Body composition analysis"],
    highlight: false,
    color: "#FFB800",
  },
  {
    name: "Annual",
    price: "₹11,999",
    period: "/year",
    note: "Best value — Save ₹6,001",
    features: ["Full gym access", "All group classes", "4 PT sessions/month", "Full nutrition program", "Priority booking", "Guest passes"],
    highlight: false,
    color: "#22C55E",
  },
];

const STATS = [
  { label: "Active Members", value: 2400, suffix: "+", icon: "👥" },
  { label: "Expert Trainers", value: 48, suffix: "", icon: "🏋️" },
  { label: "Years of Excellence", value: 7, suffix: "+", icon: "⭐" },
  { label: "Satisfaction Rate", value: 99, suffix: "%", icon: "🔥" },
];

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Sessions", href: "#sessions" },
  { label: "Trainers", href: "#trainers" },
  { label: "Plans", href: "#plans" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

// ── Hooks ─────────────────────────────────────────────────────────────────────

const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

const useCountUp = (target, duration = 2000, active = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, active]);
  return count;
};

// ── Components ────────────────────────────────────────────────────────────────

const ScrollCard = ({ children, direction = "left", delay = 0 }) => {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView
          ? "translateX(0) translateY(0)"
          : direction === "left"
          ? "translateX(-80px)"
          : "translateX(80px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

const StatCard = ({ stat, index, active }) => {
  const count = useCountUp(stat.value, 2000 + index * 200, active);
  return (
    <div style={s.statCard}>
      <span style={s.statIcon}>{stat.icon}</span>
      <span style={s.statValue}>
        {count.toLocaleString()}{stat.suffix}
      </span>
      <span style={s.statLabel}>{stat.label}</span>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────



// ── Energy Section Styles ─────────────────────────────────────────────────────
const energyStyles = {
  section: {
    padding: "7rem 2rem",
    position: "relative",
    overflow: "hidden",
    minHeight: "600px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute", inset: 0,
    background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,26,26,0.1), transparent)",
    pointerEvents: "none",
    animation: "pulse 3s ease infinite",
  },
  inner: {
    maxWidth: "680px", width: "100%",
    textAlign: "center", position: "relative", zIndex: 1,
  },
  eyebrow: {
    display: "flex", alignItems: "center",
    justifyContent: "center", gap: "10px",
    marginBottom: "1.25rem",
  },
  eyebrowDot: {
    width: "8px", height: "8px", borderRadius: "50%",
    background: "#FF1A1A", flexShrink: 0,
    animation: "pulse 2s infinite",
  },
  eyebrowText: {
    fontSize: "11px", fontWeight: 700,
    letterSpacing: "4px", color: "#FF1A1A",
  },
  title: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "clamp(2rem, 5vw, 3.5rem)",
    letterSpacing: "2px", lineHeight: 1.1,
    marginBottom: "0.75rem",
    transition: "all 0.5s ease",
  },
  sub: {
    fontSize: "1rem", color: "rgba(255,255,255,0.45)",
    marginBottom: "2rem", minHeight: "24px",
    transition: "all 0.3s ease",
  },
  numberWrap: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "center", gap: "4px",
    marginBottom: "2rem", cursor: "pointer",
    userSelect: "none",
  },
  number: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "clamp(6rem, 18vw, 11rem)",
    letterSpacing: "-4px", lineHeight: 1,
    transition: "all 0.2s ease",
  },
  numberPct: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "clamp(2rem, 6vw, 4rem)",
    color: "rgba(255,255,255,0.4)",
    marginTop: "12px",
  },
  barWrap: { marginBottom: "3rem", position: "relative" },
  barTrack: {
    height: "8px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "4px", overflow: "visible",
    position: "relative",
  },
  barFill: {
    height: "100%", borderRadius: "4px",
    transition: "width 0.2s ease, background 0.5s ease, box-shadow 0.3s ease",
    position: "relative",
  },
  barTip: {
    position: "absolute",
    top: "50%", transform: "translate(-50%,-50%)",
    width: "16px", height: "16px",
    borderRadius: "50%",
    background: "#FF1A1A",
    boxShadow: "0 0 12px rgba(255,26,26,0.8)",
    animation: "pulse 1s infinite",
  },
  ticks: {
    display: "flex", justifyContent: "space-between",
    marginTop: "10px",
  },
  tick: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
  tickLine: { width: "1px", height: "6px", transition: "background 0.3s" },
  tickLabel: { fontSize: "10px", fontWeight: 600, transition: "color 0.3s" },
  shakeBox: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: "12px",
    padding: "2rem",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    marginBottom: "1rem",
  },
  phoneIcon: {
    fontSize: "3.5rem",
    display: "block",
    filter: "drop-shadow(0 0 20px rgba(255,26,26,0.4))",
  },
  shakeText: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "1.4rem", letterSpacing: "3px",
    color: "#fff",
  },
  shakeSubText: {
    fontSize: "0.85rem", color: "rgba(255,255,255,0.3)",
  },
  tapBtn: {
    width: "100px", height: "100px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #FF1A1A, #991111)",
    border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 0 40px rgba(255,26,26,0.4)",
    transition: "transform 0.1s ease",
  },
  tapBtnInner: { fontSize: "2.5rem" },
  permBtn: {
    marginTop: "1rem",
    padding: "12px 28px",
    background: "rgba(255,26,26,0.15)",
    border: "1px solid rgba(255,26,26,0.4)",
    borderRadius: "8px",
    color: "#FF1A1A", fontWeight: 700,
    fontSize: "14px", cursor: "pointer",
    letterSpacing: "1px",
  },
  goalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "0.75rem",
    marginBottom: "1rem",
  },
  goalChip: {
    position: "relative",
    padding: "1rem 0.75rem",
    borderRadius: "12px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: "6px",
    transition: "all 0.25s ease",
  },
  goalIcon: { fontSize: "1.6rem" },
  goalLabel: {
    fontSize: "12px", fontWeight: 700,
    letterSpacing: "0.5px", lineHeight: 1.2,
    textAlign: "center",
  },
  goalCheck: {
    position: "absolute", top: "8px", right: "8px",
    width: "18px", height: "18px",
    borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "10px", color: "#fff", fontWeight: 800,
  },
  planPreview: {
    display: "flex", alignItems: "center", gap: "1rem",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "1rem 1.5rem",
    marginBottom: "1.5rem",
    textAlign: "left",
  },
  planPreviewLabel: {
    fontSize: "10px", fontWeight: 800,
    letterSpacing: "3px", color: "rgba(255,255,255,0.4)",
    marginBottom: "4px",
  },
  planPreviewText: {
    fontSize: "0.95rem", fontWeight: 600, color: "#fff",
  },
  ctaBtn: {
    display: "inline-block",
    padding: "16px 40px",
    color: "#fff", textDecoration: "none",
    fontWeight: 800, fontSize: "1rem",
    letterSpacing: "0.5px",
    borderRadius: "8px",
    border: "none", cursor: "pointer",
    transition: "all 0.2s ease",
    width: "100%",
  },
  ctaNote: {
    fontSize: "12px", color: "rgba(255,255,255,0.3)",
    marginTop: "0.75rem",
  },
  backBtn: {
    marginTop: "1.5rem",
    background: "none", border: "none",
    color: "rgba(255,255,255,0.25)",
    fontSize: "13px", cursor: "pointer",
    letterSpacing: "1px",
    transition: "color 0.2s",
  },
  nameInputWrap: {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  alignItems: "center",
},
nameInput: {
  width: "100%",
  maxWidth: "380px",
  background: "rgba(255,255,255,0.04)",
  border: "2px solid",
  borderRadius: "12px",
  padding: "18px 24px",
  fontSize: "1.5rem",
  fontFamily: "'Bebas Neue', sans-serif",
  letterSpacing: "4px",
  textAlign: "center",
  color: "#fff",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.3s, color 0.3s",
  caretColor: "#FF1A1A",
},
letterCount: {
  display: "flex",
  gap: "5px",
  alignItems: "flex-end",
  height: "20px",
},
letterDot: {
  width: "8px",
  height: "20px",
  borderRadius: "4px",
  transition: "all 0.2s ease",
},
};

// ── Goals Data ────────────────────────────────────────────────────────────────
const GOALS = [
  {
    id: "weight",
    label: "Lose Weight",
    icon: "🔥",
    headline: "We'll burn it together.",
    plan: "Cardio + HIIT program — 4x per week",
    color: "#FF6B00",
  },
  {
    id: "muscle",
    label: "Build Muscle",
    icon: "💪",
    headline: "Let's build something real.",
    plan: "Strength Training — 5x per week",
    color: "#FF1A1A",
  },
  {
    id: "active",
    label: "Stay Active",
    icon: "⚡",
    headline: "Move more. Feel better.",
    plan: "Mixed program — 3x per week",
    color: "#FFB800",
  },
  {
    id: "flex",
    label: "Improve Flexibility",
    icon: "🧘",
    headline: "Stretch your limits.",
    plan: "Yoga + Functional — 4x per week",
    color: "#A855F7",
  },
  {
    id: "stress",
    label: "Reduce Stress",
    icon: "🌊",
    headline: "Your escape is here.",
    plan: "Yoga + Zumba — 3x per week",
    color: "#00C2FF",
  },
  {
    id: "sport",
    label: "Sport Performance",
    icon: "🥊",
    headline: "Train like an athlete.",
    plan: "Boxing + Conditioning — 5x per week",
    color: "#22C55E",
  },
];

// ── EnergyShakeSection Component ──────────────────────────────────────────────
function EnergyShakeSection({
  energy, setEnergy,
  selectedGoal, setSelectedGoal,
  goalStep, setGoalStep,
  shakeSupported, setShakeSupported,
  shakeHint, setShakeHint,
}) {
  const isFull = energy >= 95;
  const lastShakeRef = React.useRef(null);
  const decayRef     = React.useRef(null);
  const activeGoal   = GOALS.find((g) => g.id === selectedGoal);

  // Detect mobile vs desktop
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768 || "ontouchstart" in window);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // DESKTOP: Type-your-name fills the bar
  const [userName, setUserName] = React.useState("");
  const MAX_NAME_LENGTH = 12;

  const handleNameType = (e) => {
    const val = e.target.value.replace(/[^a-zA-Z ]/g, "");
    if (val.length > MAX_NAME_LENGTH) return;
    setUserName(val);
    const pct = Math.min(Math.round((val.length / MAX_NAME_LENGTH) * 100), 100);
    setEnergy(pct);
    if (val.length >= MAX_NAME_LENGTH) setShakeHint("done");
    else setShakeHint(val.length > 0 ? "typing" : "idle");
  };

  const getMobileLabel = () => {
    if (energy === 0)  return "Zero energy. Let's fix that.";
    if (energy < 30)   return "Warming up...";
    if (energy < 60)   return "Getting there! Keep shaking!";
    if (energy < 90)   return "🔥 Almost there! Don't stop!";
    if (energy < 100)  return "💥 One more shake!";
    return "MAXIMUM ENERGY UNLOCKED! 🔥";
  };

  const getDesktopLabel = () => {
    if (userName.length === 0) return "Type your name — each letter charges your energy.";
    if (userName.length < 4)   return `Hey ${userName}... keep going.`;
    if (userName.length < 8)   return `${userName}, feeling it yet? 🔥`;
    if (userName.length < MAX_NAME_LENGTH) return `Almost there, ${userName}!`;
    return `${userName.trim()}, YOUR ZONE IS READY. 🔥`;
  };
  const barColor = energy < 30
  ? "#FF6B00"
  : energy < 60
  ? "#FFB800"
  : energy < 90
  ? "#FF4400"
  : "#FF1A1A";
  return (
    <section style={{
      ...energyStyles.section,
      background: isFull
        ? "linear-gradient(180deg, #0d0000 0%, #1a0000 50%, #0d0000 100%)"
        : "linear-gradient(180deg, #000 0%, #060606 100%)",
      transition: "background 1.2s ease",
    }}>
      {isFull && <div style={energyStyles.glow} />}

      {/* ── Phase 1: Energy Meter ── */}
      {!goalStep && (
        <div style={energyStyles.inner}>

          {/* Label */}
          <div style={energyStyles.eyebrow}>
            <span style={energyStyles.eyebrowDot} />
            <span style={energyStyles.eyebrowText}>ENERGY CHECK</span>
          </div>

          <h2 style={{
            ...energyStyles.title,
            color: isFull ? "#FF1A1A" : "#fff",
            textShadow: isFull ? "0 0 60px rgba(255,26,26,0.4)" : "none",
            transition: "all 0.5s ease",
          }}>
            {isFull ? "THAT'S FITZONE ENERGY." : "HOW MUCH ENERGY DID YOU BRING?"}
          </h2>

          <p style={energyStyles.sub}>{isMobile ? getMobileLabel() : getDesktopLabel()}</p>

          {/* Big number */}
          <div
            style={{
              ...energyStyles.numberWrap,
              transform: shakeHint === "shaking" ? "scale(1.08)" : "scale(1)",
              transition: "transform 0.15s ease",
            }}
          >
            <span style={{
              ...energyStyles.number,
              color: isFull ? "#FF1A1A" : "#fff",
              textShadow: isFull
                ? "0 0 80px rgba(255,26,26,0.7)"
                : shakeHint === "shaking"
                ? "0 0 40px rgba(255,100,0,0.5)"
                : "none",
            }}>
              {energy}
            </span>
            <span style={energyStyles.numberPct}>%</span>
          </div>

          {/* Progress bar */}
          <div style={energyStyles.barWrap}>
            <div style={energyStyles.barTrack}>
              <div style={{
                ...energyStyles.barFill,
                width: `${energy}%`,
                background: barColor,
                boxShadow: energy > 0
                  ? "0 0 20px rgba(255,26,26,0.5)"
                  : "none",
              }} />
              {/* Animated pulse at tip */}
              {energy > 0 && energy < 100 && (
                <div style={{
                  ...energyStyles.barTip,
                  left: `${energy}%`,
                }} />
              )}
            </div>

            {/* Tick marks */}
            <div style={energyStyles.ticks}>
              {[0, 25, 50, 75, 100].map((v) => (
                <div key={v} style={energyStyles.tick}>
                  <div style={{
                    ...energyStyles.tickLine,
                    background: energy >= v ? "#FF1A1A" : "rgba(255,255,255,0.1)",
                  }} />
                  <span style={{
                    ...energyStyles.tickLabel,
                    color: energy >= v ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)",
                  }}>{v}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Interaction block — Mobile: shake / Desktop: type name ── */}
          {!isFull && (
            <div style={energyStyles.shakeBox}>
              {isMobile ? (
                /* ─── MOBILE: Shake ─── */
                <>
                  <div style={{
                    ...energyStyles.phoneIcon,
                    animation: shakeHint === "shaking"
                      ? "shakePhone 0.15s ease infinite"
                      : "shakePhoneIdle 2s ease-in-out infinite",
                  }}>
                    📱
                  </div>
                  <p style={energyStyles.shakeText}>
                    {shakeHint === "shaking"
                      ? "YES! KEEP SHAKING! 🔥"
                      : "SHAKE YOUR PHONE LIKE YOU MEAN IT"}
                  </p>
                  <p style={energyStyles.shakeSubText}>
                    The harder you shake, the faster it fills
                  </p>

                  {/* iOS permission button */}
                  {shakeSupported &&
                   typeof DeviceMotionEvent !== "undefined" &&
                   typeof DeviceMotionEvent.requestPermission === "function" &&
                   energy === 0 && (
                    <button onClick={requestShakePermission} style={energyStyles.permBtn}>
                      Allow Motion Access →
                    </button>
                  )}
                </>
              ) : (
                /* ─── DESKTOP: Type your name ─── */
                <>
                  <p style={energyStyles.shakeText}>
                    {shakeHint === "done"
                      ? `${userName.trim()}, YOUR ZONE IS READY. 🔥`
                      : "TYPE YOUR NAME TO UNLOCK YOUR ZONE"}
                  </p>
                  <p style={energyStyles.shakeSubText}>
                    {shakeHint === "idle" || shakeHint === "typing"
                      ? getDesktopLabel()
                      : ""}
                  </p>

                  {/* Name input */}
                  <div style={energyStyles.nameInputWrap}>
                    <input
                      type="text"
                      value={userName}
                      onChange={handleNameType}
                      placeholder="Enter your name..."
                      maxLength={MAX_NAME_LENGTH}
                      autoComplete="off"
                      style={{
                        ...energyStyles.nameInput,
                        borderColor: energy > 0
                          ? `rgba(255,26,26,${0.3 + (energy / 100) * 0.7})`
                          : "rgba(255,255,255,0.1)",
                        boxShadow: energy > 0
                          ? `0 0 ${energy / 3}px rgba(255,26,26,${energy / 200})`
                          : "none",
                        color: energy >= 100 ? "#FF1A1A" : "#fff",
                      }}
                    />
                    {/* Letter counter */}
                    <div style={energyStyles.letterCount}>
                      {Array.from({ length: MAX_NAME_LENGTH }).map((_, i) => (
                        <div key={i} style={{
                          ...energyStyles.letterDot,
                          background: i < userName.length
                            ? "#FF1A1A"
                            : "rgba(255,255,255,0.1)",
                          transform: i < userName.length ? "scaleY(1)" : "scaleY(0.5)",
                        }} />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Phase 2: Goal Selector ── */}
      {goalStep && (
        <div style={{ ...energyStyles.inner, animation: "fadeUp 0.6s ease forwards" }}>
          <div style={energyStyles.eyebrow}>
            <span style={energyStyles.eyebrowDot} />
            <span style={energyStyles.eyebrowText}>ENERGY LOCKED IN</span>
          </div>

          <h2 style={{ ...energyStyles.title, color: "#fff" }}>
            {selectedGoal
              ? activeGoal?.headline.toUpperCase()
              : "WHAT'S YOUR GOAL?"}
          </h2>

          <p style={energyStyles.sub}>
            {selectedGoal
              ? `Suggested: ${activeGoal?.plan}`
              : "Pick one. We'll build your perfect program."}
          </p>

          {/* Goal chips */}
          <div style={energyStyles.goalGrid}>
            {GOALS.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(
                  goal.id === selectedGoal ? null : goal.id
                )}
                style={{
                  ...energyStyles.goalChip,
                  border: selectedGoal === goal.id
                    ? `2px solid ${goal.color}`
                    : "2px solid rgba(255,255,255,0.08)",
                  background: selectedGoal === goal.id
                    ? goal.color + "18"
                    : "rgba(255,255,255,0.03)",
                  color: selectedGoal === goal.id
                    ? "#fff"
                    : "rgba(255,255,255,0.6)",
                  boxShadow: selectedGoal === goal.id
                    ? `0 0 20px ${goal.color}40`
                    : "none",
                  transform: selectedGoal === goal.id
                    ? "translateY(-3px)"
                    : "none",
                }}
              >
                <span style={energyStyles.goalIcon}>{goal.icon}</span>
                <span style={energyStyles.goalLabel}>{goal.label}</span>
                {selectedGoal === goal.id && (
                  <span style={{
                    ...energyStyles.goalCheck,
                    background: goal.color,
                  }}>✓</span>
                )}
              </button>
            ))}
          </div>

          {/* CTA */}
          {selectedGoal && (
            <div style={{ animation: "fadeUp 0.4s ease forwards", marginTop: "2.5rem" }}>
              <div style={energyStyles.planPreview}>
                <span style={{ color: activeGoal?.color, fontSize: "1.5rem" }}>
                  {activeGoal?.icon}
                </span>
                <div>
                  <p style={energyStyles.planPreviewLabel}>YOUR RECOMMENDED PLAN</p>
                  <p style={energyStyles.planPreviewText}>{activeGoal?.plan}</p>
                </div>
              </div>
              <a
                href={`/register?goal=${selectedGoal}`}
                style={{
                  ...energyStyles.ctaBtn,
                  background: `linear-gradient(135deg, ${activeGoal?.color}, ${activeGoal?.color}bb)`,
                  boxShadow: `0 8px 30px ${activeGoal?.color}50`,
                }}
              >
                Start My {activeGoal?.label} Journey →
              </a>
              <p style={energyStyles.ctaNote}>
                Free first session · No joining fee this month
              </p>
            </div>
          )}

          {/* Back link */}
          <button
            onClick={() => { setGoalStep(false); setEnergy(0); setSelectedGoal(null); }}
            style={energyStyles.backBtn}
          >
            ← Recharge energy
          </button>
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [energy, setEnergy] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [goalStep, setGoalStep] = useState(false);
  const [shakeSupported, setShakeSupported] = useState(false);
  const [shakeHint, setShakeHint] = useState("idle"); // idle | shaking | done
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [formSent, setFormSent] = useState(false);
  const videoRef = useRef(null);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phraseVisible, setPhraseVisible] = useState(true);

  const [statsRef, statsInView] = useInView(0.3);

  useEffect(() => {
  const interval = setInterval(() => {
    setPhraseVisible(false);
    setTimeout(() => {
      setPhraseIndex(i => (i + 1) % PHRASES.length);
      setPhraseVisible(true);
    }, 400);
  }, 4000);
  return () => clearInterval(interval);
}, []);
  // Scroll
  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Init video A
  useEffect(() => {
  if (videoRef.current) {
    videoRef.current.play().catch(() => {});
  }
}, []);

  const handleEnquiry = useCallback((e) => {
    e.preventDefault();
    setFormSent(true);
  }, []);

  const isFull = energy >= 95;

  return (
    <div style={s.root}>
      {/* ── Global styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #000; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #FF1A1A; border-radius: 2px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes phraseIn {
          from { opacity: 0; transform: translateY(20px) skewX(-3deg); }
          to   { opacity: 1; transform: translateY(0) skewX(0deg); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-12px); }
        }
        @keyframes pulse {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.3; }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes borderGlow {
          0%,100% { box-shadow: 0 0 20px rgba(255,26,26,0.3); }
          50%      { box-shadow: 0 0 40px rgba(255,26,26,0.7); }
        }
        @keyframes shakePhone {
          0%,100% { transform: rotate(-8deg) translateX(-4px); }
          50%      { transform: rotate(8deg) translateX(4px); }
        }
        @keyframes shakePhoneIdle {
          0%,100% { transform: rotate(-3deg); }
          50%      { transform: rotate(3deg); }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hero-phrase {
          animation: phraseIn 0.6s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .hero-phrase-exit {
          opacity: 0;
          transform: translateY(-20px);
          transition: all 0.3s ease;
        }
        .nav-link:hover { color: #FF1A1A !important; }
        .session-card:hover {
          transform: translateY(-8px) !important;
          border-color: var(--card-color) !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 30px var(--card-glow) !important;
        }
        .trainer-card:hover {
          transform: translateY(-8px) !important;
          border-color: var(--trainer-color) !important;
        }
        .plan-card:hover {
          transform: translateY(-6px) !important;
        }
        .cta-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 35px rgba(255,26,26,0.5) !important;
        }
        .outline-btn:hover {
          background: rgba(255,26,26,0.1) !important;
          border-color: #FF1A1A !important;
        }
        .social-link:hover { color: #FF1A1A !important; }
        .nav-dot:hover { background: #FF1A1A !important; transform: scale(1.3) !important; }
        input:focus, textarea:focus {
          outline: none !important;
          border-color: #FF1A1A !important;
          box-shadow: 0 0 0 2px rgba(255,26,26,0.15) !important;
        }
      `}</style>

      {/* ════════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════════ */}
      <nav style={{
        ...s.nav,
        background: scrollY > 60 ? "rgba(0,0,0,0.95)" : "transparent",
        borderBottom: scrollY > 60 ? "1px solid rgba(255,26,26,0.15)" : "1px solid transparent",
        backdropFilter: scrollY > 60 ? "blur(20px)" : "none",
      }}>
        <div style={s.navInner}>
          {/* Logo */}
          <div style={s.logo}>
            <div style={s.logoBox}>FZ</div>
            <div>
              <div style={s.logoName}>FITZONE</div>
              <div style={s.logoSub}>GYM</div>
            </div>
          </div>

          {/* Desktop links */}
          <div style={s.navLinks}>
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="nav-link" style={s.navLink}>
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div style={s.navRight}>
            <a href="/login" style={s.navSignIn}>Sign In</a>
            <a href="/register" className="cta-btn" style={s.navJoin}>Join Now</a>
          </div>

          {/* Burger */}
          <button style={s.burger} onClick={() => setMenuOpen(!menuOpen)}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{
                ...s.burgerLine,
                transform: menuOpen
                  ? i === 0 ? "rotate(45deg) translate(5px,5px)"
                  : i === 2 ? "rotate(-45deg) translate(5px,-5px)"
                  : "none"
                  : "none",
                opacity: menuOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={s.mobileMenu}>
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} style={s.mobileLink}
                onClick={() => setMenuOpen(false)}>{l.label}</a>
            ))}
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <a href="/login" style={s.navSignIn}>Sign In</a>
              <a href="/register" className="cta-btn" style={s.navJoin}>Join Now</a>
            </div>
          </div>
        )}
      </nav>

      {/* ════════════════════════════════════════════
          HERO — VIDEO BACKGROUND
      ════════════════════════════════════════════ */}
      <section id="home" style={s.hero}>
        {/* Video slots */}
        <video
        ref={videoRef}
        src="/hero-loop.mp4"
        style={s.videoBg}
        muted
        loop
        autoPlay
        playsInline
        preload="auto"
      />

        {/* Overlays */}
        <div style={s.heroOverlay} />
        <div style={s.heroVignette} />

        {/* Scanline effect */}
        <div style={s.scanline} />

        {/* Grid */}
        <div style={s.heroGrid} />

        {/* Content */}
        <div style={s.heroContent}>
          {/* Eyebrow */}
          <div style={s.heroEyebrow}>
            <span style={s.eyebrowDot} />
            <span style={s.eyebrowText}>BENGALURU'S PREMIUM GYM • EST. 2018</span>
          </div>

          {/* Gym name */}
          <div style={s.heroName}>
            <span style={s.heroNameIron}>FIT</span>
            <span style={s.heroNamePulse}>ZONE</span>
          </div>

          {/* Dynamic phrase */}
          <div style={s.phraseWrap}>
            <span
              className={phraseVisible ? "hero-phrase" : "hero-phrase-exit"}
              style={s.heroPhrase}
            >
              {PHRASES[phraseIndex]}
            </span>
          </div>

          {/* Sub */}
          <p style={s.heroSub}>
            Train Hard. Transform Strong.
          </p>

          {/* CTAs */}
          <div style={s.heroCtas}>
            <a href="/register" className="cta-btn" style={s.primaryBtn}>
              Start Your Journey →
            </a>
            <a href="#sessions" className="outline-btn" style={s.secondaryBtn}>
              Explore Programs
            </a>
          </div>

          {/* Video indicator */}
        </div>

        {/* Scroll hint */}
        <div style={s.scrollHint}>
          <div style={s.scrollMouse}>
            <div style={s.scrollWheel} />
          </div>
          <span style={s.scrollText}>SCROLL</span>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          STATS BAR
      ════════════════════════════════════════════ */}
      <section ref={statsRef} style={s.statsBar}>
        <div style={s.statsInner}>
          {STATS.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} active={statsInView} />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          ENERGY METER — SHAKE + GOAL SELECTOR
      ════════════════════════════════════════════ */}
      <EnergyShakeSection
        energy={energy}
        setEnergy={setEnergy}
        selectedGoal={selectedGoal}
        setSelectedGoal={setSelectedGoal}
        goalStep={goalStep}
        setGoalStep={setGoalStep}
        shakeSupported={shakeSupported}
        setShakeSupported={setShakeSupported}
        shakeHint={shakeHint}
        setShakeHint={setShakeHint}
      />

      {/* ════════════════════════════════════════════
          SESSIONS
      ════════════════════════════════════════════ */}
      <section id="sessions" style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionHeader}>
            <span style={s.sectionTag}>WHAT WE OFFER</span>
            <h2 style={s.sectionTitle}>
              SESSIONS BUILT FOR<br />
              <span style={s.redText}>EVERY BODY.</span>
            </h2>
            <p style={s.sectionSub}>
              From first-timers to seasoned athletes — every session is designed to push you further.
            </p>
          </div>

          <div style={s.sessionsGrid}>
            {SESSIONS.map((session, i) => (
              <ScrollCard key={i} direction={i % 2 === 0 ? "left" : "right"} delay={i * 0.05}>
                <div
                  className="session-card"
                  style={{
                    ...s.sessionCard,
                    "--card-color": session.color,
                    "--card-glow": session.color + "33",
                    transition: "all 0.35s ease",
                  }}
                >
                  {/* ── Image ── */}
                  <div style={s.sessionImgWrap}>
                    <img
                      src={session.image}
                      alt={session.title}
                      style={s.sessionImg}
                      onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                    />
                    {/* Placeholder — shown when image file is missing */}
                    <div style={{ ...s.sessionImgPlaceholder, borderColor: session.color + "50", display: "none" }}>
                      <span style={{ fontSize: "2rem", color: session.color }}>＋</span>
                      <span style={s.sessionPlaceholderTitle}>ADD IMAGE HERE</span>
                      <span style={s.sessionPlaceholderPath}>{session.imageAlt}</span>
                    </div>
                  </div>
                  {/* ── Body ── */}
                  <div style={s.sessionBody}>
                    <div style={{ ...s.sessionTag, color: session.color, borderColor: session.color + "40", background: session.color + "10" }}>
                      {session.tag}
                    </div>
                    <h3 style={s.sessionTitle}>{session.title}</h3>
                    <p style={s.sessionDesc}>{session.desc}</p>
                    <div style={{ height: "3px", marginTop: "1rem", borderRadius: "2px", background: session.color, opacity: 0.5 }} />
                  </div>
                </div>
              </ScrollCard>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          TRAINERS
      ════════════════════════════════════════════ */}
      <section id="trainers" style={{ ...s.section, background: "#050505" }}>
        <div style={s.sectionInner}>
          <div style={s.sectionHeader}>
            <span style={s.sectionTag}>THE TEAM</span>
            <h2 style={s.sectionTitle}>
              COACHES WHO<br />
              <span style={s.redText}>PUSH YOU FURTHER.</span>
            </h2>
            <p style={s.sectionSub}>
              Certified. Experienced. Committed to your transformation.
            </p>
          </div>

          <div style={s.trainersGrid}>
            {TRAINERS.map((trainer, i) => (
              <ScrollCard key={i} direction={i % 2 === 0 ? "left" : "right"} delay={i * 0.1}>
                <div
                  className="trainer-card"
                  style={{
                    ...s.trainerCard,
                    "--trainer-color": trainer.color,
                    transition: "all 0.35s ease",
                  }}
                >
                  {/* ── Trainer Image ── */}
                  <div style={s.trainerImgWrap}>
                    <img
                      src={trainer.image}
                      alt={trainer.name}
                      style={s.trainerImg}
                      onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                    />
                    {/* Placeholder — shown when image file is missing */}
                    <div style={{ ...s.trainerImgPlaceholder, borderColor: trainer.color + "50", display: "none" }}>
                      <span style={{ fontSize: "2.5rem", color: trainer.color }}>＋</span>
                      <span style={s.trainerPlaceholderTitle}>ADD PHOTO HERE</span>
                      <span style={s.trainerPlaceholderPath}>{trainer.imageAlt}</span>
                    </div>
                  </div>
                  <div style={{ ...s.trainerAccent, background: trainer.color }} />
                  <h3 style={s.trainerName}>{trainer.name}</h3>
                  <p style={{ ...s.trainerRole, color: trainer.color }}>{trainer.role}</p>
                  <div style={s.trainerMeta}>
                    <span style={s.trainerBadge}>{trainer.exp}</span>
                    <span style={s.trainerBadge}>{trainer.cert}</span>
                  </div>
                  <p style={s.trainerSpec}>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>Specialization: </span>
                    {trainer.spec}
                  </p>
                </div>
              </ScrollCard>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          PLANS
      ════════════════════════════════════════════ */}
      <section id="plans" style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionHeader}>
            <span style={s.sectionTag}>MEMBERSHIP</span>
            <h2 style={s.sectionTitle}>
              INVEST IN<br />
              <span style={s.redText}>YOURSELF.</span>
            </h2>
            <p style={s.sectionSub}>
              No hidden fees. No joining fee this month. Cancel anytime on monthly plan.
            </p>
          </div>

          <div style={s.plansGrid}>
            {PLANS.map((plan, i) => (
              <ScrollCard key={i} direction={i % 2 === 0 ? "left" : "right"} delay={i * 0.08}>
                <div
                  className="plan-card"
                  style={{
                    ...s.planCard,
                    border: plan.highlight
                      ? `2px solid #FF1A1A`
                      : "1px solid rgba(255,255,255,0.07)",
                    background: plan.highlight
                      ? "linear-gradient(135deg, rgba(255,26,26,0.08), rgba(0,0,0,0.9))"
                      : "rgba(255,255,255,0.02)",
                    animation: plan.highlight ? "borderGlow 3s ease infinite" : "none",
                    transition: "all 0.35s ease",
                  }}
                >
                  {plan.highlight && (
                    <div style={s.planBestBadge}>MOST POPULAR</div>
                  )}
                  <div style={{ ...s.planColorBar, background: plan.color }} />
                  <h3 style={s.planName}>{plan.name}</h3>
                  <div style={s.planPriceRow}>
                    <span style={s.planPrice}>{plan.price}</span>
                    <span style={s.planPeriod}>{plan.period}</span>
                  </div>
                  <p style={s.planNote}>{plan.note}</p>
                  <ul style={s.planFeatures}>
                    {plan.features.map((f, fi) => (
                      <li key={fi} style={s.planFeature}>
                        <span style={{ color: plan.color, marginRight: "8px" }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href="/register" className="cta-btn" style={{
                    ...s.planBtn,
                    background: plan.highlight ? "#FF1A1A" : "transparent",
                    border: plan.highlight ? "none" : `1px solid ${plan.color}`,
                    color: plan.highlight ? "#fff" : plan.color,
                  }}>
                    {plan.highlight ? "Get Started →" : "Choose Plan"}
                  </a>
                </div>
              </ScrollCard>
            ))}
          </div>

          <p style={s.planAddon}>
            + Personal Training add-on available at <strong style={{ color: "#FF1A1A" }}>₹4,000/month</strong>
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          ABOUT
      ════════════════════════════════════════════ */}
      <section id="about" style={{ ...s.section, background: "#050505" }}>
        <div style={s.aboutInner}>
          <ScrollCard direction="left">
            <div style={s.aboutLeft}>
              <span style={s.sectionTag}>OUR STORY</span>
              <h2 style={{ ...s.sectionTitle, textAlign: "left" }}>
                BUILT ON<br />
                <span style={s.redText}>REAL IRON.</span>
              </h2>
              <p style={s.aboutText}>
                FitZone Gym was founded in 2018 with one belief —
                that every person deserves access to world-class training, regardless
                of where they're starting from.
              </p>
              <p style={s.aboutText}>
                Located in the heart of Whitefield, Bengaluru, we've built a community
                of over 2,400 members who show up every day to become stronger versions
                of themselves.
              </p>
              <div style={s.aboutHours}>
                <div style={s.hoursItem}>
                  <span style={s.hoursDay}>Mon – Sat</span>
                  <span style={s.hoursTime}>5:00 AM – 10:30 PM</span>
                </div>
                <div style={s.hoursItem}>
                  <span style={s.hoursDay}>Sunday</span>
                  <span style={s.hoursTime}>6:00 AM – 1:00 PM</span>
                </div>
              </div>
            </div>
          </ScrollCard>

          <ScrollCard direction="right">
            <div style={s.aboutRight}>
              {[
                { icon: "🏆", title: "Certified Coaches", desc: "Every trainer is certified and experienced in their discipline." },
                { icon: "🔧", title: "Premium Equipment", desc: "State-of-the-art machines. Free weights. Functional zones." },
                { icon: "👥", title: "Real Community", desc: "A supportive family that pushes each other to be better." },
                { icon: "📊", title: "Tracked Progress", desc: "Body composition analysis and monthly fitness assessments." },
              ].map((item, i) => (
                <div key={i} style={s.aboutCard}>
                  <span style={s.aboutCardIcon}>{item.icon}</span>
                  <div>
                    <h4 style={s.aboutCardTitle}>{item.title}</h4>
                    <p style={s.aboutCardDesc}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollCard>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          ENQUIRY / CONTACT
      ════════════════════════════════════════════ */}
      <section id="contact" style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionHeader}>
            <span style={s.sectionTag}>GET IN TOUCH</span>
            <h2 style={s.sectionTitle}>
              YOUR FIRST STEP<br />
              <span style={s.redText}>STARTS HERE.</span>
            </h2>
            <p style={s.sectionSub}>
              Fill in your details and we'll reach out within 24 hours.
              First session is on us.
            </p>
          </div>

          <div style={s.contactWrap}>
            {/* Form */}
            <ScrollCard direction="left">
              <div style={s.formCard}>
                {formSent ? (
                  <div style={s.formSuccess}>
                    <span style={s.successIcon}>✓</span>
                    <h3 style={s.successTitle}>We'll be in touch!</h3>
                    <p style={s.successText}>
                      Our team will contact you within 24 hours to schedule your free session.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleEnquiry} style={s.form}>
                    <h3 style={s.formTitle}>Book a Free Session</h3>
                    {[
                      { key: "name", label: "Full Name", type: "text", placeholder: "Rahul Kumar" },
                      { key: "email", label: "Email Address", type: "email", placeholder: "rahul@email.com" },
                      { key: "phone", label: "Phone Number", type: "tel", placeholder: "+91 98765 43210" },
                    ].map(({ key, label, type, placeholder }) => (
                      <div key={key} style={s.formField}>
                        <label style={s.formLabel}>{label}</label>
                        <input
                          type={type}
                          placeholder={placeholder}
                          value={formData[key]}
                          onChange={(e) => setFormData(p => ({ ...p, [key]: e.target.value }))}
                          style={s.formInput}
                          required
                        />
                      </div>
                    ))}
                    <div style={s.formField}>
                      <label style={s.formLabel}>Message (Optional)</label>
                      <textarea
                        placeholder="Tell us your fitness goal..."
                        value={formData.message}
                        onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                        style={{ ...s.formInput, height: "100px", resize: "vertical" }}
                        rows={4}
                      />
                    </div>
                    <button type="submit" className="cta-btn" style={{ ...s.primaryBtn, width: "100%", justifyContent: "center" }}>
                      Book Free Session →
                    </button>
                  </form>
                )}
              </div>
            </ScrollCard>

            {/* Info */}
            <ScrollCard direction="right">
              <div style={s.contactInfo}>
                {[
                  { icon: "📍", label: "Address", value: "1st Floor, Lakshmi Arcade, Whitefield Main Road, Near Hope Farm Signal, Bengaluru – 560066" },
                  { icon: "📞", label: "Phone", value: "+91 98765 43210" },
                  { icon: "✉️", label: "Email", value: "info@fitzoneGym.in" },
                  { icon: "🕐", label: "Mon–Sat", value: "5:00 AM – 10:30 PM" },
                  { icon: "🕐", label: "Sunday", value: "6:00 AM – 1:00 PM" },
                ].map((item, i) => (
                  <div key={i} style={s.contactItem}>
                    <span style={s.contactIcon}>{item.icon}</span>
                    <div>
                      <span style={s.contactLabel}>{item.label}</span>
                      <span style={s.contactValue}>{item.value}</span>
                    </div>
                  </div>
                ))}

                {/* Social */}
                <div style={s.socials}>
                  {[
                    { label: "Instagram", href: "https://instagram.com/fitzoneGym", icon: "📸" },
                    { label: "Facebook", href: "https://facebook.com/fitzoneGym", icon: "👍" },
                    { label: "YouTube", href: "https://youtube.com/@fitzoneGym", icon: "▶️" },
                  ].map((s2, i) => (
                    <a key={i} href={s2.href} target="_blank" rel="noreferrer"
                      className="social-link" style={s.socialLink}>
                      <span>{s2.icon}</span>
                      <span>{s2.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </ScrollCard>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════ */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          {/* Left — Logo + copy */}
          <div style={s.footerLeft}>
            <div style={s.logo}>
              <div style={s.logoBox}>FZ</div>
              <div>
                <div style={s.logoName}>IRON PULSE</div>
                <div style={s.logoSub}>FITNESS STUDIO</div>
              </div>
            </div>
            <p style={s.footerTagline}>"Train Hard. Transform Strong."</p>
            <p style={s.footerCopy}>
              © {new Date().getFullYear()} FitZone Gym.<br />
              All rights reserved. Bengaluru, Karnataka.
            </p>
          </div>

          {/* Center — Vertical nav */}
          <div style={s.footerNav}>
            <span style={s.footerNavTitle}>NAVIGATE</span>
            <div style={s.footerNavLinks}>
              {NAV_LINKS.map((l) => (
                <a key={l.label} href={l.href} style={s.footerNavLink}
                  className="nav-link">
                  <span style={s.navDotSmall} />
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Right — Quick info */}
          <div style={s.footerRight}>
            <span style={s.footerNavTitle}>QUICK INFO</span>
            <p style={s.footerInfo}>📍 Whitefield, Bengaluru – 560066</p>
            <p style={s.footerInfo}>📞 +91 98765 43210</p>
            <p style={s.footerInfo}>✉️ info@fitzoneGym.in</p>
            <p style={s.footerInfo}>⏰ Mon–Sat: 5AM – 10:30PM</p>
            <p style={s.footerInfo}>⏰ Sunday: 6AM – 1PM</p>
            <div style={{ ...s.socials, marginTop: "1.5rem" }}>
              {[
                { href: "https://instagram.com/fitzoneGym", icon: "📸" },
                { href: "https://facebook.com/fitzoneGym", icon: "👍" },
                { href: "https://youtube.com/@fitzoneGym", icon: "▶️" },
              ].map((item, i) => (
                <a key={i} href={item.href} target="_blank" rel="noreferrer"
                  style={s.footerSocial} className="social-link">
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={s.footerBottom}>
          <span style={s.footerBottomText}>
            Built with ❤️ for the FitZone community
          </span>
          <div style={s.footerBottomLinks}>
            <a href="#" style={s.footerBottomLink}>Privacy Policy</a>
            <a href="#" style={s.footerBottomLink}>Terms of Use</a>
            <a href="#" style={s.footerBottomLink}>Refund Policy</a>
          </div>
        </div>
      </footer>

      {/* ════════════════════════════════════════════
          VERTICAL NAV DOTS (right side)
      ════════════════════════════════════════════ */}
      <div style={s.verticalNav}>
        {NAV_LINKS.map((link, i) => (
          <a key={i} href={link.href} title={link.label}
            className="nav-dot"
            style={{
              ...s.verticalDot,
              transition: "all 0.2s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#000",
    color: "#F5F5F0",
    overflowX: "hidden",
  },

  // NAV
  nav: {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
    transition: "all 0.3s ease",
  },
  navInner: {
    maxWidth: "1400px", margin: "0 auto",
    padding: "0 2rem", height: "70px",
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
  },
  logo: { display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" },
  logoBox: {
    width: "44px", height: "44px",
    background: "linear-gradient(135deg, #FF1A1A, #991111)",
    borderRadius: "8px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "20px", color: "#fff", letterSpacing: "1px",
    boxShadow: "0 4px 20px rgba(255,26,26,0.4)",
  },
  logoName: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "20px", letterSpacing: "3px", color: "#fff", lineHeight: 1,
  },
  logoSub: {
    fontSize: "9px", letterSpacing: "4px",
    color: "#FF1A1A", fontWeight: 600,
  },
  navLinks: { display: "flex", gap: "2rem" },
  navLink: {
    fontWeight: 500, fontSize: "13px",
    letterSpacing: "1.5px", textTransform: "uppercase",
    color: "rgba(255,255,255,0.65)", textDecoration: "none",
    transition: "color 0.2s",
  },
  navRight: { display: "flex", alignItems: "center", gap: "1rem" },
  navSignIn: {
    fontSize: "13px", fontWeight: 600,
    color: "rgba(255,255,255,0.6)", textDecoration: "none",
  },
  navJoin: {
    fontSize: "13px", fontWeight: 700, letterSpacing: "0.5px",
    color: "#fff", textDecoration: "none",
    padding: "10px 22px",
    background: "linear-gradient(135deg, #FF1A1A, #991111)",
    borderRadius: "6px",
    boxShadow: "0 4px 15px rgba(255,26,26,0.35)",
    transition: "all 0.2s",
  },
  burger: {
    display: "none", flexDirection: "column", gap: "5px",
    background: "none", border: "none", cursor: "pointer", padding: "4px",
  },
  burgerLine: {
    display: "block", width: "24px", height: "2px",
    background: "#fff", transition: "all 0.3s",
    borderRadius: "2px",
  },
  mobileMenu: {
    background: "rgba(0,0,0,0.98)",
    borderTop: "1px solid rgba(255,26,26,0.2)",
    padding: "1.5rem 2rem",
    display: "flex", flexDirection: "column", gap: "1rem",
  },
  mobileLink: {
    fontSize: "16px", fontWeight: 600,
    color: "rgba(255,255,255,0.8)", textDecoration: "none",
    padding: "0.5rem 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },

  // HERO
  hero: {
    position: "relative", minHeight: "100vh",
    display: "flex", alignItems: "center",
    overflow: "hidden",
  },
  videoBg: {
    position: "absolute", inset: 0,
    width: "100%", height: "100%",
    objectFit: "cover",
  },
  heroOverlay: {
    position: "absolute", inset: 0,
    background: "linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.75) 100%)",
  },
  heroVignette: {
    position: "absolute", inset: 0,
    background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)",
  },
  scanline: {
    position: "absolute", inset: 0,
    background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
    pointerEvents: "none",
  },
  heroGrid: {
    position: "absolute", inset: 0,
    backgroundImage: "linear-gradient(rgba(255,26,26,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,26,26,0.03) 1px, transparent 1px)",
    backgroundSize: "80px 80px",
    pointerEvents: "none",
  },
  heroContent: {
    position: "relative", zIndex: 10,
    maxWidth: "1400px", margin: "0 auto",
    padding: "0 2rem", paddingTop: "70px",
    width: "100%",
    animation: "fadeUp 1s ease forwards",
  },
  heroEyebrow: {
    display: "flex", alignItems: "center", gap: "10px",
    marginBottom: "1.5rem",
  },
  eyebrowDot: {
    width: "8px", height: "8px", borderRadius: "50%",
    background: "#FF1A1A",
    animation: "pulse 2s infinite",
    flexShrink: 0,
  },
  eyebrowText: {
    fontSize: "11px", fontWeight: 700,
    letterSpacing: "3px", color: "#FF1A1A",
  },
  heroName: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "clamp(5rem, 14vw, 12rem)",
    lineHeight: 0.85, letterSpacing: "-2px",
    marginBottom: "1rem",
  },
  heroNameIron: { color: "#F5F5F0" },
  heroNamePulse: {
    background: "linear-gradient(135deg, #FF1A1A, #FF6B00)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  phraseWrap: { minHeight: "70px", marginBottom: "1rem" },
  heroPhrase: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "clamp(2rem, 5vw, 4rem)",
    letterSpacing: "6px",
    color: "rgba(255,255,255,0.85)",
    display: "block",
  },
  heroSub: {
    fontSize: "1.1rem", fontWeight: 300,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: "4px", textTransform: "uppercase",
    marginBottom: "2.5rem",
  },
  heroCtas: { display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "3rem" },
  primaryBtn: {
    display: "inline-flex", alignItems: "center", gap: "8px",
    padding: "14px 36px",
    background: "linear-gradient(135deg, #FF1A1A, #991111)",
    color: "#fff", textDecoration: "none",
    fontWeight: 700, fontSize: "14px", letterSpacing: "0.5px",
    borderRadius: "6px",
    boxShadow: "0 6px 25px rgba(255,26,26,0.4)",
    transition: "all 0.2s",
    border: "none", cursor: "pointer",
  },
  secondaryBtn: {
    display: "inline-flex", alignItems: "center", gap: "8px",
    padding: "14px 32px",
    background: "transparent",
    color: "rgba(255,255,255,0.75)",
    textDecoration: "none",
    fontWeight: 600, fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid rgba(255,255,255,0.2)",
    transition: "all 0.2s",
    cursor: "pointer",
  },
  videoIndicator: { display: "flex", gap: "6px", alignItems: "center" },
  videoDot: {
    height: "6px", borderRadius: "3px",
    transition: "all 0.4s ease",
  },
  scrollHint: {
    position: "absolute", bottom: "2rem", left: "50%",
    transform: "translateX(-50%)",
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: "8px",
    zIndex: 10,
  },
  scrollMouse: {
    width: "24px", height: "38px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderRadius: "12px",
    display: "flex", justifyContent: "center",
    padding: "4px",
  },
  scrollWheel: {
    width: "4px", height: "8px",
    background: "#FF1A1A", borderRadius: "2px",
    animation: "float 1.5s ease-in-out infinite",
  },
  scrollText: {
    fontSize: "9px", letterSpacing: "3px",
    color: "rgba(255,255,255,0.3)", fontWeight: 600,
  },

  // STATS BAR
  statsBar: {
    borderTop: "1px solid rgba(255,26,26,0.15)",
    borderBottom: "1px solid rgba(255,26,26,0.15)",
    background: "rgba(5,5,5,0.95)",
    backdropFilter: "blur(20px)",
  },
  statsInner: {
    maxWidth: "1400px", margin: "0 auto",
    padding: "0 2rem",
    display: "flex", alignItems: "center",
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
  statCard: {
    display: "flex", flexDirection: "column",
    alignItems: "center", padding: "2rem 2.5rem",
    gap: "4px",
  },
  statIcon: { fontSize: "1.5rem", marginBottom: "4px" },
  statValue: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "2.8rem", color: "#fff",
    letterSpacing: "-1px", lineHeight: 1,
  },
  statLabel: {
    fontSize: "11px", letterSpacing: "2px",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.4)", fontWeight: 600,
  },

  // ENERGY
  energySection: { padding: "6rem 2rem", position: "relative", overflow: "hidden" },
  energyGlow: {
    position: "absolute", inset: 0,
    background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,26,26,0.08), transparent)",
    pointerEvents: "none",
  },
  energyInner: {
    maxWidth: "700px", margin: "0 auto",
    textAlign: "center", position: "relative", zIndex: 1,
  },
  energyTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "clamp(2rem, 4vw, 3rem)",
    color: "#fff", marginBottom: "0.75rem",
    letterSpacing: "2px",
  },
  energySub: {
    color: "rgba(255,255,255,0.45)", marginBottom: "2rem",
    fontSize: "1rem",
  },
  energyDisplay: { marginBottom: "2rem" },
  energyNumber: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "clamp(5rem, 12vw, 9rem)",
    letterSpacing: "-4px", lineHeight: 1,
    transition: "all 0.3s ease",
  },
  sliderWrap: { position: "relative", marginBottom: "2.5rem" },
  sliderTrack: {
    height: "6px", background: "rgba(255,255,255,0.08)",
    borderRadius: "3px", overflow: "hidden",
  },
  sliderFill: { height: "100%", borderRadius: "3px", transition: "width 0.1s, background 0.5s" },
  sliderInput: {
    position: "absolute", inset: 0,
    width: "100%", height: "6px",
    opacity: 0, cursor: "pointer",
  },

  // SECTIONS
  section: {
    padding: "7rem 0",
    background: "#000",
  },
  sectionInner: {
    maxWidth: "1400px", margin: "0 auto", padding: "0 2rem",
  },
  sectionHeader: {
    textAlign: "center", marginBottom: "4rem",
  },
  sectionTag: {
    display: "inline-block",
    fontSize: "11px", fontWeight: 700,
    letterSpacing: "4px", textTransform: "uppercase",
    color: "#FF1A1A",
    background: "rgba(255,26,26,0.08)",
    border: "1px solid rgba(255,26,26,0.2)",
    padding: "6px 16px", borderRadius: "100px",
    marginBottom: "1rem",
  },
  sectionTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
    color: "#fff", letterSpacing: "2px",
    lineHeight: 1, marginBottom: "1rem",
    textAlign: "center",
  },
  sectionSub: {
    color: "rgba(255,255,255,0.45)",
    fontSize: "1rem", maxWidth: "500px",
    margin: "0 auto", lineHeight: 1.7,
  },
  redText: {
    background: "linear-gradient(135deg, #FF1A1A, #FF6B00)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  // SESSIONS
  sessionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "1.5rem",
  },
  sessionCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "2rem",
    cursor: "pointer",
  },
  sessionIcon: {
    width: "52px", height: "52px",
    borderRadius: "12px",
    display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "1.5rem",
    marginBottom: "1rem",
  },
  sessionTag: {
    display: "inline-block",
    fontSize: "10px", fontWeight: 700,
    letterSpacing: "2px", textTransform: "uppercase",
    padding: "3px 10px", borderRadius: "100px",
    border: "1px solid",
    marginBottom: "0.75rem",
  },
  sessionTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "1.5rem", letterSpacing: "1px",
    color: "#fff", marginBottom: "0.5rem",
  },
  sessionDesc: {
    color: "rgba(255,255,255,0.45)",
    fontSize: "0.875rem", lineHeight: 1.6,
  },

  // TRAINERS
  trainersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "1.5rem",
  },
  trainerCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px", padding: "2rem",
    position: "relative", overflow: "hidden",
    cursor: "pointer",
  },
  trainerAvatar: {
    width: "80px", height: "80px",
    borderRadius: "50%",
    display: "flex", alignItems: "center",
    justifyContent: "center",
    marginBottom: "1rem",
  },
  trainerEmoji: { fontSize: "2.5rem" },
  trainerAccent: {
    position: "absolute", top: 0, right: 0,
    width: "4px", height: "60px",
    borderRadius: "0 16px 0 4px",
  },
  trainerName: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "1.6rem", letterSpacing: "1px",
    color: "#fff", marginBottom: "0.25rem",
  },
  trainerRole: {
    fontSize: "0.8rem", fontWeight: 700,
    letterSpacing: "1.5px", textTransform: "uppercase",
    marginBottom: "1rem",
  },
  trainerMeta: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "1rem" },
  trainerBadge: {
    fontSize: "11px", fontWeight: 600,
    color: "rgba(255,255,255,0.5)",
    background: "rgba(255,255,255,0.06)",
    padding: "4px 10px", borderRadius: "100px",
  },
  trainerSpec: {
    fontSize: "0.85rem",
    color: "rgba(255,255,255,0.7)",
    lineHeight: 1.5,
  },

  // PLANS
  plansGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap: "1.25rem",
  },
  planCard: {
    borderRadius: "16px", padding: "2rem",
    position: "relative", overflow: "hidden",
    cursor: "pointer",
  },
  planBestBadge: {
    position: "absolute", top: "16px", right: "16px",
    fontSize: "9px", fontWeight: 800,
    letterSpacing: "2px",
    color: "#FF1A1A",
    background: "rgba(255,26,26,0.1)",
    border: "1px solid rgba(255,26,26,0.3)",
    padding: "4px 10px", borderRadius: "100px",
  },
  planColorBar: {
    height: "3px", borderRadius: "2px",
    marginBottom: "1.5rem",
  },
  planName: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "1.4rem", letterSpacing: "1px",
    color: "#fff", marginBottom: "0.75rem",
  },
  planPriceRow: { display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "0.25rem" },
  planPrice: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "2.5rem", color: "#fff", letterSpacing: "-1px",
  },
  planPeriod: { fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" },
  planNote: {
    fontSize: "11px", color: "#FF1A1A", fontWeight: 600,
    letterSpacing: "1px", marginBottom: "1.25rem",
  },
  planFeatures: { listStyle: "none", marginBottom: "1.5rem" },
  planFeature: {
    fontSize: "0.85rem", color: "rgba(255,255,255,0.6)",
    padding: "5px 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  planBtn: {
    display: "block", width: "100%",
    padding: "12px", textAlign: "center",
    textDecoration: "none", fontWeight: 700,
    fontSize: "13px", letterSpacing: "0.5px",
    borderRadius: "8px",
    transition: "all 0.2s",
    cursor: "pointer",
  },
  planAddon: {
    textAlign: "center", marginTop: "2.5rem",
    color: "rgba(255,255,255,0.4)", fontSize: "0.9rem",
  },

  // ABOUT
  aboutInner: {
    maxWidth: "1400px", margin: "0 auto",
    padding: "0 2rem",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "4rem", alignItems: "center",
  },
  aboutLeft: {},
  aboutText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: "1rem", lineHeight: 1.8,
    marginBottom: "1.25rem",
  },
  aboutHours: {
    marginTop: "2rem",
    padding: "1.5rem",
    background: "rgba(255,26,26,0.05)",
    border: "1px solid rgba(255,26,26,0.15)",
    borderRadius: "12px",
  },
  hoursItem: {
    display: "flex", justifyContent: "space-between",
    padding: "0.5rem 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  hoursDay: { color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" },
  hoursTime: { color: "#fff", fontWeight: 600, fontSize: "0.9rem" },
  aboutRight: { display: "flex", flexDirection: "column", gap: "1rem" },
  aboutCard: {
    display: "flex", gap: "1rem", alignItems: "flex-start",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px", padding: "1.25rem",
  },
  aboutCardIcon: { fontSize: "1.5rem", flexShrink: 0 },
  aboutCardTitle: {
    fontWeight: 700, fontSize: "0.95rem",
    color: "#fff", marginBottom: "4px",
  },
  aboutCardDesc: { fontSize: "0.85rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 },

  // CONTACT
  contactWrap: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "3rem", alignItems: "start",
  },
  formCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px", padding: "2.5rem",
  },
  formTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "1.8rem", letterSpacing: "1px",
    color: "#fff", marginBottom: "1.5rem",
  },
  form: { display: "flex", flexDirection: "column", gap: "1.25rem" },
  formField: { display: "flex", flexDirection: "column", gap: "6px" },
  formLabel: { fontSize: "12px", fontWeight: 600, letterSpacing: "1px", color: "rgba(255,255,255,0.5)" },
  formInput: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px", padding: "12px 14px",
    color: "#fff", fontSize: "0.9rem",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s",
    width: "100%",
  },
  formSuccess: { textAlign: "center", padding: "2rem 0" },
  successIcon: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: "64px", height: "64px", borderRadius: "50%",
    background: "rgba(34,197,94,0.1)", border: "2px solid #22C55E",
    fontSize: "1.5rem", color: "#22C55E", marginBottom: "1rem",
  },
  successTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "2rem", color: "#fff", marginBottom: "0.5rem",
  },
  successText: { color: "rgba(255,255,255,0.5)", lineHeight: 1.6 },
  contactInfo: { display: "flex", flexDirection: "column", gap: "1.25rem" },
  contactItem: {
    display: "flex", gap: "1rem", alignItems: "flex-start",
  },
  contactIcon: { fontSize: "1.1rem", flexShrink: 0, marginTop: "2px" },
  contactLabel: {
    display: "block", fontSize: "11px",
    fontWeight: 700, letterSpacing: "1.5px",
    color: "#FF1A1A", textTransform: "uppercase",
    marginBottom: "2px",
  },
  contactValue: {
    display: "block", fontSize: "0.9rem",
    color: "rgba(255,255,255,0.6)", lineHeight: 1.5,
  },
  socials: { display: "flex", gap: "1rem", flexWrap: "wrap" },
  socialLink: {
    display: "flex", alignItems: "center", gap: "6px",
    fontSize: "13px", fontWeight: 600,
    color: "rgba(255,255,255,0.5)",
    textDecoration: "none",
    padding: "8px 14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    transition: "color 0.2s",
  },

  // FOOTER
  footer: {
    background: "#050505",
    borderTop: "1px solid rgba(255,26,26,0.15)",
  },
  footerInner: {
    maxWidth: "1400px", margin: "0 auto",
    padding: "4rem 2rem",
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr 1.5fr",
    gap: "3rem",
  },
  footerLeft: {},
  footerTagline: {
    fontStyle: "italic",
    color: "rgba(255,255,255,0.35)",
    fontSize: "0.9rem", margin: "1rem 0",
  },
  footerCopy: {
    fontSize: "0.8rem",
    color: "rgba(255,255,255,0.25)",
    lineHeight: 1.7,
  },
  footerNav: { display: "flex", flexDirection: "column" },
  footerNavTitle: {
    fontSize: "10px", fontWeight: 800,
    letterSpacing: "3px", color: "#FF1A1A",
    marginBottom: "1.5rem",
  },
  footerNavLinks: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  footerNavLink: {
    display: "flex", alignItems: "center", gap: "10px",
    fontSize: "0.9rem", color: "rgba(255,255,255,0.5)",
    textDecoration: "none", transition: "color 0.2s",
  },
  navDotSmall: {
    width: "5px", height: "5px", borderRadius: "50%",
    background: "#FF1A1A", flexShrink: 0,
  },
  footerRight: {},
  footerInfo: {
    fontSize: "0.85rem", color: "rgba(255,255,255,0.4)",
    marginBottom: "0.5rem", lineHeight: 1.5,
  },
  footerSocial: {
    width: "38px", height: "38px",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px", fontSize: "1rem",
    textDecoration: "none",
    transition: "color 0.2s",
  },
  footerBottom: {
    borderTop: "1px solid rgba(255,255,255,0.05)",
    padding: "1.5rem 2rem",
    maxWidth: "1400px", margin: "0 auto",
    display: "flex", justifyContent: "space-between",
    alignItems: "center", flexWrap: "wrap", gap: "1rem",
  },
  footerBottomText: { fontSize: "0.8rem", color: "rgba(255,255,255,0.2)" },
  footerBottomLinks: { display: "flex", gap: "1.5rem" },
  footerBottomLink: {
    fontSize: "0.8rem", color: "rgba(255,255,255,0.25)",
    textDecoration: "none", transition: "color 0.2s",
  },

  // VERTICAL NAV DOTS
  verticalNav: {
    position: "fixed", right: "1.5rem",
    top: "50%", transform: "translateY(-50%)",
    display: "flex", flexDirection: "column",
    gap: "10px", zIndex: 900,
  },
  verticalDot: {
    width: "8px", height: "8px", borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    display: "block", cursor: "pointer",
    transition: "all 0.2s",
  },

  // SESSION IMAGE PLACEHOLDER
  sessionImgWrap: {
    width: "100%",
    height: "200px",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "1.25rem",
    position: "relative",
    background: "rgba(255,255,255,0.03)",
  },
  sessionImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  sessionImgPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    border: "2px dashed",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.02)",
  },
  sessionPlaceholderTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "1rem",
    letterSpacing: "3px",
    color: "rgba(255,255,255,0.5)",
  },
  sessionPlaceholderPath: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.25)",
    textAlign: "center",
    padding: "0 1rem",
    wordBreak: "break-all",
  },
  sessionBody: {
    padding: "0",
  },
  sessionColorBar: {
    height: "3px",
    borderRadius: "2px",
    marginTop: "1rem",
    opacity: 0.5,
  },

  // TRAINER IMAGE PLACEHOLDER
  trainerImgWrap: {
    width: "100%",
    height: "220px",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "1.25rem",
    position: "relative",
    background: "rgba(255,255,255,0.03)",
  },
  trainerImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "top",
    display: "block",
  },
  trainerImgPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    border: "2px dashed",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.02)",
  },
  trainerPlaceholderTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "1rem",
    letterSpacing: "3px",
    color: "rgba(255,255,255,0.5)",
  },
  trainerPlaceholderPath: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.25)",
    textAlign: "center",
    padding: "0 1rem",
    wordBreak: "break-all",
  },

  // DESKTOP NAME INPUT
  nameInputWrap: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "center",
  },
  nameInput: {
    width: "100%",
    maxWidth: "380px",
    background: "rgba(255,255,255,0.04)",
    border: "2px solid",
    borderRadius: "12px",
    padding: "18px 24px",
    fontSize: "1.5rem",
    fontFamily: "'Bebas Neue', sans-serif",
    letterSpacing: "4px",
    textAlign: "center",
    color: "#fff",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.3s, color 0.3s",
    caretColor: "#FF1A1A",
  },
  letterCount: {
    display: "flex",
    gap: "5px",
    alignItems: "flex-end",
    height: "20px",
  },
  letterDot: {
    width: "8px",
    height: "20px",
    borderRadius: "4px",
    transition: "all 0.2s ease",
  },
};