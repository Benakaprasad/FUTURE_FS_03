import React, { useState, useEffect, useRef, useCallback } from "react";
import FitZoneChatbot from "../../components/FitZoneChatbot";
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

// ── Carousel constants ─────────────────────────────────────────────────────
const ITEMS = [...SESSIONS, ...SESSIONS, ...SESSIONS];
const CARD_WIDTH = 320;
const CARD_GAP = 24;
const CARD_STEP = CARD_WIDTH + CARD_GAP;
const TOTAL_WIDTH = SESSIONS.length * CARD_STEP;

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

function SplitWord({ word, progress, delay = 0, color }) {
  const letters = word.split("");
  return (
    <span style={{ display: "inline-block", overflow: "visible" }}>
      {letters.map((ch, i) => {
        const lp = Math.max(0, Math.min(1, (progress - delay) * 3 - i * 0.08));
        const tx = (i < letters.length / 2 ? -1 : 1) * lp * (40 + i * 6);
        const opacity = 1 - lp;
        return (
          <span key={i} style={{
            display: "inline-block",
            transform: `translateX(${tx}px) translateY(${-lp * 30}px) scale(${1 - lp * 0.3})`,
            opacity,
            transition: "none",
            color: color || "inherit",
          }}>{ch === " " ? "\u00a0" : ch}</span>
        );
      })}
    </span>
  );
}

function SessionCard({ session, isActive }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: -dy * 6, y: dx * 6 });
  };
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => { setIsHovered(false); setTilt({ x: 0, y: 0 }); };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
      position: "relative",
      width: "100%",
      height: "380px",
      cursor: "pointer",
      transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      transition: isHovered ? "transform 0.15s ease" : "transform 0.45s cubic-bezier(0.4,0,0.2,1)",
      willChange: "transform",
    }}
    >
      {/* ── Background Image — always visible ── */}
      <img
        src={session.image}
        alt={session.title}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          transform: isHovered ? "scale(1.08)" : "scale(1.0)",
          transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
          willChange: "transform",
        }}
      />

      {/* ── Base gradient — always dark at bottom ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: isHovered
          ? "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.92) 100%)"
          : "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.96) 100%)",
        transition: "background 0.4s ease",
      }} />

      {/* ── Color tint overlay on hover ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(135deg, ${session.color}22, transparent 60%)`,
        opacity: isHovered ? 1 : 0,
        transition: "opacity 0.4s ease",
      }} />

      {/* ── Top left — tag pill, always visible ── */}
      <div style={{
        position: "absolute", top: 16, left: 16,
        fontSize: "9px", fontWeight: 800,
        letterSpacing: "2px", textTransform: "uppercase",
        color: session.color,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${session.color}55`,
        padding: "5px 12px", borderRadius: "100px",
        boxShadow: isHovered ? `0 0 14px ${session.color}40` : "none",
        transition: "box-shadow 0.3s",
        zIndex: 3,
      }}>{session.tag}</div>

      {/* ── Top right — arrow icon, appears on hover ── */}
      <div style={{
        position: "absolute", top: 14, right: 14,
        width: "34px", height: "34px", borderRadius: "50%",
        background: isHovered ? session.color : "rgba(255,255,255,0.08)",
        border: `1px solid ${isHovered ? session.color : "rgba(255,255,255,0.15)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "14px", color: "#fff",
        transform: isHovered ? "rotate(-45deg) scale(1.1)" : "rotate(0deg) scale(1)",
        transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: isHovered ? `0 0 20px ${session.color}60` : "none",
        zIndex: 3,
      }}>→</div>

      {/* ── Bottom content — slides up on hover ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "1.5rem",
        transform: isHovered ? "translateY(0)" : "translateY(12px)",
        transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
        zIndex: 3,
      }}>

        {/* Accent line */}
        <div style={{
          width: isHovered ? "40px" : "20px",
          height: "2px",
          background: session.color,
          borderRadius: "2px",
          marginBottom: "10px",
          transition: "width 0.4s ease",
          boxShadow: `0 0 8px ${session.color}80`,
        }} />

        {/* Title — always visible */}
        <h3 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "1.55rem",
          fontWeight: 400,
          letterSpacing: "2px",
          color: "#fff",
          lineHeight: 1.05,
          marginBottom: isHovered ? "0.6rem" : "0",
          textShadow: "0 2px 12px rgba(0,0,0,0.8)",
          transition: "margin 0.3s ease",
        }}>{session.title}</h3>

        {/* Description — slides in on hover */}
        <div style={{
          overflow: "hidden",
          maxHeight: isHovered ? "80px" : "0px",
          opacity: isHovered ? 1 : 0,
          transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease",
        }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.8rem",
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.72)",
            marginBottom: "1rem",
          }}>{session.desc}</p>

          {/* Bottom row */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
          }}>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "10px", fontWeight: 800,
              letterSpacing: "2px", color: session.color,
              textTransform: "uppercase",
            }}>Learn More</span>

            <div style={{
              display: "flex", gap: "4px",
            }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{
                  width: "4px", height: "4px", borderRadius: "50%",
                  background: i === 0 ? session.color : "rgba(255,255,255,0.2)",
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom accent glow line ── */}
      <div style={{
        position: "absolute", bottom: 0, left: "10%", right: "10%", height: "1px",
        background: `linear-gradient(90deg, transparent, ${session.color}, transparent)`,
        boxShadow: `0 0 20px 4px ${session.color}50`,
        opacity: isHovered ? 1 : 0,
        transition: "opacity 0.4s ease",
      }} />

      {/* ── Shimmer on hover ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle at ${50 + tilt.y * 5}% ${50 - tilt.x * 5}%, rgba(255,255,255,0.06) 0%, transparent 65%)`,
        opacity: isHovered ? 1 : 0,
        transition: "opacity 0.2s",
        pointerEvents: "none",
        zIndex: 2,
      }} />
    </div>
  );
}

function SessionsCarousel({ progress, hasEntered }) {
  const animRef      = useRef(null);
  const offsetRef    = useRef(TOTAL_WIDTH);
  const [isPaused, setIsPaused]   = useState(false);
  const [activeIdx, setActiveIdx] = useState(null);
  const speedRef     = useRef(0.55);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(900);
  const [slamDone, setSlamDone]   = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const hoveredIdxRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    if (hasEntered && !slamDone) {
      const t = setTimeout(() => setSlamDone(true), 700);
      return () => clearTimeout(t);
    }
  }, [hasEntered, slamDone]);

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setContainerWidth(e.contentRect.width));
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const animate = useCallback(() => {
    if (!isPaused) {
      offsetRef.current += speedRef.current;
      if (offsetRef.current >= TOTAL_WIDTH * 2) offsetRef.current -= TOTAL_WIDTH;
      if (trackRef.current) {
  const tx = hasEntered && !slamDone ? 140 : 0;
  trackRef.current.style.transform = `translateX(${-offsetRef.current + tx}px) translateY(-50%)`;
}
    }
    animRef.current = requestAnimationFrame(animate);
  }, [isPaused]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  // Drag-to-scrub
  const getClientX = (e) => e.clientX ?? e.touches?.[0]?.clientX ?? 0;
  const onDragStart = (e) => { setDragStart(getClientX(e)); setIsPaused(true); };
  const onDragMove  = (e) => {
    if (dragStart == null) return;
    const x     = getClientX(e);
    const delta = dragStart - x;
    offsetRef.current += delta * 1.2;
    if (offsetRef.current < TOTAL_WIDTH)      offsetRef.current += TOTAL_WIDTH;
    if (offsetRef.current >= TOTAL_WIDTH * 2) offsetRef.current -= TOTAL_WIDTH;
    setDragStart(x);
  };
  const onDragEnd = () => { setDragStart(null); setIsPaused(false); };

  const getCardStyle = (screenX, idx) => {
    const center   = containerWidth / 2;
    const dist     = (screenX + CARD_WIDTH / 2 - center) / (containerWidth / 2);
    const clamped  = Math.max(-1.3, Math.min(1.3, dist));
    const depth    = clamped * clamped;
    const scale = 0.82 + depth * 0.22;
    const blurAmt  = (1 - depth) * 1.8;
    const brightness = 0.32 + depth * 0.78;
    const rotY = -clamped * 12;
    const ty = depth * -14;
    const isActive = activeIdx === idx || hoveredIdxRef.current === idx;
    const lockedBrightness = isActive ? 1.4 : brightness;
    const lockedBlur       = isActive ? 0   : blurAmt;
    return {
      transform: `perspective(1000px) translateY(${ty}px) rotateY(${rotY}deg) scale(${isActive ? scale * 1.04 : scale})`,
      filter: `brightness(${lockedBrightness}) blur(${lockedBlur}px)`,
      zIndex: Math.round(depth * 10),
      transition: isActive
  ? "filter 0.35s ease, transform 0.35s cubic-bezier(0.4,0,0.2,1)"
  : "filter 0.35s ease, transform 0.35s cubic-bezier(0.4,0,0.2,1)",
      willChange: "transform, filter",
    };
  };

  const cScale = 0.90 + progress * 0.10;
  const cTY    = (1 - progress) * 44;
  const slamTX = hasEntered && !slamDone ? 140 : 0;

  return (
    <div style={{
      transform: `scale(${cScale}) translateY(${cTY}px)`,
      transformOrigin: "center center",
      transition: "transform 0.08s linear",
    }}>
      {/* Edge masks */}
      <div style={{
      position: "absolute", left: 0, top: 0, bottom: 0, width: "180px",
      background: "linear-gradient(90deg, #000 0%, rgba(0,0,0,0.85) 40%, transparent 100%)",
      zIndex: 20, pointerEvents: "none",
    }} />
    <div style={{
      position: "absolute", right: 0, top: 0, bottom: 0, width: "180px",
      background: "linear-gradient(270deg, #000 0%, rgba(0,0,0,0.85) 40%, transparent 100%)",
      zIndex: 20, pointerEvents: "none",
    }} />

      {/* Track */}
      <div
        ref={containerRef}
        style={{
          position: "relative", height: "460px",
          perspective: "1000px", perspectiveOrigin: "50% 44%",
          cursor: dragStart != null ? "grabbing" : "grab",
        }}
        onMouseLeave={() => { setIsPaused(false); setActiveIdx(null); hoveredIdxRef.current = null; setDragStart(null); }}
        onMouseDown={onDragStart}
        onMouseMove={onDragMove}
        onMouseUp={onDragEnd}
        onTouchStart={onDragStart}
        onTouchMove={onDragMove}
        onTouchEnd={onDragEnd}
      >
        <div
        ref={trackRef}
        style={{
          position: "absolute", top: "50%", left: 0,
          display: "flex", gap: `${CARD_GAP}px`,
          transform: `translateX(${-offsetRef.current + slamTX}px) translateY(-50%)`,
          opacity: hasEntered ? 1 : 0,
          transition: hasEntered && !slamDone
            ? "transform 0.7s cubic-bezier(0.16,1,0.3,1), opacity 0.45s ease"
            : "none",
          willChange: "transform",
          userSelect: "none",
        }}
      >
          {ITEMS.map((session, i) => {
            const cardLeft = i * CARD_STEP - offsetRef.current;
            return (
            <div
            key={i}
            onMouseEnter={() => { setActiveIdx(i); hoveredIdxRef.current = i; }}
            onMouseLeave={() => { setActiveIdx(null); hoveredIdxRef.current = null; }}
            style={{
              width: `${CARD_WIDTH}px`, flexShrink: 0,
              cursor: "pointer",
              ...getCardStyle(i * CARD_STEP - offsetRef.current, i),
              borderRadius: "20px",       // ← lock it here on the wrapper
              overflow: "hidden",         // ← clip to the radius
            }}
          >
            <SessionCard session={session} isActive={activeIdx === i} />
          </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        gap: "10px", marginTop: "2.2rem",
        opacity: progress > 0.55 ? Math.min(1, (progress - 0.55) / 0.35) : 0,
        transition: "opacity 0.4s",
      }}>

        {/* Pause / Play — labeled pill */}
        <button
          onClick={() => setIsPaused(p => !p)}
          style={{
            display: "flex", alignItems: "center", gap: "7px",
            padding: "8px 18px", borderRadius: "100px",
            background: isPaused
              ? "linear-gradient(135deg, #FF1A1A, #991111)"
              : "rgba(255,255,255,0.06)",
            border: `1px solid ${isPaused ? "transparent" : "rgba(255,255,255,0.1)"}`,
            cursor: "pointer", color: "#fff",
            fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px",
            boxShadow: isPaused ? "0 0 24px rgba(255,26,26,0.45)" : "none",
            transition: "all 0.25s ease",
          }}
        >
          <span style={{ fontSize: "10px" }}>{isPaused ? "▶" : "⏸"}</span>
          <span>{isPaused ? "RESUME" : "PAUSE"}</span>
        </button>

        {/* Divider */}
        <div style={{ width: "1px", height: "22px", background: "rgba(255,255,255,0.08)" }} />

        {/* Speed */}
        <div style={{ display: "flex", gap: "4px" }}>
          {[
            { spd: 0.25, label: "1×" },
            { spd: 0.55, label: "2×" },
            { spd: 1.1,  label: "3×" },
          ].map(({ spd, label }, i) => {
            const active = speedRef.current === spd;
            return (
              <button key={i} onClick={() => { speedRef.current = spd; }}
                style={{
                  padding: "7px 14px", borderRadius: "100px",
                  cursor: "pointer",
                  fontSize: "11px", fontWeight: 800, letterSpacing: "0.5px",
                  background: active ? "rgba(255,26,26,0.14)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${active ? "#FF1A1A" : "rgba(255,255,255,0.08)"}`,
                  color: active ? "#FF1A1A" : "rgba(255,255,255,0.3)",
                  transition: "all 0.2s ease",
                  boxShadow: active ? "0 0 12px rgba(255,26,26,0.3)" : "none",
                }}
              >{label}</button>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ width: "1px", height: "22px", background: "rgba(255,255,255,0.08)" }} />

        {/* Drag hint */}
        <span style={{
          fontSize: "10px", letterSpacing: "2px",
          color: "rgba(255,255,255,0.18)", fontWeight: 600,
        }}>DRAG TO SCRUB</span>
      </div>
    </div>
  );
}


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

function MemberCountUp({ active }) {
  const count = useCountUp(2400, 2000, active);
  return <>{count.toLocaleString()}+</>;
}

function AboutMemberStat() {
  const [ref, inView] = useInView(0.3);
  const count = useCountUp(2400, 2000, inView);
  return (
    <div ref={ref} style={{
      position: "absolute", inset: 0,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: "0",
    }}>
      <span style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "clamp(6rem, 12vw, 10rem)",
        color: "#FF1A1A", lineHeight: 1,
        letterSpacing: "-4px",
        textShadow: "0 0 80px rgba(255,26,26,0.4)",
      }}>{count.toLocaleString()}+</span>
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "11px", fontWeight: 800,
        letterSpacing: "6px", color: "rgba(255,255,255,0.4)",
        textTransform: "uppercase",
      }}>Members Strong</span>
      <div style={{
        position: "absolute",
        width: "320px", height: "320px",
        borderRadius: "50%",
        border: "1px solid rgba(255,26,26,0.08)",
        boxShadow: "inset 0 0 80px rgba(255,26,26,0.04)",
      }} />
      <div style={{
        position: "absolute",
        width: "440px", height: "440px",
        borderRadius: "50%",
        border: "1px solid rgba(255,26,26,0.04)",
      }} />
    </div>
  );
}

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

// ─── Config ───────────────────────────────────────────────────────────────────
const STANDARD_PHRASES = [
  "TRAIN HARD",
  "PUSH LIMITS",
  "BURN STRONGER",
  "NO EXCUSES",
  "EVERY REP COUNTS",
];
const BONUS_PHRASES = [
  "PAIN IS TEMPORARY GLORY IS FOREVER",
  "OUTWORK EVERYONE IN THE ROOM",
  "CHAMPIONS ARE BUILT NOT BORN",
  "THE ONLY BAD WORKOUT IS THE ONE YOU SKIPPED",
  "EARN YOUR REST EVERY SINGLE DAY",
];
const MAX_WPM = 100;
const FAST_WPM = 80;          
const BONUS_WPM_GATE = 50;    

const RANKS = [
  {
    label: "ELITE", min: 100, color: "#FF1A1A",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="#FF1A1A"><path d="M12 1L8 9 2 6l3 13h14l3-13-6 3-4-8z"/><rect x="5" y="20" width="14" height="2" rx="1"/></svg>,
    msg: "You type like you train. Absolutely relentless.",
  },
  {
    label: "PRO", min: 80, color: "#FF6B00",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="#FF6B00"><path d="M5 3H3a2 2 0 00-2 2v2a4 4 0 003.86 4A6 6 0 009 14.9V17H7v2h10v-2h-2v-2.1A6 6 0 0019.14 11 4 4 0 0023 7V5a2 2 0 00-2-2h-2V1H5v2z"/></svg>,
    msg: "Fast hands. That's real FitZone energy.",
  },
  {
    label: "SOLID", min: 50, color: "#FFB800",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="#FFB800"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
    msg: "Good pace. Keep showing up like this.",
  },
  {
    label: "WARMING UP", min: 0, color: "rgba(255,255,255,0.45)",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>,
    msg: "Every rep counts — including the slow ones.",
  },
];
const getRank = (wpm) => RANKS.find(r => wpm >= r.min) ?? RANKS[RANKS.length - 1];

const GOALS = [
  { id: "weight", label: "Lose Weight",        icon: "🔥", headline: "We'll burn it together.",     plan: "Cardio + HIIT — 4x per week",        color: "#FF6B00" },
  { id: "muscle", label: "Build Muscle",        icon: "💪", headline: "Let's build something real.", plan: "Strength Training — 5x per week",     color: "#FF1A1A" },
  { id: "active", label: "Stay Active",         icon: "⚡", headline: "Move more. Feel better.",     plan: "Mixed program — 3x per week",         color: "#FFB800" },
  { id: "flex",   label: "Improve Flexibility", icon: "🧘", headline: "Stretch your limits.",        plan: "Yoga + Functional — 4x per week",     color: "#A855F7" },
  { id: "stress", label: "Reduce Stress",       icon: "🌊", headline: "Your escape is here.",        plan: "Yoga + Zumba — 3x per week",          color: "#00C2FF" },
  { id: "sport",  label: "Sport Performance",   icon: "🥊", headline: "Train like an athlete.",      plan: "Boxing + Conditioning — 5x per week", color: "#22C55E" },
];

// ─── Audio ────────────────────────────────────────────────────────────────────
function createAudio() {
  let ctx = null;
  const c = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx; };
  const play = (freq, type = "sine", dur = 0.06, gain = 0.07, delay = 0) => {
    try {
      const ac = c(), o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = type; o.frequency.setValueAtTime(freq, ac.currentTime + delay);
      g.gain.setValueAtTime(gain, ac.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + dur);
      o.start(ac.currentTime + delay); o.stop(ac.currentTime + delay + dur);
    } catch {}
  };
  return {
    key:    () => play(700, "sine", 0.04, 0.05),
    wrong:  () => play(200, "sawtooth", 0.08, 0.06),
    streak: () => { play(900, "sine", 0.08, 0.07); play(1100, "sine", 0.08, 0.07, 0.06); },
    phrase: () => { [500,700,900,1100].forEach((f,i) => play(f,"sine",0.15,0.08,i*0.07)); },
    bonus:  () => { [800,1000,1300].forEach((f,i) => play(f,"sine",0.2,0.09,i*0.06)); },
    full:   () => { [500,700,900,1200,1500].forEach((f,i) => play(f,"sine",0.25,0.1,i*0.08)); },
  };
}

// ─── Particle Burst ───────────────────────────────────────────────────────────
function ParticleBurst({ trigger, color = "#FFB800", count = 12 }) {
  const [particles, setParticles] = useState([]);
  const prev = useRef(trigger);
  useEffect(() => {
    if (trigger === prev.current) return;
    prev.current = trigger;
    setParticles(Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      angle: (i / count) * 360 + Math.random() * 15,
      dist: 24 + Math.random() * 40,
      size: 2 + Math.random() * 3,
    })));
    setTimeout(() => setParticles([]), 700);
  }, [trigger, count]);
  if (!particles.length) return null;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {particles.map(p => {
        const rad = (p.angle * Math.PI) / 180;
        return (
          <div key={p.id} style={{
            position: "absolute", top: "50%", left: "50%",
            width: p.size, height: p.size, borderRadius: "50%", background: color,
            animation: "particleFly 0.65s ease-out forwards",
            "--tx": `${Math.cos(rad) * p.dist}px`,
            "--ty": `${Math.sin(rad) * p.dist}px`,
          }} />
        );
      })}
    </div>
  );
}

// ─── Post-Game Summary ────────────────────────────────────────────────────────
function Summary({ stats, onContinue }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);
 
  const rank     = getRank(stats.peakWpm);
  const isFast   = stats.peakWpm >= FAST_WPM;
  const accGrade = stats.accuracy >= 98 ? "S" : stats.accuracy >= 92 ? "A" : stats.accuracy >= 82 ? "B" : stats.accuracy >= 70 ? "C" : "D";
  const gradeColor = accGrade === "S" ? "#FFD700" : accGrade === "A" ? "#22C55E" : accGrade === "B" ? "#FFB800" : accGrade === "C" ? "#FF6B00" : "#FF1A1A";
 
  return (
    <div style={{
      maxWidth: 520, width: "100%", margin: "0 auto", padding: "0 1rem",
      opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(28px)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
    }}>
 
      {/* ── Rank block ── */}
      <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
        {/* Session complete eyebrow */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: "1.25rem" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill={rank.color}>
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "4px", color: rank.color, fontFamily: "'DM Sans',sans-serif" }}>SESSION COMPLETE</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill={rank.color}>
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
        </div>
 
        {/* Rank card */}
        <div style={{
          display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 10,
          padding: isFast ? "1.5rem 2.5rem" : "1rem 2rem",
          background: isFast
            ? `linear-gradient(135deg, ${rank.color}18, ${rank.color}06)`
            : "rgba(255,255,255,0.03)",
          border: `${isFast ? 2 : 1}px solid ${isFast ? rank.color + "45" : "rgba(255,255,255,0.08)"}`,
          borderRadius: 18,
          boxShadow: isFast ? `0 0 60px ${rank.color}18, inset 0 1px 0 ${rank.color}20` : "none",
          marginBottom: "0.875rem",
        }}>
          {/* Icon */}
          <div style={{
            width: isFast ? 52 : 40, height: isFast ? 52 : 40,
            borderRadius: 14,
            background: `${rank.color}18`,
            border: `1.5px solid ${rank.color}35`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 20px ${rank.color}25`,
          }}>
            {rank.icon}
          </div>
          <span style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: isFast ? "clamp(2.5rem,7vw,3.5rem)" : "clamp(1.8rem,5vw,2.5rem)",
            letterSpacing: "5px", color: rank.color, lineHeight: 1,
          }}>{rank.label}</span>
          {isFast && (
            <span style={{
              fontSize: 11, color: "rgba(255,255,255,0.4)",
              fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.5px",
            }}>{rank.msg}</span>
          )}
        </div>
 
        {!isFast && (
          <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans',sans-serif" }}>
            {rank.msg}
          </p>
        )}
      </div>
 
      {/* ── Stats grid ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isFast ? "1fr 1px 1fr 1px 1fr 1px 1fr" : "1fr 1px 1fr 1px 1fr",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden",
        marginBottom: "1rem",
      }}>
        {[
          {
            v: stats.peakWpm, l: "PEAK WPM", col: getRank(stats.peakWpm).color,
            icon: <svg width="13" height="13" viewBox="0 0 24 24" fill={getRank(stats.peakWpm).color}><path d="M12 2C6.48 2 2 6.48 2 12c0 3.1 1.41 5.88 3.63 7.75L7.06 18.3A7.96 7.96 0 014 12a8 8 0 018-8 8 8 0 018 8 7.96 7.96 0 01-3.06 6.3l1.43 1.45A9.97 9.97 0 0022 12c0-5.52-4.48-10-10-10z"/><path d="M12 6a1 1 0 011 1v4.59l3.2 3.2-1.41 1.42L11 12.41V7a1 1 0 011-1z"/></svg>,
          },
          {
            v: `${stats.accuracy}%`, l: "ACCURACY", col: stats.accuracy >= 90 ? "#22C55E" : stats.accuracy >= 75 ? "#FFB800" : "#FF1A1A",
            icon: <svg width="13" height="13" viewBox="0 0 24 24" fill={stats.accuracy >= 90 ? "#22C55E" : stats.accuracy >= 75 ? "#FFB800" : "#FF1A1A"}><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 3a7 7 0 110 14A7 7 0 0112 5zm0 3a4 4 0 100 8 4 4 0 000-8zm0 3a1 1 0 110 2 1 1 0 010-2z"/></svg>,
          },
          {
            v: stats.phrasesTyped, l: "PHRASES", col: "#fff",
            icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)"><path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"/></svg>,
          },
          ...(isFast ? [{
            v: stats.bestStreak, l: "STREAK", col: stats.bestStreak >= 5 ? "#FFD700" : "#FFB800",
            icon: <svg width="13" height="13" viewBox="0 0 24 24" fill={stats.bestStreak >= 5 ? "#FFD700" : "#FFB800"}><path d="M12 1.5C12 1.5 7 6.5 7 11a5 5 0 0010 0c0-3.5-2.5-6-2.5-6S14 7 13 8.5C12 6.5 12 1.5 12 1.5z"/><circle cx="12" cy="14" r="1.5"/></svg>,
          }] : []),
        ].map(({ v, l, col, icon }, i, arr) => (
          <React.Fragment key={l}>
            <div style={{ padding: "1rem 0.5rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ opacity: 0.7 }}>{icon}</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(1.5rem,5vw,2rem)", color: col, lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: 7, letterSpacing: "2px", color: "rgba(255,255,255,0.18)", fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>{l}</div>
            </div>
            {i < arr.length - 1 && <div style={{ background: "rgba(255,255,255,0.05)", width: 1 }} />}
          </React.Fragment>
        ))}
      </div>
 
      {/* ── Accuracy grade (fast typers) ── */}
      {isFast ? (
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "0.875rem 1.25rem",
          background: `${gradeColor}08`,
          border: `1px solid ${gradeColor}22`,
          borderRadius: 12, marginBottom: "1rem",
        }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12, flexShrink: 0,
            background: `${gradeColor}15`,
            border: `2px solid ${gradeColor}45`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 20px ${gradeColor}20`,
          }}>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.9rem", color: gradeColor, lineHeight: 1 }}>{accGrade}</span>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill={gradeColor}>
                <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 3a7 7 0 110 14A7 7 0 0112 5zm0 3a4 4 0 100 8 4 4 0 000-8zm0 3a1 1 0 110 2 1 1 0 010-2z"/>
              </svg>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "2px", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans',sans-serif" }}>ACCURACY GRADE</p>
            </div>
            <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans',sans-serif" }}>
              {accGrade === "S" ? "Flawless. Every key, every time." :
               accGrade === "A" ? "Sharp. Almost no wasted keystrokes." :
               accGrade === "B" ? "Solid. A few slips but mostly clean." :
               accGrade === "C" ? "Slow down to speed up — accuracy first." :
               "Focus on accuracy first, speed will follow."}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)">
                <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 3a7 7 0 110 14A7 7 0 0112 5zm0 3a4 4 0 100 8 4 4 0 000-8zm0 3a1 1 0 110 2 1 1 0 010-2z"/>
              </svg>
              <span style={{ fontSize: 9, letterSpacing: "2px", color: "rgba(255,255,255,.13)", fontFamily: "'DM Sans',sans-serif" }}>ACCURACY</span>
            </div>
            <span style={{ fontSize: 9, color: stats.accuracy >= 90 ? "#22C55E" : "#FFB800", fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>{stats.accuracy}%</span>
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,.05)", borderRadius: 2 }}>
            <div style={{ height: "100%", borderRadius: 2, width: `${stats.accuracy}%`, background: stats.accuracy >= 90 ? "#22C55E" : "#FFB800" }} />
          </div>
        </div>
      )}
 
      {/* ── Streak highlight ── */}
      {isFast && stats.bestStreak >= 3 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "0.75rem 1.25rem",
          background: "rgba(255,184,0,0.06)", border: "1px solid rgba(255,184,0,0.2)",
          borderRadius: 10, marginBottom: "1rem",
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: "rgba(255,184,0,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#FFB800">
              <path d="M12 1.5C12 1.5 7 6.5 7 11a5 5 0 0010 0c0-3.5-2.5-6-2.5-6S14 7 13 8.5C12 6.5 12 1.5 12 1.5z"/>
              <circle cx="12" cy="14" r="1.5"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, color: "#FFB800", letterSpacing: "0.5px" }}>
            {stats.bestStreak} word streak at 80+ WPM
            {stats.bestStreak >= 8 ? " — UNSTOPPABLE" : stats.bestStreak >= 5 ? " — ON FIRE" : ""}
          </span>
        </div>
      )}
 
      {/* ── Taunt ── */}
      {isFast && stats.accuracy < 90 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "0.75rem 1.25rem",
          background: "rgba(255,26,26,0.04)", border: "1px solid rgba(255,26,26,0.14)",
          borderRadius: 10, marginBottom: "1rem",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,26,26,0.5)" style={{ flexShrink: 0 }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5 }}>
            Fast but sloppy — {stats.accuracy}% accuracy cost you {Math.round((100 - stats.accuracy) / 5)} energy points.
          </p>
        </div>
      )}
 
      {/* ── CTA ── */}
      <button onClick={onContinue} style={{
        width: "100%", padding: "15px",
        background: isFast
          ? `linear-gradient(135deg, ${rank.color}, ${rank.color}cc)`
          : "linear-gradient(135deg,#FF1A1A,#991111)",
        boxShadow: `0 6px 28px ${isFast ? rank.color : "#FF1A1A"}35`,
        border: "none", borderRadius: 10, cursor: "pointer",
        color: "#fff", fontWeight: 800,
        fontSize: "clamp(0.85rem,3.5vw,1rem)",
        fontFamily: "'DM Sans',sans-serif",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
      >
        {isFast ? "See Your Rewards" : "Build My Program"}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
          <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/>
        </svg>
      </button>
 
      <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.15)", marginTop: "0.65rem", letterSpacing: "1px", fontFamily: "'DM Sans',sans-serif" }}>
        Energy: {stats.finalScore}% · {stats.phrasesTyped} phrase{stats.phrasesTyped !== 1 ? "s" : ""} typed
      </p>
    </div>
  );
}

function TypingMechanic({ setEnergy, onFinish, audioRef }) {
  const [phraseIdx, setPhraseIdx]     = useState(0);
  const [typed, setTyped]             = useState("");
  const [totalTyped, setTotalTyped]   = useState(0);
  const [errors, setErrors]           = useState(0);
  const [phraseDone, setPhraseDone]   = useState([]);
  const [phraseBurst, setPhraseBurst] = useState(0);
  const [wrongFlash, setWrongFlash]   = useState(false);
  const [wpm, setWpm]                 = useState(0);
  const [acc, setAcc]                 = useState(100);
  const [score, setScore]             = useState(0);

  // Phrase transition
  const [txState, setTxState]             = useState("idle");
  const [nextPhraseIdx, setNextPhraseIdx] = useState(null);
  const [displayIdx, setDisplayIdx]       = useState(0);
  const isTransitioning                   = txState !== "idle";

  // Bonus lock
  const [bonusLocked, setBonusLocked] = useState(false);
  const [lockedWpm, setLockedWpm]     = useState(0);

  // Streak
  const [streak, setStreak]           = useState(0);
  const [bestStreak, setBestStreak]   = useState(0);
  const [streakFlash, setStreakFlash] = useState(false);

  const [stableWpm, setStableWpm] = useState(0);
  const [showCheer, setShowCheer] = useState(0);

  const peakWpmRef     = useRef(0);
  const stampRef       = useRef([]);
  const wordStampsRef  = useRef([]);
  const phraseStartRef = useRef(Date.now());
  const phraseWpmRef   = useRef(0);

  const allPhrases    = [...STANDARD_PHRASES, ...BONUS_PHRASES];
  const currentPhrase = allPhrases[Math.min(displayIdx, allPhrases.length - 1)];
  const isBonus       = displayIdx >= STANDARD_PHRASES.length;
  const bonusCompleted = phraseDone.filter(i => i >= STANDARD_PHRASES.length).length;
  const nextIsBonus   = nextPhraseIdx != null && nextPhraseIdx >= STANDARD_PHRASES.length;

  const onLastPhrase  = phraseIdx === STANDARD_PHRASES.length - 1;
  const isClose       = onLastPhrase && stableWpm >= 50 && stableWpm < 60;
  const almostThere   = phraseIdx === STANDARD_PHRASES.length - 2 && stableWpm >= 55;

  const computeScore = useCallback((cWpm, cAcc, done) => {
    const std   = done.filter(i => i < STANDARD_PHRASES.length).length;
    const bonus = done.filter(i => i >= STANDARD_PHRASES.length).length;
    const base  = std * 20 + bonus * 10;
    const live  = (Math.min(cWpm, MAX_WPM) / MAX_WPM) * (cAcc / 100) * (isBonus ? 10 : 20);
    return Math.min(100, Math.floor(base + live));
  }, [isBonus]);

  const getWordWpm = useCallback(() => {
    const now    = Date.now();
    const recent = wordStampsRef.current.filter(t => now - t < 4000);
    if (recent.length < 2) return stableWpm;
    const elapsed = (now - recent[0]) / 1000 / 60;
    return Math.round(recent.length / elapsed);
  }, [stableWpm]);

  const handleKey = useCallback((e) => {
    if (e.key === " ") e.preventDefault();
    if (isTransitioning) return;
    if (e.key === "Backspace") { setTyped(p => p.slice(0, -1)); return; }
    if (e.key.length !== 1) return;

    const ch       = e.key.toUpperCase();
    const expected = currentPhrase[typed.length];
    if (!expected) return;

    setTotalTyped(t => t + 1);
    const now = Date.now();
    if (typed.length === 0) phraseStartRef.current = now;
    stampRef.current = [...stampRef.current.filter(t => now - t < 3000), now];

    if (ch !== expected) {
      setErrors(err => err + 1);
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 140);
      audioRef.current?.wrong();
      if (navigator.vibrate) navigator.vibrate(20);
      setStreak(0);
      return;
    }

    audioRef.current?.key();
    if (navigator.vibrate) navigator.vibrate(6);

    setTyped(prev => {
      const next    = prev + ch;
      const nextChar     = currentPhrase[next.length];
      const wordComplete = nextChar === " " || next.length === currentPhrase.length;

      if (wordComplete || next.length === currentPhrase.length) {
        const wordNow = Date.now();
        wordStampsRef.current = [...wordStampsRef.current.filter(t => wordNow - t < 6000), wordNow];
        const wordWpm    = getWordWpm();
        const isFastWord = wordWpm >= FAST_WPM;

        if (isFastWord) {
          setStreak(s => {
            const newS = s + 1;
            setBestStreak(b => Math.max(b, newS));
            if (newS > 1) {
              audioRef.current?.streak();
              setStreakFlash(true);
              setTimeout(() => setStreakFlash(false), 300);
              if (navigator.vibrate) navigator.vibrate([10, 5, 10]);
            }
            return newS;
          });
        } else {
          setStreak(0);
        }
      }

      if (next.length === currentPhrase.length) {
        const phraseElapsed  = (Date.now() - phraseStartRef.current) / 60000;
        const phraseWords    = currentPhrase.trim().split(" ").length;
        const cleanPhraseWpm = phraseElapsed > 0 ? Math.round(phraseWords / phraseElapsed) : 0;
        phraseWpmRef.current = cleanPhraseWpm;
        if (cleanPhraseWpm > peakWpmRef.current) peakWpmRef.current = cleanPhraseWpm;

        const newDone    = [...phraseDone, phraseIdx];
        const nextIdx    = phraseIdx + 1;
        const std        = newDone.filter(i => i < STANDARD_PHRASES.length).length;
        const bon        = newDone.filter(i => i >= STANDARD_PHRASES.length).length;
        const newScore   = Math.min(100, std * 20 + bon * 10);
        const allStdDone = nextIdx >= STANDARD_PHRASES.length && !isBonus;
        const meetsGate  = cleanPhraseWpm >= BONUS_WPM_GATE;
        const isDone     = nextIdx >= allPhrases.length;

        setPhraseDone(newDone);
        setPhraseBurst(b => b + 1);
        setScore(newScore);
        setEnergy(newScore);
        setPhraseIdx(nextIdx);
        if (navigator.vibrate) navigator.vibrate([20,10,20,10,20]);

        if (cleanPhraseWpm < FAST_WPM && !isDone && !allStdDone) {
          setShowCheer(std);
          setTimeout(() => setShowCheer(0), 1200);
        }

        if (allStdDone && !meetsGate) {
          audioRef.current?.phrase();
          setTxState("out");
          setTimeout(() => {
            setLockedWpm(cleanPhraseWpm);
            setBonusLocked(true);
            setTxState("idle");
            setTyped("");
          }, 300);
          return next;
        }

        setTxState("out");
        setNextPhraseIdx(nextIdx);

        setTimeout(() => {
          setTxState("flash");
          if (nextIdx === STANDARD_PHRASES.length) audioRef.current?.bonus();
          else if (!isDone) audioRef.current?.phrase();
        }, 250);

        setTimeout(() => {
          if (isDone) {
            audioRef.current?.full();
            const finalAcc = totalTyped > 0 ? Math.round(((totalTyped - errors) / totalTyped) * 100) : 100;
            onFinish({ peakWpm: peakWpmRef.current, accuracy: finalAcc, phrasesTyped: newDone.length, bestStreak, finalScore: newScore });
            return;
          }
          setDisplayIdx(nextIdx);
          setNextPhraseIdx(null);
          setTxState("in");
        }, 500);

        setTimeout(() => {
          if (!isDone) { setTxState("idle"); setTyped(""); phraseStartRef.current = Date.now(); }
        }, 750);

        return next;
      }
      return next;
    });
  }, [typed, currentPhrase, phraseIdx, phraseDone, allPhrases.length, errors, totalTyped, bestStreak, getWordWpm, setEnergy, onFinish, isBonus]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  useEffect(() => {
    const iv = setInterval(() => {
      const now    = Date.now();
      const recent = stampRef.current.filter(t => now - t < 5000);
      const cWpm = recent.length >= 3
        ? Math.round((recent.length / 5) * 12)
        : 0;
      const cAcc = totalTyped > 0 ? Math.round(((totalTyped - errors) / totalTyped) * 100) : 100;
      setWpm(cWpm);
      setStableWpm(cWpm); 
      setAcc(cAcc);
      if (cWpm > peakWpmRef.current) peakWpmRef.current = cWpm;
      const liveScore = computeScore(cWpm, cAcc, phraseDone);
      setScore(liveScore);
      setEnergy(liveScore);
    }, 150);
    return () => clearInterval(iv);
  }, [totalTyped, errors, phraseDone, computeScore, setEnergy]);

  const accColor    = acc >= 90 ? "#22C55E" : acc >= 75 ? "#FFB800" : "#FF1A1A";
  const wpmColor    = wpm > 80 ? "#FF1A1A" : wpm > 50 ? "#FFB800" : wpm > 20 ? "#FF6B00" : "rgba(255,255,255,.2)";
  const scoreColor  = score > 70 ? "#FF1A1A" : score > 40 ? "#FFB800" : "#FF6B00";
  const streakColor = streak >= 5 ? "#FFD700" : streak >= 3 ? "#FFB800" : "#FF6B00";
  const stdDone     = phraseDone.filter(i => i < STANDARD_PHRASES.length).length;

  const gateBarColor = stableWpm >= BONUS_WPM_GATE ? "#22C55E"
    : isClose ? "#FF6B00"
    : "#FFB800";

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
 
      {/* ── Progress track ── */}
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        {STANDARD_PHRASES.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 6, borderRadius: 3, position: "relative", overflow: "hidden",
            background: phraseDone.includes(i) ? "#FF1A1A"
              : phraseIdx === i ? "rgba(255,26,26,0.2)"
              : "rgba(255,255,255,0.05)",
            transition: "background 0.3s",
            boxShadow: phraseDone.includes(i) ? "0 0 12px rgba(255,26,26,0.6)" : "none",
          }}>
            {/* Animated shimmer on active phrase */}
            {phraseIdx === i && !phraseDone.includes(i) && (
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg, transparent, rgba(255,26,26,0.4), transparent)",
                animation: "shimmerBar 1.5s ease-in-out infinite",
              }} />
            )}
          </div>
        ))}
        {/* Keyboard icon + count */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, paddingLeft: 6, flexShrink: 0 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="rgba(255,255,255,0.18)">
            <path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 5H5v-2h2v2zm9 0H8v-2h8v2zm1-5h-2v-2h2v2zm0-3h-2V8h2v2zm3 8h-2v-2h2v2zm0-5h-2v-2h2v2zm0-3h-2V8h2v2z"/>
          </svg>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", letterSpacing: "1px", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap" }}>
            {stdDone}/5
          </span>
        </div>
      </div>
 
      {/* ── ALMOST THERE banner ── */}
      {almostThere && !isBonus && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10,
          background: "linear-gradient(135deg, rgba(255,107,0,0.1), rgba(255,107,0,0.04))",
          border: "1px solid rgba(255,107,0,0.28)",
          animation: "fadeUp 0.3s ease forwards",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: "rgba(255,107,0,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF6B00">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "1.5px", color: "#FF6B00" }}>
            ONE MORE PHRASE — BONUS UNLOCKS AT {BONUS_WPM_GATE} WPM
          </span>
        </div>
      )}
 
      {/* ── Bonus unlock banner ── */}
      {isBonus && !bonusLocked && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10,
          background: "linear-gradient(135deg, rgba(255,184,0,0.1), rgba(255,184,0,0.03))",
          border: "1px solid rgba(255,184,0,0.3)",
          animation: "fadeUp 0.3s ease forwards",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: "rgba(255,184,0,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFB800">
              <path d="M12 1C9.24 1 7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2H9V6c0-1.66 1.34-3 3-3s3 1.34 3 3v1h2V6c0-2.76-2.24-5-5-5zm0 11c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "1.5px", color: "#FFB800" }}>
            BONUS PHRASE {bonusCompleted + 1} — +10 ENERGY
          </span>
          <div style={{ marginLeft: "auto", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,184,0,0.4)">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>
      )}
 
      {/* ── Cheer overlay ── */}
      {showCheer > 0 && (
        <div style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 999, pointerEvents: "none",
          animation: "cheerPop 1.2s ease forwards",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: "rgba(34,197,94,0.15)",
            border: "2px solid rgba(34,197,94,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 60px rgba(34,197,94,0.3)",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#22C55E">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <span style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: "clamp(2rem,6vw,3.5rem)",
            letterSpacing: "5px", color: "#22C55E",
            textShadow: "0 0 40px rgba(34,197,94,0.7)",
          }}>
            {showCheer === 1 ? "KEEP GOING!" : showCheer === 2 ? "SOLID!" : showCheer === 3 ? "HALFWAY!" : "ALMOST DONE!"}
          </span>
        </div>
      )}
 
      {/* ── Bonus gate card (locked) ── */}
      {bonusLocked ? (
        <div style={{
          padding: "1.25rem", borderRadius: 16,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
          animation: "fadeUp 0.35s ease forwards",
          display: "flex", flexDirection: "column", gap: 14,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "rgba(255,184,0,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "2px", color: "rgba(255,255,255,0.3)", marginBottom: 1 }}>BONUS PHRASES</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.15)" }}>Speed gate not reached</p>
              </div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "rgba(255,184,0,0.08)", border: "1px solid rgba(255,184,0,0.2)",
              padding: "4px 10px", borderRadius: 100,
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#FFB800">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#FFB800", fontFamily: "'DM Sans',sans-serif" }}>
                {lockedWpm} / {BONUS_WPM_GATE} WPM
              </span>
            </div>
          </div>
 
          {/* Gate progress */}
          <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, position: "relative" }}>
            <div style={{
              height: "100%", borderRadius: 2,
              width: `${Math.min(100, (lockedWpm / BONUS_WPM_GATE) * 100)}%`,
              background: lockedWpm >= 40 ? "linear-gradient(90deg,#FF4400,#FF6B00)" : "#FF4400",
              transition: "width 0.5s ease",
              boxShadow: "0 0 8px rgba(255,107,0,0.5)",
            }} />
            <div style={{ position: "absolute", top: -3, right: 0, width: 2, height: 10, background: "#FFB800", borderRadius: 1 }} />
          </div>
 
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button onClick={() => {
              setBonusLocked(false);
              setPhraseIdx(STANDARD_PHRASES.length - 1);
              setDisplayIdx(STANDARD_PHRASES.length - 1);
              setTyped(""); setTxState("idle");
              phraseStartRef.current = Date.now();
            }} style={{
              padding: "12px 0",
              border: "1.5px solid rgba(255,26,26,0.35)",
              borderRadius: 10, cursor: "pointer",
              background: "rgba(255,26,26,0.08)",
              color: "#fff", fontWeight: 800, fontSize: "0.82rem",
              fontFamily: "'DM Sans',sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,26,26,0.16)"; e.currentTarget.style.borderColor = "rgba(255,26,26,0.6)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,26,26,0.08)"; e.currentTarget.style.borderColor = "rgba(255,26,26,0.35)"; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#FF6B00">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              Try for {BONUS_WPM_GATE} WPM
            </button>
            <button onClick={() => {
              const finalAcc = totalTyped > 0 ? Math.round(((totalTyped - errors) / totalTyped) * 100) : 100;
              onFinish({ peakWpm: peakWpmRef.current, accuracy: finalAcc, phrasesTyped: phraseDone.length, bestStreak, finalScore: score });
            }} style={{
              padding: "12px 0",
              border: "1.5px solid rgba(255,255,255,0.09)",
              borderRadius: 10, cursor: "pointer",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.55)", fontWeight: 700, fontSize: "0.82rem",
              fontFamily: "'DM Sans',sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
            >
              Pick My Goal
              <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(255,255,255,0.55)">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/>
              </svg>
            </button>
          </div>
        </div>
      ) : (
 
        /* ── Phrase typing box ── */
        <div style={{
          padding: "1.25rem 1.4rem",
          background: txState === "flash"
            ? (nextIsBonus ? "rgba(255,184,0,0.07)" : "rgba(34,197,94,0.05)")
            : wrongFlash ? "rgba(255,26,26,0.06)" : "rgba(255,255,255,0.025)",
          border: `1.5px solid ${
            txState === "flash" ? (nextIsBonus ? "rgba(255,184,0,0.45)" : "rgba(34,197,94,0.4)")
            : wrongFlash ? "rgba(255,26,26,0.45)"
            : isBonus ? "rgba(255,184,0,0.18)" : "rgba(255,255,255,0.07)"}`,
          borderRadius: 16, position: "relative", overflow: "hidden",
          transition: "border-color 0.12s, background 0.12s",
          boxShadow: wrongFlash ? "inset 0 0 20px rgba(255,26,26,0.05)" : "none",
        }}>
          <ParticleBurst trigger={phraseBurst} color={isBonus ? "#FFB800" : "#FF1A1A"} count={14} />
 
          {/* Flash overlay */}
          {txState === "flash" && (
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column", gap: 10, zIndex: 2,
              background: nextIsBonus ? "rgba(255,184,0,0.05)" : "rgba(34,197,94,0.04)",
              animation: "fadeUp 0.2s ease forwards",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: nextIsBonus ? "rgba(255,184,0,0.15)" : "rgba(34,197,94,0.15)",
                border: `2px solid ${nextIsBonus ? "rgba(255,184,0,0.4)" : "rgba(34,197,94,0.4)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "bounceIn 0.25s ease forwards",
              }}>
                {nextIsBonus
                  ? <svg width="26" height="26" viewBox="0 0 24 24" fill="#FFB800"><path d="M12 1C9.24 1 7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2H9V6c0-1.66 1.34-3 3-3s3 1.34 3 3v1h2V6c0-2.76-2.24-5-5-5zm0 11c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/></svg>
                  : <svg width="26" height="26" viewBox="0 0 24 24" fill="#22C55E"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                }
              </div>
              <span style={{
                fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.1rem", letterSpacing: "4px",
                color: nextIsBonus ? "#FFB800" : "#22C55E",
              }}>
                {nextIsBonus ? "BONUS UNLOCKED" : "PHRASE COMPLETE"}
              </span>
            </div>
          )}
 
          {/* Phrase label row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.65rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {isBonus
                ? <svg width="11" height="11" viewBox="0 0 24 24" fill="#FFB800"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                : <svg width="11" height="11" viewBox="0 0 24 24" fill="rgba(255,255,255,0.18)"><path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 5H5v-2h2v2zm9 0H8v-2h8v2zm1-5h-2v-2h2v2zm0-3h-2V8h2v2zm3 8h-2v-2h2v2zm0-5h-2v-2h2v2zm0-3h-2V8h2v2z"/></svg>
              }
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: "3px",
                color: isBonus ? "#FFB800" : "rgba(255,255,255,0.18)",
                fontFamily: "'DM Sans',sans-serif",
              }}>
                {isBonus ? `BONUS ${bonusCompleted + 1}` : `PHRASE ${displayIdx + 1} / ${STANDARD_PHRASES.length}`}
              </span>
            </div>
            {wrongFlash && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF1A1A">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                </svg>
                <span style={{ fontSize: 10, color: "#FF1A1A", fontWeight: 800, fontFamily: "'DM Sans',sans-serif", letterSpacing: "1px" }}>WRONG</span>
              </div>
            )}
          </div>
 
          {/* Phrase characters */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "0", lineHeight: 1,
            transform: txState === "out" ? "translateX(-50px)" : "none",
            opacity: txState === "out" ? 0 : txState === "flash" ? 0 : 1,
            transition: txState === "out" ? "transform 0.2s ease-in, opacity 0.2s"
                      : txState === "in"  ? "transform 0.22s ease-out, opacity 0.22s"
                      : "none",
            ...(txState === "in" ? { animation: "slideInRight 0.25s ease-out forwards" } : {}),
          }}>
            {currentPhrase.split("").map((ch, i) => {
              const isTyped   = i < typed.length;
              const isCurrent = i === typed.length && txState === "idle";
              const isSpace   = ch === " ";
              return (
                <span key={i} style={{
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: isCurrent ? "clamp(1.9rem,5.5vw,2.4rem)" : "clamp(1.5rem,4.5vw,1.85rem)",
                  letterSpacing: "3px",
                  color: isTyped ? "#22C55E" : isCurrent ? "#FFB800" : "rgba(255,255,255,0.18)",
                  textShadow: isTyped
                    ? "0 0 12px rgba(34,197,94,0.4)"
                    : isCurrent ? "0 0 20px rgba(255,184,0,0.7)" : "none",
                  transition: "font-size 0.08s, color 0.06s",
                  animation: isCurrent ? "pulseAmber 0.85s ease-in-out infinite" : "none",
                  display: "inline-block",
                  width: isSpace ? "0.5rem" : "auto",
                }}>{isSpace ? "\u00A0" : ch}</span>
              );
            })}
          </div>
 
          {/* Next key indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "0.875rem" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="rgba(255,255,255,0.1)">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/>
            </svg>
            <div style={{
              width: 34, height: 34,
              background: "rgba(255,184,0,0.07)",
              border: "1.5px solid rgba(255,184,0,0.25)",
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 12px rgba(255,184,0,0.12)",
            }}>
              <span style={{
                fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.3rem",
                color: "#FFB800", animation: "pulseAmber 0.85s ease-in-out infinite",
              }}>
                {currentPhrase[typed.length] === " " ? "⎵" : (currentPhrase[typed.length] ?? "✓")}
              </span>
            </div>
          </div>
        </div>
      )}
 
      {/* ── Live stats ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: streak > 0
          ? "1fr 1px 1fr 1px 1fr 1px 1fr 1px 1fr"
          : "1fr 1px 1fr 1px 1fr 1px 1fr",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14, overflow: "hidden",
      }}>
        {[
          {
            v: wpm || "—", l: "WPM", col: wpm > 0 ? wpmColor : "rgba(255,255,255,.15)",
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill={wpm > 0 ? wpmColor : "rgba(255,255,255,0.15)"}><path d="M12 2C6.48 2 2 6.48 2 12c0 3.1 1.41 5.88 3.63 7.75L7.06 18.3A7.96 7.96 0 014 12a8 8 0 018-8 8 8 0 018 8 7.96 7.96 0 01-3.06 6.3l1.43 1.45A9.97 9.97 0 0022 12c0-5.52-4.48-10-10-10z"/><path d="M12 6a1 1 0 011 1v4.59l3.2 3.2-1.41 1.42L11 12.41V7a1 1 0 011-1z"/></svg>,
          },
          {
            v: `${acc}%`, l: "ACC", col: accColor,
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill={accColor}><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 3a7 7 0 110 14A7 7 0 0112 5zm0 3a4 4 0 100 8 4 4 0 000-8zm0 3a1 1 0 110 2 1 1 0 010-2z"/></svg>,
          },
          {
            v: errors, l: "ERR", col: errors > 0 ? "#FF1A1A" : "rgba(255,255,255,.18)",
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill={errors > 0 ? "#FF1A1A" : "rgba(255,255,255,0.18)"}><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>,
          },
          {
            v: `${score}%`, l: "PWR", col: scoreColor,
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill={scoreColor}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
          },
          ...(streak > 0 ? [{
            v: streak, l: "FIRE", col: streakColor,
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill={streakColor}><path d="M12 1.5C12 1.5 7 6.5 7 11a5 5 0 0010 0c0-3.5-2.5-6-2.5-6S14 7 13 8.5C12 6.5 12 1.5 12 1.5z"/><circle cx="12" cy="14" r="1.5"/></svg>,
          }] : []),
        ].map(({ v, l, col, icon }, i, arr) => (
          <React.Fragment key={l}>
            <div style={{
              padding: "0.7rem 0.25rem", textAlign: "center",
              background: l === "FIRE" && streakFlash ? `${streakColor}15` : "transparent",
              transition: "background 0.2s",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            }}>
              <div style={{ opacity: 0.75 }}>{icon}</div>
              <div style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: "clamp(1.15rem,3.5vw,1.55rem)",
                color: col, lineHeight: 1,
                transform: l === "FIRE" && streakFlash ? "scale(1.25)" : "scale(1)",
                transition: "transform 0.12s, color 0.25s",
              }}>{v}</div>
              <div style={{ fontSize: 7, letterSpacing: "1.5px", color: "rgba(255,255,255,.12)", fontWeight: 800, fontFamily: "'DM Sans',sans-serif" }}>{l}</div>
            </div>
            {i < arr.length - 1 && <div style={{ background: "rgba(255,255,255,0.05)", width: 1 }} />}
          </React.Fragment>
        ))}
      </div>
 
      {/* ── Accuracy bar ── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)">
              <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 3a7 7 0 110 14A7 7 0 0112 5zm0 3a4 4 0 100 8 4 4 0 000-8zm0 3a1 1 0 110 2 1 1 0 010-2z"/>
            </svg>
            <span style={{ fontSize: 9, letterSpacing: "2px", color: "rgba(255,255,255,.13)", fontFamily: "'DM Sans',sans-serif" }}>ACCURACY</span>
          </div>
          <span style={{ fontSize: 9, letterSpacing: "1px", color: accColor, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, transition: "color .3s" }}>{acc}%</span>
        </div>
        <div style={{ height: 3, background: "rgba(255,255,255,.04)", borderRadius: 2 }}>
          <div style={{ height: "100%", borderRadius: 2, width: `${acc}%`, background: `linear-gradient(90deg,${accColor}99,${accColor})`, transition: "width .2s, background .3s", boxShadow: `0 0 6px ${accColor}60` }} />
        </div>
      </div>
 
      {/* ── Bonus gate bar ── */}
      {onLastPhrase && !bonusLocked && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              <span style={{ fontSize: 9, letterSpacing: "2px", color: "rgba(255,255,255,.13)", fontFamily: "'DM Sans',sans-serif" }}>BONUS GATE</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {stableWpm >= BONUS_WPM_GATE && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#22C55E">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              )}
              {isClose && stableWpm < BONUS_WPM_GATE && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#FF6B00">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              )}
              <span style={{
                fontSize: 9, letterSpacing: "1px", fontFamily: "'DM Sans',sans-serif", fontWeight: 700,
                color: stableWpm >= BONUS_WPM_GATE ? "#22C55E" : isClose ? "#FF6B00" : "rgba(255,184,0,0.55)",
                transition: "color .3s",
                animation: isClose ? "pulse 0.8s ease-in-out infinite" : "none",
              }}>
                {stableWpm >= BONUS_WPM_GATE ? "UNLOCKED" : isClose ? "SO CLOSE — PUSH!" : `${stableWpm || "—"} / ${BONUS_WPM_GATE} WPM`}
              </span>
            </div>
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,.04)", borderRadius: 2, position: "relative" }}>
            <div style={{
              height: "100%", borderRadius: 2,
              width: `${Math.min(100, ((stableWpm || 0) / BONUS_WPM_GATE) * 100)}%`,
              background: `linear-gradient(90deg,${gateBarColor}88,${gateBarColor})`,
              transition: "width .2s, background .3s",
              boxShadow: isClose ? `0 0 10px ${gateBarColor}90` : "none",
            }} />
            <div style={{ position: "absolute", top: -3, right: 0, width: 2, height: 9, background: "#FFB800", borderRadius: 1 }} />
          </div>
        </div>
      )}
 
      {/* ── Footer ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="rgba(255,255,255,0.07)">
          <path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"/>
        </svg>
        <p style={{ fontSize: 9, color: "rgba(255,255,255,.07)", letterSpacing: "1.5px", fontFamily: "'DM Sans',sans-serif" }}>
          5 PHRASES · BONUS AFTER · ACCURACY COUNTS
        </p>
      </div>
 
      <style>{`
        @keyframes shimmerBar {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes cheerPop {
          0%   { opacity:0; transform:translate(-50%,-50%) scale(0.5); }
          20%  { opacity:1; transform:translate(-50%,-50%) scale(1.08); }
          80%  { opacity:1; transform:translate(-50%,-50%) scale(1); }
          100% { opacity:0; transform:translate(-50%,-50%) scale(0.9); }
        }
      `}</style>
    </div>
  );
}

// ─── Goal Selector ────────────────────────────────────────────────────────────
function GoalSelector({ earnedTier, earnedRewards, onBack }) {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [mounted,      setMounted]      = useState(false);
  const activeGoal  = GOALS.find(g => g.id === selectedGoal);
  const hasReward   = earnedTier && earnedRewards?.length > 0;
  const rewardCount = earnedRewards?.length || 0;
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);
 
  const buildRegisterUrl = (goalId) => {
    if (!hasReward) return `/register?goal=${goalId}`;
    return `/register?goal=${goalId}&tier=${earnedTier.registerTag}&rewards=${rewardCount}`;
  };
 
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", width: "100%", padding: "0 1rem" }}>
      <div style={{
        textAlign: "center", marginBottom: "1.75rem",
        opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>
        {/* Reward reminder banner */}
        {hasReward && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: `${earnedTier.color}10`,
            border: `1px solid ${earnedTier.color}30`,
            padding: "7px 16px", borderRadius: 100,
            marginBottom: "1rem",
            animation: "fadeUp 0.4s ease forwards",
          }}>
            <span style={{ fontSize: 12 }}>🎁</span>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "2px", color: earnedTier.color, fontFamily: "'DM Sans',sans-serif" }}>
              {rewardCount} REWARD{rewardCount !== 1 ? "S" : ""} LOCKED IN — PICK YOUR GOAL
            </span>
          </div>
        )}
 
        {!hasReward && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,26,26,0.07)", border: "1px solid rgba(255,26,26,0.18)",
            padding: "5px 16px", borderRadius: 100, marginBottom: "1rem",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF1A1A", display: "inline-block", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: "#FF1A1A", fontFamily: "'DM Sans',sans-serif" }}>WHAT'S YOUR GOAL?</span>
          </span>
        )}
 
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(1.8rem,6vw,3.5rem)", letterSpacing: "2px", color: "#fff", lineHeight: 1.05, marginBottom: "0.5rem" }}>
          {selectedGoal ? activeGoal.headline.toUpperCase() : "PICK YOUR PROGRAM."}
        </h2>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "clamp(0.8rem,3vw,0.9rem)", fontFamily: "'DM Sans',sans-serif" }}>
          {selectedGoal ? `Suggested: ${activeGoal.plan}` : "We'll build your perfect program around it."}
        </p>
      </div>
 
      {/* Goal grid — 2 cols on mobile, 3 on desktop */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: "0.65rem", marginBottom: "1.5rem",
      }}>
        {GOALS.map((goal, i) => (
          <button key={goal.id}
            onClick={() => setSelectedGoal(goal.id === selectedGoal ? null : goal.id)}
            style={{
              position: "relative", padding: "0.875rem 0.65rem", borderRadius: 12, cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              border: selectedGoal === goal.id ? `2px solid ${goal.color}` : "2px solid rgba(255,255,255,0.07)",
              background: selectedGoal === goal.id ? goal.color + "15" : "rgba(255,255,255,0.025)",
              color: selectedGoal === goal.id ? "#fff" : "rgba(255,255,255,0.55)",
              boxShadow: selectedGoal === goal.id ? `0 0 24px ${goal.color}30` : "none",
              transform: mounted ? (selectedGoal === goal.id ? "translateY(-4px) scale(1.02)" : "translateY(0)") : "translateY(16px)",
              opacity: mounted ? 1 : 0,
              transition: `all 0.25s ease, opacity 0.4s ease ${i * 0.06}s, transform 0.4s ease ${i * 0.06}s`,
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            <span style={{ fontSize: "1.4rem" }}>{goal.icon}</span>
            <span style={{ fontSize: "clamp(10px,2.5vw,12px)", fontWeight: 700, letterSpacing: "0.5px", textAlign: "center", lineHeight: 1.2 }}>{goal.label}</span>
            {selectedGoal === goal.id && (
              <span style={{ position: "absolute", top: 6, right: 6, width: 16, height: 16, borderRadius: "50%", background: goal.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 800 }}>✓</span>
            )}
          </button>
        ))}
      </div>
 
      {selectedGoal && (
        <div style={{ animation: "fadeUp 0.35s ease forwards" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "0.875rem",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderLeft: `3px solid ${activeGoal.color}`, borderRadius: 12,
            padding: "0.875rem 1.25rem", marginBottom: "0.875rem",
          }}>
            <span style={{ fontSize: "1.4rem" }}>{activeGoal.icon}</span>
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "3px", color: "rgba(255,255,255,0.3)", marginBottom: 3, fontFamily: "'DM Sans',sans-serif" }}>YOUR PROGRAM</p>
              <p style={{ fontSize: "clamp(0.8rem,3vw,0.95rem)", fontWeight: 600, color: "#fff", fontFamily: "'DM Sans',sans-serif" }}>{activeGoal.plan}</p>
            </div>
          </div>
 
          {hasReward && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 12px", borderRadius: 8, marginBottom: "0.875rem",
              background: `${earnedTier.color}08`, border: `1px solid ${earnedTier.color}25`,
            }}>
              <span style={{ fontSize: "0.85rem" }}>🎁</span>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(10px,2.5vw,11px)", color: "rgba(255,255,255,0.5)" }}>
                Your <strong style={{ color: earnedTier.color }}>{rewardCount} rewards</strong> will be applied at registration
              </span>
            </div>
          )}
 
          <a href={buildRegisterUrl(selectedGoal)} style={{
            display: "block", width: "100%", padding: "15px", textAlign: "center",
            background: hasReward
              ? `linear-gradient(135deg, ${earnedTier.color}, ${earnedTier.color}cc)`
              : `linear-gradient(135deg, ${activeGoal.color}, ${activeGoal.color}cc)`,
            boxShadow: hasReward
              ? `0 6px 28px ${earnedTier.color}40`
              : `0 6px 28px ${activeGoal.color}40`,
            color: "#fff", textDecoration: "none", fontWeight: 800,
            fontSize: "clamp(0.85rem,3.5vw,1rem)",
            letterSpacing: "0.5px", borderRadius: 8, fontFamily: "'DM Sans',sans-serif",
          }}>
            {hasReward
              ? `Register & Claim ${rewardCount} Rewards →`
              : `Start My ${activeGoal.label} Journey →`}
          </a>
 
          <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: "0.65rem", fontFamily: "'DM Sans',sans-serif" }}>
            {hasReward ? "Rewards valid today only · No credit card required" : "First session free · No joining fee this month"}
          </p>
        </div>
      )}
 
      <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", fontSize: 13, cursor: "pointer", letterSpacing: "1px", fontFamily: "'DM Sans',sans-serif" }}>
          ← Back
        </button>
      </div>
    </div>
  );
}

function ContactField({ label, type, placeholder, value, onChange, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{
        fontSize: "10px", fontWeight: 800, letterSpacing: "2px",
        color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif",
        textTransform: "uppercase",
      }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        style={{
          background: focused ? "rgba(255,26,26,0.04)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${focused ? "rgba(255,26,26,0.45)" : "rgba(255,255,255,0.08)"}`,
          borderRadius: "10px", padding: "13px 16px",
          color: "#fff", fontSize: "0.9rem",
          fontFamily: "'DM Sans', sans-serif",
          outline: "none", width: "100%",
          transition: "all 0.2s",
          boxShadow: focused ? "0 0 0 3px rgba(255,26,26,0.08)" : "none",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

function ContactInfoRow({ item, index }) {
  const [ref, inView] = useInView(0.1);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", gap: "1.25rem", alignItems: "flex-start",
        padding: "1.5rem 0",
        borderBottom: index < 3 ? "1px solid rgba(255,255,255,0.04)" : "none",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateX(0)" : "translateX(30px)",
        transition: `opacity 0.6s ease ${index * 0.08}s, transform 0.6s ease ${index * 0.08}s`,
      }}
    >
      <div style={{
        width: "38px", height: "38px", flexShrink: 0,
        borderRadius: "10px",
        background: hovered ? "rgba(255,26,26,0.12)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${hovered ? "rgba(255,26,26,0.3)" : "rgba(255,255,255,0.07)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: hovered ? "#FF1A1A" : "rgba(255,255,255,0.4)",
        transition: "all 0.25s ease",
        marginTop: "2px",
      }}>{item.icon}</div>
      <div>
        <p style={{
          fontSize: "9px", fontWeight: 800, letterSpacing: "3px",
          color: "#FF1A1A", fontFamily: "'DM Sans', sans-serif",
          marginBottom: "5px", textTransform: "uppercase",
        }}>{item.label}</p>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.875rem", color: "rgba(255,255,255,0.6)",
          lineHeight: 1.6, whiteSpace: "pre-line",
        }}>{item.value}</p>
      </div>
    </div>
  );
}

function PlanCard({ plan, index, total }) {
  const [hovered, setHovered] = useState(false);
  const [ref, inView] = useInView(0.1);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        position: "relative",
        padding: "2.5rem 1.75rem",
        background: plan.highlight
          ? `linear-gradient(180deg, ${plan.color}12 0%, rgba(0,0,0,0.95) 100%)`
          : hovered
          ? "rgba(255,255,255,0.03)"
          : "#000",
        display: "flex", flexDirection: "column",
        cursor: "pointer",
        transition: "background 0.3s ease",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(30px)",
        transitionProperty: "background, opacity, transform",
        transitionDuration: "0.3s, 0.6s, 0.6s",
        transitionDelay: `0s, ${index * 0.07}s, ${index * 0.07}s`,
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: plan.highlight
          ? `linear-gradient(90deg, transparent, ${plan.color}, transparent)`
          : hovered
          ? `linear-gradient(90deg, transparent, ${plan.color}88, transparent)`
          : "transparent",
        transition: "background 0.3s ease",
        boxShadow: plan.highlight ? `0 0 20px ${plan.color}60` : "none",
      }} />

      {/* Most popular badge */}
      {plan.highlight && (
        <div style={{
          position: "absolute", top: "-1px", left: "50%",
          transform: "translateX(-50%)",
          padding: "4px 14px",
          background: plan.color,
          borderRadius: "0 0 8px 8px",
          fontSize: "9px", fontWeight: 800,
          letterSpacing: "2px", color: "#fff",
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: `0 4px 16px ${plan.color}50`,
          whiteSpace: "nowrap",
        }}>MOST POPULAR</div>
      )}

      {/* Plan name */}
      <div style={{ marginBottom: "1.5rem", paddingTop: plan.highlight ? "1rem" : "0" }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "9px", fontWeight: 800,
          letterSpacing: "3px", color: plan.color,
          marginBottom: "6px", textTransform: "uppercase",
        }}>{plan.note}</p>
        <h3 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "1.6rem", letterSpacing: "2px",
          color: "#fff", lineHeight: 1,
        }}>{plan.name}</h3>
      </div>

      {/* Price */}
      <div style={{
        display: "flex", alignItems: "flex-start",
        gap: "3px", marginBottom: "2rem",
      }}>
        <span style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(2.2rem, 3vw, 3rem)",
          color: hovered || plan.highlight ? "#fff" : "rgba(255,255,255,0.8)",
          letterSpacing: "-2px", lineHeight: 1,
          transition: "color 0.3s",
        }}>{plan.price}</span>
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "11px", color: "rgba(255,255,255,0.3)",
          marginTop: "6px", lineHeight: 1.3,
        }}>{plan.period}</span>
      </div>

      {/* Divider */}
      <div style={{
        height: "1px",
        background: hovered || plan.highlight
          ? `linear-gradient(90deg, ${plan.color}44, transparent)`
          : "rgba(255,255,255,0.06)",
        marginBottom: "1.5rem",
        transition: "background 0.3s",
      }} />

      {/* Features */}
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", flex: 1, marginBottom: "2rem" }}>
        {plan.features.map((f, fi) => (
          <li key={fi} style={{
            display: "flex", alignItems: "flex-start", gap: "10px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.82rem", color: "rgba(255,255,255,0.55)",
            lineHeight: 1.4,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
              <path d="M20 6L9 17l-5-5" stroke={plan.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a href="/register" style={{
        display: "block", width: "100%",
        padding: "12px",
        textAlign: "center",
        textDecoration: "none",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 800, fontSize: "12px",
        letterSpacing: "1.5px",
        borderRadius: "8px",
        color: plan.highlight ? "#fff" : hovered ? "#fff" : plan.color,
        background: plan.highlight
          ? `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`
          : hovered
          ? `${plan.color}18`
          : "transparent",
        border: plan.highlight ? "none" : `1px solid ${plan.color}44`,
        boxShadow: plan.highlight ? `0 6px 24px ${plan.color}40` : "none",
        transition: "all 0.25s ease",
      }}>
        {plan.highlight ? "GET STARTED →" : "CHOOSE PLAN"}
      </a>

      {/* Right border divider — except last */}
      {index < total - 1 && (
        <div style={{
          position: "absolute", top: "10%", bottom: "10%", right: 0, width: "1px",
          background: "rgba(255,255,255,0.05)",
        }} />
      )}
    </div>
  );
}

function AboutFact({ item, index }) {
  const [ref, inView] = useInView(0.2);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", gap: "1.5rem", alignItems: "flex-start",
        padding: "1.75rem 0",
        borderBottom: index < 3 ? "1px solid rgba(255,255,255,0.05)" : "none",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateX(0)" : "translateX(40px)",
        transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`,
        cursor: "default",
      }}
    >
      {/* Number */}
      <span style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "3.5rem", lineHeight: 1,
        color: hovered ? "#FF1A1A" : "rgba(255,26,26,0.15)",
        letterSpacing: "-2px", flexShrink: 0,
        transition: "color 0.3s ease",
        textShadow: hovered ? "0 0 30px rgba(255,26,26,0.4)" : "none",
      }}>{item.num}</span>

      <div style={{ paddingTop: "6px" }}>
        <h4 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "1.1rem", letterSpacing: "3px",
          color: hovered ? "#fff" : "rgba(255,255,255,0.7)",
          marginBottom: "6px", lineHeight: 1,
          transition: "color 0.3s ease",
        }}>{item.title}</h4>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.85rem", lineHeight: 1.7,
          color: "rgba(255,255,255,0.4)",
        }}>{item.desc}</p>

        {/* Animated underline */}
        <div style={{
          height: "1px", marginTop: "10px",
          background: "#FF1A1A",
          width: hovered ? "40px" : "0px",
          transition: "width 0.35s ease",
          boxShadow: "0 0 8px rgba(255,26,26,0.6)",
        }} />
      </div>
    </div>
  );
}

function TrainerCard({ trainer, index }) {
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt]       = useState({ x: 0, y: 0 });
  const cardRef               = useRef(null);

  const onMouseMove = (e) => {
    if (!cardRef.current) return;
    const r  = cardRef.current.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width  - 0.5;
    const dy = (e.clientY - r.top)  / r.height - 0.5;
    setTilt({ x: -dy * 8, y: dx * 8 });
  };

  return (
    <ScrollCard direction={index % 2 === 0 ? "left" : "right"} delay={index * 0.08}>
      <div
        ref={cardRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
        onMouseMove={onMouseMove}
        style={{
          position: "relative",
          borderRadius: "20px",
          cursor: "pointer",
          isolation: "isolate",
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${hovered ? "-6px" : "0px"}) translateZ(0)`,
          transition: hovered
            ? "transform 0.15s ease"
            : "transform 0.5s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: hovered
            ? `0 32px 64px rgba(0,0,0,0.7), 0 0 40px ${trainer.color}25`
            : "0 8px 32px rgba(0,0,0,0.5)",
          willChange: "transform",
        }}
      >
        {/* ── Image block — top corners only ── */}
        <div style={{
          position: "relative",
          height: "320px",
          borderRadius: "20px 20px 0 0",
          overflow: "hidden",
          transform: "translateZ(0)",
          backgroundColor: "#111",
        }}>
          <img
            src={trainer.image}
            alt={trainer.name}
            style={{
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "top",
              transform: hovered ? "scale(1.06)" : "scale(1.0)",
              transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
              display: "block",
            }}
            onError={e => { e.target.style.display = "none"; }}
          />

          {/* Dark gradient */}
          <div style={{
            position: "absolute", inset: 0,
            background: hovered
              ? "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.97) 100%)"
              : "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.98) 100%)",
            transition: "background 0.4s ease",
          }} />

          {/* Color tint */}
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(160deg, ${trainer.color}18 0%, transparent 55%)`,
            opacity: hovered ? 1 : 0.4,
            transition: "opacity 0.4s ease",
          }} />

          {/* Exp badge — top right */}
          <div style={{
            position: "absolute", top: 14, right: 14,
            padding: "5px 12px", borderRadius: "100px",
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(10px)",
            border: `1px solid ${trainer.color}44`,
            fontSize: "10px", fontWeight: 800,
            letterSpacing: "1.5px", color: trainer.color,
            fontFamily: "'DM Sans', sans-serif",
            display: "flex", alignItems: "center", gap: "5px",
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {trainer.exp}
          </div>

          {/* Name block — bottom of image */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "1.25rem 1.4rem 0.85rem",
          }}>
            <div style={{
              width: hovered ? "44px" : "22px",
              height: "2px",
              background: trainer.color,
              borderRadius: "2px",
              marginBottom: "8px",
              transition: "width 0.4s ease",
              boxShadow: `0 0 8px ${trainer.color}80`,
            }} />
            <h3 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "2rem", letterSpacing: "2px",
              color: "#fff", lineHeight: 1,
              textShadow: "0 2px 16px rgba(0,0,0,0.9)",
              marginBottom: "4px",
            }}>{trainer.name}</h3>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "10px", fontWeight: 800,
              letterSpacing: "2.5px", textTransform: "uppercase",
              color: trainer.color, lineHeight: 1,
            }}>{trainer.role}</p>
          </div>
        </div>

        {/* ── Info panel — bottom corners only ── */}
        <div style={{
          background: "linear-gradient(180deg, #0a0a0a 0%, #040404 100%)",
          padding: "1.2rem 1.4rem 1.5rem",
          borderTop: `1px solid ${trainer.color}18`,
          borderRadius: "0 0 20px 20px",
          overflow: "hidden",
          transform: "translateZ(0)",
        }}>

          {/* Speciality row */}
          <div style={{
            display: "flex", alignItems: "flex-start",
            gap: "10px", marginBottom: "0.85rem",
          }}>
            <div style={{
              width: "30px", height: "30px", flexShrink: 0,
              borderRadius: "8px",
              background: `${trainer.color}14`,
              border: `1px solid ${trainer.color}35`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: trainer.color,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <div style={{ paddingTop: "1px" }}>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "9px", fontWeight: 800,
                letterSpacing: "2px", color: "rgba(255,255,255,0.22)",
                marginBottom: "3px", textTransform: "uppercase",
              }}>Speciality</p>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.82rem", fontWeight: 600,
                color: "rgba(255,255,255,0.78)", lineHeight: 1.4,
              }}>{trainer.spec}</p>
            </div>
          </div>

          {/* Cert row */}
          <div style={{
            display: "flex", alignItems: "center",
            gap: "10px",
            padding: "0.75rem 0 0",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}>
            <div style={{
              width: "30px", height: "30px", flexShrink: 0,
              borderRadius: "8px",
              background: `${trainer.color}14`,
              border: `1px solid ${trainer.color}35`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: trainer.color,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
              </svg>
            </div>
            <div style={{ paddingTop: "1px" }}>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "9px", fontWeight: 800,
                letterSpacing: "2px", color: "rgba(255,255,255,0.22)",
                marginBottom: "3px", textTransform: "uppercase",
              }}>Certification</p>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.82rem", fontWeight: 600,
                color: "rgba(255,255,255,0.78)",
              }}>{trainer.cert}</p>
            </div>
          </div>

          {/* CTA — slides in on hover */}
          <div style={{
            maxHeight: hovered ? "60px" : "0px",
            opacity: hovered ? 1 : 0,
            overflow: "hidden",
            transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease",
            marginTop: hovered ? "1rem" : "0",
          }}>
            <button style={{
              width: "100%", padding: "11px",
              background: `linear-gradient(135deg, ${trainer.color}, ${trainer.color}bb)`,
              border: "none", borderRadius: "8px",
              cursor: "pointer", color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 800, fontSize: "12px",
              letterSpacing: "1.5px",
              boxShadow: `0 4px 20px ${trainer.color}35`,
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: "8px",
            }}>
              BOOK A SESSION
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7"/><path d="M7 7h10v10"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom glow line */}
        <div style={{
          position: "absolute", bottom: 0, left: "15%", right: "15%", height: "1px",
          background: `linear-gradient(90deg, transparent, ${trainer.color}, transparent)`,
          boxShadow: `0 0 16px 3px ${trainer.color}40`,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
        }} />

        {/* Shimmer */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(circle at ${50 + tilt.y * 6}% ${50 - tilt.x * 6}%, rgba(255,255,255,0.04) 0%, transparent 60%)`,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s",
          borderRadius: "20px",
        }} />
      </div>
    </ScrollCard>
  );
}

const REWARD_TIERS = {
  WARMING_UP: {
    rank:        "WARMING UP",
    wpmRange:    "0–49 WPM",
    color:       "rgba(255,255,255,0.5)",
    headline:    "You showed up. That's everything.",
    subline:     "Here's what you've unlocked just for completing the challenge.",
    rewards: [
      { icon: "🎯", title: "Free Fitness Assessment", value: "₹500 value",      desc: "Full body composition scan on your first visit" },
      { icon: "🚫", title: "No Joining Fee",          value: "Waived",           desc: "Join today with zero setup cost"               },
    ],
    ctaLabel:    "Claim Your Rewards →",
    registerTag: "warming_up",
  },
  SOLID: {
    rank:        "SOLID",
    wpmRange:    "50–79 WPM",
    color:       "#FFB800",
    headline:    "Good pace. Real FitZone energy.",
    subline:     "Your speed earned you an extra perk on top.",
    rewards: [
      { icon: "🎯", title: "Free Fitness Assessment", value: "₹500 value",      desc: "Full body composition scan on your first visit" },
      { icon: "🚫", title: "No Joining Fee",          value: "Waived",           desc: "Join today with zero setup cost"               },
      { icon: "🔒", title: "Bonus Locker Access",     value: "First month free", desc: "Dedicated locker for your first 30 days"       },
    ],
    ctaLabel:    "Claim Your Rewards →",
    registerTag: "solid",
  },
  PRO: {
    rank:        "PRO",
    wpmRange:    "80–99 WPM",
    color:       "#FF6B00",
    headline:    "Fast hands. That's real FitZone energy.",
    subline:     "You typed like you train — here's what that earns you.",
    rewards: [
      { icon: "🎯", title: "Free Fitness Assessment", value: "₹500 value",      desc: "Full body composition scan on your first visit" },
      { icon: "🚫", title: "No Joining Fee",          value: "Waived",           desc: "Join today with zero setup cost"               },
      { icon: "🔒", title: "Bonus Locker Access",     value: "First month free", desc: "Dedicated locker for your first 30 days"       },
      { icon: "💰", title: "₹300 Off First Month",   value: "₹300 discount",    desc: "Applied automatically at checkout"             },
    ],
    ctaLabel:    "Claim Your Rewards →",
    registerTag: "pro",
  },
  ELITE: {
    rank:        "ELITE",
    wpmRange:    "100+ WPM",
    color:       "#FF1A1A",
    headline:    "You type like you train. Absolutely relentless.",
    subline:     "ELITE tier unlocks everything. This is the full package.",
    rewards: [
      { icon: "🎯", title: "Free Fitness Assessment", value: "₹500 value",      desc: "Full body composition scan on your first visit" },
      { icon: "🚫", title: "No Joining Fee",          value: "Waived",           desc: "Join today with zero setup cost"               },
      { icon: "🔒", title: "Bonus Locker Access",     value: "First month free", desc: "Dedicated locker for your first 30 days"       },
      { icon: "💰", title: "₹500 Off First Month",   value: "₹500 discount",    desc: "Applied automatically at checkout"             },
      { icon: "🏋️", title: "First PT Session Free", value: "₹500 value",       desc: "1-on-1 session with any certified trainer"     },
    ],
    ctaLabel:    "Claim Your Full Reward →",
    registerTag: "elite",
  },
};
 
const BONUS_STACK_REWARD = {
  icon:  "⚡",
  title: "Bonus Phrase Reward",
  value: "+₹200 extra off",
  desc:  "You went beyond — extra discount stacked on your tier reward",
};
 
const getTier = (peakWpm) => {
  if (peakWpm >= 100) return REWARD_TIERS.ELITE;
  if (peakWpm >= 80)  return REWARD_TIERS.PRO;
  if (peakWpm >= 50)  return REWARD_TIERS.SOLID;
  return REWARD_TIERS.WARMING_UP;
};
 
function RewardScreen({ stats, onContinue }) {
  const [mounted,     setMounted]     = useState(false);
  const [revealed,    setRevealed]    = useState([]);
  const [allRevealed, setAllRevealed] = useState(false);
  const [countDown,   setCountDown]   = useState(null);
 
  const tier         = getTier(stats.peakWpm);
  const bonusDone    = stats.phrasesTyped > 5;
  const showBonusRow = bonusDone && stats.peakWpm >= 80;
  const allRewards   = [...tier.rewards, ...(showBonusRow ? [BONUS_STACK_REWARD] : [])];
  const registerUrl  = `/register?tier=${tier.registerTag}&peakWpm=${stats.peakWpm}&bonus=${bonusDone ? 1 : 0}`;
 
  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
    allRewards.forEach((_, i) => {
      setTimeout(() => {
        setRevealed(prev => [...prev, i]);
        if (i === allRewards.length - 1) setTimeout(() => setAllRevealed(true), 400);
      }, 500 + i * 320);
    });
  }, []);
 
  useEffect(() => {
    if (!allRevealed) return;
    setCountDown(8);
    const iv = setInterval(() => {
      setCountDown(prev => {
        if (prev <= 1) { clearInterval(iv); onContinue(tier, allRewards); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [allRevealed]);
 
  const rewardIcons = {
    "🎯": <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 3a7 7 0 110 14A7 7 0 0112 5zm0 3a4 4 0 100 8 4 4 0 000-8zm0 3a1 1 0 110 2 1 1 0 010-2z"/></svg>,
    "🚫": <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>,
    "🔒": <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>,
    "💰": <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>,
    "🏋️": <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z"/></svg>,
    "⚡": <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  };
 
  return (
    <div style={{
      maxWidth: 540, width: "100%", margin: "0 auto", padding: "0 1rem",
      opacity: mounted ? 1 : 0,
      transform: mounted ? "none" : "translateY(32px)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
    }}>
      <style>{`
        @keyframes rewardPop {
          0%   { opacity:0; transform:translateY(14px) scale(0.97); }
          60%  { transform:translateY(-2px) scale(1.01); }
          100% { opacity:1; transform:none; }
        }
        @keyframes rankPulse {
          0%,100% { box-shadow: 0 0 24px var(--rc,rgba(255,26,26,0.25)); }
          50%      { box-shadow: 0 0 48px var(--rc,rgba(255,26,26,0.45)), 0 0 80px var(--rc,rgba(255,26,26,0.15)); }
        }
        @keyframes shimmerFlow {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
 
      {/* ── Rank header ── */}
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div style={{
          display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 10,
          padding: "1.25rem clamp(1.5rem,5vw,2.75rem)",
          background: `linear-gradient(135deg, ${tier.color}14, ${tier.color}06)`,
          border: `2px solid ${tier.color}40`,
          borderRadius: 18,
          animation: "rankPulse 2.5s ease-in-out infinite",
          "--rc": `${tier.color}30`,
          marginBottom: "1rem",
        }}>
          {/* Rank icon */}
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: `${tier.color}20`,
            border: `2px solid ${tier.color}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 24px ${tier.color}30`,
          }}>
            {tier.rank === "ELITE"      && <svg width="24" height="24" viewBox="0 0 24 24" fill={tier.color}><path d="M12 1L8 9 2 6l3 13h14l3-13-6 3-4-8z"/><rect x="5" y="20" width="14" height="2" rx="1"/></svg>}
            {tier.rank === "PRO"        && <svg width="24" height="24" viewBox="0 0 24 24" fill={tier.color}><path d="M5 3H3a2 2 0 00-2 2v2a4 4 0 003.86 4A6 6 0 009 14.9V17H7v2h10v-2h-2v-2.1A6 6 0 0019.14 11 4 4 0 0023 7V5a2 2 0 00-2-2h-2V1H5v2z"/></svg>}
            {tier.rank === "SOLID"      && <svg width="24" height="24" viewBox="0 0 24 24" fill={tier.color}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
            {tier.rank === "WARMING UP" && <svg width="24" height="24" viewBox="0 0 24 24" fill={tier.color}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>}
          </div>
 
          <div>
            <span style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: "clamp(2rem,8vw,3rem)", letterSpacing: "5px",
              color: tier.color, lineHeight: 1, display: "block",
            }}>{tier.rank}</span>
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: "3px",
              color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans',sans-serif",
              display: "block", marginTop: 2,
            }}>{tier.wpmRange}</span>
          </div>
        </div>
 
        <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(1.1rem,3.5vw,1.6rem)", color: "#fff", letterSpacing: "2px", lineHeight: 1.1, marginBottom: "0.35rem" }}>
          {tier.headline.toUpperCase()}
        </p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(0.78rem,2.5vw,0.88rem)", color: "rgba(255,255,255,0.38)" }}>
          {tier.subline}
        </p>
 
        {/* Shimmer divider */}
        <div style={{
          height: 1, margin: "1rem auto 0",
          background: `linear-gradient(90deg, transparent, ${tier.color}, transparent)`,
          backgroundSize: "200% auto",
          animation: "shimmerFlow 2s linear infinite",
          opacity: 0.45,
        }} />
      </div>
 
      {/* ── Reward cards ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "1.25rem" }}>
        {allRewards.map((reward, i) => {
          const isVisible = revealed.includes(i);
          const isBonus   = reward === BONUS_STACK_REWARD;
          const cardColor = isBonus ? "#FFB800" : tier.color;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "0.875rem",
              padding: "0.875rem 1rem",
              background: `linear-gradient(135deg, ${cardColor}0a, ${cardColor}04)`,
              border: `1px solid ${cardColor}25`,
              borderRadius: 12,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateX(-12px)",
              transition: "opacity 0.35s ease, transform 0.35s ease",
              animation: isVisible ? "rewardPop 0.4s ease forwards" : "none",
            }}>
              {/* Icon box */}
              <div style={{
                width: 42, height: 42, flexShrink: 0, borderRadius: 11,
                background: `${cardColor}18`,
                border: `1.5px solid ${cardColor}35`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: cardColor,
                boxShadow: isVisible ? `0 0 16px ${cardColor}20` : "none",
              }}>
                {rewardIcons[reward.icon] || <span style={{ fontSize: "1.1rem" }}>{reward.icon}</span>}
              </div>
 
              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(0.78rem,3vw,0.88rem)", fontWeight: 700, color: "#fff" }}>
                    {reward.title}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: "1px",
                    padding: "2px 8px", borderRadius: 100,
                    color: cardColor,
                    background: `${cardColor}15`,
                    border: `1px solid ${cardColor}30`,
                    fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap",
                  }}>{reward.value}</span>
                </div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(0.68rem,2.5vw,0.75rem)", color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>
                  {reward.desc}
                </p>
              </div>
 
              {/* Check */}
              {isVisible && (
                <div style={{
                  width: 24, height: 24, flexShrink: 0, borderRadius: "50%",
                  background: `${cardColor}18`,
                  border: `2px solid ${cardColor}55`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  animation: "rewardPop 0.3s ease forwards",
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill={cardColor}>
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
 
      {/* ── Stats strip ── */}
      {allRevealed && (
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1px 1fr 1px 1fr",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12, overflow: "hidden", marginBottom: "1rem",
          animation: "rewardPop 0.4s ease forwards",
        }}>
          {[
            { v: stats.peakWpm, l: "PEAK WPM", col: tier.color, icon: <svg width="12" height="12" viewBox="0 0 24 24" fill={tier.color}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
            { v: `${stats.accuracy}%`, l: "ACCURACY", col: stats.accuracy >= 90 ? "#22C55E" : "#FFB800", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill={stats.accuracy >= 90 ? "#22C55E" : "#FFB800"}><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 3a7 7 0 110 14A7 7 0 0112 5zm0 3a4 4 0 100 8 4 4 0 000-8zm0 3a1 1 0 110 2 1 1 0 010-2z"/></svg> },
            { v: stats.phrasesTyped, l: "PHRASES", col: "#fff", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)"><path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"/></svg> },
          ].map(({ v, l, col, icon }, i, arr) => (
            <React.Fragment key={l}>
              <div style={{ padding: "0.65rem 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{ opacity: 0.7 }}>{icon}</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(1.2rem,4vw,1.55rem)", color: col, lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 7, letterSpacing: "2px", color: "rgba(255,255,255,0.18)", fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>{l}</div>
              </div>
              {i < arr.length - 1 && <div style={{ background: "rgba(255,255,255,0.05)" }} />}
            </React.Fragment>
          ))}
        </div>
      )}
 
      {/* ── CTA ── */}
      {allRevealed && (
        <div style={{ animation: "rewardPop 0.5s ease 0.1s both" }}>
          {/* Expiry row */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 12px", borderRadius: 9, marginBottom: "0.875rem",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(255,184,0,0.6)">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
            </svg>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(9px,2.5vw,11px)", color: "rgba(255,255,255,0.35)" }}>
              Valid <strong style={{ color: "#FFB800" }}>today only</strong> — tied to this session
            </span>
            {countDown !== null && countDown > 0 && (
              <span style={{
                marginLeft: "auto", flexShrink: 0,
                fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.05rem",
                color: countDown <= 3 ? "#FF1A1A" : "#FFB800",
              }}>{countDown}s</span>
            )}
          </div>
 
          <a href={registerUrl} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            width: "100%", padding: "15px",
            background: `linear-gradient(135deg, ${tier.color}, ${tier.color}cc)`,
            boxShadow: `0 6px 28px ${tier.color}40`,
            border: "none", borderRadius: 10, cursor: "pointer",
            color: "#fff", fontWeight: 800,
            fontSize: "clamp(0.85rem,3.5vw,1rem)",
            textDecoration: "none", fontFamily: "'DM Sans',sans-serif",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 10px 36px ${tier.color}55`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 6px 28px ${tier.color}40`; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
              <path d="M20 12v10H4V12H2v-2h20v2h-2zM6 12v8h12v-8H6zM12 4.5A2.5 2.5 0 009.5 7H11V6a1 1 0 012 0v1h1.5A2.5 2.5 0 0012 4.5zm0-2a4.5 4.5 0 014.45 3.83A4 4 0 0120 10H4a4 4 0 013.55-3.67A4.5 4.5 0 0112 2.5z"/>
            </svg>
            {tier.ctaLabel}
          </a>
 
          <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.18)", marginTop: "0.65rem", letterSpacing: "1px", fontFamily: "'DM Sans',sans-serif" }}>
            {allRewards.length} reward{allRewards.length !== 1 ? "s" : ""} unlocked · No credit card needed
          </p>
 
          <div style={{ textAlign: "center", marginTop: "0.875rem" }}>
            <button onClick={() => onContinue(tier, allRewards)} style={{
              background: "none", border: "none",
              color: "rgba(255,255,255,0.2)", fontSize: 12,
              cursor: "pointer", letterSpacing: "1px",
              fontFamily: "'DM Sans',sans-serif",
              display: "inline-flex", alignItems: "center", gap: 5,
              transition: "color 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}
            >
              Pick my goal first
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

 
const IC = {
  bolt: (sz=16, col="currentColor") => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill={col} xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  flame: (sz=16, col="currentColor") => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill={col}>
      <path d="M12 1.5C12 1.5 7 6.5 7 11a5 5 0 0010 0c0-3.5-2.5-6-2.5-6S14 7 13 8.5C12 6.5 12 1.5 12 1.5z"/>
      <circle cx="12" cy="14" r="1.5"/>
    </svg>
  ),
  target: (sz=16, col="currentColor") => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill={col}>
      <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 3a7 7 0 110 14A7 7 0 0112 5zm0 3a4 4 0 100 8 4 4 0 000-8zm0 3a1 1 0 110 2 1 1 0 010-2z"/>
    </svg>
  ),
  gauge: (sz=16, col="currentColor") => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill={col}>
      <path d="M12 2C6.48 2 2 6.48 2 12c0 3.1 1.41 5.88 3.63 7.75L7.06 18.3A7.96 7.96 0 014 12a8 8 0 018-8 8 8 0 018 8 7.96 7.96 0 01-3.06 6.3l1.43 1.45A9.97 9.97 0 0022 12c0-5.52-4.48-10-10-10z"/>
      <path d="M12 6a1 1 0 011 1v4.59l3.2 3.2-1.41 1.42L11 12.41V7a1 1 0 011-1z"/>
    </svg>
  ),
  trophy: (sz=16, col="currentColor") => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill={col}>
      <path d="M5 3H3a2 2 0 00-2 2v2a4 4 0 003.86 4A6 6 0 009 14.9V17H7v2h10v-2h-2v-2.1A6 6 0 0019.14 11 4 4 0 0023 7V5a2 2 0 00-2-2h-2V1H5v2zm0 2V5h-.5A.5.5 0 004 5.5v1.59A2 2 0 005 7V5zm14 0v2a2 2 0 001-1.91V5.5a.5.5 0 00-.5-.5H19z"/>
    </svg>
  ),
  crown: (sz=16, col="currentColor") => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill={col}>
      <path d="M12 1L8 9 2 6l3 13h14l3-13-6 3-4-8z"/>
      <rect x="5" y="20" width="14" height="2" rx="1"/>
    </svg>
  ),
  check: (sz=16, col="currentColor") => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill={col}>
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
    </svg>
  ),
  xmark: (sz=16, col="currentColor") => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill={col}>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
    </svg>
  ),
  lock: (sz=16, col="currentColor") => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill={col}>
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>
  ),
  unlock: (sz=16, col="currentColor") => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill={col}>
      <path d="M12 1C9.24 1 7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2H9V6c0-1.66 1.34-3 3-3s3 1.34 3 3v1h2V6c0-2.76-2.24-5-5-5zm0 11c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
    </svg>
  ),
  keyboard: (sz=16, col="currentColor") => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill={col}>
      <path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 5H5v-2h2v2zm9 0H8v-2h8v2zm1-5h-2v-2h2v2zm0-3h-2V8h2v2zm3 8h-2v-2h2v2zm0-5h-2v-2h2v2zm0-3h-2V8h2v2z"/>
    </svg>
  ),
  gift: (sz=16, col="currentColor") => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill={col}>
      <path d="M20 12v10H4V12H2v-2h20v2h-2zM6 12v8h12v-8H6zM12 4.5A2.5 2.5 0 009.5 7H11V6a1 1 0 012 0v1h1.5A2.5 2.5 0 0012 4.5zm0-2a4.5 4.5 0 014.45 3.83A4 4 0 0120 10H4a4 4 0 013.55-3.67A4.5 4.5 0 0112 2.5z"/>
    </svg>
  ),
  star: (sz=16, col="currentColor") => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill={col}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  shield: (sz=16, col="currentColor") => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill={col}>
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
    </svg>
  ),
  dumbbell: (sz=16, col="currentColor") => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill={col}>
      <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z"/>
    </svg>
  ),
  arrowRight: (sz=16, col="currentColor") => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill={col}>
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/>
    </svg>
  ),
  skip: (sz=16, col="currentColor") => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill={col}>
      <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/>
    </svg>
  ),
  clock: (sz=16, col="currentColor") => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill={col}>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
    </svg>
  ),
};

function EnergyShakeSection() {
  const [phase,         setPhase]         = useState("invite");
  const [energy,        setEnergy]        = useState(0);
  const [summaryStats,  setSummaryStats]  = useState(null);
  const [earnedTier,    setEarnedTier]    = useState(null);
  const [earnedRewards, setEarnedRewards] = useState([]);
  const audioRef = useRef(null);
  const isFull   = energy >= 100;
 
  useEffect(() => { audioRef.current = createAudio(); }, []);
 
  const handleFinish = useCallback((stats) => {
    setSummaryStats(stats);
    setPhase("summary");
  }, []);
 
  const handleRewardContinue = useCallback((tier, rewards) => {
    setEarnedTier(tier);
    setEarnedRewards(rewards);
    setPhase("goals");
  }, []);
 
  const barColor = energy < 30 ? "#FF6B00" : energy < 60 ? "#FFB800" : energy < 90 ? "#FF4400" : "#FF1A1A";
 
  return (
    <section style={{
      padding: "7rem 1.25rem", position: "relative", overflow: "hidden",
      background: isFull
        ? "linear-gradient(180deg,#0d0000 0%,#160000 50%,#0d0000 100%)"
        : "linear-gradient(180deg,#000 0%,#060606 100%)",
      transition: "background 1.4s ease",
      minHeight: phase === "typing" ? 700 : "auto",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700;800&display=swap');
        @keyframes pulseAmber  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.9)} }
        @keyframes fadeCheckIn { from{opacity:0;transform:scale(0.3)} to{opacity:1;transform:scale(1)} }
        @keyframes fadeUp      { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse       { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes particleFly {
          0%   { transform:translate(-50%,-50%) scale(1); opacity:1; }
          100% { transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(0); opacity:0; }
        }
        @keyframes slideInRight { from{transform:translateX(50px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes bounceIn { 0%{transform:scale(0.4);opacity:0} 60%{transform:scale(1.2);opacity:1} 100%{transform:scale(1)} }
        @keyframes cheerPop {
          0%   { opacity:0; transform:translate(-50%,-50%) scale(0.5); }
          20%  { opacity:1; transform:translate(-50%,-50%) scale(1.1); }
          80%  { opacity:1; transform:translate(-50%,-50%) scale(1); }
          100% { opacity:0; transform:translate(-50%,-50%) scale(0.9); }
        }
      `}</style>
 
      {isFull && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 70% 60% at 50% 50%,rgba(255,26,26,0.07),transparent)", animation: "pulse 3s ease infinite" }} />
      )}
 

{phase === "invite" && (
  <div style={{ maxWidth: 540, width: "100%", textAlign: "center", animation: "fadeUp 0.5s ease forwards" }}>
 
    {/* Eyebrow */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, marginBottom: "1.25rem" }}>
      <svg width="8" height="8" viewBox="0 0 24 24" fill="#FF1A1A" style={{ animation: "pulse 2s infinite" }}>
        <circle cx="12" cy="12" r="10"/>
      </svg>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "4px", color: "#FF1A1A", fontFamily: "'DM Sans',sans-serif" }}>ENERGY CHECK</span>
    </div>
 
    {/* Headline */}
    <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(2.2rem,8vw,4rem)", letterSpacing: "2px", color: "#fff", lineHeight: 1.02, marginBottom: "0.65rem" }}>
      HOW BAD DO<br/>
      <span style={{ background: "linear-gradient(135deg,#FF1A1A,#FF6B00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>YOU WANT IT?</span>
    </h2>
    <p style={{ color: "rgba(255,255,255,0.32)", fontSize: "clamp(0.82rem,3vw,0.92rem)", lineHeight: 1.65, maxWidth: 380, margin: "0 auto 1.5rem", fontFamily: "'DM Sans',sans-serif" }}>
      Type 5 phrases. Speed × accuracy fills the bar — then we unlock your rewards.
    </p>
 
    {/* Rewards preview grid */}
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr",
      gap: 8, marginBottom: "1.75rem",
      padding: "1rem 1.1rem",
      background: "rgba(255,255,255,0.015)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 14, textAlign: "left",
    }}>
      <div style={{ gridColumn: "span 2", display: "flex", alignItems: "center", gap: 6, marginBottom: 4, paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)">
          <path d="M20 12v10H4V12H2v-2h20v2h-2zM6 12v8h12v-8H6zM12 4.5A2.5 2.5 0 009.5 7H11V6a1 1 0 012 0v1h1.5A2.5 2.5 0 0012 4.5zm0-2a4.5 4.5 0 014.45 3.83A4 4 0 0120 10H4a4 4 0 013.55-3.67A4.5 4.5 0 0112 2.5z"/>
        </svg>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "3px", color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans',sans-serif" }}>REWARDS UP FOR GRABS</span>
      </div>
      {[
        { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 3a7 7 0 110 14A7 7 0 0112 5zm0 3a4 4 0 100 8 4 4 0 000-8zm0 3a1 1 0 110 2 1 1 0 010-2z"/></svg>, label: "Free Assessment", tier: "All tiers" },
        { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>, label: "No Joining Fee", tier: "All tiers" },
        { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>, label: "Bonus Locker", tier: "50+ WPM" },
        { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>, label: "Up to ₹500 off", tier: "80+ WPM" },
        { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z"/></svg>, label: "Free PT Session", tier: "100+ WPM" },
        { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, label: "Bonus stack", tier: "Bonus round" },
      ].map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7, flexShrink: 0,
            background: "rgba(255,255,255,0.04)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{r.icon}</div>
          <div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(10px,2.5vw,11px)", fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>{r.label}</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "rgba(255,255,255,0.18)", letterSpacing: "0.5px" }}>{r.tier}</div>
          </div>
        </div>
      ))}
    </div>
 
    {/* CTAs */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
      <button onClick={() => setPhase("typing")} style={{
        padding: "13px 28px",
        background: "linear-gradient(135deg,#FF1A1A,#CC1111)",
        border: "none", borderRadius: 10, cursor: "pointer",
        color: "#fff", fontWeight: 800,
        fontSize: "clamp(0.82rem,3vw,0.92rem)", letterSpacing: "0.5px",
        boxShadow: "0 6px 28px rgba(255,26,26,0.4)",
        fontFamily: "'DM Sans',sans-serif",
        display: "flex", alignItems: "center", gap: 8,
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 36px rgba(255,26,26,0.5)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(255,26,26,0.4)"; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        Start & Earn Rewards
        <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff">
          <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/>
        </svg>
      </button>
      <button onClick={() => setPhase("goals")} style={{
        padding: "13px 18px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 10, cursor: "pointer",
        color: "rgba(255,255,255,0.38)", fontWeight: 600,
        fontSize: "clamp(0.78rem,3vw,0.88rem)",
        fontFamily: "'DM Sans',sans-serif",
        display: "flex", alignItems: "center", gap: 7,
        transition: "color 0.2s, border-color 0.2s",
      }}
        onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.38)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }}
      >
        Skip
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/>
        </svg>
      </button>
    </div>
    <p style={{ marginTop: "0.75rem", fontSize: 10, color: "rgba(255,255,255,0.1)", letterSpacing: "1.5px", fontFamily: "'DM Sans',sans-serif" }}>
      ~60 SECONDS · UNLOCK REAL REWARDS
    </p>
  </div>
)}
 
      {/* ── TYPING ── */}
      {phase === "typing" && (
        <div style={{ maxWidth: 660, width: "100%", animation: "fadeUp 0.4s ease forwards" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.5rem" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF1A1A", animation: "pulse 2s infinite", display: "inline-block" }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "4px", color: "#FF1A1A", fontFamily: "'DM Sans',sans-serif" }}>ENERGY CHECK</span>
              </div>
              <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(1.5rem,5vw,2.8rem)", letterSpacing: "2px", color: "#fff" }}>
                TYPE TO UNLOCK REWARDS
              </h2>
            </div>
            <button onClick={() => setPhase("goals")} style={{
              flexShrink: 0, marginTop: 4, padding: "8px 14px", borderRadius: 100,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 700,
              letterSpacing: "1.5px", fontFamily: "'DM Sans',sans-serif",
            }}>SKIP →</button>
          </div>
 
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: "1rem" }}>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(3.5rem,12vw,7rem)", letterSpacing: "-4px", lineHeight: 1, color: "#fff" }}>
              {Math.floor(energy)}
            </span>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(1.2rem,4vw,2.5rem)", color: "rgba(255,255,255,0.3)", marginTop: 8 }}>%</span>
          </div>
 
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3 }}>
              <div style={{ height: "100%", borderRadius: 3, width: `${energy}%`, background: barColor, boxShadow: energy > 0 ? `0 0 12px ${barColor}50` : "none", transition: "width 0.15s, background 0.4s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              {[0,25,50,75,100].map(v => (
                <div key={v} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <div style={{ width: 1, height: 4, background: energy >= v ? "#FF1A1A" : "rgba(255,255,255,0.07)" }} />
                  <span style={{ fontSize: 9, letterSpacing: "1px", color: energy >= v ? "rgba(255,255,255,0.38)" : "rgba(255,255,255,0.12)", fontFamily: "'DM Sans',sans-serif" }}>{v}%</span>
                </div>
              ))}
            </div>
          </div>
 
          <TypingMechanic setEnergy={setEnergy} onFinish={handleFinish} audioRef={audioRef} />
        </div>
      )}
 
      {/* ── SUMMARY ── */}
      {phase === "summary" && summaryStats && (
        <div style={{ width: "100%", animation: "fadeUp 0.5s ease forwards" }}>
          <Summary stats={summaryStats} onContinue={() => setPhase("reward")} />
        </div>
      )}
 
      {/* ── REWARD ── */}
      {phase === "reward" && summaryStats && (
        <div style={{ width: "100%", animation: "fadeUp 0.5s ease forwards" }}>
          <RewardScreen stats={summaryStats} onContinue={handleRewardContinue} />
        </div>
      )}
 
      {/* ── GOALS ── */}
      {phase === "goals" && (
        <GoalSelector
          earnedTier={earnedTier}
          earnedRewards={earnedRewards}
          onBack={() => {
            if (summaryStats) setPhase("reward");
            else { setPhase("invite"); setEnergy(0); setSummaryStats(null); }
          }}
        />
      )}
    </section>
  );
}

// ─── Marquee Strip ────────────────────────────────────────────────────────────
function AboutMarquee() {
  const items = [
    "WHITEFIELD · BENGALURU",
    "EST. 2018",
    "2,400+ MEMBERS",
    "48 EXPERT TRAINERS",
    "7 YEARS OF EXCELLENCE",
    "99% SATISFACTION",
    "TRAIN HARD",
    "NO EXCUSES",
  ];
  const repeated = [...items, ...items];

  return (
    <div style={{
      borderTop: "1px solid rgba(255,26,26,0.15)",
      borderBottom: "1px solid rgba(255,26,26,0.15)",
      background: "rgba(255,26,26,0.03)",
      overflow: "hidden",
      padding: "14px 0",
      position: "relative", zIndex: 1,
    }}>
      <div style={{
        display: "flex",
        width: "max-content",
        animation: "marquee 18s linear infinite",
      }}>
        {repeated.map((item, i) => (
          <span key={i} style={{
            display: "inline-flex", alignItems: "center", gap: "16px",
            paddingRight: "32px",
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "1rem", letterSpacing: "4px",
            color: i % 2 === 0 ? "rgba(255,255,255,0.55)" : "rgba(255,26,26,0.7)",
            whiteSpace: "nowrap",
          }}>
            {item}
            <span style={{
              width: "5px", height: "5px", borderRadius: "50%",
              background: "#FF1A1A", opacity: 0.5, flexShrink: 0,
              boxShadow: "0 0 6px rgba(255,26,26,0.6)",
            }} />
          </span>
        ))}
      </div>
    </div>
  );
}

function MasonryPhotoGrid() {
  const containerRef = useRef(null);
  const [entered, setEntered] = useState(false);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setEntered(true); },
      { threshold: 0.15 }
    );
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const PHOTOS = [
    { src: "/images/about/strength-zone.png",      label: "Strength Zone",   stat: "5 Power Racks",   color: "#FF1A1A", from: "translateX(-120px) translateY(60px) rotate(-6deg)"  },
    { src: "/images/about/cardio-deck.png",         label: "Cardio Deck",     stat: "20+ Machines",    color: "#FF6B00", from: "translateX(80px) translateY(-100px) rotate(5deg)"   },
    { src: "/images/about/functional-training.png", label: "Functional Zone", stat: "Full TRX Setup",  color: "#00C2FF", from: "translateX(-60px) translateY(-100px) rotate(-4deg)" },
    { src: "/images/about/boxing-ring.png",         label: "Boxing Ring",     stat: "Pro Bag Setup",   color: "#FFB800", from: "translateX(60px) translateY(100px) rotate(4deg)"    },
    { src: "/images/about/group-classes.png",       label: "Group Classes",   stat: "12 Classes/Week", color: "#A855F7", from: "translateX(120px) translateY(40px) rotate(6deg)"    },
  ];

  const DELAYS = [0, 0.08, 0.16, 0.22, 0.30];

  return (
    <div style={{ padding: "5rem 2rem", background: "#050505" }}>

      {/* Eyebrow */}
      <div style={{
        display:      "flex",
        alignItems:   "center",
        gap:          "12px",
        marginBottom: "2.5rem",
        maxWidth:     "1400px",
        margin:       "0 auto 2.5rem",
        opacity:      entered ? 1 : 0,
        transform:    entered ? "none" : "translateY(20px)",
        transition:   "opacity 0.6s ease, transform 0.6s ease",
      }}>
        <div style={{ width: "40px", height: "2px", background: "#FF1A1A" }} />
        <span style={{
          fontSize:      "10px",
          fontWeight:    800,
          letterSpacing: "5px",
          color:         "#FF1A1A",
          fontFamily:    "'DM Sans', sans-serif",
        }}>OUR FACILITY</span>
      </div>

      {/* Grid */}
      <div
        ref={containerRef}
        style={{
          display:             "grid",
          gridTemplateColumns: "1.4fr 1fr 1fr",
          gridTemplateRows:    "260px 260px",
          gap:                 "10px",
          maxWidth:            "1400px",
          margin:              "0 auto",
        }}
      >
        {PHOTOS.map((photo, i) => {
          const isHovered = hovered === i;

          const gridStyle = i === 0 ? { gridRow: "1 / 3" } : {};

          return (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position:     "relative",
                borderRadius: "14px",
                overflow:     "hidden",
                cursor:       "pointer",
                opacity:      entered ? 1 : 0,
                transform:    entered ? "none" : photo.from,
                transition:   `opacity 0.7s ease ${DELAYS[i]}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${DELAYS[i]}s`,
                ...gridStyle,
              }}
            >
              <img
                src={photo.src}
                alt={photo.label}
                style={{
                  width:          "100%",
                  height:         "100%",
                  objectFit:      "cover",
                  objectPosition: "center",
                  transform:      isHovered ? "scale(1.06)" : "scale(1)",
                  transition:     "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
                  display:        "block",
                }}
              />

              {/* Base gradient */}
              <div style={{
                position:      "absolute", inset: 0,
                background:    "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%)",
                pointerEvents: "none",
              }} />

              {/* Colour tint on hover */}
              <div style={{
                position:      "absolute", inset: 0,
                background:    `linear-gradient(135deg, ${photo.color}33 0%, transparent 60%)`,
                opacity:       isHovered ? 1 : 0,
                transition:    "opacity 0.4s ease",
                pointerEvents: "none",
              }} />

              {/* Stat pill */}
              <div style={{
                position:       "absolute", top: "14px", right: "14px",
                padding:        "6px 14px",
                background:     "rgba(0,0,0,0.6)",
                backdropFilter: "blur(10px)",
                border:         `1px solid ${photo.color}55`,
                borderRadius:   "100px",
                fontSize:       "10px", fontWeight: 800, letterSpacing: "1.5px",
                color:          photo.color,
                fontFamily:     "'DM Sans', sans-serif",
                opacity:        isHovered ? 1 : 0,
                transform:      isHovered ? "translateY(0)" : "translateY(-8px)",
                transition:     "opacity 0.3s ease, transform 0.3s ease",
                pointerEvents:  "none",
              }}>{photo.stat}</div>

              {/* Bottom label */}
              <div style={{
                position:      "absolute", bottom: 0, left: 0, right: 0,
                padding:       "1.25rem",
                transform:     isHovered ? "translateY(0)" : "translateY(4px)",
                transition:    "transform 0.4s ease",
                pointerEvents: "none",
              }}>
                <div style={{
                  width:        isHovered ? "32px" : "16px",
                  height:       "2px",
                  background:   photo.color,
                  borderRadius: "2px",
                  marginBottom: "8px",
                  transition:   "width 0.4s ease",
                  boxShadow:    `0 0 8px ${photo.color}80`,
                }} />
                <span style={{
                  fontFamily:    "'Bebas Neue', sans-serif",
                  fontSize:      "1.3rem",
                  letterSpacing: "2px",
                  color:         "#fff",
                  textShadow:    "0 2px 12px rgba(0,0,0,0.8)",
                }}>{photo.label}</span>
              </div>

              {/* Bottom glow on hover */}
              <div style={{
                position:      "absolute", bottom: 0, left: "10%", right: "10%",
                height:        "1px",
                background:    `linear-gradient(90deg, transparent, ${photo.color}, transparent)`,
                boxShadow:     `0 0 16px 3px ${photo.color}50`,
                opacity:       isHovered ? 1 : 0,
                transition:    "opacity 0.4s ease",
                pointerEvents: "none",
              }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const TIMELINE = [
  { year: "2018", color: "#FF1A1A", title: "Founded",         desc: "Doors opened in Whitefield with 200 founding members and a dream.",            badge: "LAUNCH",    stats:[{v:"200",   l:"Founding Members"},{v:"1",  l:"Location"      },{v:"8",  l:"Trainers"   }] },
  { year: "2019", color: "#FF6B00", title: "500 Strong",      desc: "Crossed 500 members. Added cardio deck and group class studio.",                badge: "GROWTH",    stats:[{v:"500+",  l:"Members"        },{v:"12", l:"Group Classes/wk"},{v:"2",  l:"New Zones"  }] },
  { year: "2021", color: "#FFB800", title: "Expansion",       desc: "Doubled the floor space. Brought in Hammer Strength & Technogym rigs.",         badge: "SCALE",     stats:[{v:"2×",    l:"Floor Space"    },{v:"5",  l:"Power Racks"    },{v:"20+",l:"Machines"   }] },
  { year: "2022", color: "#A855F7", title: "Pro Trainers",    desc: "Recruited ISSA, CrossFit & RYT certified coaches. 12 trainers on staff.",        badge: "TEAM",      stats:[{v:"12",    l:"Trainers"       },{v:"3",  l:"Certifications" },{v:"4",  l:"Specialties"}] },
  { year: "2023", color: "#00C2FF", title: "2,000 Members",   desc: "Bengaluru's fastest growing gym. Launched personal training programs.",          badge: "MILESTONE", stats:[{v:"2,000", l:"Members"        },{v:"1:1",l:"PT Programs"     },{v:"99%",l:"Satisfaction"}] },
  { year: "2024", color: "#22C55E", title: "2,400+ & Rising", desc: "Award nominated. 99% satisfaction. Still just getting started.",                 badge: "TODAY",     stats:[{v:"2,400+",l:"Members"        },{v:"48", l:"Trainers"        },{v:"7+", l:"Years"       }] },
];

function AboutTimeline() {
  const [activeIdx, setActiveIdx] = useState(-1);
  const [spineHeight, setSpineHeight] = useState(0);
  const itemRefs = useRef([]);
  const bodyRef  = useRef(null);

  useEffect(() => {
  itemRefs.current.forEach((el, i) => {
    if (el) {
      setTimeout(() => el.style.opacity = "1", i * 80);
    }
  });

  const handleScroll = () => {
    if (!bodyRef.current) return;
    const viewportCenter = window.innerHeight * 0.5;
    let closestIdx = 0;
    let closestDist = Infinity;

    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cardCenter = rect.top + rect.height / 2;
      const dist = Math.abs(cardCenter - viewportCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    });

    setActiveIdx(closestIdx);

    const activeEl = itemRefs.current[closestIdx];
    if (activeEl && bodyRef.current) {
      const node = activeEl.querySelector("[data-node]");
      if (node) {
        const bodyTop = bodyRef.current.getBoundingClientRect().top;
        const nodeTop = node.getBoundingClientRect().top;
        setSpineHeight(nodeTop - bodyTop + 7);
      }
    }
  };

  handleScroll();

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  return (
    <section style={{
      padding: "6rem 2rem",
      position: "relative", zIndex: 1,
      borderTop: "1px solid rgba(255,255,255,0.05)",
    }}>
      <style>{`
        .tl-card-hover:hover { border-color: rgba(255,26,26,0.2) !important; transform: translateX(4px); }
        .tl-item-enter { animation: tlSlideIn 0.5s ease forwards; }
        @keyframes tlSlideIn { from { opacity:0; transform:translateX(30px);} to { opacity:1; transform:none;} }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "4rem", maxWidth: "600px", margin: "0 auto 4rem" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"10px", marginBottom:"1rem" }}>
          <div style={{ width:"32px", height:"1px", background:"rgba(255,26,26,0.4)" }} />
          <span style={{ fontSize:"10px", fontWeight:800, letterSpacing:"5px", color:"#FF1A1A", fontFamily:"'DM Sans',sans-serif" }}>OUR JOURNEY</span>
          <div style={{ width:"32px", height:"1px", background:"rgba(255,26,26,0.4)" }} />
        </div>
        <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(2.5rem,5vw,4rem)", color:"#fff", letterSpacing:"2px", lineHeight:1, marginBottom:".5rem" }}>
          FROM ZERO TO <span style={{ color:"#FF1A1A" }}>2,400.</span>
        </h2>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".9rem", color:"rgba(255,255,255,0.35)" }}>
          Six years. One gym. A whole community.
        </p>
      </div>

      {/* Timeline body */}
      <div ref={bodyRef} style={{ maxWidth:"700px", margin:"0 auto", position:"relative", paddingLeft:"52px" }}>

        {/* Spine track */}
        <div style={{ position:"absolute", left:"16px", top:0, bottom:0, width:"1px", background:"rgba(255,26,26,0.12)" }} />
        {/* Spine fill — grows as you scroll */}
        <div style={{ position:"absolute", left:"16px", top:0, width:"1px", height:`${spineHeight}px`, background:"#FF1A1A", boxShadow:"0 0 8px rgba(255,26,26,0.5)", transition: "height 0.15s linear" }} />

        {TIMELINE.map((item, i) => {
          const isActive = activeIdx === i;
          return (
            <div
              key={i}
              ref={(el) => (itemRefs.current[i] = el)}
              data-idx={i}
              style={{
                position:"relative", marginBottom:"2.5rem",
                opacity: 1,
                transform: "none",
                transition: "none",
              }}
            >
              {/* Node dot */}
              <div
                data-node
                style={{
                  position:"absolute", left:"-45px", top:"20px",
                  width:"14px", height:"14px", borderRadius:"50%",
                  background: isActive ? item.color : "#0a0a0a",
                  border: `2px solid ${isActive ? item.color : "rgba(255,26,26,0.25)"}`,
                  boxShadow: isActive ? `0 0 16px ${item.color}80` : "none",
                  transform: isActive ? "scale(1.3)" : "scale(1)",
                  transition:"all 0.3s ease",
                }}
              />
              {/* Connector tick */}
              <div style={{
                position:"absolute", left:"-31px", top:"26px",
                width:"18px", height:"1px",
                background: isActive ? `${item.color}60` : "rgba(255,255,255,0.08)",
                transition:"background 0.3s",
              }} />

              {/* Card */}
              <div
                className="tl-card-hover"
                onClick={() => setActiveIdx(i)}
                style={{
                  background: isActive ? `${item.color}08` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isActive ? item.color + "33" : "rgba(255,255,255,0.07)"}`,
                  borderLeft: `3px solid ${isActive ? item.color : "transparent"}`,
                  borderRadius:"16px",
                  padding:"1.75rem 2rem",
                  cursor:"pointer",
                  transition:"all 0.3s ease",
                  position:"relative",
                  overflow:"hidden",
                }}
              >
                {/* Year + badge */}
                <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:".6rem" }}>
                  <span style={{
                    fontFamily:"'Bebas Neue',sans-serif", fontSize:"2rem",
                    letterSpacing:"2px", lineHeight:1,
                    color: isActive ? item.color : "rgba(255,255,255,0.25)",
                    textShadow: isActive ? `0 0 20px ${item.color}50` : "none",
                    transition: "background 0.2s ease, border-color 0.2s ease, transform 0.2s ease"
                  }}>{item.year}</span>
                  <span style={{
                    fontSize:"9px", fontWeight:800, letterSpacing:"2px",
                    padding:"3px 10px", borderRadius:"100px",
                    color: item.color,
                    background: `${item.color}11`,
                    border: `1px solid ${item.color}44`,
                    fontFamily:"'DM Sans',sans-serif",
                  }}>{item.badge}</span>
                </div>

                {/* Title */}
                <h3 style={{
                  fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.4rem",
                  letterSpacing:"2px", color:"#fff", marginBottom:".5rem", lineHeight:1,
                }}>{item.title}</h3>

                {/* Description — expands when active */}
                <div style={{
                  overflow:"hidden",
                  maxHeight: isActive ? "80px" : "0",
                  opacity: isActive ? 1 : 0,
                  transition:"max-height 0.4s ease, opacity 0.3s ease",
                }}>
                  <p style={{
                    fontFamily:"'DM Sans',sans-serif", fontSize:".875rem",
                    color:"rgba(255,255,255,0.5)", lineHeight:1.7,
                    marginBottom:"1rem",
                  }}>{item.desc}</p>
                </div>

                {/* Stats row — expands when active */}
                <div style={{
                  overflow:"hidden",
                  maxHeight: isActive ? "70px" : "0",
                  opacity: isActive ? 1 : 0,
                  transition:"max-height 0.4s ease 0.1s, opacity 0.3s ease 0.1s",
                }}>
                  <div style={{
                    display:"flex", gap:"2rem", paddingTop:"1rem",
                    borderTop:"1px solid rgba(255,255,255,0.05)",
                  }}>
                    {item.stats.map((s, si) => (
                      <div key={si} style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
                        <span style={{
                          fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.5rem",
                          color: item.color, letterSpacing:"1px", lineHeight:1,
                        }}>{s.v}</span>
                        <span style={{
                          fontSize:"9px", fontWeight:800, letterSpacing:"2px",
                          color:"rgba(255,255,255,0.25)", fontFamily:"'DM Sans',sans-serif",
                          textTransform:"uppercase",
                        }}>{s.l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CustomCursor() {
  const dotRef   = useRef(null);
  const ringRef  = useRef(null);
  const pos      = useRef({ x: -100, y: -100 });
  const ringPos  = useRef({ x: -100, y: -100 });
  const hovering = useRef(false);
  const rafRef   = useRef(null);

  useEffect(() => {
    let lastCheck = 0;
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      const now = Date.now();
      if (now - lastCheck > 40) {
        lastCheck = now;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        hovering.current = !!el?.closest('a, button, [role="button"], input, textarea, select, label');
      }
    };

    const animate = () => {
      if (dotRef.current) {
        dotRef.current.style.left = `${pos.current.x}px`;
        dotRef.current.style.top  = `${pos.current.y}px`;

        if (hovering.current) {
          dotRef.current.style.width      = "56px";
          dotRef.current.style.height     = "56px";
          dotRef.current.style.background = "rgba(255,107,0,0.13)";
          dotRef.current.style.border     = "1.5px solid #FF6B00";
          dotRef.current.style.boxShadow  = "0 0 20px rgba(255,107,0,0.25)";
        } else {
          dotRef.current.style.width      = "7px";
          dotRef.current.style.height     = "7px";
          dotRef.current.style.background = "#fff";
          dotRef.current.style.border     = "none";
          dotRef.current.style.boxShadow  = "none";
        }
      }

      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.28;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.28;

      if (ringRef.current) {
        ringRef.current.style.left = `${ringPos.current.x}px`;
        ringRef.current.style.top  = `${ringPos.current.y}px`;

        if (hovering.current) {
          ringRef.current.style.opacity = "0";
          ringRef.current.style.width   = "8px";
          ringRef.current.style.height  = "8px";
        } else {
          ringRef.current.style.opacity = "1";
          ringRef.current.style.width   = "32px";
          ringRef.current.style.height  = "32px";
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove);
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      {/* Dot — expands into big circle on hover */}
      <div ref={dotRef} style={{
        position: "fixed", zIndex: 99999,
        left: "-100px", top: "-100px",
        width: "7px", height: "7px",
        borderRadius: "50%",
        background: "#fff",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        transition: "width 0.3s cubic-bezier(0.34,1.56,0.64,1), height 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.25s ease, border 0.25s ease, box-shadow 0.25s ease",
      }} />

      {/* Ring — vanishes on hover */}
      <div ref={ringRef} style={{
        position: "fixed", zIndex: 99998,
        left: "-100px", top: "-100px",
        width: "32px", height: "32px",
        borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.5)",
        background: "transparent",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        transition: "width 0.25s ease, height 0.25s ease, opacity 0.2s ease",
      }} />
    </>
  );
}

function ParallaxImage({ src }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const container = ref.current.parentElement;
      const rect = container.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const progress = 1 - (rect.bottom / (viewportH + rect.height));
      const offset = progress * rect.height * 0.4;
      ref.current.style.transform = `translateY(${offset}px)`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "-30%",
        left: 0,
        right: 0,
        bottom: "-30%",
        backgroundImage: `url('${src}')`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        willChange: "transform",
      }}
    />
  );
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [formSent, setFormSent] = useState(false);
  const videoRef = useRef(null);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phraseVisible, setPhraseVisible] = useState(true);
  const sessionsSectionRef = useRef(null);
  const [sessionsScrollProgress, setSessionsScrollProgress] = useState(0);
  const [sessionsEntered, setSessionsEntered] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

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

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
  const check = () => setIsDesktop(window.innerWidth > 768);
  check();
  window.addEventListener("resize", check);
  return () => window.removeEventListener("resize", check);
}, []);

useEffect(() => {
  if (!isDesktop) return;
  const handleScroll = () => {
    if (!sessionsSectionRef.current) return;
    const rect          = sessionsSectionRef.current.getBoundingClientRect();
    const sectionHeight = sessionsSectionRef.current.offsetHeight;
    const scrollable    = sectionHeight - window.innerHeight;
    const raw           = Math.max(0, Math.min(1, -rect.top / scrollable));
    setSessionsScrollProgress(raw);
    if (raw > 0.1 && !sessionsEntered) setSessionsEntered(true);
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, [isDesktop, sessionsEntered]);

  useEffect(() => {
  if (videoRef.current) {
    videoRef.current.play().catch(() => {});
  }
}, []);

  const handleEnquiry = useCallback((e) => {
    e.preventDefault();
    setFormSent(true);
  }, []);


  return (
    <div style={s.root}>
      {/* ── Global styles ── */}
      <CustomCursor /> 
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

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        p, h1, h2, h3, h4, h5, h6, span, a, li, div, section, nav, footer { cursor: default !important; }
input, textarea { cursor: text !important; }

        @keyframes cursorRing {
          0%   { transform: translate(-50%, -50%) scale(1);   opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
        }
          @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
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

      <EnergyShakeSection />
      {/* ════════════════════════════════════════════
          SESSIONS — 3D Carousel
      ════════════════════════════════════════════ */}
      <section
        id="sessions"
        ref={sessionsSectionRef}
        style={{
          ...s.section,
          overflowX: "hidden",
          position: "relative",
          width: "100%",
          background: "linear-gradient(180deg, #000 0%, #060606 100%)",
          minHeight: isDesktop ? "160vh" : "auto",
          marginTop: "2rem",
        }}
      >
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,26,26,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,26,26,0.022) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
        }} />

        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(ellipse 80% 50% at 50% 80%, rgba(255,26,26,${0.04 + sessionsScrollProgress * 0.1}), transparent)`,
        }} />

        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
          opacity: 0.018,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }} />

        {isDesktop ? (
          <div style={{
            position: "sticky", top: 0,
            height: "100vh", width: "100%",
            display: "flex", flexDirection: "column", justifyContent: "center",
            paddingTop: "70px",  // ← add this — matches your navbar height
          }}>
            <div style={{
              textAlign: "center", paddingBottom: "1.75rem",
              opacity: Math.max(0, 1 - sessionsScrollProgress * 1.8),
              transform: `translateY(${-sessionsScrollProgress * 60}px)`,
              pointerEvents: sessionsScrollProgress > 0.55 ? "none" : "auto",
              position: "relative", zIndex: 5,
            }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                marginBottom: "1.25rem",
                opacity: Math.max(0, 1 - sessionsScrollProgress * 2.4),
                background: "rgba(255,26,26,0.07)",
                border: "1px solid rgba(255,26,26,0.18)",
                padding: "6px 18px", borderRadius: "100px",
              }}>
                <span style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "#FF1A1A", animation: "pulse 2s infinite",
                  display: "inline-block",
                }} />
                <span style={{
                  fontSize: "10px", fontWeight: 800,
                  letterSpacing: "4px", color: "#FF1A1A",
                }}>WHAT WE OFFER</span>
              </div>

              <h2 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(3rem, 6vw, 5.5rem)",
                color: "#fff", letterSpacing: "2px", lineHeight: 0.92,
                marginBottom: "0", textAlign: "center",
              }}>
                <SplitWord word="SESSIONS" progress={sessionsScrollProgress} delay={0 * 0.04} />
                {" "}
                <SplitWord word="BUILT" progress={sessionsScrollProgress} delay={1 * 0.04} />
                {" "}
                <SplitWord word="FOR" progress={sessionsScrollProgress} delay={2 * 0.04} />
                <br />
                <span style={{
                  background: "linear-gradient(135deg, #FF1A1A 20%, #FF6B00 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  <SplitWord word="EVERY" progress={sessionsScrollProgress} delay={0.1 + 0 * 0.04} />
                  {" "}
                  <SplitWord word="BODY." progress={sessionsScrollProgress} delay={0.1 + 1 * 0.04} />
                </span>
              </h2>

              <p style={{
                color: "rgba(255,255,255,0.35)", fontSize: "0.95rem", lineHeight: 1.65,
                opacity: Math.max(0, 1 - sessionsScrollProgress * 2.4),
                maxWidth: "440px", margin: "1.1rem auto 0",
              }}>
                From first-timers to seasoned athletes — every session is designed to push you further.
              </p>

              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                marginTop: "1.5rem",
                opacity: Math.max(0, 1 - sessionsScrollProgress * 2.4),
              }}>
                {SESSIONS.map((sess, i) => (
                  <div key={i} style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: sess.color, opacity: 0.6,
                    boxShadow: `0 0 6px ${sess.color}80`,
                  }} />
                ))}
                <span style={{
                  fontSize: "10px", fontWeight: 700, letterSpacing: "2px",
                  color: "rgba(255,255,255,0.2)", marginLeft: "4px",
                }}>{SESSIONS.length} PROGRAMS</span>
              </div>
            </div>

            <div style={{
              position: "relative", zIndex: 4,
              opacity: Math.min(1, Math.max(0, (sessionsScrollProgress - 0.15) / 0.55)),
            }}>
              <SessionsCarousel progress={sessionsScrollProgress} hasEntered={sessionsEntered} />
            </div>

            <div style={{
              position: "absolute", bottom: "1.75rem", left: "50%",
              transform: "translateX(-50%)",
              opacity: Math.max(0, 1 - sessionsScrollProgress * 4),
              display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
              pointerEvents: "none",
            }}>
              <div style={s.scrollMouse}><div style={s.scrollWheel} /></div>
              <span style={s.scrollText}>SCROLL</span>
            </div>
          </div>
        ) : (
          <div style={s.sectionInner}>
            <div style={s.sectionHeader}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "rgba(255,26,26,0.07)",
                border: "1px solid rgba(255,26,26,0.18)",
                padding: "5px 16px", borderRadius: "100px",
                marginBottom: "1.25rem",
              }}>
                <span style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "#FF1A1A", display: "inline-block",
                }} />
                <span style={{
                  fontSize: "10px", fontWeight: 800,
                  letterSpacing: "4px", color: "#FF1A1A",
                }}>WHAT WE OFFER</span>
              </div>
              <h2 style={s.sectionTitle}>
                SESSIONS BUILT FOR<br />
                <span style={s.redText}>EVERY BODY.</span>
              </h2>
              <p style={s.sectionSub}>
                From first-timers to seasoned athletes — every session is designed to push you further.
              </p>
            </div>
            <div style={{ position: "relative" }}>
              <SessionsCarousel progress={1} hasEntered={true} />
            </div>
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════════
           TRAINERS
         ════════════════════════════════════════════ */}
<section id="trainers" style={{ padding: "7rem 0", background: "#050505", position: "relative", overflow: "hidden" }}>

  {/* Background grid */}
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
    backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)",
    backgroundSize: "48px 48px",
  }} />

  <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 2rem" }}>

    {/* Header */}
    <div style={{ textAlign: "center", marginBottom: "5rem" }}>
      <span style={s.sectionTag}>MEET THE TEAM</span>
      <h2 style={s.sectionTitle}>
        COACHED BY THE<br />
        <span style={s.redText}>BEST.</span>
      </h2>
      <p style={s.sectionSub}>
        Our certified trainers bring years of experience and real results to every session.
      </p>
    </div>

    {/* Cards grid */}
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "1.5rem",
    }}>
      {TRAINERS.map((trainer, i) => (
        <TrainerCard key={i} trainer={trainer} index={i} />
      ))}
    </div>
  </div>
</section>

      {/* ════════════════════════════════════════════
           PLANS
          ════════════════════════════════════════════ */}
<section id="plans" style={{
  padding: "7rem 0",
  background: "#000",
  position: "relative",
  overflow: "hidden",
}}>

  {/* Background grid */}
  <div style={{
    position: "absolute", inset: 0, pointerEvents: "none",
    backgroundImage: "linear-gradient(rgba(255,26,26,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,26,26,0.018) 1px,transparent 1px)",
    backgroundSize: "56px 56px",
  }} />

  {/* Radial glow center */}
  <div style={{
    position: "absolute", inset: 0, pointerEvents: "none",
    background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,26,26,0.05), transparent)",
  }} />

  <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 2rem", position: "relative", zIndex: 1 }}>

    {/* Header */}
    <div style={{ textAlign: "center", marginBottom: "5rem" }}>
      <ScrollCard direction="left" delay={0}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "1.5rem" }}>
          <div style={{ width: "32px", height: "1px", background: "rgba(255,26,26,0.4)" }} />
          <span style={{
            fontSize: "10px", fontWeight: 800, letterSpacing: "5px",
            color: "#FF1A1A", fontFamily: "'DM Sans', sans-serif",
          }}>MEMBERSHIP</span>
          <div style={{ width: "32px", height: "1px", background: "rgba(255,26,26,0.4)" }} />
        </div>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(3rem, 6vw, 5.5rem)",
          color: "#fff", letterSpacing: "2px", lineHeight: 0.9,
          marginBottom: "1.25rem",
        }}>
          INVEST IN<br />
          <span style={{
            background: "linear-gradient(135deg, #FF1A1A, #FF6B00)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>YOURSELF.</span>
        </h2>
        <p style={{
          color: "rgba(255,255,255,0.35)", fontSize: "0.95rem",
          maxWidth: "420px", margin: "0 auto", lineHeight: 1.7,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          No hidden fees. No joining fee this month.<br />Cancel anytime on the monthly plan.
        </p>
      </ScrollCard>
    </div>

    {/* Plans row */}
    <div style={{
      display: "flex",
      gap: "1px",
      alignItems: "stretch",
      background: "rgba(255,255,255,0.05)",
      borderRadius: "20px",
      overflow: "hidden",
      boxShadow: "0 0 80px rgba(0,0,0,0.6)",
    }}>
      {PLANS.map((plan, i) => (
        <PlanCard key={i} plan={plan} index={i} total={PLANS.length} />
      ))}
    </div>

    {/* Addon note */}
    <ScrollCard direction="left" delay={0.1}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: "12px", marginTop: "2.5rem",
      }}>
        <div style={{ width: "40px", height: "1px", background: "rgba(255,255,255,0.08)" }} />
        <p style={{
          textAlign: "center", color: "rgba(255,255,255,0.3)",
          fontSize: "0.85rem", fontFamily: "'DM Sans', sans-serif",
        }}>
          Personal Training add-on available at{" "}
          <span style={{ color: "#FF1A1A", fontWeight: 700 }}>₹4,000/month</span>
        </p>
        <div style={{ width: "40px", height: "1px", background: "rgba(255,255,255,0.08)" }} />
      </div>
    </ScrollCard>
  </div>
</section>

      {/* ════════════════════════════════════════════
           ABOUT
          ════════════════════════════════════════════ */}
<section id="about" style={{
  padding: "0",
  background: "#050505",
  position: "relative",
  overflow: "visible",
}}>

  {/* ── Diagonal red slash ── */}
  <div style={{
    position: "absolute",
    top: 0, left: "-10%", right: "-10%",
    height: "6px",
    background: "linear-gradient(90deg, transparent, #FF1A1A 30%, #FF6B00 70%, transparent)",
    boxShadow: "0 0 40px rgba(255,26,26,0.6)",
    zIndex: 2,
  }} />

  {/* ── Background noise ── */}
  <div style={{
    position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
    opacity: 0.025,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
  }} />

  {/* ── Ghost year ── */}
  <div style={{
    position: "absolute", right: "-2rem", top: "50%",
    transform: "translateY(-50%)",
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "clamp(12rem, 22vw, 22rem)",
    color: "rgba(255,26,26,0.028)",
    letterSpacing: "-8px", lineHeight: 1,
    userSelect: "none", pointerEvents: "none",
    zIndex: 0,
  }}>2018</div>

  {/* ══ BLOCK 1 — MANIFESTO ══ */}
<div style={{
  position: "relative", zIndex: 1,
  minHeight: "600px",
}}>

  {/* Deadlift image fills the entire block behind everything */}
  <div style={{
    position: "absolute", inset: 0,
    overflow: "hidden",
  }}>
    <ParallaxImage src="/images/about/deadlift-for-background-1.png" />
    {/* Dark gradient — heavy on left so text is readable, fades right */}
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(90deg, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.75) 45%, rgba(0,0,0,0.2) 100%)",
      zIndex: 1,
    }} />
  </div>

  {/* Text content floats on top */}
  <div style={{
    position: "relative", zIndex: 2,
    padding: "7rem 2rem 5rem",
    maxWidth: "1400px", margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "4rem",
    alignItems: "center",
  }}>
    {/* Left — text */}
    <div>
      <ScrollCard direction="left" delay={0}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2rem" }}>
          <div style={{ width: "40px", height: "2px", background: "#FF1A1A", boxShadow: "0 0 8px rgba(255,26,26,0.6)" }} />
          <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "5px", color: "#FF1A1A", fontFamily: "'DM Sans', sans-serif" }}>EST. BENGALURU · 2018</span>
        </div>
      </ScrollCard>

      <ScrollCard direction="left" delay={0.08}>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(3.5rem, 6vw, 7rem)",
          letterSpacing: "-1px", lineHeight: 0.88,
          color: "#fff", marginBottom: "2.5rem",
        }}>
          NOT JUST A GYM.<br />
          <span style={{
            background: "linear-gradient(135deg, #FF1A1A 0%, #FF6B00 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>A MOVEMENT.</span>
        </h2>
      </ScrollCard>

      <ScrollCard direction="left" delay={0.14}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "clamp(1rem, 1.4vw, 1.15rem)",
          color: "rgba(255,255,255,0.55)",
          lineHeight: 1.85, maxWidth: "480px",
          borderLeft: "2px solid rgba(255,26,26,0.4)",
          paddingLeft: "1.5rem",
          marginBottom: "2.5rem",
        }}>
          FitZone was built on a single belief — that every person in Bengaluru
          deserves access to world-class training, regardless of where they're
          starting from. We don't sell memberships. We build athletes.
        </p>
      </ScrollCard>

      <ScrollCard direction="left" delay={0.2}>
        <div style={{ display: "flex", gap: "2rem" }}>
          {[["7+", "Years"], ["2400+", "Members"], ["48", "Trainers"]].map(([val, label]) => (
            <div key={label}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem", color: "#FF1A1A", letterSpacing: "-1px", lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", marginTop: "3px" }}>{label}</div>
            </div>
          ))}
        </div>
      </ScrollCard>
    </div>

    {/* Right */}
    <div />
  </div>

  {/* Bottom label over image */}
  <div style={{
    position: "absolute", bottom: "1.5rem", right: "2rem",
    display: "flex", alignItems: "center", gap: "8px",
    zIndex: 3,
  }}>
    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FF1A1A", boxShadow: "0 0 8px rgba(255,26,26,0.8)" }} />
    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", fontWeight: 800, letterSpacing: "3px", color: "#FF1A1A" }}>STRENGTH ZONE</span>
  </div>
</div>

  {/* ══ MARQUEE STRIP ══ */}
  <AboutMarquee />

  {/* ══ MASONRY PHOTO GRID ══ */}
<section style={{ background: "#050505", position: "relative" }}>
  <MasonryPhotoGrid />
</section>

<section id="about-continued" style={{
  padding: "0",
  background: "#050505",
  position: "relative",
  overflow: "hidden",
}}>

  {/* ══ TIMELINE ══ */}
  <AboutTimeline />

  {/* ══ BLOCK 2 — SPLIT (2400+ count + facts) ══ */}
  <div style={{
    position: "relative", zIndex: 1,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    minHeight: "520px",
  }}>
    {/* Left — red-tinted image panel */}
    <ScrollCard direction="left" delay={0}>
      <div style={{
        position: "relative",
        height: "100%", minHeight: "520px",
        overflow: "hidden",
        background: "#0a0a0a",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, #1a0000 0%, #0d0000 50%, #050000 100%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,26,26,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,26,26,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <AboutMemberStat />
        <div style={{
          position: "absolute", bottom: "2rem", left: "2rem",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <div style={{ width: "28px", height: "1px", background: "#FF1A1A" }} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "10px", fontWeight: 700,
            letterSpacing: "3px", color: "rgba(255,255,255,0.25)",
          }}>WHITEFIELD · BENGALURU</span>
        </div>
      </div>
    </ScrollCard>

    {/* Right — facts panel */}
    <ScrollCard direction="right" delay={0.08}>
      <div style={{
        padding: "4rem 3.5rem",
        background: "#000",
        height: "100%",
        display: "flex", flexDirection: "column", justifyContent: "center",
        borderLeft: "1px solid rgba(255,26,26,0.1)",
      }}>
        {[
          { num: "01", title: "CERTIFIED COACHES",  desc: "Every trainer holds recognised certifications and brings real competition or clinical experience." },
          { num: "02", title: "PREMIUM EQUIPMENT",  desc: "Hammer Strength racks, Concept2 rowers, Technogym cardio, and a full functional zone." },
          { num: "03", title: "REAL COMMUNITY",     desc: "2,400+ members who show up for each other. Beginners and veterans train side by side." },
          { num: "04", title: "TRACKED PROGRESS",   desc: "Monthly body composition scans, fitness assessments, and trainer check-ins — no guesswork." },
        ].map((item, i) => (
          <AboutFact key={i} item={item} index={i} />
        ))}
      </div>
    </ScrollCard>
  </div>

  {/* ══ BLOCK 3 — HOURS + LOCATION ══ */}
  <ScrollCard direction="left" delay={0}>
    <div style={{
      position: "relative", zIndex: 1,
      borderTop: "1px solid rgba(255,255,255,0.05)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      display: "grid",
      gridTemplateColumns: "1fr 1px 1fr 1px 1fr",
    }}>
      <div style={{ padding: "2.5rem 3rem", display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "3px", color: "#FF1A1A", fontFamily: "'DM Sans', sans-serif", marginBottom: "4px" }}>MON – SAT</span>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem", letterSpacing: "1px", color: "#fff", lineHeight: 1 }}>5:00 AM</span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px" }}>until 10:30 PM</span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.05)" }} />
      <div style={{ padding: "2.5rem 3rem", display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "3px", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif", marginBottom: "4px" }}>SUNDAY</span>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem", letterSpacing: "1px", color: "#fff", lineHeight: 1 }}>6:00 AM</span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px" }}>until 1:00 PM</span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.05)" }} />
      <div style={{ padding: "2.5rem 3rem", display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "3px", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif", marginBottom: "4px" }}>FIND US</span>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "1px", color: "#fff", lineHeight: 1.2 }}>Lakshmi Arcade</span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>Whitefield Main Rd, near<br />Hope Farm Signal · 560066</span>
      </div>
    </div>
  </ScrollCard>

  {/* ══ BLOCK 4 — CTA STRIP ══ */}
  <ScrollCard direction="left" delay={0}>
    <div style={{
      position: "relative", zIndex: 1,
      padding: "4rem 3rem",
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      gap: "2rem", flexWrap: "wrap",
      background: "linear-gradient(90deg, rgba(255,26,26,0.04) 0%, transparent 60%)",
      borderTop: "1px solid rgba(255,26,26,0.1)",
    }}>
      <div>
        <p style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(1.8rem, 4vw, 3rem)",
          color: "#fff", letterSpacing: "2px", lineHeight: 1, marginBottom: "8px",
        }}>READY TO JOIN THE MOVEMENT?</p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem", color: "rgba(255,255,255,0.35)" }}>
          First session free · No joining fee this month
        </p>
      </div>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <a href="/register" style={{
          padding: "14px 32px",
          background: "linear-gradient(135deg, #FF1A1A, #991111)",
          color: "#fff", textDecoration: "none",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 800, fontSize: "13px", letterSpacing: "1px",
          borderRadius: "6px", boxShadow: "0 6px 24px rgba(255,26,26,0.35)",
        }}>Start Training →</a>
        <a href="#contact" style={{
          padding: "14px 28px", background: "transparent",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.55)", textDecoration: "none",
          fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "13px",
          borderRadius: "6px",
        }}>Get in Touch</a>
      </div>
    </div>
  </ScrollCard>
</section>
</section>

     {/* ════════════════════════════════════════════
         CONTACT
        ════════════════════════════════════════════ */}
<section id="contact" style={{
  padding: "0",
  background: "#000",
  position: "relative",
  overflow: "hidden",
}}>

  {/* Top slash */}
  <div style={{
    position: "absolute", top: 0, left: 0, right: 0, height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(255,26,26,0.3), transparent)",
  }} />

  {/* Full bleed split layout */}
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "700px" }}>

    {/* ── Left — form side ── */}
    <ScrollCard direction="left" delay={0}>
      <div style={{
        padding: "6rem 4rem",
        height: "100%",
        display: "flex", flexDirection: "column", justifyContent: "center",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        position: "relative",
      }}>

        {/* Background glow */}
        <div style={{
          position: "absolute", top: "30%", left: "-20%",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,26,26,0.04), transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Eyebrow */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
            <div style={{ width: "28px", height: "2px", background: "#FF1A1A", boxShadow: "0 0 8px rgba(255,26,26,0.6)" }} />
            <span style={{
              fontSize: "10px", fontWeight: 800, letterSpacing: "4px",
              color: "#FF1A1A", fontFamily: "'DM Sans', sans-serif",
            }}>GET IN TOUCH</span>
          </div>

          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
            color: "#fff", letterSpacing: "2px", lineHeight: 0.9,
            marginBottom: "2.5rem",
          }}>
            YOUR FIRST STEP<br />
            <span style={{
              background: "linear-gradient(135deg, #FF1A1A, #FF6B00)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>STARTS HERE.</span>
          </h2>

          {formSent ? (
            <div style={{
              padding: "3rem 2rem",
              background: "rgba(34,197,94,0.04)",
              border: "1px solid rgba(34,197,94,0.15)",
              borderRadius: "16px",
              textAlign: "center",
            }}>
              <div style={{
                width: "64px", height: "64px", borderRadius: "50%",
                background: "rgba(34,197,94,0.1)", border: "2px solid #22C55E",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1.25rem",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h3 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "2rem", color: "#fff", letterSpacing: "2px", marginBottom: "0.5rem",
              }}>We'll be in touch!</h3>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.9rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6,
              }}>Our team will contact you within 24 hours to schedule your free session.</p>
            </div>
          ) : (
            <form onSubmit={handleEnquiry} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Name + Phone row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <ContactField label="Full Name" type="text" placeholder="Rahul Kumar"
                  value={formData.name} onChange={v => setFormData(p => ({ ...p, name: v }))} required />
                <ContactField label="Phone" type="tel" placeholder="+91 98765 43210"
                  value={formData.phone} onChange={v => setFormData(p => ({ ...p, phone: v }))} required />
              </div>

              {/* Email */}
              <ContactField label="Email Address" type="email" placeholder="rahul@email.com"
                value={formData.email} onChange={v => setFormData(p => ({ ...p, email: v }))} required />

              {/* Message */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{
                  fontSize: "10px", fontWeight: 800, letterSpacing: "2px",
                  color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif",
                  textTransform: "uppercase",
                }}>Message (Optional)</label>
                <textarea
                  placeholder="Tell us your fitness goal..."
                  value={formData.message}
                  onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                  rows={3}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "10px", padding: "14px 16px",
                    color: "#fff", fontSize: "0.9rem",
                    fontFamily: "'DM Sans', sans-serif",
                    resize: "vertical", outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "rgba(255,26,26,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                />
              </div>

              <button type="submit" style={{
                width: "100%", padding: "15px",
                background: "linear-gradient(135deg, #FF1A1A, #991111)",
                border: "none", borderRadius: "10px",
                cursor: "pointer", color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 800, fontSize: "13px",
                letterSpacing: "1.5px",
                boxShadow: "0 6px 28px rgba(255,26,26,0.35)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 36px rgba(255,26,26,0.45)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(255,26,26,0.35)"; }}
              >BOOK FREE SESSION →</button>

              <p style={{
                textAlign: "center", fontSize: "11px",
                color: "rgba(255,255,255,0.18)", letterSpacing: "1px",
                fontFamily: "'DM Sans', sans-serif",
              }}>First session free · No commitment required</p>
            </form>
          )}
        </div>
      </div>
    </ScrollCard>

    {/* ── Right — info side ── */}
    <ScrollCard direction="right" delay={0.08}>
      <div style={{
        padding: "6rem 4rem",
        height: "100%",
        display: "flex", flexDirection: "column", justifyContent: "center",
        background: "rgba(255,255,255,0.01)",
        gap: "0",
        position: "relative",
      }}>

        {/* Ghost text watermark */}
        <div style={{
          position: "absolute", bottom: "1rem", right: "-1rem",
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "10rem", color: "rgba(255,255,255,0.015)",
          letterSpacing: "-4px", lineHeight: 1,
          userSelect: "none", pointerEvents: "none",
        }}>FITZONE</div>

        {/* Info items */}
        {[
          {
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            ),
            label: "ADDRESS",
            value: "1st Floor, Lakshmi Arcade\nWhitefield Main Rd, near Hope Farm\nBengaluru – 560066",
          },
          {
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 11.5 19.79 19.79 0 01.1 2.82 2 2 0 012.11 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l.46-.46a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
            ),
            label: "PHONE",
            value: "+91 98765 43210",
          },
          {
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
            ),
            label: "EMAIL",
            value: "info@fitzoneGym.in",
          },
          {
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            ),
            label: "HOURS",
            value: "Mon–Sat  5:00 AM – 10:30 PM\nSunday  6:00 AM – 1:00 PM",
          },
        ].map((item, i) => (
          <ContactInfoRow key={i} item={item} index={i} />
        ))}

        {/* Social row */}
        <div style={{
          marginTop: "2.5rem",
          paddingTop: "2rem",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}>
          <p style={{
            fontSize: "9px", fontWeight: 800, letterSpacing: "3px",
            color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans', sans-serif",
            marginBottom: "1rem",
          }}>FOLLOW US</p>
          <div style={{ display: "flex", gap: "10px" }}>
            {[
              {
                label: "Instagram",
                href: "https://instagram.com/fitzoneGym",
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                ),
              },
              {
                label: "YouTube",
                href: "https://youtube.com/@fitzoneGym",
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                  </svg>
                ),
              },
              {
                label: "Facebook",
                href: "https://facebook.com/fitzoneGym",
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                  </svg>
                ),
              },
            ].map((s2, i) => (
              <a key={i} href={s2.href} target="_blank" rel="noreferrer"
                style={{
                  width: "42px", height: "42px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,0.4)",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255,26,26,0.1)";
                  e.currentTarget.style.borderColor = "rgba(255,26,26,0.3)";
                  e.currentTarget.style.color = "#FF1A1A";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                  e.currentTarget.style.transform = "none";
                }}
              >{s2.icon}</a>
            ))}
          </div>
        </div>
      </div>
    </ScrollCard>
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
                <div style={s.logoName}>FITZONE</div>
                <div style={s.logoSub}>GYM</div>
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
      <FitZoneChatbot /> 
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