// src/components/FitZoneChatbot.jsx
import { useState, useRef, useEffect } from "react";

// SYSTEM_PROMPT removed from frontend — now lives in backend/routes/public.js

const WELCOME_MSG = {
  role:    "assistant",
  content: "Hey! 👋 Welcome to FitZone Gym. I can help you with memberships, classes, timings, or anything else. What's on your mind?",
};

const QUICK_REPLIES = [
  "What are your membership plans?",
  "What classes do you offer?",
  "Where are you located?",
  "Can I get a free trial?",
];

// ── Fix 3: Robust lead extraction ─────────────────────────────
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

export default function FitZoneChatbot() {

  // ── Fix 2: Persist messages to sessionStorage ──────────────
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem("fz_chat_history");
      return saved ? JSON.parse(saved) : [WELCOME_MSG];
    } catch {
      return [WELCOME_MSG];
    }
  });

  // ── Fix 2: Persist leadDone to sessionStorage ──────────────
  const [leadDone, setLeadDone] = useState(() => {
    try {
      return sessionStorage.getItem("fz_lead_done") === "true";
    } catch {
      return false;
    }
  });

  const [open,    setOpen]    = useState(false);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [pulse,   setPulse]   = useState(true);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // ── Fix 2: Sync messages to sessionStorage on every change ─
  useEffect(() => {
    try {
      sessionStorage.setItem("fz_chat_history", JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 8000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  // ── Send message ───────────────────────────────────────────
  async function sendMessage(text) {
    if (!text.trim() || loading) return;
    setInput("");

    const userMsg     = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      // ── Fix 1: Call backend proxy — no API key in frontend ─
      const res = await fetch("/api/public/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: newMessages }),
      });

      const data    = await res.json();
      const rawText = data.content || "Sorry, something went wrong. Please call us at +91 98765 43210.";

      // ── Fix 3: Robust lead extraction ─────────────────────
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
          // ── Fix 2: Persist leadDone ────────────────────────
          setLeadDone(true);
          sessionStorage.setItem("fz_lead_done", "true");
        } catch {}
      }

      // Strip LEAD_CAPTURED line from display text
      const displayText = rawText
        .replace(/\nLEAD_CAPTURED:[\s\S]*?(\n|$)/, "")
        .replace(/LEAD_CAPTURED:[\s\S]*?(\n|$)/, "")
        .trim();

      setMessages(prev => [...prev, { role: "assistant", content: displayText }]);
    } catch {
      setMessages(prev => [...prev, {
        role:    "assistant",
        content: "Oops, something went wrong on my end. Please call us at +91 98765 43210.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const showQuickReplies = messages.length === 1;

  return (
    <>
      <style>{`
        @keyframes chatSlideUp {
          from { opacity:0; transform:translateY(20px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes chatPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(255,26,26,0.4); }
          50%      { box-shadow: 0 0 0 10px rgba(255,26,26,0); }
        }
        @keyframes typingDot {
          0%,80%,100% { transform: scale(0.6); opacity: 0.4; }
          40%          { transform: scale(1);   opacity: 1;   }
        }
        .fz-chat-btn:hover { transform: scale(1.08) !important; }
        .fz-quick-reply:hover {
          background:   rgba(255,26,26,0.1) !important;
          border-color: rgba(255,26,26,0.4) !important;
          color:        #fff !important;
        }
        .fz-send-btn:hover:not(:disabled) { background: #e01515 !important; }
        .fz-chat-input:focus {
          outline:      none;
          border-color: rgba(255,26,26,0.5) !important;
        }
        .fz-chat-input::placeholder { color: rgba(255,255,255,0.2); }
        .fz-close-btn:hover {
          background:   rgba(255,26,26,0.1) !important;
          border-color: rgba(255,26,26,0.2) !important;
          color:        #fff !important;
        }
        ::-webkit-scrollbar       { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,26,26,0.3); border-radius: 2px; }
      `}</style>

      {/* ── Chat window ─────────────────────────────────────── */}
      {open && (
        <div style={{
          position:      "fixed",
          bottom:        "90px",
          right:         "24px",
          width:         "360px",
          maxHeight:     "560px",
          background:    "#0a0a0a",
          border:        "1px solid rgba(255,255,255,0.1)",
          borderRadius:  "20px",
          boxShadow:     "0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,26,26,0.1)",
          display:       "flex",
          flexDirection: "column",
          zIndex:        9998,
          animation:     "chatSlideUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards",
          overflow:      "hidden",
        }}>

          {/* Header */}
          <div style={{
            display:      "flex",
            alignItems:   "center",
            gap:          "12px",
            padding:      "16px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            background:   "linear-gradient(135deg, #110000, #0a0a0a)",
            flexShrink:   0,
          }}>
            <div style={{
              width:          "38px",
              height:         "38px",
              borderRadius:   "50%",
              background:     "linear-gradient(135deg, #FF1A1A, #991111)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              fontFamily:     "'Bebas Neue', sans-serif",
              fontSize:       "15px",
              color:          "#fff",
              letterSpacing:  "1px",
              flexShrink:     0,
              boxShadow:      "0 0 16px rgba(255,26,26,0.4)",
            }}>FZ</div>

            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily:    "'Bebas Neue', sans-serif",
                fontSize:      "15px",
                letterSpacing: "2px",
                color:         "#fff",
                lineHeight:    1,
              }}>FITZONE GYM</div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "3px" }}>
                <div style={{
                  width:        "6px",
                  height:       "6px",
                  borderRadius: "50%",
                  background:   "#22C55E",
                  boxShadow:    "0 0 6px rgba(34,197,94,0.6)",
                }} />
                <span style={{
                  fontSize:      "10px",
                  color:         "rgba(255,255,255,0.4)",
                  fontFamily:    "'DM Sans', sans-serif",
                  fontWeight:    600,
                  letterSpacing: "0.5px",
                }}>Online · Typically replies instantly</span>
              </div>
            </div>

            <button
              className="fz-close-btn"
              onClick={() => setOpen(false)}
              style={{
                background:     "rgba(255,255,255,0.05)",
                border:         "1px solid rgba(255,255,255,0.08)",
                borderRadius:   "8px",
                width:          "30px",
                height:         "30px",
                cursor:         "pointer",
                color:          "rgba(255,255,255,0.4)",
                fontSize:       "14px",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                flexShrink:     0,
                transition:     "all 0.2s",
              }}
            >✕</button>
          </div>

          {/* Messages */}
          <div style={{
            flex:          1,
            overflowY:     "auto",
            padding:       "16px",
            display:       "flex",
            flexDirection: "column",
            gap:           "12px",
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display:        "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                gap:            "8px",
                alignItems:     "flex-end",
              }}>
                {msg.role === "assistant" && (
                  <div style={{
                    width:          "26px",
                    height:         "26px",
                    borderRadius:   "50%",
                    background:     "linear-gradient(135deg, #FF1A1A, #991111)",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    fontSize:       "9px",
                    color:          "#fff",
                    fontFamily:     "'Bebas Neue', sans-serif",
                    letterSpacing:  "0.5px",
                    flexShrink:     0,
                  }}>FZ</div>
                )}

                <div style={{
                  maxWidth:     "78%",
                  padding:      "10px 14px",
                  borderRadius: msg.role === "user"
                    ? "16px 16px 4px 16px"
                    : "16px 16px 16px 4px",
                  background:   msg.role === "user"
                    ? "linear-gradient(135deg, #FF1A1A, #cc1111)"
                    : "rgba(255,255,255,0.06)",
                  border:       msg.role === "user"
                    ? "none"
                    : "1px solid rgba(255,255,255,0.08)",
                  color:        "#fff",
                  fontSize:     "13px",
                  lineHeight:   1.6,
                  fontFamily:   "'DM Sans', sans-serif",
                  whiteSpace:   "pre-wrap",
                  boxShadow:    msg.role === "user"
                    ? "0 4px 12px rgba(255,26,26,0.25)"
                    : "none",
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                <div style={{
                  width:          "26px",
                  height:         "26px",
                  borderRadius:   "50%",
                  background:     "linear-gradient(135deg, #FF1A1A, #991111)",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontSize:       "9px",
                  color:          "#fff",
                  fontFamily:     "'Bebas Neue', sans-serif",
                  flexShrink:     0,
                }}>FZ</div>
                <div style={{
                  padding:      "12px 16px",
                  borderRadius: "16px 16px 16px 4px",
                  background:   "rgba(255,255,255,0.06)",
                  border:       "1px solid rgba(255,255,255,0.08)",
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
                      animation:    `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Lead captured confirmation */}
            {leadDone && (
              <div style={{
                textAlign:    "center",
                padding:      "10px 14px",
                background:   "rgba(34,197,94,0.08)",
                border:       "1px solid rgba(34,197,94,0.2)",
                borderRadius: "10px",
                fontSize:     "12px",
                color:        "#22C55E",
                fontFamily:   "'DM Sans', sans-serif",
                fontWeight:   600,
              }}>
                ✓ Our team will reach out to you shortly!
              </div>
            )}

            {/* Quick replies — only on first message */}
            {showQuickReplies && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                {QUICK_REPLIES.map((q, i) => (
                  <button
                    key={i}
                    className="fz-quick-reply"
                    onClick={() => sendMessage(q)}
                    style={{
                      padding:      "6px 12px",
                      borderRadius: "100px",
                      border:       "1px solid rgba(255,255,255,0.12)",
                      background:   "rgba(255,255,255,0.04)",
                      color:        "rgba(255,255,255,0.6)",
                      fontSize:     "11px",
                      fontWeight:   600,
                      cursor:       "pointer",
                      fontFamily:   "'DM Sans', sans-serif",
                      transition:   "all 0.2s",
                    }}
                  >{q}</button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding:    "12px 14px",
            borderTop:  "1px solid rgba(255,255,255,0.07)",
            display:    "flex",
            gap:        "8px",
            alignItems: "flex-end",
            background: "#080808",
            flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              className="fz-chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything about FitZone..."
              disabled={loading}
              style={{
                flex:         1,
                background:   "rgba(255,255,255,0.05)",
                border:       "1px solid rgba(255,255,255,0.09)",
                borderRadius: "12px",
                padding:      "10px 14px",
                color:        "#fff",
                fontSize:     "13px",
                fontFamily:   "'DM Sans', sans-serif",
                transition:   "border-color 0.2s",
              }}
            />
            <button
              className="fz-send-btn"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{
                width:          "38px",
                height:         "38px",
                borderRadius:   "10px",
                background:     input.trim() ? "#FF1A1A" : "rgba(255,255,255,0.06)",
                border:         "none",
                cursor:         input.trim() ? "pointer" : "not-allowed",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                flexShrink:     0,
                transition:     "all 0.2s",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Floating button ─────────────────────────────────── */}
      <button
        className="fz-chat-btn"
        onClick={() => { setOpen(o => !o); setPulse(false); }}
        style={{
          position:       "fixed",
          bottom:         "24px",
          right:          "24px",
          width:          "58px",
          height:         "58px",
          borderRadius:   "50%",
          background:     open
            ? "rgba(255,255,255,0.08)"
            : "linear-gradient(135deg, #FF1A1A, #991111)",
          border:         open
            ? "1px solid rgba(255,255,255,0.15)"
            : "none",
          boxShadow:      open
            ? "none"
            : pulse
              ? "0 6px 24px rgba(255,26,26,0.5)"
              : "0 6px 24px rgba(255,26,26,0.35)",
          cursor:         "pointer",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          zIndex:         9999,
          transition:     "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          animation:      pulse ? "chatPulse 2s ease-in-out infinite" : "none",
        }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6"  y2="18"/>
            <line x1="6"  y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        )}
      </button>

      {/* Unread dot — shown before first open */}
      {!open && pulse && (
        <div style={{
          position:     "fixed",
          bottom:       "72px",
          right:        "20px",
          width:        "12px",
          height:       "12px",
          borderRadius: "50%",
          background:   "#22C55E",
          border:       "2px solid #000",
          zIndex:       10000,
          boxShadow:    "0 0 8px rgba(34,197,94,0.6)",
        }} />
      )}
    </>
  );
}