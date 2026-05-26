import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// AGENT DEFINITIONS
// ============================================================
const AGENTS = [
  {
    id: "guestvoice", name: "GuestVoice", emoji: "💬",
    color: "#06b6d4", colorDark: "#0e7490",
    bg: "from-cyan-500/20 to-cyan-900/10", border: "border-cyan-500/30",
    role: "24/7 Guest Relations", tagline: "24/7 multilingual guest communication",
    capability: "Handles guest messages, complaints, check-ins in 40+ languages",
    checkInterval: "daily",
    systemPrompt: `You are GuestVoice, HotelMind's 24/7 Guest Relations AI agent for independent hotels. You speak 40+ languages and handle: check-in/check-out questions, complaints, room requests, local recommendations, amenity info. When doing AGENTIC CHECK: scan for common guest pain points, flag review scores below 4.0, suggest proactive service improvements. Always be warm, professional, solution-focused. Give specific actionable advice with dollar impact.`,
  },
  {
    id: "staffiq", name: "StaffIQ", emoji: "👥",
    color: "#a855f7", colorDark: "#7e22ce",
    bg: "from-purple-500/20 to-purple-900/10", border: "border-purple-500/30",
    role: "Staff & Scheduling", tagline: "Staff scheduling & labor optimization",
    capability: "Creates optimal schedules, reduces overtime, tracks labor costs",
    checkInterval: "weekly",
    systemPrompt: `You are StaffIQ, HotelMind's Staff Intelligence AI agent. You optimize: shift scheduling, labor costs, overtime prevention, HR compliance, hiring recommendations. When doing AGENTIC CHECK: calculate if hotel is over/understaffed based on room count and occupancy, flag overtime risks and compliance gaps, suggest schedule optimizations with dollar savings. Benchmark labor cost % against industry standard (25-35% of revenue). Give specific numbers.`,
  },
  {
    id: "profitpulse", name: "ProfitPulse", emoji: "📊",
    color: "#10b981", colorDark: "#065f46",
    bg: "from-emerald-500/20 to-emerald-900/10", border: "border-emerald-500/30",
    role: "Revenue & Pricing", tagline: "Revenue & booking optimization",
    capability: "Reduces OTA fees, finds direct booking opportunities, optimizes rates",
    checkInterval: "daily",
    systemPrompt: `You are ProfitPulse, HotelMind's Revenue Intelligence AI agent. You optimize: room pricing, RevPAR, ADR, occupancy rates, channel mix, OTA vs direct booking ratio. When doing AGENTIC CHECK: calculate current RevPAR vs industry benchmark, flag if OTA fees exceed 20% of revenue, identify pricing opportunities. Key benchmarks: Budget $45-65 RevPAR, Mid-scale $65-90, Upscale $90-130. OTA fees 15-25%. Always give: current metric → benchmark → gap → dollar impact → specific action.`,
  },
  {
    id: "complianceguard", name: "ComplianceGuard", emoji: "🛡️",
    color: "#f59e0b", colorDark: "#92400e",
    bg: "from-amber-500/20 to-amber-900/10", border: "border-amber-500/30",
    role: "Legal & Compliance", tagline: "Legal & franchise compliance",
    capability: "Tracks deadlines, prevents fines, monitors regulations",
    checkInterval: "weekly",
    systemPrompt: `You are ComplianceGuard, HotelMind's Legal & Compliance AI agent. You monitor: licenses, permits, fire safety, ADA compliance, labor law, franchise agreements, health inspections. When doing AGENTIC CHECK: check for common compliance gaps, flag upcoming renewal deadlines, alert on recent regulatory changes. Key risks: Fire marshal failures ($500-$10,000), ADA violations ($75,000-$150,000), labor violations ($1,000+/employee). Be specific about deadlines and dollar risk.`,
  },
  {
    id: "cosradar", name: "CostRadar", emoji: "⚡",
    color: "#ef4444", colorDark: "#991b1b",
    bg: "from-red-500/20 to-red-900/10", border: "border-red-500/30",
    role: "Cost Reduction", tagline: "Energy & supply cost savings",
    capability: "Finds waste, compares suppliers, cuts unnecessary spending",
    checkInterval: "weekly",
    systemPrompt: `You are CostRadar, HotelMind's Cost Intelligence AI agent. You find and eliminate: energy waste, supply inefficiencies, vendor overcharging, unnecessary subscriptions. When doing AGENTIC CHECK: estimate energy cost vs industry benchmark (hotels avg $2,500-4,000/room/year), flag supply cost inefficiencies, identify top 3 cost reduction opportunities. Benchmarks: Energy $2.50-4.00/sq ft/year, Laundry $3-5/room/day, Supplies $8-15/occupied room. Give specific vendor alternatives and savings.`,
  },
  {
    id: "ownercoach", name: "OwnerCoach", emoji: "🎯",
    color: "#ec4899", colorDark: "#9d174d",
    bg: "from-pink-500/20 to-pink-900/10", border: "border-pink-500/30",
    role: "Business Coaching", tagline: "Weekly profit coaching",
    capability: "Personal business advisor, weekly intelligence briefings",
    checkInterval: "weekly",
    systemPrompt: `You are OwnerCoach, HotelMind's Business Strategy AI agent — like a hotel MBA consultant on call 24/7. You coach on: profit optimization, growth strategy, brand building, franchise negotiations, exit planning. When doing AGENTIC CHECK: analyze overall hotel health score (0-100), identify the #1 highest-leverage action this week, flag strategic risks or missed opportunities. Think like a $500/hour hotel consultant. Always end with: "Your #1 priority this week is..."`,
  },
];

const ALERT_PROMPTS = {
  guestvoice: (p) => `Run an AGENTIC CHECK for ${p.name || "this hotel"} in ${p.city || "their market"}. ${p.rooms || "50"} rooms, ${p.type || "mid-scale"} property. Identify the top 2-3 guest experience risks right now. Format: start with "🚨 ALERT:" or "✅ ALL CLEAR:" then bullet points with specific actions.`,
  staffiq: (p) => `Run an AGENTIC CHECK for ${p.name || "this hotel"} — ${p.rooms || "50"} rooms in ${p.city || "their market"}. Calculate labor cost risks, overtime exposure, scheduling gaps. Give specific dollar amounts and 3 action items. Start with alert level: 🔴 HIGH / 🟡 MEDIUM / 🟢 LOW`,
  profitpulse: (p) => `Run an AGENTIC CHECK for ${p.name || "this hotel"} — ${p.rooms || "50"} rooms, ${p.type || "mid-scale"}, ${p.city || "their market"}. Calculate RevPAR gap vs benchmark, OTA cost drain, top pricing opportunity. Give dollar amounts. Start with: "📊 REVENUE REPORT:"`,
  complianceguard: (p) => `Run an AGENTIC CHECK for ${p.name || "this hotel"} in ${p.state || "Florida"}, opened ${p.yearOpened || "10+"} years ago. Flag top 3 compliance risks — licenses, safety, labor law. Include fine amounts. Start with alert level.`,
  cosradar: (p) => `Run an AGENTIC CHECK for ${p.name || "this hotel"} — ${p.rooms || "50"} rooms. Calculate top 3 cost reduction opportunities with specific dollar savings. Check energy, supplies, vendors. Start with: "⚡ COST SCAN COMPLETE:"`,
  ownercoach: (p) => `Run a weekly AGENTIC CHECK for ${p.name || "this hotel"} — ${p.rooms || "50"} rooms, ${p.type || "mid-scale"} in ${p.city || "their market"}. Give 60-second executive brief: hotel health score, #1 priority this week, one strategic insight. Start with: "🎯 WEEKLY BRIEF:"`,
};

const QUICK_ACTIONS = {
  guestvoice: ["📋 Weekly guest report", "🌐 Translate for Spanish guest", "⭐ How to improve my reviews"],
  staffiq: ["📅 Optimize this week's schedule", "💰 Calculate my overtime costs", "🔍 Am I overstaffed or understaffed?"],
  profitpulse: ["📈 Analyze my RevPAR", "🏨 How to reduce OTA fees?", "💡 Best pricing for this weekend"],
  complianceguard: ["🔍 Full compliance checklist", "📅 What licenses expire soon?", "⚖️ ADA requirements for my hotel"],
  cosradar: ["⚡ Find my top 3 cost leaks", "🔋 Quick energy saving wins", "📦 Better supply vendors near me"],
  ownercoach: ["🎯 My #1 priority this week", "📊 Rate my hotel health 0-100", "🚀 How do I grow revenue 20%?"],
};

// ============================================================
// HELPERS
// ============================================================
const S = {
  get: (k, d = null) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

async function callClaude(systemPrompt, messages, onChunk) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      stream: true,
      system: systemPrompt,
      messages,
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of dec.decode(value).split("\n")) {
      if (line.startsWith("data: ")) {
        try {
          const d = JSON.parse(line.slice(6));
          if (d.type === "content_block_delta" && d.delta?.text) {
            full += d.delta.text;
            onChunk(full);
          }
        } catch {}
      }
    }
  }
  return full;
}

// ============================================================
// LANDING PAGE
// ============================================================
const LIVE_FEED = [
  { agent: "GuestVoice", emoji: "💬", color: "#06b6d4", msg: "Responded to guest complaint in Spanish — issue resolved", time: "2:14 AM" },
  { agent: "ProfitPulse", emoji: "📊", color: "#10b981", msg: "Detected pricing opportunity — Friday rate should be $109 not $89", time: "6:08 AM" },
  { agent: "ComplianceGuard", emoji: "🛡️", color: "#f59e0b", msg: "Alert: Fire inspection due in 23 days — added to calendar", time: "8:30 AM" },
  { agent: "CostRadar", emoji: "⚡", color: "#ef4444", msg: "Found $340/month savings on linen supplier — switching recommended", time: "9:15 AM" },
  { agent: "StaffIQ", emoji: "👥", color: "#a855f7", msg: "Schedule optimized — saved 4.5 hours overtime this week", time: "11:00 AM" },
  { agent: "OwnerCoach", emoji: "🎯", color: "#ec4899", msg: "Weekly brief ready — RevPAR up 8%, ADR opportunity identified", time: "Mon 7am" },
];

function LandingPage({ onGetStarted }) {
  const [feedIdx, setFeedIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setFeedIdx(i => (i + 1) % LIVE_FEED.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: "#080d1a", minHeight: "100vh", color: "white" }}>
      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏨</div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>HotelMind<span style={{ color: "#6366f1" }}> AI</span></span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ color: "#94a3b8", fontSize: 14, cursor: "pointer" }}>Features</span>
          <span style={{ color: "#94a3b8", fontSize: 14, cursor: "pointer" }}>Pricing</span>
          <button
            onClick={onGetStarted}
            style={{ padding: "8px 20px", background: "linear-gradient(135deg,#6366f1,#a855f7)", borderRadius: 10, border: "none", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Start Free Trial
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ textAlign: "center", padding: "80px 40px 60px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 100, padding: "6px 16px", marginBottom: 32, fontSize: 12, color: "#818cf8", letterSpacing: "0.1em", fontWeight: 600 }}>
          <span style={{ width: 7, height: 7, background: "#4ade80", borderRadius: "50%", display: "inline-block", animation: "pulse 2s infinite" }} />
          AUTONOMOUS AI AGENTS · LIVE & LEARNING
        </div>
        <h1 style={{ fontSize: "clamp(48px,7vw,88px)", fontWeight: 800, lineHeight: 1.05, marginBottom: 24, letterSpacing: "-0.03em" }}>
          The Future of<br />
          <span style={{ background: "linear-gradient(135deg,#6366f1,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Hotel AI</span>
        </h1>
        <p style={{ fontSize: 20, color: "#94a3b8", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.6 }}>
          6 autonomous AI agents that <strong style={{ color: "white" }}>think, decide, and act</strong> for your hotel. Save{" "}
          <span style={{ color: "#4ade80", fontWeight: 700 }}>$4,800/month</span>. Work 24/7. Never sleep.
        </p>
        <button
          onClick={onGetStarted}
          style={{ padding: "18px 40px", background: "linear-gradient(135deg,#6366f1,#a855f7,#ec4899)", borderRadius: 16, border: "none", color: "white", fontSize: 18, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em", boxShadow: "0 0 60px rgba(99,102,241,0.4)" }}
        >
          Activate Your AI Team →
        </button>
        <p style={{ marginTop: 16, color: "#475569", fontSize: 13 }}>No credit card · 30-day free trial · $99/month after</p>
      </div>

      {/* LIVE FEED */}
      <div style={{ maxWidth: 680, margin: "0 auto 80px", padding: "0 40px" }}>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: "#94a3b8" }}>
              <span style={{ width: 7, height: 7, background: "#4ade80", borderRadius: "50%", display: "inline-block" }} />
              LIVE AGENT ACTIVITY
            </div>
            <span style={{ fontSize: 12, color: "#475569" }}>Updated now</span>
          </div>
          {LIVE_FEED.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: i === feedIdx ? 1 : 0.4, transition: "opacity 0.5s", background: i === feedIdx ? "rgba(255,255,255,0.03)" : "transparent" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: item.color + "22", border: `1px solid ${item.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{item.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "white" }}>{item.agent}</div>
                <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>{item.msg}</div>
              </div>
              <div style={{ fontSize: 12, color: "#475569", flexShrink: 0 }}>{item.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AGENTS SECTION */}
      <div style={{ textAlign: "center", padding: "0 40px 80px" }}>
        <div style={{ fontSize: 12, letterSpacing: "0.15em", color: "#6366f1", fontWeight: 600, marginBottom: 16 }}>MEET YOUR AGENTS</div>
        <h2 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 800, marginBottom: 16, letterSpacing: "-0.02em" }}>
          <span style={{ background: "linear-gradient(135deg,#6366f1,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Autonomous Intelligence</span><br />
          <span style={{ color: "white" }}>for Every Task</span>
        </h2>
        <p style={{ color: "#64748b", marginBottom: 48, fontSize: 17 }}>Each agent is a specialist. Each makes decisions. Each delivers results.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20, maxWidth: 1000, margin: "0 auto" }}>
          {AGENTS.map(a => (
            <div key={a.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 28, textAlign: "left", cursor: "pointer", transition: "transform 0.2s, border-color 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = a.color + "60"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
              onClick={onGetStarted}
            >
              <div style={{ width: 52, height: 52, borderRadius: 14, background: a.color + "22", border: `1px solid ${a.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16 }}>{a.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{a.name}</div>
              <div style={{ color: "#94a3b8", fontSize: 14, marginBottom: 14 }}>{a.tagline}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: a.color + "15", border: `1px solid ${a.color}30`, borderRadius: 10 }}>
                <span style={{ color: a.color, fontSize: 12 }}>⚡</span>
                <span style={{ color: a.color, fontSize: 12, fontWeight: 500 }}>{a.capability}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div style={{ maxWidth: 800, margin: "0 auto 80px", padding: "0 40px" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "36px 40px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, textAlign: "center" }}>
          {[["$4.8K", "SAVED MONTHLY", "#6366f1"], ["40+", "LANGUAGES", "#a855f7"], ["24/7", "ALWAYS ON", "#ec4899"], ["6", "AI AGENTS", "#10b981"]].map(([v, l, c]) => (
            <div key={l}>
              <div style={{ fontSize: 40, fontWeight: 800, color: c, letterSpacing: "-0.03em" }}>{v}</div>
              <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, letterSpacing: "0.1em", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "60px 40px 100px" }}>
        <h2 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 800, marginBottom: 16, letterSpacing: "-0.02em" }}>
          Ready to deploy your<br />
          <span style={{ background: "linear-gradient(135deg,#6366f1,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI workforce?</span>
        </h2>
        <p style={{ color: "#64748b", marginBottom: 36, fontSize: 17 }}>5 minute setup. Lifetime of savings. Cancel anytime.</p>
        <button
          onClick={onGetStarted}
          style={{ padding: "18px 48px", background: "linear-gradient(135deg,#6366f1,#a855f7)", borderRadius: 16, border: "none", color: "white", fontSize: 18, fontWeight: 700, cursor: "pointer", boxShadow: "0 0 60px rgba(99,102,241,0.35)" }}
        >
          Start Free Trial →
        </button>
        <p style={{ marginTop: 16, color: "#374151", fontSize: 13 }}>No credit card · 30-day free trial · $99/month after</p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}

// ============================================================
// PROFILE SETUP
// ============================================================
function ProfileSetup({ profile, onSave, onBack }) {
  const [form, setForm] = useState({
    name: "", ownerName: "", rooms: "", city: "", state: "Florida", type: "mid-scale", yearOpened: "", website: "", phone: "",
    ...profile,
  });
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  const inp = "w-full text-sm text-white placeholder-gray-600 outline-none transition-colors";

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: "#080d1a", minHeight: "100vh", color: "white", padding: "40px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 14, marginBottom: 32, display: "flex", alignItems: "center", gap: 6 }}>← Back</button>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>🏨 Set Up Your Hotel</h1>
          <p style={{ color: "#64748b", fontSize: 15 }}>Takes 3 minutes. Your agents use this to give specific, real advice.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            ["Hotel Name", "name", "e.g. Sunrise Inn & Suites"],
            ["Your Name", "ownerName", "e.g. Rajesh Patel"],
            ["Number of Rooms", "rooms", "e.g. 62"],
            ["City", "city", "e.g. Orlando"],
            ["State", "state", "e.g. Florida"],
            ["Year Opened", "yearOpened", "e.g. 2008"],
            ["Website", "website", "e.g. sunriseinn.com"],
            ["Phone", "phone", "e.g. 407-555-0100"],
          ].map(([label, field, ph]) => (
            <div key={field} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
              <input value={form[field]} onChange={set(field)} placeholder={ph}
                style={{ background: "none", border: "none", width: "100%", color: "white", fontSize: 14, outline: "none", fontFamily: "'Outfit', sans-serif" }} />
            </div>
          ))}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Hotel Type</div>
            <select value={form.type} onChange={set("type")}
              style={{ background: "none", border: "none", width: "100%", color: "white", fontSize: 14, outline: "none", fontFamily: "'Outfit', sans-serif" }}>
              {["budget", "mid-scale", "upscale", "extended-stay", "boutique", "franchise"].map(t => (
                <option key={t} value={t} style={{ background: "#0f172a" }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() => { if (form.name && form.rooms) onSave(form); else alert("Please enter at least Hotel Name and Number of Rooms"); }}
          style={{ marginTop: 28, padding: "16px 40px", background: "linear-gradient(135deg,#6366f1,#a855f7)", borderRadius: 14, border: "none", color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%" }}
        >
          Activate My AI Team →
        </button>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');`}</style>
      </div>
    </div>
  );
}

// ============================================================
// AGENT CHAT
// ============================================================
function AgentChat({ agent, profile, onBack }) {
  const [msgs, setMsgs] = useState(() => S.get(`hm_chat_${agent.id}`, []));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => { S.set(`hm_chat_${agent.id}`, msgs.slice(-60)); }, [msgs, agent.id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, stream]);

  const send = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    const um = { role: "user", content: text };
    const next = [...msgs, um];
    setMsgs(next);
    setInput("");
    setLoading(true);
    setStream("");
    try {
      const ctx = profile ? `\n\nHotel: ${profile.name}, ${profile.rooms} rooms, ${profile.type}, ${profile.city} ${profile.state}. Owner: ${profile.ownerName}.` : "";
      const full = await callClaude(agent.systemPrompt + ctx, next, setStream);
      setMsgs([...next, { role: "assistant", content: full }]);
    } catch (e) {
      setMsgs([...next, { role: "assistant", content: `⚠️ ${e.message}` }]);
    }
    setStream("");
    setLoading(false);
  }, [msgs, loading, agent, profile]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: `linear-gradient(135deg, ${agent.color}15, transparent)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18, padding: 0 }}>←</button>
          <div style={{ fontSize: 28 }}>{agent.emoji}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "white" }}>{agent.name}</div>
            <div style={{ fontSize: 12, color: agent.color }}>{agent.role}</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 11, color: "#64748b" }}>Active</span>
          </div>
        </div>
        {/* Quick actions */}
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {(QUICK_ACTIONS[agent.id] || []).map(a => (
            <button key={a}
              onClick={() => send(a.replace(/^[^\s]+\s/, ""))}
              style={{ fontSize: 12, padding: "5px 12px", borderRadius: 100, border: `1px solid ${agent.color}50`, color: agent.color, background: agent.color + "12", cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
            >{a}</button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        {msgs.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#475569" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{agent.emoji}</div>
            <div>Ask {agent.name} anything about your hotel</div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "80%", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              padding: "12px 16px", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap",
              background: m.role === "user" ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "rgba(255,255,255,0.06)",
              color: m.role === "user" ? "white" : "#cbd5e1",
              border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.08)",
            }}>{m.content}</div>
          </div>
        ))}
        {stream && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ maxWidth: "80%", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap", background: "rgba(255,255,255,0.06)", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.08)" }}>
              {stream}<span style={{ display: "inline-block", width: 6, height: 16, background: "currentColor", marginLeft: 2, animation: "pulse 1s infinite", verticalAlign: "middle" }} />
            </div>
          </div>
        )}
        {loading && !stream && (
          <div style={{ display: "flex", gap: 6, padding: "12px 16px" }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#475569", animation: `pulse 1s ${i * 0.2}s infinite` }} />)}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
            placeholder={`Ask ${agent.name}...`}
            style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 14, outline: "none", fontFamily: "'Outfit', sans-serif" }}
          />
          <button onClick={() => send(input)} disabled={loading || !input.trim()}
            style={{ padding: "12px 22px", borderRadius: 12, border: "none", color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer", opacity: loading || !input.trim() ? 0.4 : 1, background: `linear-gradient(135deg,${agent.color},${agent.colorDark})`, fontFamily: "'Outfit', sans-serif" }}
          >Send</button>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

// ============================================================
// ALERTS PANEL
// ============================================================
function AlertsPanel({ alerts, onDismiss, onRunCheck, runningAgent }) {
  return (
    <div style={{ padding: 28, overflowY: "auto", height: "100%", fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 4 }}>🔔 Agent Alerts</h2>
          <p style={{ color: "#64748b", fontSize: 14 }}>Auto-detected issues · {alerts.length} total</p>
        </div>
        <button onClick={() => AGENTS.forEach(a => onRunCheck(a.id))}
          style={{ padding: "10px 20px", background: "linear-gradient(135deg,#6366f1,#a855f7)", borderRadius: 12, border: "none", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          ⚡ Run All Checks
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {AGENTS.map(agent => {
          const agentAlerts = alerts.filter(a => a.agentId === agent.id);
          const latest = agentAlerts[agentAlerts.length - 1];
          const isRunning = runningAgent === agent.id;
          return (
            <div key={agent.id} style={{ background: `linear-gradient(135deg, ${agent.color}10, transparent)`, border: `1px solid ${agent.color}35`, borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{agent.emoji}</span>
                  <span style={{ fontWeight: 700, color: "white", fontSize: 15 }}>{agent.name}</span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>· {agent.checkInterval}</span>
                </div>
                <button onClick={() => onRunCheck(agent.id)} disabled={isRunning}
                  style={{ padding: "6px 14px", borderRadius: 10, border: `1px solid ${agent.color}50`, color: agent.color, background: agent.color + "15", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: isRunning ? 0.6 : 1, fontFamily: "'Outfit', sans-serif" }}>
                  {isRunning ? "Checking..." : "Run Check"}
                </button>
              </div>
              {latest ? (
                <div>
                  <p style={{ fontSize: 11, color: "#475569", marginBottom: 6 }}>Last: {new Date(latest.timestamp).toLocaleString()}</p>
                  <p style={{ fontSize: 13, color: "#94a3b8", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{latest.content}</p>
                  <button onClick={() => onDismiss(latest.id)} style={{ marginTop: 10, background: "none", border: "none", color: "#475569", fontSize: 12, cursor: "pointer" }}>✕ Dismiss</button>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "#374151" }}>No checks run yet. Click "Run Check" to start.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// WEEKLY DIGEST MODAL
// ============================================================
function DigestModal({ digest, onClose }) {
  if (!digest) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#0f1629", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 20, maxWidth: 680, width: "100%", maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 20, color: "white" }}>📋 Weekly Intelligence Digest</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>Auto-generated by all 6 agents</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 24, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {digest.map((item, i) => {
            const agent = AGENTS.find(a => a.id === item.agentId);
            return (
              <div key={i} style={{ background: `linear-gradient(135deg, ${agent?.color || "#6366f1"}10, transparent)`, border: `1px solid ${agent?.color || "#6366f1"}30`, borderRadius: 14, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span>{agent?.emoji}</span>
                  <span style={{ fontWeight: 700, color: "white", fontSize: 14 }}>{agent?.name}</span>
                </div>
                <p style={{ fontSize: 13, color: "#94a3b8", whiteSpace: "pre-wrap", lineHeight: 1.65 }}>
                  {item.loading ? "⏳ Generating..." : item.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD (inside the app)
// ============================================================
function Dashboard({ profile, onEditProfile, onSelectAgent, alerts, onRunAllChecks }) {
  const alertCount = alerts.length;
  const recent = [...alerts].reverse().slice(0, 4);

  return (
    <div style={{ padding: 28, overflowY: "auto", height: "100%", fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "white", marginBottom: 4 }}>
            Welcome back, {profile?.ownerName || "Owner"} 👋
          </h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>{profile?.name} · {profile?.city}, {profile?.state} · {profile?.rooms} rooms</p>
        </div>
        <button onClick={onEditProfile}
          style={{ padding: "8px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#94a3b8", fontSize: 13, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
          ✏️ Edit Profile
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Rooms", value: profile?.rooms || "—", icon: "🏨", color: "#6366f1" },
          { label: "Active Agents", value: "6", icon: "🤖", color: "#10b981" },
          { label: "Active Alerts", value: alertCount, icon: "🔔", color: alertCount > 0 ? "#ef4444" : "#10b981" },
          { label: "Hotel Type", value: profile?.type || "—", icon: "⭐", color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Run All CTA */}
      <div style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(168,85,247,0.2))", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 16, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 700, color: "white", marginBottom: 4 }}>🤖 Run All 6 Agents Now</div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>Detect issues across your entire hotel — takes ~30 seconds</div>
        </div>
        <button onClick={onRunAllChecks}
          style={{ padding: "12px 24px", background: "linear-gradient(135deg,#6366f1,#a855f7)", borderRadius: 12, border: "none", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap", marginLeft: 16, fontFamily: "'Outfit', sans-serif" }}>
          ⚡ Run All Agents
        </button>
      </div>

      {/* Recent alerts */}
      {recent.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Recent Alerts</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recent.map(alert => {
              const agent = AGENTS.find(a => a.id === alert.agentId);
              return (
                <div key={alert.id} style={{ background: `linear-gradient(135deg,${agent?.color || "#6366f1"}08,transparent)`, border: `1px solid ${agent?.color || "#6366f1"}30`, borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10 }}>
                  <span>{agent?.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: agent?.color }}>{agent?.name}</span>
                    <p style={{ fontSize: 12, color: "#64748b", marginTop: 2, lineHeight: 1.4 }}>{alert.content.split("\n")[0].slice(0, 120)}...</p>
                  </div>
                  <span style={{ fontSize: 11, color: "#374151", whiteSpace: "nowrap" }}>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agents grid */}
      <h3 style={{ fontSize: 12, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Your AI Agents</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {AGENTS.map(agent => (
          <button key={agent.id} onClick={() => onSelectAgent(agent)}
            style={{ background: `linear-gradient(135deg,${agent.color}12,transparent)`, border: `1px solid ${agent.color}35`, borderRadius: 14, padding: "18px 16px", textAlign: "left", cursor: "pointer", transition: "transform 0.15s", fontFamily: "'Outfit', sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <div style={{ fontSize: 26, marginBottom: 8 }}>{agent.emoji}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "white", marginBottom: 3 }}>{agent.name}</div>
            <div style={{ fontSize: 11, color: agent.color }}>{agent.role}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// APP SHELL (sidebar layout)
// ============================================================
function AppShell({ profile, onEditProfile, initialView = "dashboard" }) {
  const [view, setView] = useState(initialView);
  const [activeAgent, setActiveAgent] = useState(null);
  const [alerts, setAlerts] = useState(() => S.get("hm_alerts", []));
  const [digest, setDigest] = useState(null);
  const [runningAgent, setRunningAgent] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { S.set("hm_alerts", alerts.slice(-50)); }, [alerts]);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const addAlert = (agentId, content) => {
    setAlerts(prev => [...prev, { id: Date.now() + Math.random(), agentId, content, timestamp: new Date().toISOString() }]);
  };

  const runCheck = useCallback(async (agentId) => {
    const agent = AGENTS.find(a => a.id === agentId);
    if (!agent) return;
    setRunningAgent(agentId);
    try {
      const prompt = ALERT_PROMPTS[agentId](profile || {});
      const result = await callClaude(agent.systemPrompt, [{ role: "user", content: prompt }], () => {});
      addAlert(agentId, result);
      showToast(`${agent.emoji} ${agent.name} check complete`);
    } catch (e) {
      showToast(`⚠️ ${e.message}`);
    }
    setRunningAgent(null);
  }, [profile]);

  const runAll = useCallback(async () => {
    showToast("⚡ Running all 6 agent checks...");
    for (const a of AGENTS) await runCheck(a.id);
    showToast("✅ All checks complete!");
    setView("alerts");
  }, [runCheck]);

  const runDigest = useCallback(async () => {
    showToast("📋 Generating weekly digest...");
    const initial = AGENTS.map(a => ({ agentId: a.id, content: "", loading: true }));
    setDigest(initial);
    const results = await Promise.all(AGENTS.map(async agent => {
      try {
        const content = await callClaude(agent.systemPrompt, [{ role: "user", content: ALERT_PROMPTS[agent.id](profile || {}) }], () => {});
        return { agentId: agent.id, content, loading: false };
      } catch (e) {
        return { agentId: agent.id, content: `⚠️ ${e.message}`, loading: false };
      }
    }));
    setDigest(results);
  }, [profile]);

  const alertCount = alerts.length;

  return (
    <div style={{ display: "flex", height: "100vh", background: "#080d1a", color: "white", fontFamily: "'Outfit', sans-serif" }}>
      {/* SIDEBAR */}
      <div style={{ width: 240, flexShrink: 0, background: "#0a1020", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column" }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#6366f1,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🏨</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em" }}>HotelMind</div>
              <div style={{ fontSize: 11, color: "#6366f1" }}>AI Platform</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ padding: "10px 8px" }}>
          {[
            { id: "dashboard", icon: "▦", label: "Dashboard" },
            { id: "alerts", icon: "🔔", label: "Alerts", badge: alertCount },
            { id: "profile", icon: "🏨", label: "Hotel Profile" },
          ].map(item => (
            <button key={item.id}
              onClick={() => { setView(item.id); setActiveAgent(null); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, border: (view === item.id && !activeAgent) ? "1px solid rgba(99,102,241,0.4)" : "1px solid transparent", background: (view === item.id && !activeAgent) ? "rgba(99,102,241,0.2)" : "transparent", color: (view === item.id && !activeAgent) ? "#818cf8" : "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 2, textAlign: "left", position: "relative", fontFamily: "'Outfit', sans-serif" }}>
              <span>{item.icon}</span><span>{item.label}</span>
              {item.badge > 0 && <span style={{ marginLeft: "auto", background: "#ef4444", color: "white", borderRadius: 100, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{item.badge > 9 ? "9+" : item.badge}</span>}
            </button>
          ))}
        </div>

        {/* Agents */}
        <div style={{ padding: "4px 8px" }}>
          <div style={{ fontSize: 10, color: "#374151", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", padding: "6px 12px", marginBottom: 4 }}>AI AGENTS</div>
          {AGENTS.map(agent => (
            <button key={agent.id}
              onClick={() => { setActiveAgent(agent); setView("agent"); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "8px 12px", borderRadius: 10, border: "1px solid transparent", background: activeAgent?.id === agent.id ? "rgba(255,255,255,0.08)" : "transparent", color: activeAgent?.id === agent.id ? "white" : "#64748b", fontSize: 13, cursor: "pointer", marginBottom: 1, textAlign: "left", fontFamily: "'Outfit', sans-serif" }}>
              <span style={{ fontSize: 16 }}>{agent.emoji}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 12 }}>{agent.name}</div>
                <div style={{ fontSize: 10, color: agent.color }}>{agent.role}</div>
              </div>
              {runningAgent === agent.id && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#fbbf24", animation: "pulse 1s infinite" }} />}
            </button>
          ))}
        </div>

        {/* Bottom buttons */}
        <div style={{ marginTop: "auto", padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={runDigest}
            style={{ width: "100%", padding: "10px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 10, color: "#818cf8", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 8, fontFamily: "'Outfit', sans-serif" }}>
            📋 Weekly Digest
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {view === "agent" && activeAgent ? (
          <AgentChat agent={activeAgent} profile={profile} onBack={() => { setView("dashboard"); setActiveAgent(null); }} />
        ) : view === "alerts" ? (
          <AlertsPanel alerts={alerts} onDismiss={id => setAlerts(p => p.filter(a => a.id !== id))} onRunCheck={runCheck} runningAgent={runningAgent} />
        ) : view === "profile" ? (
          <ProfileSetup profile={profile} onSave={p => { S.set("hm_profile", p); onEditProfile(p); setView("dashboard"); showToast("✅ Profile saved!"); }} onBack={() => setView("dashboard")} />
        ) : (
          <Dashboard profile={profile} onEditProfile={() => setView("profile")} onSelectAgent={a => { setActiveAgent(a); setView("agent"); }} alerts={alerts} onRunAllChecks={runAll} />
        )}
      </div>

      {digest && <DigestModal digest={digest} onClose={() => setDigest(null)} />}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1a2540", border: "1px solid rgba(99,102,241,0.4)", color: "white", fontSize: 14, padding: "12px 20px", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", zIndex: 200, fontFamily: "'Outfit', sans-serif" }}>
          {toast}
        </div>
      )}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap'); @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

// ============================================================
// ROOT — controls which screen shows
// ============================================================
export default function HotelMind() {
  const [screen, setScreen] = useState(() => {
    const p = S.get("hm_profile");
    return p?.name ? "app" : "landing";
  });
  const [profile, setProfile] = useState(() => S.get("hm_profile", null));

  if (screen === "landing") {
    return <LandingPage onGetStarted={() => setScreen("setup")} />;
  }
  if (screen === "setup") {
    return (
      <ProfileSetup
        profile={profile}
        onBack={() => setScreen("landing")}
        onSave={p => { S.set("hm_profile", p); setProfile(p); setScreen("app"); }}
      />
    );
  }
  return (
    <AppShell
      profile={profile}
      onEditProfile={p => setProfile(p)}
    />
  );
}
