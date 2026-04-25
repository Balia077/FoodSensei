const Food = require("../models/food.model");
const axios = require("axios");
const normalizeFoodWikipedia = require("../utils/foodNormalizer");

const clamp  = (val, min, max) => Math.max(min, Math.min(max, val));
const round2 = (n) => Math.round((n || 0) * 100) / 100;

// ─── SCORING ──────────────────────────────────────────────────────────────────

function scoreNutrient(value, { bad, worse, worst }, invert = false) {
  if (invert) {
    if (value >= worst) return 0;
    if (value >= worse) return 25;
    if (value >= bad)   return 55;
    return 100;
  } else {
    if (value >= worst) return 100;
    if (value >= worse) return 75;
    if (value >= bad)   return 45;
    return 0;
  }
}

function calculateScore(nutrition, goal = "general") {
  const {
    calories = 0, sugar = 0, fat = 0,
    sodium = 0, protein = 0, fiber = 0, carbs = 0,
  } = nutrition;

  const calorieScore = scoreNutrient(calories, { bad: 200, worse: 350, worst: 500 }, true);
  const sugarScore   = scoreNutrient(sugar,    { bad: 6,   worse: 12,  worst: 22  }, true);
  const fatScore     = scoreNutrient(fat,      { bad: 12,  worse: 20,  worst: 30  }, true);
  const sodiumScore  = scoreNutrient(sodium,   { bad: 250, worse: 500, worst: 750 }, true);
  const proteinScore = scoreNutrient(protein,  { bad: 3,   worse: 8,   worst: 15  }, false);
  const fiberScore   = scoreNutrient(fiber,    { bad: 1.5, worse: 3,   worst: 6   }, false);

  let base =
    calorieScore * 0.18 +
    sugarScore   * 0.22 +
    fatScore     * 0.18 +
    sodiumScore  * 0.18 +
    proteinScore * 0.14 +
    fiberScore   * 0.10;

  const badCount = [
    sugar > 12, fat > 20, sodium > 500, calories > 350,
  ].filter(Boolean).length;

  if (badCount >= 3)      base *= 0.65;
  else if (badCount === 2) base *= 0.80;

  if (sugar    > 30)  base = Math.min(base, 30);
  if (fat      > 35)  base = Math.min(base, 35);
  if (sodium   > 900) base = Math.min(base, 35);
  if (calories > 550) base = Math.min(base, 40);

  let modifier = 0;

  if (goal === "weight_loss") {
    if (calories > 300)      modifier -= 8;
    else if (calories < 150) modifier += 5;
    if (fat > 15)   modifier -= 5;
    if (fiber > 4)  modifier += 5;
    if (sugar > 10) modifier -= 5;
  }

  if (goal === "muscle_gain") {
    if (protein > 20)               modifier += 10;
    else if (protein > 12)          modifier += 6;
    else if (protein < 5)           modifier -= 8;
    if (carbs > 40 && protein > 10) modifier += 4;
  }

  if (goal === "general") {
    if (fiber > 5 && sugar < 6 && sodium < 250) modifier += 5;
  }

  return clamp(Math.round(base + modifier), 0, 100);
}

function classify(score) {
  if (score >= 70) return "HEALTHY";
  if (score >= 45) return "MODERATE";
  return "UNHEALTHY";
}

function generateReason(nutrition, nutriScore, goal = "general") {
  const {
    sugar = 0, fat = 0, sodium = 0,
    calories = 0, protein = 0, fiber = 0,
  } = nutrition;

  const negatives = [];
  const positives = [];

  if (sugar > 22)          negatives.push("extremely high sugar content");
  else if (sugar > 12)     negatives.push("high sugar content");
  else if (sugar > 6)      negatives.push("moderate sugar");

  if (fat > 30)            negatives.push("very high total fat");
  else if (fat > 20)       negatives.push("high fat content");
  else if (fat > 12)       negatives.push("moderate fat");

  if (sodium > 750)        negatives.push("dangerously high sodium (heart risk)");
  else if (sodium > 500)   negatives.push("high sodium content");
  else if (sodium > 250)   negatives.push("moderate sodium");

  if (calories > 500)      negatives.push("very high calorie density");
  else if (calories > 350) negatives.push("high calorie content");

  if (protein > 15)        positives.push("excellent protein source");
  else if (protein > 8)    positives.push("good protein content");

  if (fiber > 6)           positives.push("high in dietary fiber");
  else if (fiber > 3)      positives.push("decent fiber content");

  if (sugar < 4 && fat < 8 && sodium < 150)
    positives.push("clean macronutrient profile");

  if (goal === "weight_loss" && calories < 150)
    positives.push("low calorie — good for weight loss");
  if (goal === "muscle_gain" && protein > 20)
    positives.push("high protein supports muscle growth");

  if (nutriScore && nutriScore !== "unknown") {
    const grade = nutriScore.toUpperCase();
    if (["A", "B"].includes(grade))      positives.push(`Nutri-Score ${grade} (official rating)`);
    else if (["D", "E"].includes(grade)) negatives.push(`Nutri-Score ${grade} (officially rated poor)`);
    else                                 negatives.push(`Nutri-Score ${grade}`);
  }

  const parts = [];
  if (negatives.length) parts.push(`Issues: ${negatives.join(", ")}.`);
  if (positives.length) parts.push(`Positives: ${positives.join(", ")}.`);
  if (!parts.length)    parts.push("Nutrition profile looks balanced.");
  return parts.join(" ");
}

// ─── DATA SOURCES ─────────────────────────────────────────────────────────────

// 1. Open Food Facts — barcode lookup (no key needed)
async function getProductByBarcode(barcode) {
  try {
    const res = await axios.get(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      { timeout: 8000 },
    );

    if (res.data?.status !== 1 || !res.data?.product) return null;

    const p = res.data.product;
    const n = p.nutriments || {};

    return {
      source: "openfoodfacts_barcode",
      foodName: p.product_name || p.product_name_en || "Unknown Product",
      brand: p.brands || null,
      imageUrl: p.image_front_url || null,
      nutriScore: p.nutriscore_grade || "unknown",
      ingredients: p.ingredients_text || null,
      nutrition: {
        calories: round2(n["energy-kcal_100g"] || n["energy-kcal"] || 0),
        protein:  round2(n.proteins_100g || 0),
        fat:      round2(n.fat_100g || 0),
        sugar:    round2(n.sugars_100g || 0),
        fiber:    round2(n.fiber_100g || 0),
        sodium:   round2((n.sodium_100g || n.sodium || 0) * 1000),
        carbs:    round2(n.carbohydrates_100g || 0),
      },
    };
  } catch (err) {
    console.error("Open Food Facts barcode error:", err.message);
    return null;
  }
}

// 2. USDA FoodData Central — text search (free API key, no business account)
//    Sign up at: https://fdc.nal.usda.gov/api-guide.html  (instant, free)
//    Supports: Foundation, SR Legacy, Survey (FNDDS), Branded foods
//    Strategy: prefer Foundation/SR Legacy (per-100g, reliable) over Branded
async function getNutritionFromUSDA(query) {
  try {
    const res = await axios.get("https://api.nal.usda.gov/fdc/v1/foods/search", {
      params: {
        query,
        pageSize: 10,
        api_key: process.env.USDA_API_KEY || "DEMO_KEY",
        // Prefer Foundation & SR Legacy: most accurate per-100g data
        dataType: ["Foundation", "SR Legacy", "Survey (FNDDS)", "Branded"],
      },
      timeout: 10000,
    });

    const foods = res.data?.foods;
    if (!foods || foods.length === 0) return null;

    // Pick the best result: Foundation > SR Legacy > Survey > Branded
    const priority = { "Foundation": 0, "SR Legacy": 1, "Survey (FNDDS)": 2, "Branded": 3 };
    const sorted = [...foods].sort(
      (a, b) => (priority[a.dataType] ?? 4) - (priority[b.dataType] ?? 4),
    );

    const food = sorted.find((f) => f.foodNutrients?.length >= 3) || sorted[0];
    if (!food) return null;

    const nutrients = food.foodNutrients || [];

    // USDA nutrient IDs are stable — use them for precision
    const byId = (id) => {
      const n = nutrients.find((n) => n.nutrientId === id || n.nutrientNumber === String(id));
      return round2(n?.value || 0);
    };

    // Fallback: match by name fragment if ID not found
    const byName = (fragment) => {
      const n = nutrients.find((n) =>
        n.nutrientName?.toLowerCase().includes(fragment.toLowerCase()),
      );
      return round2(n?.value || 0);
    };

    // USDA nutrient IDs: 1008=Energy(kcal), 1003=Protein, 1004=Fat,
    //   1005=Carbs, 2000=Sugars, 1079=Fiber, 1093=Sodium
    const calories = byId(1008) || byName("energy");
    const protein  = byId(1003) || byName("protein");
    const fat      = byId(1004) || byName("total lipid");
    const carbs    = byId(1005) || byName("carbohydrate");
    const sugar    = byId(2000) || byName("sugars");
    const fiber    = byId(1079) || byName("fiber");
    const sodium   = byId(1093) || byName("sodium");

    // Reject results that have zero for everything (junk entry)
    if (!calories && !protein && !fat && !carbs) return null;

    return {
      source: "usda",
      foodName: toTitleCase(food.description || query),
      brand: food.brandOwner || food.brandName || null,
      imageUrl: null,
      nutriScore: null,
      ingredients: food.ingredients || null,
      nutrition: { calories, protein, fat, sugar, fiber, sodium, carbs },
    };
  } catch (err) {
    console.error("USDA error:", err.message);
    return null;
  }
}

// 3. Open Food Facts — text search fallback (no key needed)
async function searchOpenFoodFacts(query) {
  try {
    const res = await axios.get("https://world.openfoodfacts.org/cgi/search.pl", {
      params: {
        search_terms: query,
        search_simple: 1,
        action: "process",
        json: 1,
        page_size: 5,
      },
      timeout: 8000,
    });

    const product = res.data?.products?.find((p) => {
      const n = p?.nutriments || {};
      // Only accept if it has at least calories or protein data
      return p?.product_name && (n["energy-kcal_100g"] || n.proteins_100g);
    });

    if (!product) return null;

    const n = product.nutriments || {};

    return {
      source: "openfoodfacts_search",
      foodName: product.product_name || query,
      brand: product.brands || null,
      imageUrl: product.image_front_url || null,
      nutriScore: product.nutriscore_grade || "unknown",
      ingredients: product.ingredients_text || null,
      nutrition: {
        calories: round2(n["energy-kcal_100g"] || 0),
        protein:  round2(n.proteins_100g || 0),
        fat:      round2(n.fat_100g || 0),
        sugar:    round2(n.sugars_100g || 0),
        fiber:    round2(n.fiber_100g || 0),
        sodium:   round2((n.sodium_100g || n.sodium || 0) * 1000),
        carbs:    round2(n.carbohydrates_100g || 0),
      },
    };
  } catch (err) {
    console.error("Open Food Facts search error:", err.message);
    return null;
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function toTitleCase(str) {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── CONTROLLERS ──────────────────────────────────────────────────────────────

exports.analyzeFoodImage = async (req, res) => {
  try {
    const userId        = req.user.id; // ✅ always from verified JWT
    const { goal = "general" } = req.body;
    const barcode       = req.body.barcode?.trim();
    const textQuery     = req.body.query?.trim();

    let productData = null;

    // ── Barcode ───────────────────────────────────────────────
    if (barcode) {
      if (!/^\d{8,14}$/.test(barcode)) {
        return res.status(400).json({ message: "Invalid barcode (must be 8–14 digits)." });
      }
      console.log("📦 Barcode:", barcode);
      productData = await getProductByBarcode(barcode);

      if (!productData) {
        return res.status(404).json({
          message: "Product not found for this barcode. Try searching by name instead.",
        });
      }

    // ── Text search ───────────────────────────────────────────
    } else if (textQuery) {
      console.log("🔤 Text search:", textQuery);

      const query = await normalizeFoodWikipedia(textQuery);
      console.log("🧠 Normalized:", query);

      // Fallback chain: USDA (best accuracy) → Open Food Facts
      productData =
        (await getNutritionFromUSDA(query)) ||
        (await searchOpenFoodFacts(query));

      if (!productData) {
        return res.status(404).json({
          message: `No nutrition data found for "${textQuery}". Try a more specific name.`,
        });
      }

    } else {
      return res.status(400).json({
        message: "Please provide a barcode or food name.",
      });
    }

    // ── Score & save ──────────────────────────────────────────
    const { nutrition, foodName, brand, imageUrl, nutriScore, ingredients, source } = productData;

    const score  = calculateScore(nutrition, goal);
    const status = classify(score);
    const reason = generateReason(nutrition, nutriScore, goal);

    console.log(`[Score] ${foodName} → ${score} (${status}) | goal: ${goal} | source: ${source}`);

    const food = await Food.create({
      userId,
      foodName,
      brand,
      imageUrl: imageUrl || null,
      ...nutrition,
      score,
      status,
      reason,
      source,
    });

    return res.json({
      foodName, brand, score, status, reason,
      nutrition, nutriScore, ingredients,
      imageUrl: imageUrl || null,
      source,
      recordId: food._id,
    });

  } catch (err) {
    console.error("analyzeFoodImage error:", err.response?.data || err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.lookupBarcode = async (req, res) => {
  const { barcode } = req.params;
  if (!barcode || !/^\d{8,14}$/.test(barcode)) {
    return res.status(400).json({ message: "Invalid barcode format" });
  }
  try {
    const product = await getProductByBarcode(barcode);
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.json(product);
  } catch (err) {
    console.error("lookupBarcode error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.searchFood = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: "Query is required" });
  try {
    const result =
      (await getNutritionFromUSDA(query)) ||
      (await searchOpenFoodFacts(query));

    if (!result) return res.status(404).json({ message: `No results for "${query}"` });
    return res.json(result);
  } catch (err) {
    console.error("searchFood error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserFoods = async (req, res) => {
  try {
    const foods = await Food.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch foods" });
  }
};
