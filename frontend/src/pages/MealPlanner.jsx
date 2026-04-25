import { useState, useRef } from "react";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext";

/* ─── Global styles ─────────────────────────────────────────────────────────── */
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --green:       #00e676;
    --green-dim:   rgba(0,230,118,0.12);
    --green-glow:  rgba(0,230,118,0.25);
    --amber:       #ffb300;
    --amber-dim:   rgba(255,179,0,0.12);
    --violet:      #7c6dfa;
    --violet-dim:  rgba(124,109,250,0.12);
    --rose:        #ff5f7e;
    --rose-dim:    rgba(255,95,126,0.12);
    --surface-0:   #080b10;
    --surface-1:   #0d1117;
    --surface-2:   #141921;
    --surface-3:   #1c2333;
    --border:      rgba(255,255,255,0.07);
    --border-hover:rgba(255,255,255,0.14);
    --text-1:      #f0f4ff;
    --text-2:      #8b95a8;
    --text-3:      #4a5568;
    --radius-sm:   10px;
    --radius-md:   16px;
    --radius-lg:   24px;
    --radius-xl:   32px;
    --font-main:   'Poppins', sans-serif;
    --font-alt:    'Plus Jakarta Sans', sans-serif;
    --shadow-card: 0 4px 32px rgba(0,0,0,0.4);
    --shadow-glow: 0 0 40px rgba(0,230,118,0.15);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.6; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-6px); }
  }
  @keyframes orbMove {
    0%   { transform: translate(0, 0) scale(1); }
    33%  { transform: translate(30px, -20px) scale(1.05); }
    66%  { transform: translate(-20px, 15px) scale(0.97); }
    100% { transform: translate(0, 0) scale(1); }
  }

  /* ── Page wrapper ── */
  .mp-page {
    min-height: 90vh;
    background: var(--surface-0);
    font-family: var(--font-main);
    color: var(--text-1);
    overflow-x: hidden;
    position: relative;
  }

  /* ── Background orbs ── */
  .mp-orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    z-index: 0;
    animation: orbMove 18s ease-in-out infinite;
  }
  .mp-orb-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(0,230,118,0.08) 0%, transparent 70%);
    top: -120px; left: -120px;
    animation-delay: 0s;
  }
  .mp-orb-2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(124,109,250,0.07) 0%, transparent 70%);
    top: 40%; right: -100px;
    animation-delay: -6s;
  }
  .mp-orb-3 {
    width: 350px; height: 350px;
    background: radial-gradient(circle, rgba(255,179,0,0.05) 0%, transparent 70%);
    bottom: 10%; left: 20%;
    animation-delay: -12s;
  }

  /* ── Content container ── */
  .mp-container {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 48px 20px 80px;
  }
  @media (max-width: 768px) {
    .mp-container { padding: 32px 16px 60px; }
  }

  /* ── Hero header ── */
  .mp-hero {
    text-align: center;
    margin-bottom: 52px;
    animation: fadeUp 0.6s ease both;
  }
  .mp-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--green-dim);
    border: 1px solid rgba(0,230,118,0.25);
    border-radius: 999px;
    padding: 6px 18px;
    font-size: 12px;
    font-weight: 600;
    color: var(--green);
    letter-spacing: 0.5px;
    margin-bottom: 24px;
    text-transform: uppercase;
  }
  .mp-hero-title {
    font-family: var(--font-main);
    font-size: clamp(32px, 6vw, 58px);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -1.5px;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #f0f4ff 0%, #8b95a8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .mp-hero-title span {
    background: linear-gradient(135deg, var(--green) 0%, #00b96b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .mp-hero-sub {
    font-size: clamp(13px, 2vw, 15px);
    color: var(--text-2);
    line-height: 1.7;
    max-width: 520px;
    margin: 0 auto;
    font-weight: 400;
  }

  /* ── Stats pills ── */
  .mp-stats {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 28px;
  }
  .mp-stat-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 7px 16px;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-2);
  }
  .mp-stat-pill .dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--green);
    animation: pulse 2s ease-in-out infinite;
  }

  /* ── Form card ── */
  .mp-form-card {
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    padding: 36px 40px;
    max-width: 700px;
    margin: 0 auto 48px;
    box-shadow: var(--shadow-card);
    animation: fadeUp 0.6s ease 0.1s both;
    backdrop-filter: blur(10px);
  }
  @media (max-width: 600px) {
    .mp-form-card { padding: 24px 20px; border-radius: var(--radius-lg); }
  }

  .mp-form-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    color: var(--text-3);
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  /* ── Budget row ── */
  .mp-budget-row {
    display: flex;
    gap: 10px;
    align-items: stretch;
  }
  @media (max-width: 420px) {
    .mp-budget-row { flex-direction: column; }
  }

  .mp-currency-select {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    color: var(--text-1);
    font-family: var(--font-main);
    font-size: 14px;
    font-weight: 600;
    padding: 0 20px;
    cursor: pointer;
    outline: none;
    min-width: 100px;
    transition: border-color 0.2s, background 0.2s;
    appearance: none;
    -webkit-appearance: none;
    text-align: center;
  }
  .mp-currency-select:focus {
    border-color: rgba(0,230,118,0.4);
    background: rgba(0,230,118,0.04);
  }
  @media (max-width: 420px) {
    .mp-currency-select { padding: 14px 20px; min-width: unset; }
  }

  .mp-budget-input {
    flex: 1;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    color: var(--text-1);
    font-family: var(--font-main);
    font-size: 28px;
    font-weight: 700;
    padding: 16px 22px;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    width: 100%;
  }
  .mp-budget-input::placeholder { color: var(--text-3); font-size: 20px; font-weight: 400; }
  .mp-budget-input:focus {
    border-color: rgba(0,230,118,0.4);
    background: rgba(0,230,118,0.03);
    box-shadow: 0 0 0 3px rgba(0,230,118,0.08);
  }
  .mp-budget-input::-webkit-outer-spin-button,
  .mp-budget-input::-webkit-inner-spin-button { -webkit-appearance: none; }

  .mp-divider {
    height: 1px;
    background: var(--border);
    margin: 28px 0;
  }

  /* ── Diet chips ── */
  .mp-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .mp-chip {
    padding: 8px 18px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text-2);
    font-family: var(--font-main);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s ease;
    letter-spacing: 0.2px;
    user-select: none;
  }
  .mp-chip:hover { border-color: var(--border-hover); color: var(--text-1); }
  .mp-chip.active {
    background: var(--green-dim);
    border-color: rgba(0,230,118,0.35);
    color: var(--green);
  }

  /* ── Generate button ── */
  .mp-btn {
    width: 100%;
    margin-top: 28px;
    padding: 18px;
    border-radius: var(--radius-md);
    border: none;
    background: linear-gradient(135deg, #00e676 0%, #00c853 100%);
    color: #050e09;
    font-family: var(--font-main);
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    letter-spacing: 0.3px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .mp-btn:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0,230,118,0.3);
  }
  .mp-btn:active:not(:disabled) { transform: translateY(0); }
  .mp-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

  /* ── Spinner ── */
  .mp-spinner {
    width: 18px; height: 18px;
    border: 2.5px solid rgba(5,14,9,0.3);
    border-top-color: #050e09;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  /* ── Error ── */
  .mp-error {
    max-width: 700px;
    margin: 0 auto 28px;
    background: rgba(255,95,126,0.08);
    border: 1px solid rgba(255,95,126,0.2);
    border-radius: var(--radius-md);
    padding: 14px 20px;
    font-size: 13px;
    font-weight: 500;
    color: var(--rose);
    animation: fadeUp 0.3s ease both;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  /* ── Summary strip ── */
  .mp-summary {
    max-width: 700px;
    margin: 0 auto 40px;
    background: var(--surface-1);
    border: 1px solid rgba(0,230,118,0.15);
    border-radius: var(--radius-lg);
    padding: 0;
    overflow: hidden;
    animation: fadeUp 0.4s ease both;
    box-shadow: var(--shadow-glow);
  }
  .mp-summary-top {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    border-bottom: 1px solid var(--border);
  }
  @media (max-width: 600px) {
    .mp-summary-top { grid-template-columns: repeat(3, 1fr); }
    .mp-summary-top .sum-hide { display: none; }
  }
  @media (max-width: 380px) {
    .mp-summary-top { grid-template-columns: repeat(2, 1fr); }
  }
  .mp-sum-cell {
    padding: 20px 16px;
    text-align: center;
    border-right: 1px solid var(--border);
  }
  .mp-sum-cell:last-child { border-right: none; }
  .mp-sum-val {
    font-family: var(--font-main);
    font-size: 20px;
    font-weight: 800;
    color: var(--green);
    display: block;
    letter-spacing: -0.5px;
  }
  .mp-sum-lbl {
    font-size: 10px;
    font-weight: 600;
    color: var(--text-3);
    text-transform: uppercase;
    letter-spacing: 0.7px;
    margin-top: 3px;
    display: block;
  }
  .mp-summary-tip {
    padding: 14px 24px;
    font-size: 12.5px;
    color: var(--text-2);
    line-height: 1.55;
    font-weight: 400;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* ── Meals section label ── */
  .mp-section-label {
    text-align: center;
    margin-bottom: 28px;
    animation: fadeIn 0.4s ease both;
  }
  .mp-section-label h2 {
    font-size: 22px;
    font-weight: 700;
    color: var(--text-1);
    letter-spacing: -0.3px;
  }
  .mp-section-label p {
    font-size: 13px;
    color: var(--text-2);
    margin-top: 4px;
  }

  /* ── Meals grid ── */
  .mp-grid {
    display: grid;
    gap: 18px;
    grid-template-columns: repeat(2, 1fr);
    max-width: 1100px;
    margin: 0 auto;
  }
  @media (max-width: 900px) {
    .mp-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 600px) {
    .mp-grid { grid-template-columns: 1fr; }
  }

  /* ── Meal card ── */
  .mp-card {
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    animation: fadeUp 0.4s ease both;
    display: flex;
    flex-direction: column;
  }
  .mp-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 24px 56px rgba(0,0,0,0.5);
    border-color: var(--border-hover);
  }

  /* card accent top bar */
  .mp-card-accent {
    height: 3px;
    width: 100%;
  }

  .mp-card-head {
    padding: 22px 22px 16px;
  }
  .mp-card-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 999px;
    margin-bottom: 12px;
  }
  .mp-card-name {
    font-family: var(--font-main);
    font-size: 17px;
    font-weight: 700;
    color: var(--text-1);
    line-height: 1.25;
    margin-bottom: 6px;
    letter-spacing: -0.2px;
  }
  .mp-card-desc {
    font-size: 12px;
    color: var(--text-2);
    line-height: 1.6;
    font-weight: 400;
  }

  /* ── Nutrition grid ── */
  .mp-nutr-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .mp-nutr-cell {
    padding: 14px 10px;
    text-align: center;
    border-right: 1px solid var(--border);
    transition: background 0.2s;
  }
  .mp-nutr-cell:last-child { border-right: none; }
  .mp-nutr-cell:hover { background: var(--surface-2); }
  .mp-nutr-val {
    font-family: var(--font-main);
    font-size: 15px;
    font-weight: 700;
    color: var(--text-1);
    display: block;
    letter-spacing: -0.3px;
  }
  .mp-nutr-lbl {
    font-size: 9px;
    font-weight: 700;
    color: var(--text-3);
    text-transform: uppercase;
    letter-spacing: 0.7px;
    margin-top: 2px;
    display: block;
  }

  /* ── Card footer ── */
  .mp-card-footer {
    padding: 14px 22px 18px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-top: auto;
  }
  .mp-cost-wrap {}
  .mp-cost {
    font-family: var(--font-main);
    font-size: 22px;
    font-weight: 800;
    color: var(--green);
    letter-spacing: -0.5px;
  }
  .mp-cost-lbl {
    font-size: 10px;
    color: var(--text-3);
    margin-top: 1px;
    font-weight: 500;
  }
  .mp-ings {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    justify-content: flex-end;
    flex: 1;
  }
  .mp-ing-chip {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 3px 9px;
    font-size: 10px;
    font-weight: 500;
    color: var(--text-2);
  }

  /* ── Health benefit strip ── */
  .mp-benefit {
    margin: 0 22px 18px;
    padding: 10px 14px;
    border-radius: var(--radius-sm);
    font-size: 11.5px;
    color: var(--text-2);
    line-height: 1.5;
    font-weight: 400;
    border-left: 2px solid;
    background: var(--surface-2);
  }

  /* ── Micronutrients section ── */
  .mp-micros {
    max-width: 1100px;
    margin: 24px auto 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 14px;
  }
  @media (max-width: 600px) {
    .mp-micros { grid-template-columns: 1fr; }
  }
  .mp-micro-card {
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 16px 18px;
    animation: fadeUp 0.4s ease both;
  }
  .mp-micro-title {
    font-size: 10px;
    font-weight: 700;
    color: var(--text-3);
    text-transform: uppercase;
    letter-spacing: 0.7px;
    margin-bottom: 10px;
  }
  .mp-micro-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .mp-micro-tag {
    background: var(--violet-dim);
    color: #a899fc;
    border: 1px solid rgba(124,109,250,0.2);
    border-radius: 6px;
    padding: 3px 9px;
    font-size: 11px;
    font-weight: 600;
  }

  /* ── Shimmer skeleton ── */
  .sk {
    background: linear-gradient(90deg,
      var(--surface-2) 25%,
      var(--surface-3) 50%,
      var(--surface-2) 75%
    );
    background-size: 600px 100%;
    animation: shimmer 1.5s infinite linear;
    border-radius: 8px;
  }

  /* ── Save button ── */
  .mp-save-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 32px auto 0;
    padding: 15px 36px;
    border-radius: var(--radius-md);
    border: 1px solid rgba(0,230,118,0.35);
    background: var(--green-dim);
    color: var(--green);
    font-family: var(--font-main);
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    letter-spacing: 0.2px;
  }
  .mp-save-btn:hover:not(:disabled) {
    background: rgba(0,230,118,0.2);
    box-shadow: 0 8px 24px rgba(0,230,118,0.2);
    transform: translateY(-2px);
  }
  .mp-save-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
  .mp-save-btn.saved {
    border-color: rgba(0,230,118,0.6);
    background: rgba(0,230,118,0.18);
    color: #00e676;
  }
  .mp-login-hint {
    text-align: center;
    margin-top: 24px;
    font-size: 13px;
    color: var(--text-3);
  }
  .mp-login-hint a {
    color: var(--green);
    text-decoration: none;
    font-weight: 600;
  }
  .mp-login-hint a:hover { text-decoration: underline; }
`;

/* ─── Constants ────────────────────────────────────────────────────────────── */
const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
];

const DIET_OPTIONS = [
  "🥦 Vegetarian", "🌱 Vegan", "🌾 Gluten-Free",
  "💪 High Protein", "🥑 Low Carb", "🥛 Dairy-Free",
];

const MEAL_THEMES = {
  Breakfast: { accent: "#ffb300", bg: "rgba(255,179,0,0.1)",  color: "#ffb300", gradient: "linear-gradient(90deg,#ffb300,#ff8f00)" },
  Lunch:     { accent: "#00e676", bg: "rgba(0,230,118,0.1)",  color: "#00e676", gradient: "linear-gradient(90deg,#00e676,#00c853)" },
  Snack:     { accent: "#7c6dfa", bg: "rgba(124,109,250,0.1)",color: "#7c6dfa", gradient: "linear-gradient(90deg,#7c6dfa,#5c4fd6)" },
  Dinner:    { accent: "#ff5f7e", bg: "rgba(255,95,126,0.1)", color: "#ff5f7e", gradient: "linear-gradient(90deg,#ff5f7e,#e91e63)" },
};
const MEAL_ICONS = { Breakfast: "🌅", Lunch: "☀️", Snack: "🍎", Dinner: "🌙" };

/* ─── Skeleton card ─────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="mp-card" style={{ padding: 22 }}>
      <div className="sk" style={{ height: 3, marginBottom: 22 }} />
      <div className="sk" style={{ height: 22, width: "38%", marginBottom: 14 }} />
      <div className="sk" style={{ height: 20, width: "78%", marginBottom: 8 }} />
      <div className="sk" style={{ height: 14, width: "92%", marginBottom: 5 }} />
      <div className="sk" style={{ height: 14, width: "65%", marginBottom: 22 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, marginBottom: 20 }}>
        {[0,1,2].map(i => <div key={i} className="sk" style={{ height: 56, borderRadius: 4 }} />)}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "0 0 4px" }}>
        {[70,90,60,80].map((w,i) => <div key={i} className="sk" style={{ height: 22, width: w, borderRadius: 6 }} />)}
      </div>
    </div>
  );
}

/* ─── Meal card ─────────────────────────────────────────────────────────────── */
function MealCard({ meal, currencySymbol, index }) {
  const theme = MEAL_THEMES[meal.mealType] || MEAL_THEMES.Lunch;
  const icon  = MEAL_ICONS[meal.mealType] || "🍽️";

  return (
    <div className="mp-card" style={{ animationDelay: `${index * 0.08}s` }}>
      {/* accent bar */}
      <div className="mp-card-accent" style={{ background: theme.gradient }} />

      <div className="mp-card-head">
        <div className="mp-card-badge" style={{ background: theme.bg, color: theme.color }}>
          <span>{icon}</span>
          <span>{meal.mealType}</span>
        </div>
        <div className="mp-card-name">{meal.name}</div>
        <div className="mp-card-desc">{meal.description}</div>
      </div>

      {/* Nutrition */}
      <div className="mp-nutr-grid">
        {[
          { label: "Calories", value: `${meal.nutrition.calories}` , unit: "kcal" },
          { label: "Protein",  value: `${meal.nutrition.protein}g`,  unit: ""     },
          { label: "Carbs",    value: `${meal.nutrition.carbs}g`,    unit: ""     },
          { label: "Fat",      value: `${meal.nutrition.fat}g`,      unit: ""     },
          { label: "Fiber",    value: `${meal.nutrition.fiber}g`,    unit: ""     },
          { label: "Sodium",   value: `${meal.nutrition.sodium}`,    unit: "mg"   },
        ].map(n => (
          <div key={n.label} className="mp-nutr-cell">
            <span className="mp-nutr-val">{n.value}<span style={{ fontSize: 9, fontWeight: 500, color: "var(--text-3)" }}>{n.unit}</span></span>
            <span className="mp-nutr-lbl">{n.label}</span>
          </div>
        ))}
      </div>

      {/* Health benefit */}
      {meal.healthBenefit && (
        <div className="mp-benefit" style={{ borderLeftColor: theme.accent }}>
          ✦ {meal.healthBenefit}
        </div>
      )}

      {/* Footer */}
      <div className="mp-card-footer">
        <div className="mp-cost-wrap">
          <div className="mp-cost">{currencySymbol}{meal.estimatedCost}</div>
          <div className="mp-cost-lbl">estimated cost</div>
        </div>
        <div className="mp-ings">
          {(meal.ingredients || []).slice(0, 4).map((ing, i) => (
            <span key={i} className="mp-ing-chip">{ing}</span>
          ))}
          {(meal.ingredients || []).length > 4 && (
            <span className="mp-ing-chip">+{meal.ingredients.length - 4}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────────── */
export default function MealPlanner() {
  const { loggedIn } = useAuth();
  const [budget,   setBudget]   = useState("");
  const [currency, setCurrency] = useState("INR");
  const [diets,    setDiets]    = useState([]);
  const [meals,    setMeals]    = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const resultsRef = useRef(null);

  const currSymbol = CURRENCIES.find(c => c.code === currency)?.symbol || "₹";

  function toggleDiet(d) {
    setDiets(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  async function generateMeals() {
    const num = parseFloat(budget);
    if (!num || num <= 0) { setError("Please enter a valid daily budget."); return; }
    setError(""); setLoading(true); setMeals([]); setSummary(null); setSaved(false);
    try {
      const res = await api.post("/meal/generate", {
        budget: num,
        currency,
        currencySymbol: currSymbol,
        diets: diets.map(d => d.replace(/^[^\s]+ /, "")), // strip emoji
      });
      setMeals(res.data.meals || []);
      setSummary(res.data.summary || null);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to generate meal plan. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function saveMealPlan() {
    if (!loggedIn || saving || saved) return;
    setSaving(true);
    try {
      await api.post("/meal/save", { meals, summary, currency, currencySymbol: currSymbol, budget: parseFloat(budget) });
      setSaved(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save meal plan.");
    } finally {
      setSaving(false);
    }
  }

  const hasMeals = meals.length > 0;

  return (
    <div className="mp-page">
      <style>{GLOBAL_STYLES}</style>

      {/* Background orbs */}
      <div className="mp-orb mp-orb-1" />
      <div className="mp-orb mp-orb-2" />
      <div className="mp-orb mp-orb-3" />

      <div className="mp-container">

        {/* ── Hero ── */}
        <div className="mp-hero">
          <div className="mp-hero-badge">
            <span className="dot" />
            AI-Powered Nutrition
          </div>
          <h1 className="mp-hero-title">
            Your Perfect<br /><span>Meal Plan</span>
          </h1>
          <p className="mp-hero-sub">
            Enter your daily budget and get a personalized, nutritionally optimized meal plan packed with protein, fiber, vitamins &amp; minerals.
          </p>
          <div className="mp-stats">
            <div className="mp-stat-pill"><span className="dot" />Free to use</div>
            <div className="mp-stat-pill">🥗 4 meals per day</div>
            <div className="mp-stat-pill">⚡ AI generated</div>
            <div className="mp-stat-pill">🌍 Multi-currency</div>
          </div>
        </div>

        {/* ── Form card ── */}
        <div className="mp-form-card">
          <label className="mp-form-label">Daily Food Budget</label>
          <div className="mp-budget-row">
            <select
              className="mp-currency-select"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code} style={{ background: "#0d1117" }}>
                  {c.symbol} {c.code}
                </option>
              ))}
            </select>
            <input
              type="number"
              className="mp-budget-input"
              placeholder="e.g. 200"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !loading && generateMeals()}
              min="1"
            />
          </div>

          <div className="mp-divider" />

          <label className="mp-form-label">Dietary Preferences <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
          <div className="mp-chips">
            {DIET_OPTIONS.map(d => (
              <button
                key={d}
                className={`mp-chip${diets.includes(d) ? " active" : ""}`}
                onClick={() => toggleDiet(d)}
              >
                {d}
              </button>
            ))}
          </div>

          <button
            className="mp-btn"
            disabled={loading || !budget}
            onClick={generateMeals}
          >
            {loading
              ? <><span className="mp-spinner" /> Crafting your meal plan…</>
              : <> ✨ Generate My Meal Plan</>
            }
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mp-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* ── Results ── */}
        <div ref={resultsRef}>

          {/* Summary */}
          {summary && !loading && (
            <div className="mp-summary">
              <div className="mp-summary-top">
                {[
                  { val: `${currSymbol}${summary.totalCost}`, lbl: "Total Cost" },
                  { val: `${summary.totalCalories} kcal`,     lbl: "Calories"   },
                  { val: `${summary.totalProtein}g`,           lbl: "Protein"    },
                  { val: `${summary.totalFiber}g`,             lbl: "Fiber", hide: true },
                  { val: `${summary.budgetUsed}%`,             lbl: "Budget Used", hide: true },
                ].map((s, i) => (
                  <div key={s.lbl} className={`mp-sum-cell${s.hide ? " sum-hide" : ""}`}>
                    <span className="mp-sum-val">{s.val}</span>
                    <span className="mp-sum-lbl">{s.lbl}</span>
                  </div>
                ))}
              </div>
              {summary.tip && (
                <div className="mp-summary-tip">
                  <span>💡</span>
                  <span>{summary.tip}</span>
                </div>
              )}
            </div>
          )}

          {/* Meals */}
          {(loading || hasMeals) && (
            <>
              {hasMeals && !loading && (
                <div className="mp-section-label">
                  <h2>Your Meal Plan</h2>
                  <p>Tap a card to explore nutritional details</p>
                </div>
              )}
              <div className="mp-grid">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                  : meals.map((meal, i) => (
                      <MealCard key={i} meal={meal} currencySymbol={currSymbol} index={i} />
                    ))
                }
              </div>
            </>
          )}

          {/* Save button */}
          {hasMeals && !loading && (
            <div style={{ textAlign: "center" }}>
              {loggedIn ? (
                <button
                  className={`mp-save-btn${saved ? " saved" : ""}`}
                  onClick={saveMealPlan}
                  disabled={saving || saved}
                >
                  {saved ? "✅ Meal Plan Saved!" : saving ? <><span className="mp-spinner" style={{ borderTopColor: "var(--green)", borderColor: "rgba(0,230,118,0.3)" }} /> Saving…</> : "🔖 Save to My Profile"}
                </button>
              ) : (
                <p className="mp-login-hint">
                  <a href="/login">Log in</a> to save this meal plan to your profile
                </p>
              )}
            </div>
          )}

          {/* Micronutrients */}
          {hasMeals && !loading && (
            <div className="mp-micros">
              {meals.map((meal, i) => {
                const tags = [...(meal.nutrition.vitamins || []), ...(meal.nutrition.minerals || [])];
                if (!tags.length) return null;
                const theme = MEAL_THEMES[meal.mealType] || MEAL_THEMES.Lunch;
                return (
                  <div key={i} className="mp-micro-card" style={{ animationDelay: `${i * 0.08 + 0.3}s` }}>
                    <div className="mp-micro-title" style={{ color: theme.color }}>
                      {MEAL_ICONS[meal.mealType]} {meal.mealType} · Micronutrients
                    </div>
                    <div className="mp-micro-tags">
                      {tags.map((t, j) => <span key={j} className="mp-micro-tag">{t}</span>)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}