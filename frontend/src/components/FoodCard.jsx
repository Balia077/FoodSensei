const STATUS_COLOR = {
  HEALTHY: "#22c55e",
  MODERATE: "#facc15",
  UNHEALTHY: "#ef4444",
};

const BADGE_STYLE = {
  HEALTHY:   { background: "#d1fae5", color: "#065f46" },
  MODERATE:  { background: "#fef3c7", color: "#92400e" },
  UNHEALTHY: { background: "#fee2e2", color: "#991b1b" },
};

export default function FoodCard({ food }) {
  const color = STATUS_COLOR[food.status] || "#999";
  const badgeStyle = BADGE_STYLE[food.status] || { background: "#e5e7eb", color: "#374151" };

  return (
    <div
      className="food-card"
      style={styles.card}
      onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-5px)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
    >
      {/* STATUS BADGE */}
      <div style={{ ...styles.badge, ...badgeStyle }}>
        {food.status}
      </div>

      {/* IMAGE */}
      <div style={styles.imageWrap}>
        <img
          src={
            food.imageUrl ||
            `https://placehold.co/400x300?text=${encodeURIComponent(food.foodName || "food")}`
          }
          onError={(e) => {
            e.target.src = `https://placehold.co/400x300?text=${encodeURIComponent(food.foodName || "food")}`;
          }}
          style={styles.image}
        />
        <div style={styles.imageOverlay} />
      </div>

      {/* CONTENT */}
      <div style={styles.content}>
        <h3 style={styles.title}>{food.foodName}</h3>
        <p style={styles.brand}>{food.brand || "Unknown brand"}</p>

        {/* MACROS */}
        <div style={styles.macros}>
          <div style={styles.macroChip}>
            <span style={styles.macroLabel}>Calories</span>
            <span style={styles.macroValue}>{food.calories} kcal</span>
          </div>
          <div style={styles.macroChip}>
            <span style={styles.macroLabel}>Protein</span>
            <span style={styles.macroValue}>{food.protein}g</span>
          </div>
          <div style={styles.macroChip}>
            <span style={styles.macroLabel}>Sugar</span>
            <span style={styles.macroValue}>{food.sugar}g</span>
          </div>
          <div style={styles.macroChip}>
            <span style={styles.macroLabel}>Fat</span>
            <span style={styles.macroValue}>{food.fat}g</span>
          </div>
        </div>

        {/* SCORE BAR */}
        <div style={styles.scoreRow}>
          <span style={styles.scoreLabel}>Score</span>
          <div style={styles.scoreBarWrap}>
            <div
              style={{
                ...styles.scoreBarFill,
                width: `${food.score}%`,
                background: color,
              }}
            />
          </div>
          <span style={styles.scoreNumber}>{food.score}/100</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    overflow: "hidden",
    color: "#fff",
    position: "relative",
    backdropFilter: "blur(10px)",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
    width: "100%",
  },

  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: "5px 12px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    zIndex: 2,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  imageWrap: {
    width: "100%",
    height: 200,
    overflow: "hidden",
    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.4s ease",
    display: "block",
  },

  imageOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)",
    pointerEvents: "none",
  },

  content: {
    padding: "16px 18px 18px",
  },

  title: {
    margin: 0,
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: 0.1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  brand: {
    margin: "5px 0 14px",
    fontSize: 12,
    color: "#888",
  },

  macros: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 8,
    marginBottom: 14,
  },

  macroChip: {
    background: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: "9px 11px",
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },

  macroLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: "#777",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },

  macroValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "#fff",
  },

  scoreRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    borderTop: "1px solid rgba(255,255,255,0.07)",
    paddingTop: 12,
  },

  scoreLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "#777",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    whiteSpace: "nowrap",
  },

  scoreBarWrap: {
    flex: 1,
    height: 6,
    background: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    overflow: "hidden",
  },

  scoreBarFill: {
    height: "100%",
    borderRadius: 999,
    transition: "width 0.7s cubic-bezier(.25,.8,.25,1)",
  },

  scoreNumber: {
    fontSize: 12,
    fontWeight: 700,
    color: "#ccc",
    minWidth: 40,
    textAlign: "right",
    whiteSpace: "nowrap",
  },
};