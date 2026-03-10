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
  const [tilt, setTilt]         = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: -dy * 10, y: dx * 10 });
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
        background: isActive
          ? "linear-gradient(160deg, rgba(28,28,28,0.95) 0%, rgba(8,8,8,0.98) 100%)"
          : "linear-gradient(160deg, rgba(18,18,18,0.92) 0%, rgba(4,4,4,0.96) 100%)",
        border: `1px solid ${isActive ? session.color + "70" : "rgba(255,255,255,0.06)"}`,
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: isActive
          ? `0 32px 80px rgba(0,0,0,0.8), 0 0 50px ${session.color}22, inset 0 1px 0 rgba(255,255,255,0.07)`
          : isHovered
          ? `0 20px 60px rgba(0,0,0,0.7), 0 0 25px ${session.color}12`
          : "0 12px 40px rgba(0,0,0,0.55)",
        transition: isHovered
          ? "box-shadow 0.2s, border-color 0.2s"
          : "all 0.45s cubic-bezier(0.4,0,0.2,1)",
        position: "relative",
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.025 : 1})`,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {/* Shimmer highlight */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 10,
        pointerEvents: "none", borderRadius: "20px",
        background: isHovered
          ? `radial-gradient(circle at ${50 + tilt.y * 3}% ${50 - tilt.x * 3}%, rgba(255,255,255,0.07) 0%, transparent 62%)`
          : "none",
        transition: "background 0.1s",
      }} />

      {/* Top accent bar */}
      <div style={{
        height: "3px",
        background: `linear-gradient(90deg, ${session.color}, ${session.color}44, transparent)`,
        opacity: isActive ? 1 : isHovered ? 0.7 : 0.35,
        transition: "opacity 0.35s",
      }} />

      {/* Image */}
      <div style={{ width: "100%", height: "200px", position: "relative", overflow: "hidden" }}>
        <img
          src={session.image} alt={session.title}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            transform: isActive ? "scale(1.08)" : isHovered ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.65s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.92) 100%)",
        }} />
        {/* Color wash on active */}
        {isActive && (
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(135deg, ${session.color}18, transparent 60%)`,
          }} />
        )}
        {/* Tag pill */}
        <div style={{
          position: "absolute", bottom: "12px", left: "14px",
          fontSize: "9px", fontWeight: 800, letterSpacing: "1.5px",
          textTransform: "uppercase", color: session.color,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(12px)",
          border: `1px solid ${session.color}55`,
          padding: "4px 11px", borderRadius: "100px",
          boxShadow: isActive ? `0 0 12px ${session.color}40` : "none",
          transition: "box-shadow 0.3s",
        }}>{session.tag}</div>
      </div>

      {/* Body */}
      <div style={{ padding: "1.4rem 1.5rem 1.6rem" }}>
        <h3 style={{
          fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.5px",
          color: "#fff", marginBottom: "0.45rem", lineHeight: 1.1,
          textTransform: "uppercase",
          textShadow: isActive ? `0 0 30px ${session.color}50` : "none",
          transition: "text-shadow 0.4s",
        }}>{session.title}</h3>

        <p style={{
          color: "rgba(255,255,255,0.48)",
          fontSize: "0.82rem", lineHeight: 1.75, marginBottom: "1.1rem",
        }}>{session.desc}</p>

        {/* Footer row */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "0.9rem",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}>
          <span style={{
            fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px",
            color: isActive ? session.color : "rgba(255,255,255,0.2)",
            textTransform: "uppercase", transition: "color 0.3s",
          }}>Learn more</span>

          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: isActive
              ? `linear-gradient(135deg, ${session.color}, ${session.color}bb)`
              : `${session.color}12`,
            border: `1px solid ${session.color}45`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: 700,
            color: isActive ? "#fff" : session.color,
            boxShadow: isActive ? `0 0 20px ${session.color}55` : "none",
            transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
            transform: isHovered ? "translateX(3px)" : "none",
          }}>→</div>
        </div>
      </div>

      {/* Bottom glow line */}
      {isActive && (
        <div style={{
          position: "absolute", bottom: 0, left: "15%", right: "15%", height: "1px",
          background: `linear-gradient(90deg, transparent, ${session.color}, transparent)`,
          boxShadow: `0 0 24px 6px ${session.color}45`,
        }} />
      )}
    </div>
  );
}


function SessionsCarousel({ progress, hasEntered }) {
  const animRef      = useRef(null);
  const offsetRef    = useRef(TOTAL_WIDTH);
  const [, setTick]  = useState(0);
  const [isPaused, setIsPaused]   = useState(false);
  const [activeIdx, setActiveIdx] = useState(null);
  const speedRef     = useRef(0.55);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(900);
  const [slamDone, setSlamDone]   = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const hoveredIdxRef = useRef(null);

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
      setTick(t => t + 1);
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
    const scale    = 0.72 + depth * 0.34;
    const blurAmt  = (1 - depth) * 1.8;
    const brightness = 0.32 + depth * 0.78;
    const rotY     = -clamped * 20;
    const ty       = depth * -22;
    const isActive = activeIdx === idx || hoveredIdxRef.current === idx;
    return {
      transform: `perspective(1000px) translateY(${ty}px) rotateY(${rotY}deg) scale(${isActive ? scale * 1.04 : scale})`,
      filter: `brightness(${isActive ? 1.4 : brightness}) blur(${isActive ? 0 : blurAmt}px)`,
      zIndex: Math.round(depth * 10),
      transition: isActive ? "filter 0.2s, transform 0.2s" : "filter 0.12s, transform 0.04s",
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
        onMouseEnter={() => { setActiveIdx(i); hoveredIdxRef.current = i; }}
        onMouseLeave={() => { setActiveIdx(null); hoveredIdxRef.current = null; }}
        onMouseDown={onDragStart}
        onMouseMove={onDragMove}
        onMouseUp={onDragEnd}
        onTouchStart={onDragStart}
        onTouchMove={onDragMove}
        onTouchEnd={onDragEnd}
      >
        <div style={{
          position: "absolute", top: "50%", left: 0,
          display: "flex", gap: `${CARD_GAP}px`,
          transform: `translateX(${-offsetRef.current + slamTX}px) translateY(-50%)`,
          opacity: hasEntered ? 1 : 0,
          transition: hasEntered && !slamDone
            ? "transform 0.7s cubic-bezier(0.16,1,0.3,1), opacity 0.45s ease"
            : "none",
          willChange: "transform",
          userSelect: "none",
        }}>
          {ITEMS.map((session, i) => {
            const cardLeft = i * CARD_STEP - offsetRef.current;
            return (
              <div
                key={i}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
                style={{
                  width: `${CARD_WIDTH}px`, flexShrink: 0,
                  cursor: "pointer",
                  ...getCardStyle(cardLeft, i),
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
const FAST_WPM = 80;          // threshold for streak + fast-typer experience
const BONUS_WPM_GATE = 60;    // minimum WPM to unlock bonus phrases

const RANKS = [
  { label: "ELITE",      min: 100, color: "#FF1A1A", icon: "🔴", msg: "You type like you train. Absolutely relentless." },
  { label: "PRO",        min: 80,  color: "#FF6B00", icon: "🟠", msg: "Fast hands. That's real FitZone energy." },
  { label: "SOLID",      min: 60,  color: "#FFB800", icon: "🟡", msg: "Good pace. Keep showing up like this." },
  { label: "WARMING UP", min: 0,   color: "rgba(255,255,255,0.4)", icon: "⚪", msg: "Every rep counts — including the slow ones." },
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

  const rank       = getRank(stats.peakWpm);
  const isFast     = stats.peakWpm >= FAST_WPM;
  const accGrade   = stats.accuracy >= 98 ? "S" : stats.accuracy >= 92 ? "A" : stats.accuracy >= 82 ? "B" : stats.accuracy >= 70 ? "C" : "D";
  const gradeColor = accGrade === "S" ? "#FFD700" : accGrade === "A" ? "#22C55E" : accGrade === "B" ? "#FFB800" : accGrade === "C" ? "#FF6B00" : "#FF1A1A";

  return (
    <div style={{
      maxWidth: 520, width: "100%", margin: "0 auto",
      opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(28px)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: "1rem" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: rank.color, display: "inline-block", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "4px", color: rank.color, fontFamily: "'DM Sans',sans-serif" }}>SESSION COMPLETE</span>
        </div>

        {/* Rank badge — big and proud for fast typers */}
        <div style={{
          display: "inline-flex", flexDirection: "column", alignItems: "center",
          gap: 4, marginBottom: "1rem",
          padding: isFast ? "1.25rem 2.5rem" : "0.75rem 2rem",
          background: isFast ? `${rank.color}12` : "rgba(255,255,255,0.03)",
          border: `${isFast ? 2 : 1}px solid ${isFast ? rank.color + "40" : "rgba(255,255,255,0.08)"}`,
          borderRadius: 14,
          boxShadow: isFast ? `0 0 40px ${rank.color}20` : "none",
          transition: "all 0.4s",
        }}>
          {isFast && <span style={{ fontSize: "2rem", marginBottom: 4 }}>{rank.icon}</span>}
          <span style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: isFast ? "3.5rem" : "2.2rem",
            letterSpacing: "4px", color: rank.color, lineHeight: 1,
          }}>{rank.label}</span>
          {isFast && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif", letterSpacing: "1px", marginTop: 4 }}>
              {rank.msg}
            </span>
          )}
        </div>

        {!isFast && (
          <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans',sans-serif" }}>
            {rank.msg}
          </p>
        )}
      </div>

      {/* Stats grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isFast ? "1fr 1px 1fr 1px 1fr 1px 1fr" : "1fr 1px 1fr 1px 1fr",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden",
        marginBottom: "1.25rem",
      }}>
        {[
          { v: stats.peakWpm,       l: "PEAK WPM",  col: getRank(stats.peakWpm).color },
          { v: `${stats.accuracy}%`, l: "ACCURACY",  col: stats.accuracy >= 90 ? "#22C55E" : stats.accuracy >= 75 ? "#FFB800" : "#FF1A1A" },
          { v: stats.phrasesTyped,  l: "PHRASES",   col: "#fff" },
          ...(isFast ? [{ v: stats.bestStreak, l: "BEST STREAK", col: stats.bestStreak >= 5 ? "#FFD700" : "#FFB800" }] : []),
        ].map(({ v, l, col }, i, arr) => (
          <React.Fragment key={l}>
            <div style={{ padding: "1rem 0", textAlign: "center" }}>
              <div style={{
                fontFamily: "'Bebas Neue',sans-serif", fontSize: "2rem",
                color: col, lineHeight: 1,
                animation: "fadeUp 0.4s ease forwards",
              }}>{v}</div>
              <div style={{ fontSize: 8, letterSpacing: "2px", color: "rgba(255,255,255,0.18)", fontWeight: 700, fontFamily: "'DM Sans',sans-serif", marginTop: 3 }}>{l}</div>
            </div>
            {i < arr.length - 1 && <div style={{ background: "rgba(255,255,255,0.05)", width: 1 }} />}
          </React.Fragment>
        ))}
      </div>

      {/* Accuracy grade — letter grade for fast typers, just bar for slow */}
      {isFast ? (
        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          padding: "0.85rem 1.25rem",
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 10, marginBottom: "1.25rem",
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 8,
            background: `${gradeColor}18`, border: `2px solid ${gradeColor}55`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.8rem", color: gradeColor }}>{accGrade}</span>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "2px", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans',sans-serif", marginBottom: 3 }}>ACCURACY GRADE</p>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.55)", fontFamily: "'DM Sans',sans-serif" }}>
              {accGrade === "S" ? "Flawless. Every key, every time." :
               accGrade === "A" ? "Sharp. Almost no wasted keystrokes." :
               accGrade === "B" ? "Solid. A few slips but mostly clean." :
               accGrade === "C" ? "Accuracy needs work — slow down to speed up." :
               "Focus on accuracy first, speed will follow."}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 9, letterSpacing: "2px", color: "rgba(255,255,255,.13)", fontFamily: "'DM Sans',sans-serif" }}>ACCURACY</span>
            <span style={{ fontSize: 9, color: stats.accuracy >= 90 ? "#22C55E" : "#FFB800", fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>{stats.accuracy}%</span>
          </div>
          <div style={{ height: 2, background: "rgba(255,255,255,.05)", borderRadius: 2 }}>
            <div style={{ height: "100%", borderRadius: 2, width: `${stats.accuracy}%`, background: stats.accuracy >= 90 ? "#22C55E" : "#FFB800" }} />
          </div>
        </div>
      )}

      {/* Streak highlight for fast typers */}
      {isFast && stats.bestStreak >= 3 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "0.75rem 1.25rem",
          background: "rgba(255,184,0,0.06)", border: "1px solid rgba(255,184,0,0.2)",
          borderRadius: 10, marginBottom: "1.25rem",
          animation: "fadeUp 0.4s ease 0.2s both",
        }}>
          <span style={{ fontSize: "1.1rem" }}>⚡</span>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, color: "#FFB800", letterSpacing: "1px" }}>
            {stats.bestStreak} WORD STREAK AT 80+ WPM
            {stats.bestStreak >= 8 ? " — UNSTOPPABLE" : stats.bestStreak >= 5 ? " — ON FIRE" : " — KEEP IT UP"}
          </span>
        </div>
      )}

      {/* Taunt for fast typers who could do better */}
      {isFast && stats.accuracy < 90 && (
        <div style={{
          padding: "0.75rem 1.25rem",
          background: "rgba(255,26,26,0.04)", border: "1px solid rgba(255,26,26,0.15)",
          borderRadius: 10, marginBottom: "1.25rem",
          animation: "fadeUp 0.4s ease 0.3s both",
        }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5 }}>
            Fast but sloppy. Your accuracy held your score back — {stats.accuracy}% cost you {Math.round((100 - stats.accuracy) / 5)} energy points.
          </p>
        </div>
      )}

      {/* CTA */}
      <button onClick={onContinue} style={{
        width: "100%", padding: "16px",
        background: isFast ? `linear-gradient(135deg, ${rank.color}, ${rank.color}bb)` : "linear-gradient(135deg,#FF1A1A,#991111)",
        boxShadow: isFast ? `0 6px 28px ${rank.color}40` : "0 6px 28px rgba(255,26,26,0.35)",
        border: "none", borderRadius: 8, cursor: "pointer",
        color: "#fff", fontWeight: 800, fontSize: "1rem", letterSpacing: "0.5px",
        fontFamily: "'DM Sans',sans-serif",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
      >
        {isFast ? "Pick Your Goal →" : "Build My Program →"}
      </button>

      <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.15)", marginTop: "0.75rem", letterSpacing: "1px", fontFamily: "'DM Sans',sans-serif" }}>
        Energy score: {stats.finalScore}% · {stats.phrasesTyped} phrase{stats.phrasesTyped !== 1 ? "s" : ""} completed
      </p>
    </div>
  );
}

// ─── Typing Mechanic ──────────────────────────────────────────────────────────
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

  // Phrase transition: "idle" | "out" | "flash" | "in"
  const [txState, setTxState]             = useState("idle");
  const [nextPhraseIdx, setNextPhraseIdx] = useState(null);
  const [displayIdx, setDisplayIdx]       = useState(0);
  const isTransitioning                   = txState !== "idle";

  // Bonus lock state
  const [bonusLocked, setBonusLocked]     = useState(false); // shown after phrase 5 if WPM too low
  const [lockedWpm, setLockedWpm]         = useState(0);     // WPM they hit on the last phrase

  // Streak tracking
  const [streak, setStreak]           = useState(0);
  const [bestStreak, setBestStreak]   = useState(0);
  const [streakFlash, setStreakFlash] = useState(false);
  const peakWpmRef    = useRef(0);
  const stampRef      = useRef([]);
  const wordStampsRef = useRef([]);
  const phraseStartRef = useRef(Date.now()); // when current phrase typing began
  const phraseWpmRef   = useRef(0);          // clean WPM for phrase 5 gate check

  const allPhrases     = [...STANDARD_PHRASES, ...BONUS_PHRASES];
  const currentPhrase  = allPhrases[Math.min(displayIdx, allPhrases.length - 1)];
  const isBonus        = displayIdx >= STANDARD_PHRASES.length;
  const bonusCompleted = phraseDone.filter(i => i >= STANDARD_PHRASES.length).length;
  const nextIsBonus    = nextPhraseIdx != null && nextPhraseIdx >= STANDARD_PHRASES.length;

  const computeScore = useCallback((cWpm, cAcc, done) => {
    const std   = done.filter(i => i < STANDARD_PHRASES.length).length;
    const bonus = done.filter(i => i >= STANDARD_PHRASES.length).length;
    const base  = std * 20 + bonus * 10;
    const live  = (Math.min(cWpm, MAX_WPM) / MAX_WPM) * (cAcc / 100) * (isBonus ? 10 : 20);
    return Math.min(100, Math.floor(base + live));
  }, [isBonus]);

  // Per-word WPM — measures speed of each individual word typed
  const getWordWpm = useCallback(() => {
    const now = Date.now();
    const recent = wordStampsRef.current.filter(t => now - t < 4000);
    if (recent.length < 2) return wpm;
    const elapsed = (now - recent[0]) / 1000 / 60; // minutes
    return Math.round(recent.length / elapsed);
  }, [wpm]);

  const handleKey = useCallback((e) => {
    if (e.key === " ") e.preventDefault();
    if (isTransitioning) return; // block all input during phrase transition
    if (e.key === "Backspace") { setTyped(p => p.slice(0, -1)); return; }
    if (e.key.length !== 1) return;

    const ch       = e.key.toUpperCase();
    const expected = currentPhrase[typed.length];
    if (!expected) return;

    setTotalTyped(t => t + 1);
    const now = Date.now();
    // Start phrase timer on first character
    if (typed.length === 0) phraseStartRef.current = now;
    stampRef.current = [...stampRef.current.filter(t => now - t < 3000), now];

    if (ch !== expected) {
      setErrors(err => err + 1);
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 140);
      audioRef.current?.wrong();
      if (navigator.vibrate) navigator.vibrate(20);
      // Wrong key breaks streak
      setStreak(0);
      return;
    }

    audioRef.current?.key();
    if (navigator.vibrate) navigator.vibrate(6);

    setTyped(prev => {
      const next = prev + ch;

      // Word boundary — space or end of phrase
      const nextChar = currentPhrase[next.length];
      const wordComplete = nextChar === " " || next.length === currentPhrase.length;

      if (wordComplete || next.length === currentPhrase.length) {
        // Record word completion timestamp
        const wordNow = Date.now();
        wordStampsRef.current = [...wordStampsRef.current.filter(t => wordNow - t < 6000), wordNow];

        // Compute word-level WPM
        const wordWpm = getWordWpm();
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
        // Compute clean WPM for this phrase: words / minutes elapsed
        const phraseElapsed = (Date.now() - phraseStartRef.current) / 60000;
        const phraseWords   = currentPhrase.trim().split(" ").length;
        const cleanPhraseWpm = phraseElapsed > 0 ? Math.round(phraseWords / phraseElapsed) : 0;
        phraseWpmRef.current = cleanPhraseWpm;
        if (cleanPhraseWpm > peakWpmRef.current) peakWpmRef.current = cleanPhraseWpm;

        const newDone    = [...phraseDone, phraseIdx];
        const nextIdx    = phraseIdx + 1;
        const std        = newDone.filter(i => i < STANDARD_PHRASES.length).length;
        const bon        = newDone.filter(i => i >= STANDARD_PHRASES.length).length;
        const newScore   = Math.min(100, std * 20 + bon * 10);
        const allStdDone = nextIdx >= STANDARD_PHRASES.length && !isBonus;
        const meetsGate  = cleanPhraseWpm >= BONUS_WPM_GATE; // gate uses THIS phrase's clean WPM
        const isDone     = newScore >= 100 || (nextIdx >= allPhrases.length);

        setPhraseDone(newDone);
        setPhraseBurst(b => b + 1);
        setScore(newScore);
        setEnergy(newScore);
        setPhraseIdx(nextIdx);
        if (navigator.vibrate) navigator.vibrate([20,10,20,10,20]);

        // After phrase 5 — check bonus gate
        if (allStdDone && !meetsGate) {
          audioRef.current?.phrase();
          setTxState("out");
          setTimeout(() => {
            setLockedWpm(cleanPhraseWpm); // show THIS phrase's actual WPM
            setBonusLocked(true);
            setTxState("idle");
            setTyped("");
          }, 300);
          return next;
        }

        // Normal transition: out → flash → in
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
          if (!isDone) { setTxState("idle"); setTyped(""); }
        }, 750);

        return next;
      }
      return next;
    });
  }, [typed, currentPhrase, phraseIdx, phraseDone, allPhrases.length, errors, totalTyped, bestStreak, getWordWpm, setEnergy, onFinish]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // Live WPM + score tick
  useEffect(() => {
    const iv = setInterval(() => {
      const now    = Date.now();
      const recent = stampRef.current.filter(t => now - t < 5000).length;
      const cWpm   = Math.round((recent / 5) * 12);
      const cAcc   = totalTyped > 0 ? Math.round(((totalTyped - errors) / totalTyped) * 100) : 100;
      setWpm(cWpm);
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

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Phrase progress track */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {STANDARD_PHRASES.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: phraseDone.includes(i) ? "#FF1A1A"
              : phraseIdx === i ? "rgba(255,26,26,0.3)"
              : "rgba(255,255,255,0.06)",
            transition: "background 0.3s",
            boxShadow: phraseDone.includes(i) ? "0 0 8px rgba(255,26,26,0.35)" : "none",
          }} />
        ))}
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", letterSpacing: "1px", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap" }}>
          {stdDone}/5
        </span>
      </div>

      {/* Bonus unlock banner */}
      {isBonus && !bonusLocked && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 8,
          background: "rgba(255,184,0,0.07)", border: "1px solid rgba(255,184,0,0.22)",
          animation: "fadeUp 0.3s ease forwards",
        }}>
          <span style={{ fontSize: "1rem" }}>🔓</span>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "2px", color: "#FFB800" }}>
            BONUS PHRASE {bonusCompleted + 1} — +10 ENERGY
          </span>
        </div>
      )}

      {/* ── BONUS GATE CARD ── */}
      {bonusLocked ? (
        <div style={{
          padding: "1.5rem", borderRadius: 16,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.08)",
          animation: "fadeUp 0.35s ease forwards",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          {/* Label + WPM hint */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "3px", color: "rgba(255,255,255,0.3)" }}>
              BONUS PHRASES
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "1px",
              color: "#FFB800", fontFamily: "'DM Sans',sans-serif",
              background: "rgba(255,184,0,0.08)", border: "1px solid rgba(255,184,0,0.2)",
              padding: "3px 10px", borderRadius: 100,
            }}>
              🔒 {lockedWpm} / 60 WPM
            </span>
          </div>

          {/* Thin WPM progress bar */}
          <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, position: "relative" }}>
            <div style={{
              height: "100%", borderRadius: 2,
              width: `${Math.min(100, (lockedWpm / 60) * 100)}%`,
              background: lockedWpm >= 50 ? "#FF6B00" : "#FF4400",
              transition: "width 0.5s ease",
            }} />
            <div style={{ position: "absolute", top: -2, right: 0, width: 2, height: 7, background: "#FFB800", borderRadius: 1 }} />
          </div>

          {/* Two equal CTAs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
            <button
              onClick={() => {
                setBonusLocked(false);
                setPhraseIdx(STANDARD_PHRASES.length - 1);
                setDisplayIdx(STANDARD_PHRASES.length - 1);
                setTyped("");
                setTxState("idle");
                phraseStartRef.current = Date.now(); // fresh timer — judge this attempt only
              }}
              style={{
                padding: "12px 0", border: "1.5px solid rgba(255,26,26,0.4)",
                borderRadius: 8, cursor: "pointer", background: "rgba(255,26,26,0.08)",
                color: "#fff", fontWeight: 800, fontSize: "0.85rem", letterSpacing: "0.5px",
                fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,26,26,0.15)"; e.currentTarget.style.borderColor = "rgba(255,26,26,0.7)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,26,26,0.08)"; e.currentTarget.style.borderColor = "rgba(255,26,26,0.4)"; }}
            >⚡ Try for 60 WPM</button>

            <button
              onClick={() => {
                const finalAcc = totalTyped > 0 ? Math.round(((totalTyped - errors) / totalTyped) * 100) : 100;
                onFinish({ peakWpm: peakWpmRef.current, accuracy: finalAcc, phrasesTyped: phraseDone.length, bestStreak, finalScore: score });
              }}
              style={{
                padding: "12px 0", border: "1.5px solid rgba(255,255,255,0.1)",
                borderRadius: 8, cursor: "pointer", background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.5px",
                fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
            >Pick My Goal →</button>
          </div>
        </div>
      ) : (
      <div style={{
        padding: "1.5rem",
        background: txState === "flash"
          ? (nextIsBonus ? "rgba(255,184,0,0.08)" : "rgba(34,197,94,0.06)")
          : wrongFlash ? "rgba(255,26,26,0.05)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${
          txState === "flash" ? (nextIsBonus ? "rgba(255,184,0,0.5)" : "rgba(34,197,94,0.4)")
          : wrongFlash ? "rgba(255,26,26,0.4)"
          : isBonus ? "rgba(255,184,0,0.14)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 16, position: "relative", overflow: "hidden",
        transition: "border-color 0.15s, background 0.15s",
      }}>
        <ParticleBurst trigger={phraseBurst} color={isBonus ? "#FFB800" : "#FF1A1A"} count={14} />

        {/* Completion flash overlay */}
        {txState === "flash" && (
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 8, zIndex: 2,
            background: nextIsBonus ? "rgba(255,184,0,0.06)" : "rgba(34,197,94,0.05)",
            animation: "fadeUp 0.2s ease forwards",
          }}>
            <span style={{ fontSize: "2rem", animation: "bounceIn 0.25s ease forwards" }}>
              {nextIsBonus ? "🔓" : "✓"}
            </span>
            <span style={{
              fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.2rem", letterSpacing: "4px",
              color: nextIsBonus ? "#FFB800" : "#22C55E",
            }}>
              {nextIsBonus ? "BONUS UNLOCKED" : "PHRASE COMPLETE"}
            </span>
          </div>
        )}

        <div style={{ marginBottom: "0.75rem" }}>
          <span style={{
            fontSize: 9, fontWeight: 800, letterSpacing: "3px",
            color: isBonus ? "#FFB800" : "rgba(255,255,255,0.18)",
            fontFamily: "'DM Sans',sans-serif",
          }}>
            {isBonus ? `BONUS ${bonusCompleted + 1}` : `PHRASE ${displayIdx + 1} OF ${STANDARD_PHRASES.length}`}
          </span>
        </div>

        {/* Characters — with fly-out / fly-in transform */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: "1px 0", lineHeight: 1,
          transform: txState === "out" ? "translateX(-60px)" : txState === "in" ? "translateX(0)" : "none",
          opacity: txState === "out" ? 0 : txState === "flash" ? 0 : 1,
          transition: txState === "out" ? "transform 0.22s ease-in, opacity 0.22s ease-in"
                    : txState === "in"  ? "transform 0.25s ease-out, opacity 0.25s ease-out"
                    : "none",
          // "in" starts off-right
          ...(txState === "in" ? { transform: "translateX(0)", animation: "slideInRight 0.25s ease-out forwards" } : {}),
        }}>
          {currentPhrase.split("").map((ch, i) => {
            const isTyped   = i < typed.length;
            const isCurrent = i === typed.length && txState === "idle";
            const isSpace   = ch === " ";
            return (
              <span key={i} style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: isCurrent ? "2.3rem" : "1.75rem",
                letterSpacing: "3px",
                color: isTyped ? "#22C55E" : isCurrent ? "#FFB800" : "rgba(255,255,255,0.22)",
                textShadow: isTyped ? "0 0 8px rgba(34,197,94,0.3)" : isCurrent ? "0 0 16px rgba(255,184,0,0.55)" : "none",
                transition: "font-size 0.1s, color 0.07s",
                animation: isCurrent ? "pulseAmber 0.85s ease-in-out infinite" : "none",
                display: "inline-block", width: isSpace ? "0.55rem" : "auto",
              }}>{isSpace ? "\u00A0" : ch}</span>
            );
          })}
        </div>

        {/* Next key */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "1rem" }}>
          <span style={{ fontSize: 9, letterSpacing: "2px", color: "rgba(255,255,255,0.13)", fontFamily: "'DM Sans',sans-serif" }}>NEXT</span>
          <div style={{
            width: 36, height: 36, background: "rgba(255,184,0,0.07)",
            border: "1.5px solid rgba(255,184,0,0.3)", borderRadius: 7,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 10px rgba(255,184,0,0.18)",
          }}>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.35rem", color: "#FFB800", animation: "pulseAmber 0.85s ease-in-out infinite" }}>
              {currentPhrase[typed.length] === " " ? "⎵" : (currentPhrase[typed.length] ?? "✓")}
            </span>
          </div>
          {wrongFlash && (
            <span style={{ fontSize: 11, color: "#FF1A1A", fontWeight: 800, fontFamily: "'DM Sans',sans-serif", letterSpacing: "1px" }}>✗ WRONG KEY</span>
          )}
        </div>
      </div>
      )} {/* end bonusLocked ? ... : ( ... ) */}

      {/* Live stats grid — streak column only shows if active */}
      <div style={{
        display: "grid",
        gridTemplateColumns: streak > 0 ? "1fr 1px 1fr 1px 1fr 1px 1fr 1px 1fr" : "1fr 1px 1fr 1px 1fr 1px 1fr",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden",
      }}>
        {[
          { v: wpm,        l: "WPM",      col: wpmColor },
          { v: `${acc}%`,  l: "ACCURACY", col: accColor },
          { v: errors,     l: "ERRORS",   col: errors > 0 ? "#FF1A1A" : "rgba(255,255,255,.18)" },
          { v: `${score}`, l: "ENERGY",   col: scoreColor },
          ...(streak > 0 ? [{ v: `${streak}🔥`, l: "STREAK", col: streakColor }] : []),
        ].map(({ v, l, col }, i, arr) => (
          <React.Fragment key={l}>
            <div style={{
              padding: "0.85rem 0", textAlign: "center",
              background: l === "STREAK" && streakFlash ? `${streakColor}12` : "transparent",
              transition: "background 0.2s",
            }}>
              <div style={{
                fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.75rem",
                color: col, transition: "color .25s", lineHeight: 1,
                transform: l === "STREAK" && streakFlash ? "scale(1.15)" : "scale(1)",
                transition: "transform 0.15s, color 0.25s",
              }}>{v}</div>
              <div style={{ fontSize: 8, letterSpacing: "2px", color: "rgba(255,255,255,.15)", fontWeight: 700, fontFamily: "'DM Sans',sans-serif", marginTop: 3 }}>{l}</div>
            </div>
            {i < arr.length - 1 && <div style={{ background: "rgba(255,255,255,0.05)", width: 1 }} />}
          </React.Fragment>
        ))}
      </div>

      {/* Accuracy bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 9, letterSpacing: "2px", color: "rgba(255,255,255,.13)", fontFamily: "'DM Sans',sans-serif" }}>ACCURACY</span>
          <span style={{ fontSize: 9, letterSpacing: "1px", color: accColor, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, transition: "color .3s" }}>{acc}%</span>
        </div>
        <div style={{ height: 2, background: "rgba(255,255,255,.04)", borderRadius: 2 }}>
          <div style={{ height: "100%", borderRadius: 2, width: `${acc}%`, background: accColor, transition: "width .2s, background .3s" }} />
        </div>
      </div>

      {/* Bonus gate progress — only visible on phrase 5 */}
      {phraseIdx === STANDARD_PHRASES.length - 1 && !bonusLocked && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 9, letterSpacing: "2px", color: "rgba(255,255,255,.13)", fontFamily: "'DM Sans',sans-serif" }}>
              BONUS UNLOCK SPEED
            </span>
            <span style={{
              fontSize: 9, letterSpacing: "1px", fontFamily: "'DM Sans',sans-serif", fontWeight: 700,
              color: wpm >= BONUS_WPM_GATE ? "#22C55E" : "rgba(255,184,0,0.6)",
              transition: "color .3s",
            }}>
              {wpm >= BONUS_WPM_GATE ? "✓ UNLOCKED" : `${wpm} / ${BONUS_WPM_GATE} WPM`}
            </span>
          </div>
          <div style={{ height: 2, background: "rgba(255,255,255,.04)", borderRadius: 2, position: "relative" }}>
            <div style={{
              height: "100%", borderRadius: 2,
              width: `${Math.min(100, (wpm / BONUS_WPM_GATE) * 100)}%`,
              background: wpm >= BONUS_WPM_GATE ? "#22C55E" : "#FFB800",
              transition: "width .2s, background .3s",
            }} />
          </div>
        </div>
      )}

      <p style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,.1)", letterSpacing: "1.5px", fontFamily: "'DM Sans',sans-serif" }}>
        COMPLETE 5 PHRASES · BONUS PHRASES UNLOCK AFTER · ACCURACY COUNTS
      </p>
    </div>
  );
}

// ─── Goal Selector ────────────────────────────────────────────────────────────
function GoalSelector({ onBack }) {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [mounted, setMounted] = useState(false);
  const activeGoal = GOALS.find(g => g.id === selectedGoal);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", width: "100%", padding: "0 1rem" }}>
      <div style={{
        textAlign: "center", marginBottom: "2rem",
        opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(255,26,26,0.07)", border: "1px solid rgba(255,26,26,0.18)",
          padding: "5px 16px", borderRadius: 100, marginBottom: "1rem",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF1A1A", display: "inline-block", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "4px", color: "#FF1A1A", fontFamily: "'DM Sans',sans-serif" }}>WHAT'S YOUR GOAL?</span>
        </span>
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(2rem,5vw,3.5rem)", letterSpacing: "2px", color: "#fff", lineHeight: 1.05, marginBottom: "0.5rem" }}>
          {selectedGoal ? activeGoal.headline.toUpperCase() : "PICK YOUR PROGRAM."}
        </h2>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.9rem", fontFamily: "'DM Sans',sans-serif" }}>
          {selectedGoal ? `Suggested: ${activeGoal.plan}` : "We'll build your perfect program around it."}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {GOALS.map((goal, i) => (
          <button key={goal.id}
            onClick={() => setSelectedGoal(goal.id === selectedGoal ? null : goal.id)}
            style={{
              position: "relative", padding: "1rem 0.75rem", borderRadius: 12, cursor: "pointer",
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
            onMouseEnter={e => { if (selectedGoal !== goal.id) { e.currentTarget.style.borderColor = `${goal.color}44`; e.currentTarget.style.transform = "translateY(-2px)"; }}}
            onMouseLeave={e => { if (selectedGoal !== goal.id) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}}
          >
            <span style={{ fontSize: "1.6rem" }}>{goal.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.5px", textAlign: "center", lineHeight: 1.2 }}>{goal.label}</span>
            {selectedGoal === goal.id && (
              <span style={{ position: "absolute", top: 8, right: 8, width: 18, height: 18, borderRadius: "50%", background: goal.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 800, animation: "fadeCheckIn 0.2s ease forwards" }}>✓</span>
            )}
          </button>
        ))}
      </div>

      {selectedGoal && (
        <div style={{ animation: "fadeUp 0.35s ease forwards" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "1rem",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderLeft: `3px solid ${activeGoal.color}`, borderRadius: 12, padding: "1rem 1.5rem", marginBottom: "1.25rem",
          }}>
            <span style={{ fontSize: "1.5rem" }}>{activeGoal.icon}</span>
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "3px", color: "rgba(255,255,255,0.3)", marginBottom: 4, fontFamily: "'DM Sans',sans-serif" }}>YOUR PROGRAM</p>
              <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#fff", fontFamily: "'DM Sans',sans-serif" }}>{activeGoal.plan}</p>
            </div>
          </div>
          <a href={`/register?goal=${selectedGoal}`} style={{
            display: "block", width: "100%", padding: "16px", textAlign: "center",
            background: `linear-gradient(135deg,${activeGoal.color},${activeGoal.color}cc)`,
            boxShadow: `0 6px 28px ${activeGoal.color}40`,
            color: "#fff", textDecoration: "none", fontWeight: 800, fontSize: "1rem",
            letterSpacing: "0.5px", borderRadius: 8, fontFamily: "'DM Sans',sans-serif",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 10px 36px ${activeGoal.color}55`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 6px 28px ${activeGoal.color}40`; }}
          >Start My {activeGoal.label} Journey →</a>
          <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: "0.75rem", fontFamily: "'DM Sans',sans-serif" }}>
            First session free · No joining fee this month
          </p>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", fontSize: 13, cursor: "pointer", letterSpacing: "1px", fontFamily: "'DM Sans',sans-serif", transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}
        >← Back</button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
 function EnergyShakeSection() {
  const [phase, setPhase]       = useState("invite");   // invite | typing | summary | goals
  const [energy, setEnergy]     = useState(0);
  const [summaryStats, setSummaryStats] = useState(null);
  const audioRef = useRef(null);
  const isFull   = energy >= 100;

  useEffect(() => { audioRef.current = createAudio(); }, []);

  const handleFinish = useCallback((stats) => {
    setSummaryStats(stats);
    setPhase("summary");
  }, []);

  const barColor = energy < 30 ? "#FF6B00" : energy < 60 ? "#FFB800" : energy < 90 ? "#FF4400" : "#FF1A1A";

  return (
    <section style={{
      padding: "7rem 2rem", position: "relative", overflow: "hidden",
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
        @keyframes slideInRight {
          from { transform:translateX(50px); opacity:0; }
          to   { transform:translateX(0);    opacity:1; }
        }
        @keyframes bounceIn {
          0%   { transform:scale(0.4); opacity:0; }
          60%  { transform:scale(1.2); opacity:1; }
          100% { transform:scale(1); }
        }
      `}</style>

      {isFull && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 70% 60% at 50% 50%,rgba(255,26,26,0.07),transparent)", animation: "pulse 3s ease infinite" }} />
      )}

      {/* ── INVITE ── */}
      {phase === "invite" && (
        <div style={{ maxWidth: 560, width: "100%", textAlign: "center", animation: "fadeUp 0.5s ease forwards" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: "1.25rem" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF1A1A", animation: "pulse 2s infinite", display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "4px", color: "#FF1A1A", fontFamily: "'DM Sans',sans-serif" }}>ENERGY CHECK</span>
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(2.4rem,5.5vw,4rem)", letterSpacing: "2px", color: "#fff", lineHeight: 1.02, marginBottom: "0.75rem" }}>
            HOW BAD DO<br />
            <span style={{ background: "linear-gradient(135deg,#FF1A1A,#FF6B00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>YOU WANT IT?</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.95rem", lineHeight: 1.65, maxWidth: 400, margin: "0 auto 2rem", fontFamily: "'DM Sans',sans-serif" }}>
            Type 5 FitZone phrases. Speed × accuracy fills the bar — then we build your program.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: "2.5rem", padding: "1.25rem", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, textAlign: "left" }}>
            {STANDARD_PHRASES.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 9, color: "rgba(255,26,26,0.45)", fontWeight: 800, fontFamily: "'DM Sans',sans-serif", letterSpacing: "1px", minWidth: 14, textAlign: "right" }}>{i + 1}</span>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.1rem", letterSpacing: "3px", color: "rgba(255,255,255,0.15)" }}>{p}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: "0.8rem", minWidth: 14, textAlign: "right" }}>🔓</span>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", letterSpacing: "2px", color: "rgba(255,184,0,0.28)", fontWeight: 700 }}>BONUS PHRASES UNLOCK AFTER — +10 ENERGY EACH</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => setPhase("typing")} style={{
              padding: "14px 36px", background: "linear-gradient(135deg,#FF1A1A,#991111)",
              border: "none", borderRadius: 8, cursor: "pointer", color: "#fff", fontWeight: 800,
              fontSize: "0.95rem", letterSpacing: "1px", boxShadow: "0 6px 28px rgba(255,26,26,0.35)",
              fontFamily: "'DM Sans',sans-serif", transition: "transform 0.15s, box-shadow 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 36px rgba(255,26,26,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(255,26,26,0.35)"; }}
            >⚡ Let's Go →</button>
            <button onClick={() => setPhase("goals")} style={{
              padding: "14px 24px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 8, cursor: "pointer", color: "rgba(255,255,255,0.4)", fontWeight: 600,
              fontSize: "0.9rem", fontFamily: "'DM Sans',sans-serif", transition: "color 0.2s, border-color 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }}
            >Skip → View Plans</button>
          </div>
          <p style={{ marginTop: "1rem", fontSize: 11, color: "rgba(255,255,255,0.13)", letterSpacing: "1.5px", fontFamily: "'DM Sans',sans-serif" }}>~60 SECONDS · TOTALLY OPTIONAL</p>
        </div>
      )}

      {/* ── TYPING ── */}
      {phase === "typing" && (
        <div style={{ maxWidth: 660, width: "100%", animation: "fadeUp 0.4s ease forwards" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.5rem" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF1A1A", animation: "pulse 2s infinite", display: "inline-block" }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "4px", color: "#FF1A1A", fontFamily: "'DM Sans',sans-serif" }}>ENERGY CHECK</span>
              </div>
              <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(1.8rem,4vw,2.8rem)", letterSpacing: "2px", color: "#fff", transition: "all 0.5s" }}>
                TYPE TO CHARGE
              </h2>
            </div>
            <button onClick={() => setPhase("goals")} style={{
              flexShrink: 0, marginTop: 4, padding: "8px 16px", borderRadius: 100,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 700,
              letterSpacing: "1.5px", fontFamily: "'DM Sans',sans-serif", transition: "color 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
            >SKIP →</button>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: "1.25rem" }}>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(4rem,12vw,7rem)", letterSpacing: "-4px", lineHeight: 1, color: "#fff", transition: "all 0.3s" }}>
              {Math.floor(energy)}
            </span>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(1.5rem,4vw,2.5rem)", color: "rgba(255,255,255,0.3)", marginTop: 8 }}>%</span>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3 }}>
              <div style={{ height: "100%", borderRadius: 3, width: `${energy}%`, background: barColor, boxShadow: energy > 0 ? `0 0 12px ${barColor}50` : "none", transition: "width 0.15s, background 0.4s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
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
          <Summary stats={summaryStats} onContinue={() => setPhase("goals")} />
        </div>
      )}

      {/* ── GOALS ── */}
      {phase === "goals" && (
        <GoalSelector onBack={() => { setPhase("invite"); setEnergy(0); setSummaryStats(null); }} />
      )}
    </section>
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
  const [sessionsEntered, setSessionsEntered] = useState(false);
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

  // Scroll
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
// ── REPLACE the sessions scroll useEffect in Home.jsx ────────────────────────

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

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

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
<section id="trainers" style={{ ...s.section, background: "#050505" }}>
  <div style={s.sectionInner}>
    <div style={s.sectionHeader}>
      <span style={s.sectionTag}>MEET THE TEAM</span>
      <h2 style={s.sectionTitle}>
        COACHED BY THE<br />
        <span style={s.redText}>BEST.</span>
      </h2>
      <p style={s.sectionSub}>
        Our certified trainers bring years of experience and real results to every session.
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
            <div style={{ ...s.trainerAccent, background: trainer.color }} />

            {/* Trainer Image */}
            <div style={s.trainerImgWrap}>
              <img
                src={trainer.image}
                alt={trainer.name}
                style={s.trainerImg}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>

            <h3 style={s.trainerName}>{trainer.name}</h3>
            <p style={{ ...s.trainerRole, color: trainer.color }}>{trainer.role}</p>

            <div style={s.trainerMeta}>
              <span style={s.trainerBadge}>⏱ {trainer.exp}</span>
              <span style={s.trainerBadge}>🎓 {trainer.cert}</span>
            </div>

            <p style={s.trainerSpec}>
              <span style={{ color: trainer.color, fontWeight: 700 }}>Speciality: </span>
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