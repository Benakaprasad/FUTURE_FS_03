// src/components/FitZoneChatbot.jsx
import { useState, useRef, useEffect, useCallback } from "react";

const WELCOME_MSG = {
  role: "assistant",
  content: "Hey! 👋 Welcome to **FitZone**. I'm Flex — ask me anything about memberships, classes, timings, or our trainers. What's on your mind?",
  id: "welcome",
  ts: Date.now(),
};

const QUICK_REPLIES = [
  { label: "💰 Membership plans", text: "What are your membership plans?" },
  { label: "🏋️ Classes offered",  text: "What classes do you offer?"        },
  { label: "📍 Location",         text: "Where are you located?"             },
  { label: "🎁 Free trial",       text: "Can I get a free trial?"            },
];

// ── Markdown-lite renderer (bold + line breaks) ────────────────
function renderContent(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ color: "#fff", fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    }
    return part.split("\n").map((line, j, arr) => (
      <span key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</span>
    ));
  });
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

// ── Lead extraction ────────────────────────────────────────────
function extractLead(text) {
  const patterns = [
    /LEAD_CAPTURED:\s*(\{[\s\S]*?\})/,
    /LEAD_CAPTURED:\s*```(?:json)?\s*(\{[\s\S]*?\})\s*```/,
    /LEAD_CAPTURED:\s*(\{[^}]+\})/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      try { return JSON.parse(match[1]); } catch {}
    }
  }
  return null;
}

// ── Avatar ─────────────────────────────────────────────────────
function BotAvatar({ size = 28 }) {
  return (
    <div style={{
      width:          size,
      height:         size,
      borderRadius:   "50%",
      background:     "linear-gradient(135deg, #FF1A1A 0%, #991111 100%)",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      fontSize:       size * 0.33,
      color:          "#fff",
      fontFamily:     "'Bebas Neue', sans-serif",
      letterSpacing:  "0.5px",
      flexShrink:     0,
      boxShadow:      "0 0 12px rgba(255,26,26,0.35)",
    }}>FZ</div>
  );
}

// ── Typing dots ─────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
      <BotAvatar />
      <div style={{
        padding:      "11px 16px",
        borderRadius: "18px 18px 18px 4px",
        background:   "rgba(255,255,255,0.06)",
        border:       "1px solid rgba(255,255,255,0.09)",
        display:      "flex",
        gap:          "5px",
        alignItems:   "center",
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width:        "6px",
            height:       "6px",
            borderRadius: "50%",
            background:   "#FF1A1A",
            animation:    `fzDot 1.3s ease-in-out ${i * 0.18}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Single message bubble ───────────────────────────────────────
function MessageBubble({ msg, isNew }) {
  const isBot = msg.role === "assistant";
  return (
    <div
      style={{
        display:        "flex",
        flexDirection:  isBot ? "row" : "row-reverse",
        alignItems:     "flex-end",
        gap:            "8px",
        animation:      isNew ? "fzSlideIn 0.28s cubic-bezier(0.16,1,0.3,1) forwards" : "none",
        opacity:        isNew ? 0 : 1,
      }}
    >
      {isBot && <BotAvatar />}
      <div style={{ maxWidth: "80%", display: "flex", flexDirection: "column", gap: "3px", alignItems: isBot ? "flex-start" : "flex-end" }}>
        <div style={{
          padding:      isBot ? "11px 15px" : "10px 15px",
          borderRadius: isBot ? "18px 18px 18px 4px" : "18px 18px 4px 18px",
          background:   isBot
            ? "rgba(255,255,255,0.065)"
            : "linear-gradient(135deg, #FF1A1A 0%, #cc1010 100%)",
          border:       isBot ? "1px solid rgba(255,255,255,0.09)" : "none",
          color:        "#fff",
          fontSize:     "13.5px",
          lineHeight:   1.65,
          fontFamily:   "'DM Sans', sans-serif",
          whiteSpace:   "pre-wrap",
          wordBreak:    "break-word",
          boxShadow:    isBot
            ? "0 2px 8px rgba(0,0,0,0.25)"
            : "0 4px 16px rgba(255,26,26,0.3)",
        }}>
          {renderContent(msg.content)}
        </div>
        <span style={{
          fontSize:  "10px",
          color:     "rgba(255,255,255,0.22)",
          fontFamily: "'DM Sans', sans-serif",
          paddingLeft: isBot ? "2px" : 0,
          paddingRight: isBot ? 0 : "2px",
        }}>{formatTime(msg.ts || Date.now())}</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
export default function FitZoneChatbot() {

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem("fz_chat_v2");
      return saved ? JSON.parse(saved) : [WELCOME_MSG];
    } catch { return [WELCOME_MSG]; }
  });

  const [leadDone, setLeadDone] = useState(() => {
    try { return sessionStorage.getItem("fz_lead_done") === "true"; }
    catch { return false; }
  });

  const [open,       setOpen]       = useState(false);
  const [input,      setInput]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [pulse,      setPulse]      = useState(true);
  const [newMsgIds,  setNewMsgIds]  = useState(new Set());
  const [unread,     setUnread]     = useState(0);
  const [inputRows,  setInputRows]  = useState(1);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const msgIdRef  = useRef(0);

  const nextId = () => `msg_${++msgIdRef.current}_${Date.now()}`;

  // Persist messages
  useEffect(() => {
    try { sessionStorage.setItem("fz_chat_v2", JSON.stringify(messages)); }
    catch {}
  }, [messages]);

  // Stop pulse after 10s
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 10_000);
    return () => clearTimeout(t);
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setInput(e.target.value);
    const rows = Math.min(4, Math.max(1, e.target.value.split("\n").length));
    setInputRows(rows);
  };

  const markNew = (id) => {
    setNewMsgIds(prev => new Set([...prev, id]));
    setTimeout(() => setNewMsgIds(prev => { const n = new Set(prev); n.delete(id); return n; }), 400);
  };

  // ── Send ───────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    setInput("");
    setInputRows(1);

    const uid = nextId();
    const userMsg = { role: "user", content: text.trim(), id: uid, ts: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    markNew(uid);
    setLoading(true);

    try {
      const res = await fetch("/api/public/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: newMessages }),
      });

      const data    = await res.json();
      const rawText = data.content || "Sorry, something went wrong. Please call us at +91 98765 43210.";

      // Lead capture
      const lead = extractLead(rawText);
      if (lead && !leadDone && lead.name && lead.phone) {
        try {
          await fetch("/api/public/chatbot-lead", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              name:    lead.name,
              phone:   lead.phone,
              summary: lead.summary || `${lead.name} enquired via chatbot`,
            }),
          });
          setLeadDone(true);
          sessionStorage.setItem("fz_lead_done", "true");
        } catch {}
      }

      const displayText = rawText
        .replace(/\nLEAD_CAPTURED:[\s\S]*?(\n|$)/, "")
        .replace(/LEAD_CAPTURED:[\s\S]*?(\n|$)/, "")
        .trim();

      const aid = nextId();
      const botMsg = { role: "assistant", content: displayText, id: aid, ts: Date.now() };
      setMessages(prev => [...prev, botMsg]);
      markNew(aid);
      if (!open) setUnread(u => u + 1);

    } catch {
      const eid = nextId();
      const errMsg = {
        role:    "assistant",
        content: "Oops, something went wrong. Please call us at **+91 98765 43210**.",
        id:      eid,
        ts:      Date.now(),
      };
      setMessages(prev => [...prev, errMsg]);
      markNew(eid);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, leadDone, open]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const showQuickReplies = messages.length === 1 && !loading;
  const canSend = input.trim().length > 0 && !loading;

  // ── Render ─────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');

        @keyframes fzSlideIn {
          from { opacity: 0; transform: translateY(10px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)  scale(1);    }
        }
        @keyframes fzWindowIn {
          from { opacity: 0; transform: translateY(24px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes fzDot {
          0%,80%,100% { transform: scale(0.55); opacity: 0.35; }
          40%          { transform: scale(1);    opacity: 1;    }
        }
        @keyframes fzPulse {
          0%,100% { box-shadow: 0 0 0 0   rgba(255,26,26,0.55); }
          60%      { box-shadow: 0 0 0 11px rgba(255,26,26,0);   }
        }
        @keyframes fzBadgePop {
          0%   { transform: scale(0); }
          70%  { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes fzLeadIn {
          from { opacity:0; transform: scaleY(0.7); }
          to   { opacity:1; transform: scaleY(1);   }
        }

        .fz-btn-fab {
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.3s ease,
                      background 0.3s ease !important;
        }
        .fz-btn-fab:hover { transform: scale(1.1) !important; }

        .fz-quick:hover {
          background:   rgba(255,26,26,0.14) !important;
          border-color: rgba(255,26,26,0.45) !important;
          color:        #fff !important;
          transform:    translateY(-1px);
        }
        .fz-quick { transition: all 0.18s ease !important; }

        .fz-send:hover:not(:disabled) {
          background: #e01515 !important;
          transform:  scale(1.07);
        }
        .fz-send { transition: all 0.18s ease !important; }
        .fz-send:disabled { opacity: 0.35; }

        .fz-input:focus {
          outline:      none;
          border-color: rgba(255,26,26,0.5) !important;
          background:   rgba(255,255,255,0.08) !important;
        }
        .fz-input { transition: border-color 0.2s, background 0.2s !important; }
        .fz-input::placeholder { color: rgba(255,255,255,0.2) !important; }

        .fz-close:hover {
          background:   rgba(255,255,255,0.1) !important;
          color:        #fff !important;
        }
        .fz-close { transition: all 0.15s ease !important; }

        .fz-scroll::-webkit-scrollbar       { width: 3px; }
        .fz-scroll::-webkit-scrollbar-track { background: transparent; }
        .fz-scroll::-webkit-scrollbar-thumb { background: rgba(255,26,26,0.25); border-radius: 2px; }

        .fz-lead-banner {
          animation: fzLeadIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards;
        }
      `}</style>

      {/* ══ Chat Window ═══════════════════════════════════════ */}
      {open && (
        <div style={{
          position:      "fixed",
          bottom:        "88px",
          right:         "20px",
          width:         "min(370px, calc(100vw - 32px))",
          maxHeight:     "min(600px, calc(100vh - 120px))",
          background:    "linear-gradient(180deg, #0d0d0d 0%, #080808 100%)",
          border:        "1px solid rgba(255,255,255,0.08)",
          borderRadius:  "22px",
          boxShadow:     "0 32px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,26,26,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
          display:       "flex",
          flexDirection: "column",
          zIndex:        9998,
          animation:     "fzWindowIn 0.32s cubic-bezier(0.16,1,0.3,1) forwards",
          overflow:      "hidden",
          fontFamily:    "'DM Sans', sans-serif",
        }}>

          {/* ── Header ─────────────────────────────────────── */}
          <div style={{
            display:    "flex",
            alignItems: "center",
            gap:        "12px",
            padding:    "15px 18px",
            background: "linear-gradient(135deg, rgba(255,26,26,0.08) 0%, rgba(0,0,0,0) 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
            position:   "relative",
          }}>
            {/* Subtle top glow line */}
            <div style={{
              position:   "absolute",
              top:        0,
              left:       "20%",
              right:      "20%",
              height:     "1px",
              background: "linear-gradient(90deg, transparent, rgba(255,26,26,0.5), transparent)",
            }} />

            <div style={{ position: "relative" }}>
              <BotAvatar size={40} />
              <div style={{
                position:     "absolute",
                bottom:       1,
                right:        1,
                width:        "10px",
                height:       "10px",
                borderRadius: "50%",
                background:   "#22C55E",
                border:       "2px solid #0d0d0d",
                boxShadow:    "0 0 6px rgba(34,197,94,0.7)",
              }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily:    "'Bebas Neue', sans-serif",
                fontSize:      "16px",
                letterSpacing: "2.5px",
                color:         "#fff",
                lineHeight:    1,
              }}>FLEX · FITZONE</div>
              <div style={{
                fontSize:   "11px",
                color:      "rgba(255,255,255,0.38)",
                marginTop:  "4px",
                fontWeight: 500,
              }}>Whitefield, Bengaluru · Replies instantly</div>
            </div>

            <button
              className="fz-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              style={{
                background:     "rgba(255,255,255,0.05)",
                border:         "1px solid rgba(255,255,255,0.08)",
                borderRadius:   "9px",
                width:          "32px",
                height:         "32px",
                cursor:         "pointer",
                color:          "rgba(255,255,255,0.4)",
                fontSize:       "15px",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                flexShrink:     0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/>
              </svg>
            </button>
          </div>

          {/* ── Messages ───────────────────────────────────── */}
          <div
            className="fz-scroll"
            style={{
              flex:          1,
              overflowY:     "auto",
              padding:       "16px",
              display:       "flex",
              flexDirection: "column",
              gap:           "10px",
              scrollBehavior: "smooth",
            }}
          >
            {/* Date chip */}
            <div style={{
              textAlign:    "center",
              fontSize:     "10px",
              color:        "rgba(255,255,255,0.2)",
              fontWeight:   600,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              marginBottom: "4px",
            }}>Today</div>

            {messages.map((msg) => (
              <MessageBubble key={msg.id || msg.ts} msg={msg} isNew={newMsgIds.has(msg.id)} />
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ animation: "fzSlideIn 0.2s ease forwards" }}>
                <TypingDots />
              </div>
            )}

            {/* Lead success banner */}
            {leadDone && (
              <div
                className="fz-lead-banner"
                style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "9px",
                  padding:      "10px 14px",
                  background:   "rgba(34,197,94,0.07)",
                  border:       "1px solid rgba(34,197,94,0.18)",
                  borderRadius: "12px",
                  fontSize:     "12px",
                  color:        "#4ade80",
                  fontWeight:   600,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Our team will reach out to you shortly!
              </div>
            )}

            {/* Quick replies */}
            {showQuickReplies && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginTop: "6px" }}>
                {QUICK_REPLIES.map((q, i) => (
                  <button
                    key={i}
                    className="fz-quick"
                    onClick={() => sendMessage(q.text)}
                    style={{
                      padding:      "7px 13px",
                      borderRadius: "100px",
                      border:       "1px solid rgba(255,255,255,0.12)",
                      background:   "rgba(255,255,255,0.04)",
                      color:        "rgba(255,255,255,0.55)",
                      fontSize:     "11.5px",
                      fontWeight:   600,
                      cursor:       "pointer",
                      fontFamily:   "'DM Sans', sans-serif",
                      letterSpacing: "0.2px",
                    }}
                  >{q.label}</button>
                ))}
              </div>
            )}

            <div ref={bottomRef} style={{ height: "1px" }} />
          </div>

          {/* ── Input Bar ──────────────────────────────────── */}
          <div style={{
            padding:      "10px 12px 12px",
            borderTop:    "1px solid rgba(255,255,255,0.06)",
            background:   "rgba(0,0,0,0.4)",
            flexShrink:   0,
            backdropFilter: "blur(10px)",
          }}>
            {/* Hint text */}
            <div style={{
              fontSize:     "10px",
              color:        "rgba(255,255,255,0.15)",
              marginBottom: "8px",
              fontWeight:   500,
              letterSpacing: "0.3px",
              paddingLeft:  "2px",
            }}>
              ↵ Enter to send · Shift+Enter for new line
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
              <textarea
                ref={inputRef}
                className="fz-input"
                value={input}
                rows={inputRows}
                onChange={handleInputChange}
                onKeyDown={handleKey}
                placeholder="Ask about memberships, classes, trainers…"
                disabled={loading}
                style={{
                  flex:        1,
                  background:  "rgba(255,255,255,0.055)",
                  border:      "1px solid rgba(255,255,255,0.09)",
                  borderRadius: "14px",
                  padding:     "10px 14px",
                  color:       "#fff",
                  fontSize:    "13.5px",
                  fontFamily:  "'DM Sans', sans-serif",
                  resize:      "none",
                  lineHeight:  1.5,
                  maxHeight:   "90px",
                  overflowY:   "auto",
                }}
              />
              <button
                className="fz-send"
                onClick={() => sendMessage(input)}
                disabled={!canSend}
                aria-label="Send message"
                style={{
                  width:          "42px",
                  height:         "42px",
                  borderRadius:   "13px",
                  background:     canSend
                    ? "linear-gradient(135deg, #FF1A1A, #cc1010)"
                    : "rgba(255,255,255,0.06)",
                  border:         "none",
                  cursor:         canSend ? "pointer" : "not-allowed",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  flexShrink:     0,
                  boxShadow:      canSend ? "0 4px 14px rgba(255,26,26,0.35)" : "none",
                  transition:     "all 0.2s ease",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>

            {/* Powered by */}
            <div style={{
              textAlign:  "center",
              marginTop:  "9px",
              fontSize:   "10px",
              color:      "rgba(255,255,255,0.1)",
              fontWeight: 500,
              letterSpacing: "0.3px",
            }}>Powered by FitZone AI · For emergencies call +91 98765 43210</div>
          </div>
        </div>
      )}

      {/* ══ FAB Button ════════════════════════════════════════ */}
      <button
        className="fz-btn-fab"
        onClick={() => { setOpen(o => !o); setPulse(false); }}
        aria-label={open ? "Close chat" : "Open chat"}
        style={{
          position:       "fixed",
          bottom:         "20px",
          right:          "20px",
          width:          "60px",
          height:         "60px",
          borderRadius:   "50%",
          background:     open
            ? "rgba(40,40,40,0.95)"
            : "linear-gradient(135deg, #FF1A1A 0%, #991111 100%)",
          border:         open
            ? "1px solid rgba(255,255,255,0.12)"
            : "none",
          boxShadow:      open
            ? "0 4px 20px rgba(0,0,0,0.5)"
            : pulse
              ? "0 6px 24px rgba(255,26,26,0.55)"
              : "0 6px 24px rgba(255,26,26,0.38)",
          cursor:         "pointer",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          zIndex:         9999,
          animation:      pulse ? "fzPulse 2.2s ease-in-out infinite" : "none",
        }}
      >
        <div style={{
          position:   "absolute",
          transition: "opacity 0.2s, transform 0.2s",
          opacity:    open ? 0 : 1,
          transform:  open ? "scale(0.7) rotate(-30deg)" : "scale(1) rotate(0deg)",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </div>
        <div style={{
          position:   "absolute",
          transition: "opacity 0.2s, transform 0.2s",
          opacity:    open ? 1 : 0,
          transform:  open ? "scale(1) rotate(0deg)" : "scale(0.7) rotate(30deg)",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
      </button>

      {/* ── Unread badge ──────────────────────────────────── */}
      {!open && unread > 0 && (
        <div style={{
          position:       "fixed",
          bottom:         "64px",
          right:          "16px",
          minWidth:       "20px",
          height:         "20px",
          borderRadius:   "10px",
          background:     "#FF1A1A",
          border:         "2px solid #000",
          zIndex:         10000,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontSize:       "10px",
          fontWeight:     700,
          color:          "#fff",
          fontFamily:     "'DM Sans', sans-serif",
          padding:        "0 4px",
          animation:      "fzBadgePop 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards",
          boxShadow:      "0 2px 8px rgba(255,26,26,0.5)",
        }}>{unread > 9 ? "9+" : unread}</div>
      )}

      {/* ── Pulse dot (first visit) ───────────────────────── */}
      {!open && pulse && unread === 0 && (
        <div style={{
          position:     "fixed",
          bottom:       "68px",
          right:        "16px",
          width:        "13px",
          height:       "13px",
          borderRadius: "50%",
          background:   "#22C55E",
          border:       "2.5px solid #000",
          zIndex:       10000,
          boxShadow:    "0 0 8px rgba(34,197,94,0.7)",
        }} />
      )}
    </>
  );
}