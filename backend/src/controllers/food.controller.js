const Food = require("../models/food.model");
const axios = require("axios");
const FormData = require("form-data");

/* ===============================
   🧠 SMART FOOD NAME PROCESSING
================================ */
function normalizeFoodName(rawName) {
  if (!rawName) return "unknown";

  let name = rawName.toLowerCase().trim();

  const foodMap = {
    "nasi goreng rice": "fried rice",
    "fried rice": "rice",
    "instant noodles": "noodles",
    ramen: "noodles",
    maggi: "noodles",
    spaghetti: "pasta",
  };

  if (foodMap[name]) return foodMap[name];

  if (name.includes("rice")) return "rice";
  if (name.includes("noodle")) return "noodles";
  if (name.includes("pasta")) return "pasta";
  if (name.includes("burger")) return "burger";
  if (name.includes("pizza")) return "pizza";

  return name;
}

/* ===============================
   💡 SUGGESTION ENGINE
================================ */
function getSuggestion(original, normalized) {
  if (original === normalized) return null;
  return `Detected "${original}", interpreted as "${normalized}"`;
}

/* ===============================
   🔥 SCORING FUNCTION
================================ */
function calculateScore(nutrition, goal) {
  let score = 100;

  if (nutrition.sugar > 20) score -= 20;
  if (nutrition.fat > 30) score -= 15;
  if (nutrition.protein > 10) score += 10;

  if (goal === "weight_loss" && nutrition.calories > 500) {
    score -= 20;
  }

  return Math.max(0, Math.min(100, score));
}

/* ===============================
   📊 CLASSIFICATION
================================ */
function classify(score) {
  if (score >= 75) return "HEALTHY";
  if (score >= 50) return "MODERATE";
  return "UNHEALTHY";
}

/* ===============================
   💬 EXPLANATION ENGINE
================================ */
function generateReason(nutrition) {
  let reasons = [];

  if (nutrition.sugar > 20)
    reasons.push("High sugar may increase diabetes risk");

  if (nutrition.fat > 30) reasons.push("High fat may lead to weight gain");

  if (nutrition.calories > 500)
    reasons.push("High calorie content may affect weight goals");

  if (nutrition.protein > 10)
    reasons.push("Good protein supports muscle health");

  return reasons.length > 0 ? reasons.join(". ") : "Balanced nutrition";
}

/* ===============================
   🍎 GET NUTRITION (EDAMAM)
================================ */
async function getNutrition(foodName) {
  try {
    const res = await axios.get("https://api.edamam.com/api/nutrition-data", {
      params: {
        app_id: process.env.EDAMAM_APP_ID,
        app_key: process.env.EDAMAM_APP_KEY,
        ingr: `1 ${foodName}`,
      },
    });

    const data = res.data;

    if (!data || data.calories === 0) return null;

    const nutrients = data.totalNutrients || {};

    return {
      calories: data.calories || 0,
      protein: nutrients.PROCNT?.quantity || 0,
      fat: nutrients.FAT?.quantity || 0,
      sugar: nutrients.SUGAR?.quantity || 0,
      fiber: nutrients.FIBTG?.quantity || 0,
    };
  } catch (err) {
    console.error("Edamam error:", err.response?.data || err.message);
    return null;
  }
}

/* ===============================
   📷 IMAGE ANALYSIS
================================ */
exports.analyzeFoodImage = async (req, res) => {
  try {
    const { userId, goal } = req.body;

    /* 🔹 1. Image → AI detection */
    const formData = new FormData();
    formData.append("image", req.file.buffer, "food.jpg");

    const visionRes = await axios.post(
      "https://api.logmeal.es/v2/image/recognition/complete",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.LOGMEAL_TOKEN}`,
        },
      },
    );

    const rawFoodName =
      visionRes.data?.recognition_results?.[0]?.name || "Unknown Food";

    const confidence = visionRes.data?.recognition_results?.[0]?.prob || 0;

    // ❗ Low confidence handling
    let warning = null;

    if (confidence < 0.5) {
      warning = "Low confidence in detection. Results may be inaccurate.";
    }

    /* 🔹 2. Normalize */
    const foodName = normalizeFoodName(rawFoodName);
    const suggestion = getSuggestion(rawFoodName, foodName);

    console.log("Raw:", rawFoodName);
    console.log("Normalized:", foodName);

    /* 🔹 3. Get Nutrition */
    const nutrition = await getNutrition(foodName);

    if (!nutrition) {
      return res.json({
        foodName,
        originalDetected: rawFoodName,
        suggestion,
        score: 50,
        status: "MODERATE",
        reason: "Nutrition data not available",
        confidence: (confidence * 100).toFixed(2),
      });
    }

    /* 🔹 4. Score */
    const score = calculateScore(nutrition, goal);
    const status = classify(score);
    const reason = generateReason(nutrition);

    /* 🔹 5. Save */
    const food = await Food.create({
      userId,
      foodName,
      ...nutrition,
      score,
      status,
      reason,
    });

    /* 🔹 6. Response */
    res.json({
      ...food._doc,
      originalDetected: rawFoodName,
      suggestion,
      confidence: (confidence * 100).toFixed(2),
      warning,
    });
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);

    res.status(500).json({
      message: "Error analyzing image",
      error: err.response?.data || err.message,
    });
  }
};
