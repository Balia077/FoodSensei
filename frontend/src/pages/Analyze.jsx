import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import api from "../api/api.js";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const GOALS = [
  { value: "general",     label: "General Health" },
  { value: "weight_loss", label: "Weight Loss"    },
  { value: "muscle_gain", label: "Muscle Gain"    },
];

const STATUS_CONFIG = {
  HEALTHY:   { color: "#3B6D11", bg: "#EAF3DE", border: "#C0DD97", label: "Healthy",   dot: "#639922" },
  MODERATE:  { color: "#854F0B", bg: "#FAEEDA", border: "#FAC775", label: "Moderate",  dot: "#BA7517" },
  UNHEALTHY: { color: "#A32D2D", bg: "#FCEBEB", border: "#F7C1C1", label: "Unhealthy", dot: "#E24B4A" },
};

const SOURCE_LABELS = {
  usda:                  "USDA FoodData",
  openfoodfacts_barcode: "Open Food Facts",
  openfoodfacts_search:  "Open Food Facts",
};

const SOURCE_COLORS = {
  usda:                  { bg: "#EEF2FF", color: "#4338CA", border: "#C7D2FE" },
  openfoodfacts_barcode: { bg: "#F0FDF4", color: "#166534", border: "#BBF7D0" },
  openfoodfacts_search:  { bg: "#F0FDF4", color: "#166534", border: "#BBF7D0" },
};

const NUTRISCORE_COLORS = {
  a: "#1a7a4a", b: "#56a832", c: "#d4c400", d: "#e67800", e: "#c41800",
};

const CHART_COLORS = ["#7F77DD","#378ADD","#BA7517","#E24B4A","#D85A30","#1D9E75"];

const NUTRI_MAXES = {
  calories: 600, protein: 50, carbs: 80,
  fat: 40, sugar: 30, fiber: 15, sodium: 800,
};

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────

function ScoreRing({ score, status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.MODERATE;
  const r = 46;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: 116, height: 116, flexShrink: 0 }}>
      <svg width="116" height="116" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="58" cy="58" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="58" cy="58" r={r} fill="none"
          stroke={cfg.dot} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
        <span style={{ fontSize: 30, fontWeight: 700, color: cfg.dot, lineHeight: 1, fontFamily: "'DM Mono', monospace" }}>
          {score}
        </span>
        <span style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.15em" }}>
          score
        </span>
      </div>
    </div>
  );
}

function NutriBar({ label, value, unit = "g", max, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {label}
        </span>
        <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "'DM Mono', monospace" }}>
          {value}{unit}
        </span>
      </div>
      <div style={{ height: 3, background: "#f3f4f6", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.MODERATE;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

function NutriscoreBadge({ grade }) {
  if (!grade || grade === "unknown") return null;
  const bg = NUTRISCORE_COLORS[grade.toLowerCase()] || "#6b7280";
  return (
    <span style={{ display: "inline-block", background: bg, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
      Nutri-Score {grade.toUpperCase()}
    </span>
  );
}

function SourceTag({ source }) {
  if (!source) return null;
  const style = SOURCE_COLORS[source] || { bg: "#f9fafb", color: "#9ca3af", border: "#e5e7eb" };
  return (
    <span style={{ display: "inline-block", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: style.color, background: style.bg, border: `1px solid ${style.border}`, padding: "2px 7px", borderRadius: 3, fontWeight: 600 }}>
      {SOURCE_LABELS[source] || source}
    </span>
  );
}

// ─── RESULT VIEW ──────────────────────────────────────────────────────────────

function ResultView({ result, onReset }) {
  const { nutrition = {} } = result;

  const chartData = [
    { name: "Calories", value: nutrition.calories || 0, color: CHART_COLORS[0] },
    { name: "Protein",  value: nutrition.protein  || 0, color: CHART_COLORS[1] },
    { name: "Carbs",    value: nutrition.carbs    || 0, color: CHART_COLORS[2] },
    { name: "Fat",      value: nutrition.fat      || 0, color: CHART_COLORS[3] },
    { name: "Sugar",    value: nutrition.sugar    || 0, color: CHART_COLORS[4] },
    { name: "Fiber",    value: nutrition.fiber    || 0, color: CHART_COLORS[5] },
  ];

  const nutriBars = [
    { label: "Calories", value: nutrition.calories || 0, unit: "kcal", max: NUTRI_MAXES.calories, color: CHART_COLORS[0] },
    { label: "Protein",  value: nutrition.protein  || 0, unit: "g",    max: NUTRI_MAXES.protein,  color: CHART_COLORS[1] },
    { label: "Carbs",    value: nutrition.carbs    || 0, unit: "g",    max: NUTRI_MAXES.carbs,    color: CHART_COLORS[2] },
    { label: "Fat",      value: nutrition.fat      || 0, unit: "g",    max: NUTRI_MAXES.fat,      color: CHART_COLORS[3] },
    { label: "Sugar",    value: nutrition.sugar    || 0, unit: "g",    max: NUTRI_MAXES.sugar,    color: CHART_COLORS[4] },
    { label: "Fiber",    value: nutrition.fiber    || 0, unit: "g",    max: NUTRI_MAXES.fiber,    color: CHART_COLORS[5] },
    { label: "Sodium",   value: nutrition.sodium   || 0, unit: "mg",   max: NUTRI_MAXES.sodium,   color: "#888780"       },
  ];

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      {/* Header card */}
      <div style={styles.card}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <ScoreRing score={result.score} status={result.status} />
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
              <StatusBadge status={result.status} />
              {result.nutriScore && <NutriscoreBadge grade={result.nutriScore} />}
              <SourceTag source={result.source} />
            </div>
            <h2 style={{ margin: "0 0 3px", fontSize: 20, fontWeight: 700, color: "#111827", letterSpacing: "0.02em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
              {result.foodName}
            </h2>
            {result.brand && (
              <p style={{ margin: "0 0 6px", fontSize: 12, color: "#9ca3af" }}>by {result.brand}</p>
            )}
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
              {result.reason}
            </p>
          </div>
        </div>
      </div>

      {/* Food image (OFF barcode results sometimes include one) */}
      {result.imageUrl && (
        <img
          src={result.imageUrl}
          alt={result.foodName}
          onError={(e) => { e.target.style.display = "none"; }}
          style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 12, marginBottom: 12, border: "1px solid #e5e7eb" }}
        />
      )}

      {/* Nutrition bars */}
      <div style={styles.card}>
        <p style={styles.sectionLabel}>Nutrition per 100g</p>
        {nutriBars.map((b) => (
          <NutriBar key={b.label} label={b.label} value={b.value} unit={b.unit} max={b.max} color={b.color} />
        ))}
      </div>

      {/* Chart */}
      <div style={styles.card}>
        <p style={styles.sectionLabel}>Macronutrient breakdown</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} barCategoryGap="32%">
            <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              labelStyle={{ color: "#374151", fontWeight: 600 }}
              itemStyle={{ color: "#6b7280" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ingredients */}
      {result.ingredients && (
        <div style={styles.card}>
          <p style={styles.sectionLabel}>Ingredients</p>
          <p style={{ margin: 0, fontSize: 12, color: "#9ca3af", lineHeight: 1.8 }}>
            {result.ingredients}
          </p>
        </div>
      )}

      <button
        onClick={onReset}
        style={styles.ghostBtn}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.borderColor = "#9ca3af"; e.currentTarget.style.color = "#374151"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#9ca3af"; }}
      >
        ← Analyze Another Food
      </button>
    </div>
  );
}

// ─── TAB: BARCODE ─────────────────────────────────────────────────────────────

function BarcodeTab({ goal, onResult, loading, setLoading }) {
  const [barcode, setBarcode] = useState("");
  const [error, setError]     = useState("");

  const submit = async () => {
    if (!barcode.trim()) return;
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("barcode", barcode.trim());
      fd.append("goal", goal);
      const res = await api.post("/food/analyze-image", fd);
      onResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Barcode lookup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || barcode.trim().length < 8;

  return (
    <div>
      <p style={styles.fieldHint}>Enter barcode number (8–14 digits)</p>
      <input
        type="text"
        inputMode="numeric"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value.replace(/\D/g, ""))}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="e.g. 8901058857846"
        maxLength={14}
        style={{ ...styles.input, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}
      />
      {error && <p style={styles.errorText}>{error}</p>}
      <button
        onClick={submit}
        disabled={isDisabled}
        style={{ ...styles.submitBtn, opacity: isDisabled ? 0.45 : 1, cursor: isDisabled ? "default" : "pointer" }}
      >
        {loading ? "Looking up…" : "Look Up Barcode"}
      </button>
    </div>
  );
}

// ─── TAB: TEXT SEARCH ─────────────────────────────────────────────────────────

function TextTab({ goal, onResult, loading, setLoading }) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    if (!query.trim()) return;
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("query", query.trim());
      fd.append("goal", goal);
      const res = await api.post("/food/analyze-image", fd);
      onResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed. Try a different food name.");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !query.trim();

  return (
    <div>
      <p style={styles.fieldHint}>Search by food or product name</p>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="e.g. Maggi noodles, dal"
        style={styles.input}
      />
      {error && <p style={styles.errorText}>{error}</p>}
      <button
        onClick={submit}
        disabled={isDisabled}
        style={{ ...styles.submitBtn, opacity: isDisabled ? 0.45 : 1, cursor: isDisabled ? "default" : "pointer" }}
      >
        {loading ? "Searching…" : "Search Food"}
      </button>
    </div>
  );
}

// ─── SHARED STYLES ────────────────────────────────────────────────────────────

const styles = {
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "18px 20px",
    marginBottom: 12,
  },
  sectionLabel: {
    margin: "0 0 12px",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    color: "#d1d5db",
    fontWeight: 600,
  },
  input: {
    width: "100%",
    padding: "11px 13px",
    boxSizing: "border-box",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    color: "#111827",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    transition: "border-color 0.15s",
  },
  submitBtn: {
    width: "100%",
    marginTop: 10,
    padding: "12px 0",
    background: "#111827",
    border: "1px solid #111827",
    borderRadius: 8,
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.15s",
    cursor: "pointer",
  },
  ghostBtn: {
    width: "100%",
    padding: "12px 0",
    background: "transparent",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.15s",
  },
  fieldHint: {
    margin: "0 0 10px",
    fontSize: 12,
    color: "#9ca3af",
    letterSpacing: "0.04em",
  },
  errorText: {
    margin: "8px 0 0",
    fontSize: 12,
    color: "#E24B4A",
    background: "#FCEBEB",
    border: "1px solid #F7C1C1",
    borderRadius: 6,
    padding: "7px 10px",
  },
};

// ─── TABS ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "barcode", label: "Barcode" },
  { id: "text",    label: "Search"  },
];

// ─── LOADING SPINNER ──────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div style={{ marginTop: 12, padding: "20px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12 }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid #e5e7eb", borderTopColor: "#374151", animation: "spin 0.7s linear infinite" }} />
      <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", letterSpacing: "0.15em", textTransform: "uppercase" }}>
        Analyzing nutrition data…
      </p>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Analyze() {
  const { user }           = useAuth();
  const [tab, setTab]      = useState("barcode");
  const [goal, setGoal]    = useState("general");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; background: #f9fafb; color: #111827; -webkit-font-smoothing: antialiased; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { border-color: #9ca3af !important; background: #fff !important; }
        input::placeholder { color: #d1d5db; }
        @media (max-width: 640px) {
          .analyze-container { width: 100% !important; }
          .analyze-page { padding: 20px 16px 48px !important; }
          .goal-group { flex-direction: column !important; }
        }
        @media (min-width: 641px) and (max-width: 900px) {
          .analyze-container { width: 90% !important; }
        }
      `}</style>

      <div
        className="analyze-page"
        style={{ minHeight: "91vh", background: "#EFF5F3", padding: "85px 20px 64px", fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="analyze-container" style={{ width: "56%", minWidth: 320, margin: "0 auto" }}>

          {/* Brand */}
          <div style={{ textAlign: "center", marginBottom: 32, animation: "fadeUp 0.35s ease" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#111827", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="#fff" strokeWidth="1.5"/>
                  <path d="M8 5v3l2 1.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
                Food Sensei
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "#9ca3af", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Know what you eat
            </p>
          </div>

          {!result ? (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              {/* Goal selector */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ margin: "0 0 8px", fontSize: 10, color: "#9ca3af", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
                  Your goal
                </p>
                <div className="goal-group" style={{ display: "flex", gap: 8 }}>
                  {GOALS.map((g) => {
                    const active = goal === g.value;
                    return (
                      <button
                        key={g.value}
                        onClick={() => setGoal(g.value)}
                        style={{
                          flex: 1, padding: "9px 10px",
                          background: active ? "#111827" : "#fff",
                          border: `1px solid ${active ? "#111827" : "#e5e7eb"}`,
                          borderRadius: 8, color: active ? "#fff" : "#6b7280",
                          fontSize: 13, fontWeight: active ? 600 : 400,
                          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                          transition: "all 0.15s", whiteSpace: "nowrap",
                        }}
                      >
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab panel */}
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
                  {TABS.map((t) => {
                    const active = tab === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        style={{
                          flex: 1, padding: "12px 0",
                          background: "none", border: "none",
                          borderBottom: active ? "2px solid #111827" : "2px solid transparent",
                          marginBottom: -1,
                          color: active ? "#111827" : "#9ca3af",
                          fontSize: 13, fontWeight: active ? 600 : 400,
                          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                          transition: "all 0.15s", letterSpacing: "0.03em",
                        }}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                <div style={{ padding: 20 }}>
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
              </div>

              {loading && <LoadingState />}
            </div>
          ) : (
            <ResultView result={result} onReset={() => setResult(null)} />
          )}

        </div>
      </div>
    </>
  );
}