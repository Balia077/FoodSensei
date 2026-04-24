import { useEffect, useState } from "react";
import FoodCard from "../components/FoodCard";

const API_BASE = "http://localhost:3000/api";

/* ─── Shimmer keyframes injected once ───────────────────────────────────────── */
const GLOBAL_STYLES = `
  @keyframes shimmer {
    0%   { background-position: -700px 0; }
    100% { background-position:  700px 0; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  * { box-sizing: border-box; }

  /* Responsive grid breakpoints */
  .food-grid {
    display: grid;
    gap: 18px;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  @media (max-width: 480px) {
    .food-grid { grid-template-columns: 1fr; }
  }
  @media (min-width: 481px) and (max-width: 768px) {
    .food-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (min-width: 769px) and (max-width: 1100px) {
    .food-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (min-width: 1101px) {
    .food-grid { grid-template-columns: repeat(4, 1fr); }
  }

  .food-card:hover img {
    transform: scale(1.06);
  }
`;

/* ─── Shimmer base ───────────────────────────────────────────────────────────── */
const shimmer = {
  background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.04) 75%)",
  backgroundSize: "700px 100%",
  animation: "shimmer 1.6s infinite linear",
  borderRadius: 8,
};

/* ─── Skeleton Card ──────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={skelStyles.card}>
      {/* Image area */}
      <div style={skelStyles.imgArea}>
        {/* fake badge */}
        <div style={{ ...shimmer, ...skelStyles.badge }} />
      </div>

      <div style={skelStyles.body}>
        {/* Title */}
        <div style={{ ...shimmer, height: 16, width: "70%", borderRadius: 6, marginBottom: 8 }} />
        {/* Brand */}
        <div style={{ ...shimmer, height: 11, width: "45%", borderRadius: 6, marginBottom: 18 }} />

        {/* Macro chips 2×2 */}
        <div style={skelStyles.macrosGrid}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={skelStyles.macroChip}>
              <div style={{ ...shimmer, height: 9,  width: "50%", borderRadius: 4, marginBottom: 6 }} />
              <div style={{ ...shimmer, height: 14, width: "75%", borderRadius: 5 }} />
            </div>
          ))}
        </div>

        {/* Score row */}
        <div style={skelStyles.scoreRow}>
          <div style={{ ...shimmer, height: 9, width: 38, borderRadius: 4 }} />
          <div style={{ ...shimmer, flex: 1, height: 6, borderRadius: 999 }} />
          <div style={{ ...shimmer, height: 9, width: 32, borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
}

const skelStyles = {
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 20,
    overflow: "hidden",
    width: "100%",
  },
  imgArea: {
    width: "100%",
    height: 200,
    ...shimmer,
    borderRadius: 0,
    position: "relative",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    padding: 12,
  },
  badge: {
    height: 26,
    width: 80,
    borderRadius: 999,
  },
  body: {
    padding: "16px 18px 18px",
  },
  macrosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 8,
    marginBottom: 14,
  },
  macroChip: {
    background: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: "10px 12px",
  },
  scoreRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    borderTop: "1px solid rgba(255,255,255,0.06)",
    paddingTop: 12,
  },
};

/* ─── Section ────────────────────────────────────────────────────────────────── */
function FoodSection({ title, dot, foods, loading, skeletonCount = 4 }) {
  return (
    <div style={pageStyles.section}>
      <div style={pageStyles.sectionHeader}>
        <span style={{ ...pageStyles.dot, background: dot }} />
        <h2 style={pageStyles.sectionTitle}>{title}</h2>
        {!loading && (
          <span style={pageStyles.count}>
            {foods.length} item{foods.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="food-grid">
        {loading
          ? Array.from({ length: skeletonCount }).map((_, i) => <SkeletonCard key={i} />)
          : foods.length === 0
            ? <p style={pageStyles.empty}>No items in this category.</p>
            : foods.map((f, i) => (
                <div
                  key={f._id}
                  style={{ animation: `fadeUp 0.35s ease ${i * 0.06}s both` }}
                >
                  <FoodCard food={f} />
                </div>
              ))
        }
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function FoodPage() {
  const [foods, setFoods]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/food/list?userId=123`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setFoods(data))
      .catch(() => setError("Failed to load foods. Make sure the server is running."))
      .finally(() => setLoading(false));
  }, []);

  const healthyFoods   = foods.filter(f => f.status === "HEALTHY");
  const moderateFoods  = foods.filter(f => f.status === "MODERATE");
  const unhealthyFoods = foods.filter(f => f.status === "UNHEALTHY");

  return (
    <div style={pageStyles.page}>
      <style>{GLOBAL_STYLES}</style>

      <h1 style={pageStyles.pageTitle}>Food Log</h1>

      {error && <p style={pageStyles.errorMsg}>{error}</p>}

      <FoodSection title="Healthy"   dot="#22c55e" foods={healthyFoods}   loading={loading} />
      <FoodSection title="Moderate"  dot="#facc15" foods={moderateFoods}  loading={loading} />
      <FoodSection title="Unhealthy" dot="#ef4444" foods={unhealthyFoods} loading={loading} />
    </div>
  );
}

/* ─── Page styles ────────────────────────────────────────────────────────────── */
const pageStyles = {
  page: {
    minHeight: "100vh",
    background: "#0f0f11",
    padding: "32px clamp(16px, 4vw, 40px)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    color: "#fff",
  },

  pageTitle: {
    fontSize: "clamp(22px, 4vw, 30px)",
    fontWeight: 700,
    marginBottom: 36,
    color: "#fff",
    letterSpacing: -0.4,
  },

  section: {
    marginBottom: 48,
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    margin: 0,
    color: "#fff",
    letterSpacing: 0.1,
  },

  count: {
    fontSize: 12,
    color: "#555",
    marginLeft: 2,
  },

  empty: {
    color: "#444",
    fontSize: 13,
    gridColumn: "1/-1",
    margin: 0,
  },

  errorMsg: {
    color: "#f87171",
    background: "rgba(248,113,113,0.1)",
    border: "1px solid rgba(248,113,113,0.2)",
    padding: "12px 16px",
    borderRadius: 12,
    fontSize: 13,
    marginBottom: 28,
  },
};