import { useState, useEffect, useRef, useCallback } from "react";
const KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

const AGENTS = [
  { id:"guestvoice", name:"GuestVoice", tagline:"24/7 Guest Communications", color:"#0D9488", icon:"💬", description:"Handle guest requests, complaints & multilingual support instantly", prompt:`You are GuestVoice, an elite AI guest communications specialist for AAHOA hotel owners. Give specific copy-paste-ready scripts and templates. Include real dollar amounts. Always sign off: — GuestVoice, HotelMind AI`, quickPrompts:["Draft response to a 2-star cleanliness review","Guest says AC broken, how do I respond?","Angry guest demands free night, what do I say?","Write a Spanish check-in welcome message"] },
  { id:"staffiq", name:"StaffIQ", tagline:"Staff Scheduling Optimizer", color:"#065A82", icon:"👥", description:"Build schedules, predict busy periods, cut overtime costs", prompt:`You are StaffIQ, an expert hotel staffing AI for AAHOA hotel owners. Give specific schedules with numbers, hours, dollar amounts. Always sign off: — StaffIQ, HotelMind AI`, quickPrompts:["Build schedule for 3 housekeepers at 60% occupancy","How do I reduce overtime this week?","Calculate labor cost for 50-room hotel at 75% occ","Staff shortage this weekend — what do I do?"] },
  { id:"profitpulse", name:"ProfitPulse", tagline:"Revenue & OTA Optimization", color:"#C9A84C", icon:"📈", description:"Dynamic pricing, OTA fee reduction, direct booking growth", prompt:`You are ProfitPulse, an elite hotel revenue management AI for AAHOA hotel owners. Give specific dollar amounts and percentage calculations. Always sign off: — ProfitPulse, HotelMind AI`, quickPrompts:["My ADR is $89. How to get to $110 this month?","Expedia takes 22%. How do I reduce that?","How do I get more direct bookings this week?","Should I raise rates for the holiday weekend?"] },
  { id:"complianceguard", name:"ComplianceGuard", tagline:"Legal & Franchise Monitor", color:"#6B46C1", icon:"⚖️", description:"Track regulations, flag franchise fees, explain legal issues", prompt:`You are ComplianceGuard, an expert hotel legal and compliance AI for AAHOA hotel owners. Explain in plain English, flag risks, give specific dollar amounts for fines. Always recommend consulting a real attorney. Sign off: — ComplianceGuard, HotelMind AI`, quickPrompts:["My franchise wants $50k renovation. Do I have to?","What are my ADA pool lift requirements?","Explain the royalty fees in my franchise contract","Can franchise terminate me for missing a score?"] },
  { id:"costradar", name:"CostRadar", tagline:"Supply & Energy Savings", color:"#2F855A", icon:"💡", description:"Cut supply, energy, linen & utility costs with bulk buying", prompt:`You are CostRadar, an expert hotel cost reduction AI for AAHOA hotel owners. Find savings with specific dollar amounts and payback periods. Mention AAHOA Marketplace bulk buying. Sign off: — CostRadar, HotelMind AI`, quickPrompts:["Where can I save $1,000/month starting now?","Is in-house laundry cheaper than outsourcing?","How much can smart thermostats really save?","Compare AAHOA bulk buying vs my current supplier"] },
  { id:"ownercoach", name:"OwnerCoach", tagline:"Weekly Profit Coaching", color:"#C53030", icon:"🏆", description:"Translate financials into plain English, compare benchmarks", prompt:`You are OwnerCoach, a personal business coach AI for AAHOA hotel owners. Translate hotel financial data into plain English. Always end with exactly 3 specific action items with dollar impact. Sign off: — OwnerCoach, HotelMind AI`, quickPrompts:["My RevPAR is $58. Is that good or bad?","Give me 3 actions to make more profit this week","Explain GOPPAR to me in simple terms","My hotel is worth how much right now?"] },
];

const C = { navy:"#0A1628", navyDark:"#060E1A", navyMid:"#0D1A30", navyLight:"#0F1F3D", gold:"#C9A84C", goldLight:"#E8C96D", white:"#FFFFFF", gray:"#94A3B8", grayDark:"#475569", grayLight:"#CBD5E1", border:"#1E3A5F" };

function getTime() { return new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }); }

function AgentChat({ agent }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

  const send = useCallback(async (text) => {
    const txt = (text || input).trim();
    if (!txt || loading) return;
    const userMsg = { role:"user", content:txt, time:getTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    if (taRef.current) taRef.current.style.height = "44px";

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 1024,
          system: agent.prompt,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "API Error");
      const reply = data?.content?.[0]?.text || "Sorry, try again.";
      setMessages(prev => [...prev, { role:"assistant", content:reply, time:getTime() }]);
    } catch(e) {
      setMessages(prev => [...prev, { role:"assistant", content:`⚠️ Error: ${e.message}`, time:getTime() }]);
    }
    setLoading(false);
  }, [input, loading, agent, messages]);

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };
  const handleChange = (e) => { setInput(e.target.value); const el = e.target; el.style.height = "44px"; el.style.height = Math.min(el.scrollHeight, 140) + "px"; };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ flex:1, overflowY:"auto", padding:"20px 24px", display:"flex", flexDirection:"column", gap:16 }}>
        {messages.length === 0 && (
          <div style={{ background:`${agent.color}12`, border:`1px solid ${agent.color}30`, borderRadius:12, padding:20 }}>
            <div style={{ fontSize:15, fontWeight:600, color:agent.color, marginBottom:8 }}>{agent.icon} Welcome to {agent.name}</div>
            <div style={{ fontSize:13, color:C.grayLight, lineHeight:1.6, marginBottom:12 }}>{agent.description}. Ask me anything — I give specific advice with real numbers.</div>
            <div style={{ fontSize:10, color:C.grayDark, fontWeight:600, letterSpacing:"0.5px", textTransform:"uppercase", marginBottom:8 }}>Quick starts</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {agent.quickPrompts.map((p,i) => (
                <button key={i} onClick={() => send(p)} disabled={loading} style={{ padding:"7px 10px", background:`${agent.color}15`, border:`1px solid ${agent.color}30`, borderRadius:7, color:C.grayLight, fontSize:11.5, cursor:"pointer", textAlign:"left", lineHeight:1.3 }}>{p}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div key={i} style={{ display:"flex", justifyContent:isUser?"flex-end":"flex-start", alignItems:"flex-start", gap:10 }}>
              {!isUser && <div style={{ width:32, height:32, borderRadius:8, background:`${agent.color}25`, border:`1px solid ${agent.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{agent.icon}</div>}
              <div>
                <div style={{ maxWidth:500, padding:"11px 14px", borderRadius:isUser?"12px 4px 12px 12px":"4px 12px 12px 12px", background:isUser?`${C.gold}20`:C.navyLight, border:isUser?`1px solid ${C.gold}40`:`1px solid ${C.border}`, fontSize:13.5, lineHeight:1.65, color:C.white, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>{m.content}</div>
                <div style={{ fontSize:10, color:C.grayDark, marginTop:3, textAlign:isUser?"right":"left" }}>{isUser?"You":agent.name} · {m.time}</div>
              </div>
              {isUser && <div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg, ${C.gold}, #A07A2E)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0, fontWeight:700, color:C.navyDark }}>H</div>}
            </div>
          );
        })}
        {loading && (
          <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:`${agent.color}25`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{agent.icon}</div>
            <div style={{ padding:"14px 16px", background:C.navyLight, border:`1px solid ${C.border}`, borderRadius:"4px 12px 12px 12px", display:"flex", gap:5 }}>
              {[0,200,400].map(d => <div key={d} style={{ width:7, height:7, borderRadius:"50%", background:C.gray, animation:`bounce 1.2s ${d}ms infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ borderTop:`1px solid ${C.border}`, background:C.navyDark, padding:"14px 20px", flexShrink:0 }}>
        <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
          <textarea ref={taRef} value={input} onChange={handleChange} onKeyDown={handleKey} placeholder={`Ask ${agent.name} about your hotel...`} rows={1} disabled={loading} style={{ flex:1, background:C.navyLight, border:`1px solid ${C.border}`, borderRadius:10, padding:"11px 14px", color:C.white, fontSize:13.5, resize:"none", outline:"none", lineHeight:1.5, minHeight:44, maxHeight:140, fontFamily:"inherit" }} />
          <button onClick={() => send()} disabled={!input.trim() || loading} style={{ width:44, height:44, borderRadius:10, background:!input.trim()||loading?C.grayDark:agent.color, border:"none", cursor:!input.trim()||loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity:!input.trim()||loading?0.5:1 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div style={{ fontSize:11, color:C.grayDark, marginTop:8, textAlign:"center" }}>Press Enter to send · Shift+Enter for new line · Powered by Claude Sonnet 4</div>
      </div>
    </div>
  );
}

export default function HotelMind() {
  const [active, setActive] = useState(AGENTS[0]);

  return (
    <div style={{ display:"flex", height:"100vh", background:C.navy, fontFamily:"'Inter',-apple-system,sans-serif", color:C.white, overflow:"hidden" }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#1E3A5F;border-radius:3px}@keyframes bounce{0%,60%,100%{transform:translateY(0);opacity:0.4}30%{transform:translateY(-6px);opacity:1}}`}</style>

      {/* SIDEBAR */}
      <div style={{ width:240, minWidth:240, background:C.navyDark, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"20px 16px", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
            <div style={{ width:34, height:34, background:`linear-gradient(135deg,${C.gold},#A07A2E)`, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🏨</div>
            <span style={{ fontSize:18, fontWeight:700, background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>HotelMind AI</span>
          </div>
          <div style={{ fontSize:10, color:C.gold, opacity:0.75, fontWeight:500, letterSpacing:"0.8px" }}>AAHOA PARTNER PLATFORM</div>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"10px 8px" }}>
          <div style={{ fontSize:10, fontWeight:600, color:C.grayDark, letterSpacing:"1px", textTransform:"uppercase", padding:"4px 8px 8px" }}>AI Agents</div>
          {AGENTS.map(a => {
            const sel = active.id === a.id;
            return (
              <button key={a.id} onClick={() => setActive(a)} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 10px", borderRadius:8, border:"none", cursor:"pointer", marginBottom:3, background:sel?`${a.color}25`:"transparent", borderLeft:sel?`2px solid ${a.color}`:"2px solid transparent", textAlign:"left" }}>
                <div style={{ width:30, height:30, borderRadius:7, background:`${a.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>{a.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:sel?600:500, color:sel?C.white:C.grayLight, display:"block", marginBottom:1 }}>{a.name}</div>
                  <div style={{ fontSize:10, color:C.grayDark, display:"block", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{a.tagline}</div>
                </div>
                {sel && <div style={{ width:5, height:5, borderRadius:"50%", background:a.color, boxShadow:`0 0 4px ${a.color}`, flexShrink:0 }} />}
              </button>
            );
          })}
        </div>

        <div style={{ padding:"12px 16px", borderTop:`1px solid ${C.border}` }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:4, background:`${C.gold}15`, border:`1px solid ${C.gold}30`, borderRadius:5, padding:"2px 7px", fontSize:10, color:C.gold, fontWeight:500, marginBottom:8 }}>✦ Claude Sonnet 4</div>
          <div style={{ fontSize:10, color:C.grayDark, lineHeight:1.5 }}>HotelMind AI helps AAHOA's 20,000+ member hotel owners optimize operations, revenue & compliance.</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ background:C.navyMid, borderBottom:`1px solid ${C.border}`, padding:"16px 24px", display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:`linear-gradient(135deg,${active.color}50,${active.color}20)`, border:`1px solid ${active.color}50`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{active.icon}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:18, fontWeight:700, color:active.color, marginBottom:2 }}>{active.name}</div>
            <div style={{ fontSize:13, color:C.gray }}>{active.description}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:C.gray }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:active.color, boxShadow:`0 0 6px ${active.color}` }} />
            Online
          </div>
        </div>

        <div style={{ flex:1, overflow:"hidden" }}>
          <AgentChat key={active.id} agent={active} />
        </div>
      </div>
    </div>
  );
}