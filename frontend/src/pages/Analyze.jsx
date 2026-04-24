import { useState, useRef, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";

// ─── API ────────────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:3000/api";

async function apiPost(path, body, isFormData = false) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    body: isFormData ? body : JSON.stringify(body),
    headers: isFormData ? {} : { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const GOALS = [
  { value: "general", label: "General Health" },
  { value: "weight_loss", label: "Weight Loss" },
  { value: "muscle_gain", label: "Muscle Gain" },
];

const STATUS_CONFIG = {
  HEALTHY: { color: "#4ade80", bg: "#052e16", label: "Healthy", icon: "✦" },
  MODERATE: { color: "#fbbf24", bg: "#2d1b00", label: "Moderate", icon: "◈" },
  UNHEALTHY: { color: "#f87171", bg: "#2d0a0a", label: "Unhealthy", icon: "⬡" },
};

const SOURCE_LABELS = {
  logmeal: "LogMeal AI",
  edamam: "Edamam",
  openfoodfacts_barcode: "Open Food Facts (Barcode)",
  openfoodfacts_search: "Open Food Facts",
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function ScoreRing({ score, status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.MODERATE;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div
      style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}
    >
      <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#1a1a2e"
          strokeWidth="10"
        />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={cfg.color}
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: cfg.color,
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: 1,
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontSize: 10,
            color: "#666",
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          score
        </span>
      </div>
    </div>
  );
}

function NutriBar({ label, value, unit = "g", max, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: "#888",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 12,
            color: "#ccc",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
          {unit}
        </span>
      </div>
      <div
        style={{
          height: 4,
          background: "#1e1e2e",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 2,
            transition: "width 0.8s ease",
          }}
        />
      </div>
    </div>
  );
}

function NutriscoreBadge({ grade }) {
  if (!grade || grade === "unknown") return null;
  const colors = {
    a: "#1a7a4a",
    b: "#56a832",
    c: "#d4c400",
    d: "#e67800",
    e: "#c41800",
  };
  const bg = colors[grade.toLowerCase()] || "#444";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: bg,
        color: "#fff",
        fontSize: 11,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 3,
        textTransform: "uppercase",
        letterSpacing: 1,
      }}
    >
      Nutri-Score {grade.toUpperCase()}
    </span>
  );
}

function Tag({ children, color = "#334" }) {
  return (
    <span
      style={{
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: 1.5,
        color: "#aaa",
        background: color,
        padding: "3px 8px",
        borderRadius: 2,
      }}
    >
      {children}
    </span>
  );
}

function ResultView({ result, onReset }) {
  const { nutrition = {} } = result;
  const cfg = STATUS_CONFIG[result.status] || STATUS_CONFIG.MODERATE;

  const chartData = [
    {
      name: "Calories",
      value: nutrition.calories || 0,
      max: 600,
      color: "#e879f9",
    },
    {
      name: "Protein",
      value: nutrition.protein || 0,
      max: 50,
      color: "#60a5fa",
    },
    { name: "Carbs", value: nutrition.carbs || 0, max: 80, color: "#fbbf24" },
    { name: "Fat", value: nutrition.fat || 0, max: 40, color: "#f87171" },
    { name: "Sugar", value: nutrition.sugar || 0, max: 30, color: "#fb923c" },
    { name: "Fiber", value: nutrition.fiber || 0, max: 15, color: "#4ade80" },
    {
      name: "Sodium",
      value: nutrition.sodium || 0,
      max: 800,
      color: "#94a3b8",
      unit: "mg",
    },
  ];

  return (
    <div style={{ animation: "fadeUp 0.5s ease" }}>
      {/* Header card */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)",
          border: `1px solid ${cfg.color}33`,
          borderRadius: 16,
          padding: 24,
          marginBottom: 16,
          display: "flex",
          gap: 24,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <ScoreRing score={result.score} status={result.status} />
        <div style={{ flex: 1, minWidth: 180 }}>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                background: cfg.bg,
                color: cfg.color,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
                padding: "3px 10px",
                borderRadius: 3,
                textTransform: "uppercase",
              }}
            >
              {cfg.icon} {cfg.label}
            </span>
            {result.nutriScore && <NutriscoreBadge grade={result.nutriScore} />}
            {result.source && (
              <Tag>{SOURCE_LABELS[result.source] || result.source}</Tag>
            )}
          </div>
          <h2
            style={{
              margin: "0 0 4px",
              fontSize: 22,
              fontWeight: 800,
              color: "#f0f0f0",
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            {result.foodName}
          </h2>
          {result.brand && (
            <p style={{ margin: "0 0 6px", fontSize: 12, color: "#666" }}>
              by {result.brand}
            </p>
          )}
          <p
            style={{ margin: 0, fontSize: 13, color: "#999", lineHeight: 1.5 }}
          >
            {result.reason}
          </p>
        </div>
      </div>

      {result.imageUrl && (
        <img
          src={result.imageUrl}
          alt={result.foodName}
          style={{
            width: "100%",
            maxHeight: 220,
            objectFit: "cover",
            borderRadius: 12,
            marginBottom: 16,
            border: "1px solid #1a1a2e",
          }}
        />
      )}

      {/* Warning */}
      {result.warning && (
        <div
          style={{
            background: "#1a1500",
            border: "1px solid #fbbf2440",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 16,
            fontSize: 13,
            color: "#fbbf24",
          }}
        >
          ⚠ {result.warning}
        </div>
      )}

      {/* Alternative detections */}
      {result.alternativeDetections?.length > 0 && (
        <div
          style={{
            background: "#0f0f1a",
            border: "1px solid #ffffff0d",
            borderRadius: 8,
            padding: 14,
            marginBottom: 16,
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 2,
              color: "#555",
            }}
          >
            Alternative Detections
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {result.alternativeDetections.map((d, i) => (
              <span
                key={i}
                style={{
                  fontSize: 12,
                  color: "#aaa",
                  background: "#1a1a2e",
                  padding: "4px 10px",
                  borderRadius: 20,
                }}
              >
                {d.name} <span style={{ color: "#555" }}>{d.confidence}%</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Nutrition bars */}
      <div
        style={{
          background: "#0f0f1a",
          border: "1px solid #ffffff0d",
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <p
          style={{
            margin: "0 0 14px",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: 2,
            color: "#555",
          }}
        >
          Nutrition per 100g
        </p>
        {chartData.map((d) => (
          <NutriBar
            key={d.name}
            label={d.name}
            value={d.value}
            unit={d.unit || "g"}
            max={d.max}
            color={d.color}
          />
        ))}
      </div>

      {/* Chart */}
      <div
        style={{
          background: "#0f0f1a",
          border: "1px solid #ffffff0d",
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <p
          style={{
            margin: "0 0 14px",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: 2,
            color: "#555",
          }}
        >
          Breakdown
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData.slice(0, 6)} barCategoryGap="30%">
            <XAxis
              dataKey="name"
              tick={{ fill: "#555", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: "#1a1a2e",
                border: "1px solid #333",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#aaa" }}
              itemStyle={{ color: "#fff" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.slice(0, 6).map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ingredients */}
      {result.ingredients && (
        <div
          style={{
            background: "#0f0f1a",
            border: "1px solid #ffffff0d",
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 2,
              color: "#555",
            }}
          >
            Ingredients
          </p>
          <p
            style={{ margin: 0, fontSize: 12, color: "#777", lineHeight: 1.7 }}
          >
            {result.ingredients}
          </p>
        </div>
      )}

      {/* Detection confidence */}
      {result.detectionConfidence != null && (
        <p
          style={{
            fontSize: 11,
            color: "#444",
            textAlign: "right",
            margin: "0 0 16px",
          }}
        >
          Image detection confidence: {result.detectionConfidence}%
        </p>
      )}

      <button
        onClick={onReset}
        style={{
          width: "100%",
          padding: "13px 0",
          background: "transparent",
          border: "1px solid #333",
          borderRadius: 8,
          color: "#666",
          fontSize: 13,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = "#555";
          e.target.style.color = "#aaa";
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = "#333";
          e.target.style.color = "#666";
        }}
      >
        ← Analyze Another Food
      </button>
    </div>
  );
}

// ─── TAB: IMAGE ───────────────────────────────────────────────────────────────
// function ImageTab({ goal, onResult, loading, setLoading }) {
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [dragging, setDragging] = useState(false);
//   const inputRef = useRef();

//   const pickFile = (f) => {
//     if (!f) return;
//     setFile(f);
//     setPreview(URL.createObjectURL(f));
//   };

//   const handleDrop = (e) => {
//     e.preventDefault(); setDragging(false);
//     pickFile(e.dataTransfer.files[0]);
//   };

//   const submit = async () => {
//     if (!file) return;
//     setLoading(true);
//     try {
//       const fd = new FormData();
//       fd.append("image", file);
//       fd.append("userId", "123");
//       fd.append("goal", goal);
//       const data = await apiPost("/food/analyze-image", fd, true);
//       onResult(data);
//     } catch (err) {
//       alert(err.message || "Analysis failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <div
//         onClick={() => inputRef.current.click()}
//         onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
//         onDragLeave={() => setDragging(false)}
//         onDrop={handleDrop}
//         style={{
//           border: `1.5px dashed ${dragging ? "#60a5fa" : preview ? "#333" : "#2a2a3e"}`,
//           borderRadius: 12, minHeight: 200,
//           display: "flex", flexDirection: "column",
//           alignItems: "center", justifyContent: "center",
//           cursor: "pointer", background: dragging ? "#0a1628" : "#0a0a14",
//           overflow: "hidden", transition: "all 0.2s",
//           position: "relative",
//         }}>
//         {preview ? (
//           <img src={preview} alt="preview" style={{
//             width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 10,
//           }} />
//         ) : (
//           <>
//             <div style={{ fontSize: 36, marginBottom: 8, opacity: 0.3 }}>⬆</div>
//             <p style={{ margin: 0, fontSize: 13, color: "#444" }}>
//               {dragging ? "Drop it!" : "Click or drag a food photo here"}
//             </p>
//           </>
//         )}
//         <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
//           onChange={e => pickFile(e.target.files[0])} />
//       </div>

//       {file && (
//         <button onClick={submit} disabled={loading} style={{
//           width: "100%", marginTop: 12, padding: "13px 0",
//           background: loading ? "#1a1a2e" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
//           border: "none", borderRadius: 8, color: loading ? "#555" : "#fff",
//           fontSize: 13, fontWeight: 700, letterSpacing: 2,
//           textTransform: "uppercase", cursor: loading ? "default" : "pointer",
//           transition: "all 0.2s",
//         }}>
//           {loading ? "Analyzing…" : "Analyze Image"}
//         </button>
//       )}
//     </div>
//   );
// }

// ─── TAB: BARCODE ─────────────────────────────────────────────────────────────
function BarcodeTab({ goal, onResult, loading, setLoading }) {
  const [barcode, setBarcode] = useState("");

  const submit = async () => {
    if (!barcode.trim()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("barcode", barcode.trim());
      fd.append("userId", "123");
      fd.append("goal", goal);
      const data = await apiPost("/food/analyze-image", fd, true);
      onResult(data);
    } catch (err) {
      alert(err.message || "Barcode lookup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p
        style={{
          margin: "0 0 12px",
          fontSize: 12,
          color: "#555",
          letterSpacing: 1,
        }}
      >
        Enter barcode number (8–14 digits)
      </p>
      <input
        type="text"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="e.g. 8901058857846"
        style={{
          width: "100%",
          padding: "12px 14px",
          boxSizing: "border-box",
          background: "#0a0a14",
          border: "1px solid #1e1e2e",
          borderRadius: 8,
          color: "#eee",
          fontSize: 15,
          fontFamily: "monospace",
          letterSpacing: 2,
          outline: "none",
        }}
      />
      <button
        onClick={submit}
        disabled={loading || !barcode.trim()}
        style={{
          width: "100%",
          marginTop: 12,
          padding: "13px 0",
          background:
            loading || !barcode.trim()
              ? "#1a1a2e"
              : "linear-gradient(135deg, #06b6d4, #3b82f6)",
          border: "none",
          borderRadius: 8,
          color: loading || !barcode.trim() ? "#555" : "#fff",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          cursor: loading || !barcode.trim() ? "default" : "pointer",
          transition: "all 0.2s",
        }}
      >
        {loading ? "Looking up…" : "Look Up Barcode"}
      </button>
    </div>
  );
}

// ─── TAB: TEXT ────────────────────────────────────────────────────────────────
function TextTab({ goal, onResult, loading, setLoading }) {
  const [query, setQuery] = useState("");

  const submit = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("query", query.trim());
      fd.append("userId", "123");
      fd.append("goal", goal);
      const data = await apiPost("/food/analyze-image", fd, true);
      onResult(data);
    } catch (err) {
      alert(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p
        style={{
          margin: "0 0 12px",
          fontSize: 12,
          color: "#555",
          letterSpacing: 1,
        }}
      >
        Search by food or product name
      </p>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="e.g. Maggi noodles, apple, chicken breast"
        style={{
          width: "100%",
          padding: "12px 14px",
          boxSizing: "border-box",
          background: "#0a0a14",
          border: "1px solid #1e1e2e",
          borderRadius: 8,
          color: "#eee",
          fontSize: 14,
          outline: "none",
        }}
      />
      <button
        onClick={submit}
        disabled={loading || !query.trim()}
        style={{
          width: "100%",
          marginTop: 12,
          padding: "13px 0",
          background:
            loading || !query.trim()
              ? "#1a1a2e"
              : "linear-gradient(135deg, #10b981, #059669)",
          border: "none",
          borderRadius: 8,
          color: loading || !query.trim() ? "#555" : "#fff",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          cursor: loading || !query.trim() ? "default" : "pointer",
          transition: "all 0.2s",
        }}
      >
        {loading ? "Searching…" : "Search Food"}
      </button>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const TABS = [
  // { id: "image",   label: "📷 Image",   color: "#8b5cf6" },
  { id: "barcode", label: "⬡ Barcode (Recommended)", color: "#06b6d4" },
  { id: "text", label: "🔤 Search", color: "#10b981" },
];

export default function Analyze() {
  const [tab, setTab] = useState("barcode");
  const [goal, setGoal] = useState("general");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const activeTab = TABS.find((t) => t.id === tab);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #EFF5F3; color: #000; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a14; }
        ::-webkit-scrollbar-thumb { background: #2a2a3e; border-radius: 2px; }
      `}</style>

      <div style={{ minHeight: "91vh", padding: "24px 16px 48px" }}>
        <div style={{ width: "60%", margin: "0 auto" }}>
          {/* Logo */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 28,
              animation: "fadeUp 0.4s ease",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: 42,
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: 5,
                textTransform: "uppercase",
                background:
                  "linear-gradient(135deg, #e879f9, #818cf8, #60a5fa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Food Sensei
            </h1>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 12,
                color: "#333",
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              Know what you eat
            </p>
          </div>

          {!result ? (
            <div style={{ animation: "fadeUp 0.45s ease" }}>
              {/* Goal selector */}
              <div style={{ marginBottom: 15 }}>
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: 20,
                    color: "#444",
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  }}
                >
                  Your Goal
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  {GOALS.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => setGoal(g.value)}
                      style={{
                        flex: 1,
                        padding: "8px 0",
                        background:
                          goal === g.value ? "#1a1a2e" : "transparent",
                        border: `1px solid ${goal === g.value ? "#333" : "#1a1a2e"}`,
                        borderRadius: 6,
                        color: goal === g.value ? "#aaa" : "#444",
                        fontSize: 15,
                        cursor: "pointer",
                        letterSpacing: 0.5,
                        transition: "all 0.15s",
                      }}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: 0,
                  marginBottom: 0,
                  background: "#0a0a14",
                  border: "1px solid #1a1a2e",
                  borderBottom: "none",
                  borderRadius: "10px 10px 0 0",
                  overflow: "hidden",
                }}
              >
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    style={{
                      flex: 1,
                      padding: "11px 0",
                      background: tab === t.id ? "#000" : "transparent",
                      border: "none",
                      borderBottom:
                        tab === t.id
                          ? `2px solid ${t.color}`
                          : "2px solid transparent",
                      color: tab === t.id ? "#fff" : "#999",
                      fontSize: 15,
                      fontWeight: tab === t.id ? 700 : 400,
                      cursor: "pointer",
                      letterSpacing: 0.5,
                      transition: "all 0.15s",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Panel */}
              <div
                style={{
                  background: "#0f0f1a",
                  border: "1px solid #1a1a2e",
                  borderTop: `2px solid ${activeTab.color}22`,
                  borderRadius: "0 0 10px 10px",
                  padding: 20,
                }}
              >
                {tab === "barcode" && (
                  <BarcodeTab
                    goal={goal}
                    onResult={setResult}
                    loading={loading}
                    setLoading={setLoading}
                  />
                )}
                {tab === "text" && (
                  <TextTab
                    goal={goal}
                    onResult={setResult}
                    loading={loading}
                    setLoading={setLoading}
                  />
                )}
              </div>

              {/* Loading state */}
              {loading && (
                <div
                  style={{
                    marginTop: 20,
                    padding: 16,
                    textAlign: "center",
                    background: "#0a0a14",
                    border: "1px solid #1a1a2e",
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border: "2px solid #1a1a2e",
                      borderTop: `2px solid ${activeTab.color}`,
                      animation: "spin 0.8s linear infinite",
                      margin: "0 auto 8px",
                    }}
                  />
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: "#444",
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                    }}
                  >
                    Analyzing nutrition data…
                  </p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                </div>
              )}
            </div>
          ) : (
            <ResultView result={result} onReset={() => setResult(null)} />
          )}
        </div>
      </div>
    </>
  );
}
