import React, { useEffect, useState } from "react";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const MEAL_ICONS = { Breakfast: "🌅", Lunch: "☀️", Snack: "🍎", Dinner: "🌙" };
const MEAL_COLORS = {
  Breakfast: { color: "#ffb300", bg: "rgba(255,179,0,0.1)" },
  Lunch:     { color: "#00e676", bg: "rgba(0,230,118,0.1)" },
  Snack:     { color: "#7c6dfa", bg: "rgba(124,109,250,0.1)" },
  Dinner:    { color: "#ff5f7e", bg: "rgba(255,95,126,0.1)" },
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  .pr-page {
    min-height: 90vh;
    background: #080b10;
    font-family: 'Poppins', sans-serif;
    color: #f0f4ff;
    padding: 40px 20px 80px;
  }
  .pr-container { max-width: 900px; margin: 0 auto; }

  /* ── Profile card ── */
  .pr-card {
    background: #0d1117;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    padding: 36px 40px;
    display: flex;
    align-items: center;
    gap: 32px;
    margin-bottom: 40px;
    flex-wrap: wrap;
  }
  @media (max-width: 600px) {
    .pr-card { padding: 24px 20px; gap: 20px; flex-direction: column; text-align: center; }
  }
  .pr-avatar {
    width: 80px; height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00e676, #00c853);
    color: #050e09;
    font-size: 26px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    letter-spacing: -1px;
  }
  .pr-info { flex: 1; }
  .pr-name {
    font-size: 22px;
    font-weight: 700;
    color: #f0f4ff;
    margin-bottom: 4px;
    letter-spacing: -0.3px;
  }
  .pr-email { font-size: 13px; color: #4a5568; font-weight: 400; }
  .pr-meta {
    display: flex;
    gap: 16px;
    margin-top: 14px;
    flex-wrap: wrap;
  }
  @media (max-width: 600px) { .pr-meta { justify-content: center; } }
  .pr-meta-pill {
    background: #141921;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 999px;
    padding: 5px 14px;
    font-size: 12px;
    color: #8b95a8;
    font-weight: 500;
  }
  .pr-logout-btn {
    padding: 10px 24px;
    border-radius: 12px;
    border: 1px solid rgba(255,95,126,0.25);
    background: rgba(255,95,126,0.07);
    color: #ff5f7e;
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .pr-logout-btn:hover {
    background: rgba(255,95,126,0.14);
    box-shadow: 0 4px 16px rgba(255,95,126,0.15);
  }

  /* ── Section header ── */
  .pr-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 8px;
  }
  .pr-section-title {
    font-size: 18px;
    font-weight: 700;
    color: #f0f4ff;
    letter-spacing: -0.3px;
  }
  .pr-section-count {
    font-size: 12px;
    font-weight: 600;
    color: #00e676;
    background: rgba(0,230,118,0.1);
    border: 1px solid rgba(0,230,118,0.2);
    border-radius: 999px;
    padding: 3px 12px;
  }

  /* ── Empty state ── */
  .pr-empty {
    background: #0d1117;
    border: 1px dashed rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 48px 24px;
    text-align: center;
  }
  .pr-empty-icon { font-size: 40px; margin-bottom: 12px; }
  .pr-empty-text { font-size: 14px; color: #4a5568; font-weight: 400; line-height: 1.6; }
  .pr-empty-link {
    display: inline-block;
    margin-top: 16px;
    padding: 10px 24px;
    border-radius: 12px;
    background: rgba(0,230,118,0.1);
    border: 1px solid rgba(0,230,118,0.25);
    color: #00e676;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s;
  }
  .pr-empty-link:hover { background: rgba(0,230,118,0.18); }

  /* ── Saved meal card ── */
  .pr-meal-card {
    background: #0d1117;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    margin-bottom: 16px;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .pr-meal-card:hover { border-color: rgba(255,255,255,0.12); }

  .pr-meal-card-head {
    padding: 18px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    cursor: pointer;
    flex-wrap: wrap;
  }
  .pr-meal-card-head-left { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .pr-meal-date { font-size: 11px; color: #4a5568; font-weight: 500; }
  .pr-meal-budget {
    font-size: 18px;
    font-weight: 800;
    color: #00e676;
    letter-spacing: -0.5px;
  }
  .pr-meal-summary-pills {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 6px;
  }
  .pr-meal-pill {
    font-size: 11px;
    font-weight: 600;
    color: #8b95a8;
    background: #141921;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 999px;
    padding: 3px 10px;
  }
  .pr-meal-head-right { display: flex; align-items: center; gap: 10px; }
  .pr-delete-btn {
    width: 30px; height: 30px;
    border-radius: 8px;
    border: 1px solid rgba(255,95,126,0.2);
    background: rgba(255,95,126,0.07);
    color: #ff5f7e;
    font-size: 13px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .pr-delete-btn:hover { background: rgba(255,95,126,0.15); }
  .pr-chevron {
    color: #4a5568;
    font-size: 12px;
    transition: transform 0.25s;
    flex-shrink: 0;
  }
  .pr-chevron.open { transform: rotate(180deg); }

  /* ── Expanded meals grid ── */
  .pr-meals-expand {
    border-top: 1px solid rgba(255,255,255,0.06);
    padding: 18px 22px 22px;
  }
  .pr-meals-inner {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  @media (max-width: 600px) { .pr-meals-inner { grid-template-columns: 1fr; } }

  .pr-mini-card {
    background: #141921;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px;
    padding: 14px 16px;
  }
  .pr-mini-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 999px;
    margin-bottom: 8px;
  }
  .pr-mini-name {
    font-size: 13px;
    font-weight: 600;
    color: #f0f4ff;
    margin-bottom: 4px;
    line-height: 1.3;
  }
  .pr-mini-nutr {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 8px;
  }
  .pr-mini-nutr-item {
    font-size: 10px;
    color: #4a5568;
    font-weight: 500;
  }
  .pr-mini-nutr-item span { color: #8b95a8; font-weight: 600; }
  .pr-mini-cost {
    font-size: 13px;
    font-weight: 700;
    color: #00e676;
    margin-top: 8px;
  }

  /* ── Loading ── */
  .pr-loading {
    text-align: center;
    padding: 48px;
    color: #4a5568;
    font-size: 14px;
  }
`;

function getInitials(name) {
  if (!name) return "";
  return name.slice(0, 2).toUpperCase();
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function SavedMealCard({ plan, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="pr-meal-card">
      <div className="pr-meal-card-head" onClick={() => setOpen(o => !o)}>
        <div className="pr-meal-card-head-left">
          <div>
            <div className="pr-meal-date">📅 {formatDate(plan.savedAt)}</div>
            <div className="pr-meal-budget">{plan.currencySymbol}{plan.budget} <span style={{ fontSize: 12, fontWeight: 500, color: "#4a5568" }}>daily budget</span></div>
            {plan.summary && (
              <div className="pr-meal-summary-pills">
                <span className="pr-meal-pill">🔥 {plan.summary.totalCalories} kcal</span>
                <span className="pr-meal-pill">💪 {plan.summary.totalProtein}g protein</span>
                <span className="pr-meal-pill">{plan.summary.budgetUsed}% used</span>
              </div>
            )}
          </div>
        </div>
        <div className="pr-meal-head-right">
          <button
            className="pr-delete-btn"
            onClick={e => { e.stopPropagation(); onDelete(plan._id); }}
            title="Delete"
          >🗑</button>
          <span className={`pr-chevron${open ? " open" : ""}`}>▼</span>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="pr-meals-expand">
              {plan.summary?.tip && (
                <div style={{ fontSize: 12, color: "#4a5568", marginBottom: 14, padding: "8px 12px", background: "#1c2333", borderRadius: 10, borderLeft: "2px solid #00e676" }}>
                  💡 {plan.summary.tip}
                </div>
              )}
              <div className="pr-meals-inner">
                {(plan.meals || []).map((meal, i) => {
                  const theme = MEAL_COLORS[meal.mealType] || MEAL_COLORS.Lunch;
                  return (
                    <div key={i} className="pr-mini-card">
                      <div className="pr-mini-badge" style={{ background: theme.bg, color: theme.color }}>
                        <span>{MEAL_ICONS[meal.mealType] || "🍽️"}</span>
                        <span>{meal.mealType}</span>
                      </div>
                      <div className="pr-mini-name">{meal.name}</div>
                      <div className="pr-mini-nutr">
                        <div className="pr-mini-nutr-item">Cal <span>{meal.nutrition?.calories}</span></div>
                        <div className="pr-mini-nutr-item">Protein <span>{meal.nutrition?.protein}g</span></div>
                        <div className="pr-mini-nutr-item">Carbs <span>{meal.nutrition?.carbs}g</span></div>
                        <div className="pr-mini-nutr-item">Fat <span>{meal.nutrition?.fat}g</span></div>
                      </div>
                      <div className="pr-mini-cost">{plan.currencySymbol}{meal.estimatedCost}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Profile = () => {
  const [user,       setUser]       = useState(null);
  const [savedMeals, setSavedMeals] = useState([]);
  const [mealsLoading, setMealsLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/user/profile");
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await api.get("/meal/saved");
        setSavedMeals(res.data.savedMeals || []);
      } catch (err) {
        console.error("Error fetching saved meals:", err);
      } finally {
        setMealsLoading(false);
      }
    };
    fetchSaved();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/meal/saved/${id}`);
      setSavedMeals(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (!user) {
    return (
      <div style={{ minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#080b10", fontFamily: "Poppins, sans-serif" }}>
        <p style={{ color: "#4a5568", fontSize: 14 }}>Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="pr-page">
      <style>{STYLES}</style>
      <div className="pr-container">

        {/* ── Profile card ── */}
        <motion.div
          className="pr-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="pr-avatar">{getInitials(user.user.username)}</div>
          <div className="pr-info">
            <div className="pr-name">{user.user.username}</div>
            <div className="pr-email">{user.user.email}</div>
            <div className="pr-meta">
              <span className="pr-meta-pill">👋 Welcome back</span>
              <span className="pr-meta-pill">🔖 {savedMeals.length} saved meal{savedMeals.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <button className="pr-logout-btn" onClick={logout}>
            Sign out →
          </button>
        </motion.div>

        {/* ── Saved Meals ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="pr-section-header">
            <div className="pr-section-title">🔖 Saved Meal Plans</div>
            {savedMeals.length > 0 && (
              <span className="pr-section-count">{savedMeals.length} plan{savedMeals.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {mealsLoading ? (
            <div className="pr-loading">Loading saved meals…</div>
          ) : savedMeals.length === 0 ? (
            <div className="pr-empty">
              <div className="pr-empty-icon">🥗</div>
              <div className="pr-empty-text">
                You haven't saved any meal plans yet.<br />
                Generate one and hit "Save to My Profile"!
              </div>
              <a href="/mealplanner" className="pr-empty-link">
                ✨ Generate a Meal Plan
              </a>
            </div>
          ) : (
            <AnimatePresence>
              {savedMeals.map((plan, i) => (
                <motion.div
                  key={plan._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <SavedMealCard plan={plan} onDelete={handleDelete} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>

      </div>
    </div>
  );
};

export default Profile;