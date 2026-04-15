import { useState, useEffect, useRef, useCallback } from "react";

const API_STEPS = [
  { id: "01", label: "LOAD DATA" },
  { id: "02", label: "CLEAN" },
  { id: "03", label: "FEATURES" },
  { id: "04", label: "SPLIT" },
  { id: "05", label: "TRAIN" },
  { id: "06", label: "EVALUATE" },
  { id: "07", label: "VISUALIZE" },
];

function generateSalesData(days = 90) {
  const data = [];
  let base = 1100;
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    base += (Math.random() - 0.45) * 60;
    base = Math.max(900, Math.min(1600, base));
    data.push({ date: d, value: Math.round(base) });
  }
  return data;
}

function movingAverage(data, window) {
  return data.map((d, i) => {
    if (i < window - 1) return null;
    const slice = data.slice(i - window + 1, i + 1);
    return Math.round(slice.reduce((s, x) => s + x.value, 0) / window);
  });
}

function MiniLineChart({ data, lag, color1 = "#00e5ff", color2 = "#ff6b35", title }) {
  const W = 560, H = 180;
  const pad = { t: 20, r: 20, b: 30, l: 55 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;

  const vals = data.map((d) => d.value);
  const lagVals = lag ? data.map((d, i) => (i >= lag ? data[i - lag].value : null)) : null;
  const allVals = [...vals, ...(lagVals ? lagVals.filter(Boolean) : [])];
  const minV = Math.min(...allVals) - 50;
  const maxV = Math.max(...allVals) + 50;

  const xScale = (i) => pad.l + (i / (data.length - 1)) * cW;
  const yScale = (v) => pad.t + cH - ((v - minV) / (maxV - minV)) * cH;

  const path1 = vals
    .map((v, i) => `${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`)
    .join(" ");

  const path2 = lagVals
    ? lagVals
        .map((v, i) =>
          v !== null ? `${i === lag ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}` : ""
        )
        .join(" ")
    : null;

  const yTicks = [minV, minV + (maxV - minV) * 0.25, minV + (maxV - minV) * 0.5, minV + (maxV - minV) * 0.75, maxV];

  return (
    <div style={{ background: "#0d1117", borderRadius: 12, padding: "16px", marginBottom: 16, border: "1px solid #1e2530" }}>
      <div style={{ color: "#8892a4", fontSize: 11, fontFamily: "monospace", letterSpacing: 2, marginBottom: 8 }}>{title}</div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={yScale(v)} y2={yScale(v)} stroke="#1e2530" strokeWidth={1} />
            <text x={pad.l - 6} y={yScale(v) + 4} fill="#4a5568" fontSize={10} textAnchor="end" fontFamily="monospace">
              ${Math.round(v)}
            </text>
          </g>
        ))}
        {path2 && (
          <path d={path2} fill="none" stroke={color2} strokeWidth={2} strokeDasharray="5,4" opacity={0.85} />
        )}
        <path d={path1} fill="none" stroke={color1} strokeWidth={2} opacity={0.95} />
        {lag && (
          <g>
            <rect x={pad.l + 10} y={8} width={24} height={3} fill={color1} rx={1} />
            <text x={pad.l + 40} y={13} fill={color1} fontSize={10} fontFamily="monospace">Actual</text>
            <rect x={pad.l + 100} y={8} width={24} height={3} fill={color2} rx={1} strokeDasharray="4,3" stroke={color2} strokeWidth={1} />
            <text x={pad.l + 130} y={13} fill={color2} fontSize={10} fontFamily="monospace">Lag-{lag}</text>
          </g>
        )}
      </svg>
    </div>
  );
}

function MAChart({ data }) {
  const W = 560, H = 180;
  const pad = { t: 20, r: 20, b: 30, l: 55 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const ma7 = movingAverage(data, 7);
  const ma30 = movingAverage(data, 30);
  const allVals = [...ma7.filter(Boolean), ...ma30.filter(Boolean)];
  const minV = Math.min(...allVals) - 30;
  const maxV = Math.max(...allVals) + 30;
  const xScale = (i) => pad.l + (i / (data.length - 1)) * cW;
  const yScale = (v) => pad.t + cH - ((v - minV) / (maxV - minV)) * cH;
  const path7 = ma7.map((v, i) => (v !== null ? `${i === 6 ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}` : "")).join(" ");
  const path30 = ma30.map((v, i) => (v !== null ? `${i === 29 ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}` : "")).join(" ");
  const yTicks = [minV, minV + (maxV - minV) * 0.33, minV + (maxV - minV) * 0.66, maxV];
  return (
    <div style={{ background: "#0d1117", borderRadius: 12, padding: "16px", marginBottom: 16, border: "1px solid #1e2530" }}>
      <div style={{ color: "#8892a4", fontSize: 11, fontFamily: "monospace", letterSpacing: 2, marginBottom: 8 }}>7-DAY & 30-DAY MOVING AVERAGE</div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={yScale(v)} y2={yScale(v)} stroke="#1e2530" strokeWidth={1} />
            <text x={pad.l - 6} y={yScale(v) + 4} fill="#4a5568" fontSize={10} textAnchor="end" fontFamily="monospace">${Math.round(v)}</text>
          </g>
        ))}
        <path d={path7} fill="none" stroke="#00ff88" strokeWidth={2} />
        <path d={path30} fill="none" stroke="#a855f7" strokeWidth={2} />
        <rect x={pad.l + 10} y={8} width={24} height={3} fill="#00ff88" rx={1} />
        <text x={pad.l + 40} y={13} fill="#00ff88" fontSize={10} fontFamily="monospace">7-day MA</text>
        <rect x={pad.l + 120} y={8} width={24} height={3} fill="#a855f7" rx={1} />
        <text x={pad.l + 150} y={13} fill="#a855f7" fontSize={10} fontFamily="monospace">30-day MA</text>
      </svg>
    </div>
  );
}

function FeatureCard({ type, title, subtitle, color }) {
  const colors = { CALENDAR: "#00e5ff", LAG: "#ff6b35", ROLLING: "#a855f7" };
  const c = colors[type] || "#00e5ff";
  return (
    <div style={{
      background: "#0d1117", border: `1px solid ${c}22`, borderRadius: 10, padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: 4,
    }}>
      <span style={{ color: "#4a5568", fontSize: 9, fontFamily: "monospace", letterSpacing: 2 }}>{type}</span>
      <span style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 700, fontFamily: "monospace" }}>{title}</span>
      <span style={{ color: c, fontSize: 11, fontFamily: "monospace" }}>{subtitle}</span>
    </div>
  );
}

export default function SalesForecastAI() {
  const [activeStep, setActiveStep] = useState("03");
  const [now, setNow] = useState(new Date());
  const [salesData] = useState(() => generateSalesData(90));
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);

  // Live clock - every second
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const formatDate = (d) => {
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatTime = (d) => {
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    const s = d.getSeconds().toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const latestSales = salesData[salesData.length - 1]?.value ?? 0;
  const prev7 = salesData[salesData.length - 8]?.value ?? 0;
  const trend = latestSales - prev7;

  const callClaude = useCallback(async (userMsg, history) => {
    setAiLoading(true);
    setAiError("");
    try {
      const msgs = [
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: "user", content: userMsg },
      ];
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are SalesForecast AI, an expert time-series sales forecasting analyst. 
Current date/time: ${formatDate(now)} ${formatTime(now)}.
Latest sales value: $${latestSales}. 7-day trend: ${trend > 0 ? "+" : ""}${trend}.
Data range: 90 days. Features: LAG_7, LAG_14, LAG_30, ROLL_7_MEAN, ROLL_30_MEAN, ROLL_7_STD, DAY_OF_WEEK, MONTH, QUARTER, YEAR.
Respond concisely and insightfully. Use $ for currency. Be data-driven.`,
          messages: msgs,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const reply = data.content?.map((c) => c.text || "").join("\n") || "No response.";
      return reply;
    } catch (e) {
      setAiError("API Error: " + e.message);
      return null;
    } finally {
      setAiLoading(false);
    }
  }, [now, latestSales, trend]);

  const handleAutoAnalyze = async () => {
    const msg = `Analyze the current sales data. Latest: $${latestSales}, 7-day trend: ${trend > 0 ? "+" : ""}${trend}. Give a brief insight and forecast outlook.`;
    const reply = await callClaude(msg, []);
    if (reply) {
      setAiAnalysis(reply);
      setChatHistory([
        { role: "user", content: msg },
        { role: "assistant", content: reply },
      ]);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || aiLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    const newHistory = [...chatHistory, { role: "user", content: userMsg }];
    setChatHistory(newHistory);
    const reply = await callClaude(userMsg, chatHistory);
    if (reply) {
      setChatHistory([...newHistory, { role: "assistant", content: reply }]);
    }
  };

  const features = [
    { type: "CALENDAR", title: "DAY_OF_WEEK", subtitle: "0–6" },
    { type: "CALENDAR", title: "MONTH", subtitle: "1–12" },
    { type: "CALENDAR", title: "QUARTER", subtitle: "1–4" },
    { type: "CALENDAR", title: "YEAR", subtitle: "2020–2024" },
    { type: "LAG", title: "LAG_7", subtitle: "t-7 sales" },
    { type: "LAG", title: "LAG_14", subtitle: "t-14 sales" },
    { type: "LAG", title: "LAG_30", subtitle: "t-30 sales" },
    { type: "ROLLING", title: "ROLL_7_MEAN", subtitle: "7d avg" },
    { type: "ROLLING", title: "ROLL_30_MEAN", subtitle: "30d avg" },
    { type: "ROLLING", title: "ROLL_7_STD", subtitle: "7d σ" },
  ];

  return (
    <div style={{
      background: "#060b14", minHeight: "100vh", color: "#e2e8f0",
      fontFamily: "monospace", padding: "0 0 40px 0",
    }}>
      {/* Header */}
      <div style={{
        background: "#0a0f1a", borderBottom: "1px solid #1e2530", padding: "20px 24px",
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#1a3a5c,#0e4d6b)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
        }}>📊</div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 1, color: "#fff" }}>SalesForecast AI</div>
          <div style={{ fontSize: 10, color: "#4a5568", letterSpacing: 3 }}>TIME-SERIES FORECASTING SYSTEM</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ff88", boxShadow: "0 0 8px #00ff88" }} />
            <span style={{ fontSize: 10, color: "#00ff88", letterSpacing: 2 }}>SYSTEM ACTIVE</span>
          </div>
          {/* Live Date & Time */}
          <div style={{ color: "#00e5ff", fontSize: 13, fontWeight: 700, marginTop: 4 }}>
            {formatTime(now)}
          </div>
          <div style={{ color: "#4a5568", fontSize: 10, letterSpacing: 1 }}>
            {formatDate(now)}
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>
        {/* Step buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {API_STEPS.map((s) => (
            <button key={s.id} onClick={() => setActiveStep(s.id)} style={{
              background: activeStep === s.id ? "#00e5ff" : "#0d1117",
              color: activeStep === s.id ? "#060b14" : "#4a5568",
              border: `1px solid ${activeStep === s.id ? "#00e5ff" : "#1e2530"}`,
              borderRadius: 8, padding: "8px 14px", fontSize: 11, fontFamily: "monospace",
              letterSpacing: 2, cursor: "pointer", fontWeight: activeStep === s.id ? 800 : 400,
              transition: "all 0.2s",
            }}>
              {s.id} · {s.label}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "LATEST SALES", value: `$${latestSales}`, color: "#00e5ff" },
            { label: "7-DAY TREND", value: `${trend > 0 ? "▲" : "▼"} $${Math.abs(trend)}`, color: trend >= 0 ? "#00ff88" : "#ff4444" },
            { label: "DATA POINTS", value: salesData.length, color: "#a855f7" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "#0d1117", border: "1px solid #1e2530", borderRadius: 10, padding: "14px 16px",
            }}>
              <div style={{ color: "#4a5568", fontSize: 9, letterSpacing: 2 }}>{s.label}</div>
              <div style={{ color: s.color, fontSize: 20, fontWeight: 800, marginTop: 4 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Features section */}
        {activeStep === "03" && (
          <div style={{
            background: "#0a0f1a", border: "1px solid #1e2530", borderRadius: 14, padding: 20, marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: "#00e5ff22",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#00e5ff", fontSize: 13, fontWeight: 800,
              }}>03</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>Create Time-Based Features</div>
                <div style={{ color: "#4a5568", fontSize: 11 }}>Lag Features · Rolling Averages · Calendar</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {features.map((f) => <FeatureCard key={f.title} {...f} />)}
            </div>
          </div>
        )}

        {/* Charts */}
        <MiniLineChart data={salesData} lag={7} title="LAG-7 VS ACTUAL SALES" />
        <MAChart data={salesData} />

        {/* Feature Engineering Code */}
        <div style={{
          background: "#0d1117", border: "1px solid #1e2530", borderRadius: 12, padding: 16, marginBottom: 20,
          fontFamily: "monospace", fontSize: 12, lineHeight: 1.7, overflowX: "auto",
        }}>
          <div style={{ color: "#4a5568", marginBottom: 8, fontSize: 10, letterSpacing: 2 }}>
            # STEP 3: FEATURE ENGINEERING
          </div>
          {[
            ["comment", "# Step 3: Feature Engineering"],
            ["key", "df["], ["str", "'day_of_week'"], ["key", "] = df.index.dayofweek"],
            ["key", "df["], ["str", "'month'"], ["key", "] = df.index.month"],
            ["key", "df["], ["str", "'quarter'"], ["key", "] = df.index.quarter"],
            ["key", "df["], ["str", "'year'"], ["key", "] = df.index.year"],
            ["key", "df["], ["str", "'lag_7'"], ["key", "] = df["], ["str", "'sales'"], ["key", "].shift(7)"],
            ["key", "df["], ["str", "'lag_14'"], ["key", "] = df["], ["str", "'sales'"], ["key", "].shift(14)"],
            ["key", "df["], ["str", "'lag_30'"], ["key", "] = df["], ["str", "'sales'"], ["key", "].shift(30)"],
            ["key", "df["], ["str", "'roll_7'"], ["key", "] = df["], ["str", "'sales'"], ["key", "].rolling(7).mean()"],
            ["key", "df["], ["str", "'roll_30'"], ["key", "] = df["], ["str", "'sales'"], ["key", "].rolling(30).mean()"],
            ["key", "df["], ["str", "'roll_std'"], ["key", "] = df["], ["str", "'sales'"], ["key", "].rolling(7).std()"],
            ["fn", "df.dropna"], ["key", "(inplace="], ["bool", "True"], ["key", ")"],
          ].reduce((lines, token, i, arr) => {
            if (token[0] === "comment") lines.push(<div key={i}><span style={{ color: "#4a5568" }}>{token[1]}</span></div>);
            return lines;
          }, [])}
          <div>
            <span style={{ color: "#4a5568" }}># Step 3: Feature Engineering</span>
          </div>
          {["day_of_week","month","quarter","year"].map((f) => (
            <div key={f}>
              <span style={{ color: "#00e5ff" }}>df[</span>
              <span style={{ color: "#ff6b35" }}>'{f}'</span>
              <span style={{ color: "#00e5ff" }}>]</span>
              <span style={{ color: "#e2e8f0" }}> = df.index.{f}</span>
            </div>
          ))}
          {["lag_7 shift(7)","lag_14 shift(14)","lag_30 shift(30)"].map((s) => {
            const [name, fn] = s.split(" ");
            return (
              <div key={name}>
                <span style={{ color: "#00e5ff" }}>df[</span>
                <span style={{ color: "#ff6b35" }}>'{name}'</span>
                <span style={{ color: "#00e5ff" }}>]</span>
                <span style={{ color: "#e2e8f0" }}> = df[</span>
                <span style={{ color: "#ff6b35" }}>'sales'</span>
                <span style={{ color: "#e2e8f0" }}>].{fn}</span>
              </div>
            );
          })}
          {["roll_7 rolling(7).mean()","roll_30 rolling(30).mean()","roll_std rolling(7).std()"].map((s) => {
            const [name, fn] = s.split(" ");
            return (
              <div key={name}>
                <span style={{ color: "#00e5ff" }}>df[</span>
                <span style={{ color: "#ff6b35" }}>'{name}'</span>
                <span style={{ color: "#00e5ff" }}>]</span>
                <span style={{ color: "#e2e8f0" }}> = df[</span>
                <span style={{ color: "#ff6b35" }}>'sales'</span>
                <span style={{ color: "#e2e8f0" }}>].{fn}</span>
              </div>
            );
          })}
          <div>
            <span style={{ color: "#a855f7" }}>df.dropna</span>
            <span style={{ color: "#e2e8f0" }}>(inplace=</span>
            <span style={{ color: "#ff6b35" }}>True</span>
            <span style={{ color: "#e2e8f0" }}>)</span>
          </div>
        </div>

        {/* AI Analysis */}
        <div style={{
          background: "#0a0f1a", border: "1px solid #1e2530", borderRadius: 14, padding: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 800, letterSpacing: 2 }}>🤖 AI ANALYSIS</div>
            <button onClick={handleAutoAnalyze} disabled={aiLoading} style={{
              background: aiLoading ? "#1e2530" : "linear-gradient(135deg,#00e5ff22,#a855f722)",
              border: "1px solid #00e5ff44", color: aiLoading ? "#4a5568" : "#00e5ff",
              borderRadius: 8, padding: "8px 16px", fontSize: 11, fontFamily: "monospace",
              letterSpacing: 2, cursor: aiLoading ? "not-allowed" : "pointer",
            }}>
     
