import { useState, useRef } from "react";

const STEPS = [
  { id: "01", label: "LOAD DATA", key: "load" },
  { id: "02", label: "CLEAN", key: "clean" },
  { id: "03", label: "FEATURES", key: "features" },
  { id: "04", label: "SPLIT", key: "split" },
  { id: "05", label: "TRAIN", key: "train" },
  { id: "06", label: "EVALUATE", key: "evaluate" },
  { id: "07", label: "VISUALIZE", key: "visualize" },
];

const FEATURE_CARDS = [
  { type: "CALENDAR", name: "DAY_OF_WEEK", desc: "0тАУ6" },
  { type: "CALENDAR", name: "MONTH", desc: "1тАУ12" },
  { type: "CALENDAR", name: "QUARTER", desc: "1тАУ4" },
  { type: "CALENDAR", name: "YEAR", desc: "2020тАУ2024" },
  { type: "LAG", name: "LAG_7", desc: "t-7 sales" },
  { type: "LAG", name: "LAG_14", desc: "t-14 sales" },
  { type: "LAG", name: "LAG_30", desc: "t-30 sales" },
  { type: "ROLLING", name: "ROLL_7_MEAN", desc: "7d avg" },
  { type: "ROLLING", name: "ROLL_30_MEAN", desc: "30d avg" },
  { type: "ROLLING", name: "ROLL_7_STD", desc: "7d ╧Г" },
];

const typeColor = { CALENDAR: "#00e5ff", LAG: "#7c6aff", ROLLING: "#00ffb3" };

export default function App() {
  const [activeStep, setActiveStep] = useState("load");
  const [dataset, setDataset] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const completedSteps = dataset ? ["load"] : [];
  const isUnlocked = (key) => {
    if (key === "load") return true;
    if (!dataset) return false;
    const idx = STEPS.findIndex((s) => s.key === key);
    return idx <= 2; // for demo, only first 3 unlocked after upload
  };

  const handleFile = (file) => {
    setError("");
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls", "json"].includes(ext)) {
      setError("тЭМ Only CSV, Excel, or JSON files supported.");
      return;
    }
    setDataset({ name: file.name, size: (file.size / 1024).toFixed(1) + " KB", type: ext.toUpperCase() });
    setActiveStep("clean");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleStepClick = (key) => {
    if (!isUnlocked(key)) {
      setError("тЪая╕П Dataset upload рокрогрпНрогрпБроЩрпНроХ роорпБродро▓рпНро▓! Step 01 complete роЖроХрогрпБроорпН.");
      setActiveStep("load");
      return;
    }
    setError("");
    setActiveStep(key);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0d1117", color: "#e6edf3",
      fontFamily: "'Space Mono', 'Courier New', monospace", padding: "24px 16px"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 12,
          background: "linear-gradient(135deg,#1a3a5c,#0e2a47)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
        }}>ЁЯУК</div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>SalesForecast<span style={{ color: "#00e5ff" }}>AI</span></div>
          <div style={{ fontSize: 10, color: "#8b949e", letterSpacing: 3 }}>TIME-SERIES FORECASTING SYSTEM</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: dataset ? "#3fb950" : "#f0883e" }} />
          <span style={{ fontSize: 10, color: "#8b949e", letterSpacing: 2 }}>
            {dataset ? "SYSTEM ACTIVE" : "AWAITING DATA"}
          </span>
        </div>
      </div>

      {/* Warning Banner */}
      {!dataset && (
        <div style={{
          background: "linear-gradient(90deg,#2d1b00,#1a1000)",
          border: "1px solid #f0883e55", borderRadius: 8, padding: "10px 16px",
          marginBottom: 16, fontSize: 12, color: "#f0883e", letterSpacing: 1
        }}>
          тЪая╕П DATASET MISSING тАФ Step 01 ┬╖ LOAD DATA роорпБродро▓рпНро▓ complete рокрогрпНрогрпБроЩрпНроХ
        </div>
      )}

      {/* Step Nav */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {STEPS.map((s) => {
          const unlocked = isUnlocked(s.key);
          const active = activeStep === s.key;
          const done = completedSteps.includes(s.key);
          return (
            <button key={s.key} onClick={() => handleStepClick(s.key)} style={{
              padding: "8px 14px", borderRadius: 6, fontSize: 11, fontFamily: "inherit",
              letterSpacing: 1, cursor: unlocked ? "pointer" : "not-allowed",
              border: active ? "1.5px solid #00e5ff" : "1.5px solid #30363d",
              background: active ? "#00e5ff18" : done ? "#3fb95018" : "#161b22",
              color: active ? "#00e5ff" : done ? "#3fb950" : unlocked ? "#8b949e" : "#3d444d",
              transition: "all 0.2s"
            }}>
              {s.id} ┬╖ {s.label} {!unlocked && "ЁЯФТ"}
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: "#2d0f0f", border: "1px solid #f8514944", borderRadius: 8,
          padding: "10px 16px", marginBottom: 16, fontSize: 12, color: "#f85149"
        }}>{error}</div>
      )}

      {/* Step Content */}
      {activeStep === "load" && (
        <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: "#00e5ff22",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, color: "#00e5ff", fontWeight: 700
            }}>01</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Load Dataset</div>
              <div style={{ fontSize: 11, color: "#8b949e", letterSpacing: 2 }}>CSV ┬╖ EXCEL ┬╖ JSON</div>
            </div>
          </div>

          {dataset ? (
            <div style={{
              background: "#0d2818", border: "1px solid #3fb95055", borderRadius: 10,
              padding: 20, display: "flex", alignItems: "center", gap: 16
            }}>
              <div style={{ fontSize: 28 }}>тЬЕ</div>
              <div>
                <div style={{ color: "#3fb950", fontWeight: 700 }}>{dataset.name}</div>
                <div style={{ fontSize: 11, color: "#8b949e" }}>{dataset.size} ┬╖ {dataset.type}</div>
              </div>
              <button onClick={() => { setDataset(null); setActiveStep("load"); }} style={{
                marginLeft: "auto", padding: "6px 12px", borderRadius: 6, fontSize: 11,
                background: "transparent", border: "1px solid #f8514955", color: "#f85149",
                cursor: "pointer", fontFamily: "inherit"
              }}>REMOVE</button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current.click()}
              style={{
                border: `2px dashed ${dragging ? "#00e5ff" : "#30363d"}`,
                borderRadius: 10, padding: "40px 20px", textAlign: "center",
                cursor: "pointer", transition: "all 0.2s",
                background: dragging ? "#00e5ff08" : "transparent"
              }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>ЁЯУВ</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Dataset-я┐╜рпИ роЗроЩрпНроХ drop рокрогрпНрогрпБроЩрпНроХ</div>
              <div style={{ fontSize: 11, color: "#8b949e" }}>or click to browse ┬╖ CSV, Excel, JSON</div>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.json"
                onChange={(e) => handleFile(e.target.files[0])}
                style={{ display: "none" }} />
            </div>
          )}
        </div>
      )}

      {activeStep === "features" && dataset && (
        <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: "#00e5ff22",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, color: "#00e5ff", fontWeight: 700
            }}>03</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Create Time-Based Features</div>
              <div style={{ fontSize: 11, color: "#8b949e", letterSpacing: 1 }}>
                Lag Features ┬╖ Rolling Averages ┬╖ Calendar
              </div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "#3fb950", marginBottom: 20 }}>
            тЬЕ Dataset loaded: {dataset.name}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {FEATURE_CARDS.map((f, i) => (
              <div key={i} style={{
                background: "#0d1117", border: "1px solid #21262d",
                borderRadius: 8, padding: "14px 16px"
              }}>
                <div style={{ fontSize: 9, color: typeColor[f.type] || "#8b949e", letterSpacing: 2, marginBottom: 4 }}>
                  {f.type}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{f.name}</div>
                <div style={{ fontSize: 11, color: typeColor[f.type] || "#8b949e" }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeStep === "clean" && dataset && (
        <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: "#00e5ff22",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, color: "#00e5ff", fontWeight: 700
            }}>02</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Clean Data</div>
              <div style={{ fontSize: 11, color: "#8b949e", letterSpacing: 2 }}>NULL HANDLING ┬╖ OUTLIERS ┬╖ TYPES</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#8b949e" }}>
            Dataset "{dataset.name}" loaded. Cleaning pipeline ready...
          </div>
        </div>
      )}
    </div>
  );
}
              
