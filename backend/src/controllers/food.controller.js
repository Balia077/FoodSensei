const Food = require("../models/food.model");
const axios = require("axios");
const FormData = require("form-data");
const normalizeFoodWikipedia = require("../utils/foodNormalizer");

/* ============================================================
   🏗️  ARCHITECTURE
   ─────────────────────────────────────────────────────────────
   Input type detection
        │
        ├── barcode number  →  Open Food Facts  (packaged goods)
        │
        ├── image upload    →  LogMeal  (dish recognition)
        │       └── if low confidence / unknown
        │               └── Fallback: Open Food Facts text search
        │
        └── text search     →  Edamam  +  Open Food Facts fallback

   Nutrition → Score → Classify → Save → Respond
   ============================================================ */

/* ─────────────────────────────────────────────
   🔧 HELPERS
───────────────────────────────────────────── */

/** Clamp a number between min and max */
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

/** Round to 2 decimal places */
const round2 = (n) => Math.round((n || 0) * 100) / 100;

/* ─────────────────────────────────────────────
   🔥 SCORING  (per 100 g / serving)
───────────────────────────────────────────── */
function calculateScore(nutrition, goal = "general") {
  let score = 100;

  // Penalise bad nutrients
  if (nutrition.sugar > 15) score -= 20;
  else if (nutrition.sugar > 8) score -= 10;

  if (nutrition.fat > 25) score -= 20;
  else if (nutrition.fat > 15) score -= 10;

  if (nutrition.sodium > 600)
    score -= 15; // mg – packaged food killer
  else if (nutrition.sodium > 300) score -= 7;

  if (nutrition.calories > 500) score -= 15;
  else if (nutrition.calories > 300) score -= 7;

  // Reward good nutrients
  if (nutrition.protein > 10) score += 10;
  else if (nutrition.protein > 5) score += 5;

  if (nutrition.fiber > 5) score += 10;
  else if (nutrition.fiber > 2) score += 5;

  // Goal modifiers
  if (goal === "weight_loss") {
    if (nutrition.calories > 400) score -= 15;
    if (nutrition.fat > 20) score -= 10;
  }
  if (goal === "muscle_gain") {
    if (nutrition.protein > 15) score += 10;
  }

  return clamp(Math.round(score), 0, 100);
}

/* ─────────────────────────────────────────────
   📊 CLASSIFICATION
───────────────────────────────────────────── */
function classify(score) {
  if (score >= 75) return "HEALTHY";
  if (score >= 50) return "MODERATE";
  return "UNHEALTHY";
}

/* ─────────────────────────────────────────────
   💬 REASON GENERATOR
───────────────────────────────────────────── */
function generateReason(nutrition, nutriScore) {
  const reasons = [];

  if (nutrition.sugar > 15) reasons.push("Very high sugar content");
  else if (nutrition.sugar > 8) reasons.push("Moderate sugar content");

  if (nutrition.fat > 25) reasons.push("Very high fat content");
  else if (nutrition.fat > 15) reasons.push("Moderate fat content");

  if (nutrition.sodium > 600)
    reasons.push("High sodium – not ideal for heart health");

  if (nutrition.calories > 500) reasons.push("High calorie density");

  if (nutrition.protein > 10) reasons.push("Good source of protein");
  if (nutrition.fiber > 5) reasons.push("Excellent fiber content");

  // Include Nutri-Score from Open Food Facts if available
  if (nutriScore && nutriScore !== "unknown") {
    reasons.push(`Nutri-Score: ${nutriScore.toUpperCase()}`);
  }

  return reasons.length > 0
    ? reasons.join(". ")
    : "Nutrition profile looks balanced";
}

/* ─────────────────────────────────────────────
   🌍  SOURCE 1 — OPEN FOOD FACTS  (barcode)
   Free, 3M+ products, great for Indian brands
───────────────────────────────────────────── */
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
        protein: round2(n.proteins_100g || 0),
        fat: round2(n.fat_100g || 0),
        sugar: round2(n.sugars_100g || 0),
        fiber: round2(n.fiber_100g || 0),
        sodium: round2((n.sodium_100g || n.sodium || 0) * 1000), // convert g → mg
        carbs: round2(n.carbohydrates_100g || 0),
      },
    };
  } catch (err) {
    console.error("Open Food Facts barcode error:", err.message);
    return null;
  }
}

/* ─────────────────────────────────────────────
   🌍  SOURCE 2 — OPEN FOOD FACTS  (text search)
   Fallback when LogMeal gives a bad result
───────────────────────────────────────────── */
async function searchOpenFoodFacts(query) {
  try {
    const res = await axios.get(
      "https://world.openfoodfacts.org/cgi/search.pl",
      {
        params: {
          search_terms: query,
          search_simple: 1,
          action: "process",
          json: 1,
          page_size: 5,
        },
        timeout: 8000,
      },
    );

    const product = res.data?.products?.find((p) => p?.product_name);

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
        protein: round2(n.proteins_100g || 0),
        fat: round2(n.fat_100g || 0),
        sugar: round2(n.sugars_100g || 0),
        fiber: round2(n.fiber_100g || 0),
        sodium: round2((n.sodium_100g || n.sodium || 0) * 1000),
        carbs: round2(n.carbohydrates_100g || 0),
      },
    };
  } catch (err) {
    console.error("Open Food Facts search error:", err.message);
    return null;
  }
}

/* ─────────────────────────────────────────────
   🌍  SOURCE 3 — EDAMAM  (text search)
   Good for fresh/whole foods & recipes
───────────────────────────────────────────── */
async function getNutritionFromEdamam(foodName) {
  try {
    const res = await axios.get("https://api.edamam.com/api/nutrition-data", {
      params: {
        app_id: process.env.EDAMAM_APP_ID,
        app_key: process.env.EDAMAM_APP_KEY,
        ingr: `100g ${foodName}`,
      },
      timeout: 8000,
    });

    const data = res.data;
    if (!data || data.calories === 0) return null;

    const n = data.totalNutrients || {};

    return {
      source: "edamam",
      foodName,
      brand: null,
      imageUrl: null,
      nutriScore: null,
      ingredients: null,
      nutrition: {
        calories: round2(data.calories || 0),
        protein: round2(n.PROCNT?.quantity || 0),
        fat: round2(n.FAT?.quantity || 0),
        sugar: round2(n.SUGAR?.quantity || 0),
        fiber: round2(n.FIBTG?.quantity || 0),
        sodium: round2(n.NA?.quantity || 0),
        carbs: round2(n.CHOCDF?.quantity || 0),
      },
    };
  } catch (err) {
    console.error("Edamam error:", err.response?.data || err.message);
    return null;
  }
}

/* ─────────────────────────────────────────────
   📷  SOURCE 4 — LOGMEAL  (image → dish name)
───────────────────────────────────────────── */
async function recognizeFoodFromImage(imageBuffer) {
  const formData = new FormData();
  formData.append("image", imageBuffer, {
    filename: "food.jpg",
    contentType: "image/jpeg",
  });

  const res = await axios.post(
    "https://api.logmeal.es/v2/image/recognition/complete",
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${process.env.LOGMEAL_TOKEN}`,
      },
      timeout: 15000,
    },
  );

  const results = res.data?.recognition_results || [];
  const top = results[0];

  return {
    name: top?.name || null,
    confidence: top?.prob || 0,
    allResults: results.slice(0, 3).map((r) => ({
      name: r.name,
      confidence: round2(r.prob * 100),
    })),
  };
}

/* ─────────────────────────────────────────────
   🔍 INPUT TYPE DETECTOR
───────────────────────────────────────────── */
function detectInputType(req) {
  const barcode = req.body.barcode?.trim();
  const textQuery = req.body.query?.trim();
  const hasImage = !!req.file;

  if (barcode && /^\d{8,14}$/.test(barcode))
    return { type: "barcode", value: barcode };
  if (hasImage) return { type: "image", value: req.file.buffer };
  if (textQuery) return { type: "text", value: textQuery };

  return { type: "unknown" };
}

/* ─────────────────────────────────────────────
   🚀 MAIN CONTROLLER
───────────────────────────────────────────── */
exports.analyzeFoodImage = async (req, res) => {
  try {
    const { userId, goal = "general" } = req.body;
    const input = detectInputType(req);

    let productData = null; // { source, foodName, brand, nutrition, nutriScore, ... }
    let logmealMeta = null; // LogMeal raw result for image inputs
    let warning = null;

    /* ══════════════════════════════════════════
       ROUTE 1: BARCODE
    ══════════════════════════════════════════ */
    if (input.type === "barcode") {
      console.log("📦 Barcode scan:", input.value);
      productData = await getProductByBarcode(input.value);

      if (!productData) {
        return res.status(404).json({
          message: "Product not found for this barcode. Try searching by name.",
        });
      }
    } else if (input.type === "image") {
      /* ══════════════════════════════════════════
       ROUTE 2: IMAGE
       Step 1 → LogMeal recognition
       Step 2 → if confidence OK → Edamam
       Step 3 → if poor result  → Open Food Facts text search
    ══════════════════════════════════════════ */
      console.log("🖼️  Image analysis starting...");

      try {
        logmealMeta = await recognizeFoodFromImage(input.value);
      } catch (logmealErr) {
        console.error("LogMeal failed:", logmealErr.message);
        warning =
          "Image recognition service unavailable. Please try a text search.";
        return res.status(503).json({ message: warning });
      }

      let { name: logmealName, confidence } = logmealMeta;

      // 🧠 normalize image result using Wikipedia
      if (logmealName) {
        logmealName = await normalizeFoodWikipedia(logmealName);
      }
      console.log(`LogMeal → "${logmealName}" (${round2(confidence * 100)}%)`);

      if (!logmealName || confidence < 0.3) {
        // Very uncertain — try Open Food Facts text search with whatever name we got
        warning =
          "Low confidence image recognition. Falling back to food database search.";
        if (logmealName) {
          productData =
            (await searchOpenFoodFacts(logmealName)) ||
            (await getNutritionFromEdamam(logmealName));
        }
        if (!productData) {
          return res.status(422).json({
            message:
              "Could not identify this food. Try uploading a clearer image or use text/barcode search.",
            logmealResults: logmealMeta?.allResults || [],
          });
        }
      } else {
        // Good confidence — try Edamam first (better for fresh/cooked food)
        // then fall back to Open Food Facts
        productData =
          (await getNutritionFromEdamam(logmealName)) ||
          (await searchOpenFoodFacts(logmealName));

        if (!productData) {
          warning = `Nutrition data not found for "${logmealName}".`;
          return res.status(404).json({
            message: warning,
            logmealResults: logmealMeta?.allResults || [],
          });
        }

        // Confidence warning (still usable)
        if (confidence < 0.6) {
          warning = `Detection confidence is ${round2(confidence * 100)}% — results may not be fully accurate.`;
        }

        // Override foodName with LogMeal name (Edamam returns same name)
        productData.foodName = logmealName;
      }
    } else if (input.type === "text") {
      /* ══════════════════════════════════════════
       ROUTE 3: TEXT SEARCH
       Try Open Food Facts first (better for brands/packaged)
       Then Edamam (better for fresh foods)
    ══════════════════════════════════════════ */
      console.log("🔤 Text search:", input.value);

      // 🧠 STEP 1: normalize input using Wikipedia (FREE AI replacement)
      let query = await normalizeFoodWikipedia(input.value);

      console.log("🧠 Normalized query:", query);

      // 🔍 STEP 2: Open Food Facts
      productData = await searchOpenFoodFacts(query);

      // 🌿 STEP 3: fallback to Edamam
      if (!productData) {
        productData = await getNutritionFromEdamam(query);
      }

      if (!productData) {
        return res.status(404).json({
          message: `No nutrition data found for "${input.value}". Try a different name.`,
        });
      }
    } else {
      return res.status(400).json({
        message: "Please provide an image, barcode, or food name to analyze.",
      });
    }

    /* ══════════════════════════════════════════
       SCORE & CLASSIFY
    ══════════════════════════════════════════ */
    const {
      nutrition,
      foodName,
      brand,
      imageUrl,
      nutriScore,
      ingredients,
      source,
    } = productData;
    const score = calculateScore(nutrition, goal);
    const status = classify(score);
    const reason = generateReason(nutrition, nutriScore);

    /* ══════════════════════════════════════════
       SAVE TO DATABASE
    ══════════════════════════════════════════ */
    const food = await Food.create({
      userId,
      foodName,
      brand,
      ...nutrition,
      score,
      status,
      reason,
      source,
    });

    /* ══════════════════════════════════════════
       RESPOND
    ══════════════════════════════════════════ */
    return res.json({
      // Core result
      foodName,
      brand,
      score,
      status,
      reason,
      warning,

      // Nutrition breakdown
      nutrition,

      // Extra metadata
      nutriScore,
      ingredients,
      imageUrl,
      source,

      // LogMeal specific (only for image inputs)
      ...(logmealMeta && {
        detectionConfidence: round2(logmealMeta.confidence * 100),
        alternativeDetections: logmealMeta.allResults,
      }),

      // DB record
      recordId: food._id,
    });
  } catch (err) {
    console.error("analyzeFoodImage error:", err.response?.data || err.message);
    return res.status(500).json({
      message: "Internal server error",
      error: err.response?.data || err.message,
    });
  }
};

/* ─────────────────────────────────────────────
   🔍 BARCODE LOOKUP (dedicated endpoint)
───────────────────────────────────────────── */
exports.lookupBarcode = async (req, res) => {
  const { barcode } = req.params;

  if (!barcode || !/^\d{8,14}$/.test(barcode)) {
    return res.status(400).json({ message: "Invalid barcode format" });
  }

  const product = await getProductByBarcode(barcode);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json(product);
};

/* ─────────────────────────────────────────────
   🔤 TEXT SEARCH (dedicated endpoint)
───────────────────────────────────────────── */
exports.searchFood = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: "Query is required" });

  const result =
    (await searchOpenFoodFacts(query)) || (await getNutritionFromEdamam(query));

  if (!result) {
    return res.status(404).json({ message: `No results for "${query}"` });
  }

  return res.json(result);
};
