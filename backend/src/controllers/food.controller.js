const Food = require("../models/food.model");
const axios = require("axios");
const FormData = require("form-data");
const normalizeFoodWikipedia = require("../utils/foodNormalizer");


const clamp = (val, min, max) => Math.max(min, Math.min(max, val));


const round2 = (n) => Math.round((n || 0) * 100) / 100;


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
    calories = 0,
    sugar    = 0,
    fat      = 0,
    sodium   = 0,    // mg
    protein  = 0,
    fiber    = 0,
    carbs    = 0,
  } = nutrition;

  // ── 1. PER-NUTRIENT SCORES (0–100) ───────────────────────
  const calorieScore = scoreNutrient(calories, { bad: 200, worse: 350, worst: 500 }, true);
  const sugarScore   = scoreNutrient(sugar,    { bad: 6,   worse: 12,  worst: 22  }, true);
  const fatScore     = scoreNutrient(fat,      { bad: 12,  worse: 20,  worst: 30  }, true);
  const sodiumScore  = scoreNutrient(sodium,   { bad: 250, worse: 500, worst: 750 }, true);
  const proteinScore = scoreNutrient(protein,  { bad: 3,   worse: 8,   worst: 15  }, false);
  const fiberScore   = scoreNutrient(fiber,    { bad: 1.5, worse: 3,   worst: 6   }, false);

  
  const weights = {
    calories: 0.18,
    sugar:    0.22,   // sugar is the biggest offender in processed food
    fat:      0.18,
    sodium:   0.18,   // critical for packaged/Indian snacks
    protein:  0.14,
    fiber:    0.10,
  };

  let base =
    calorieScore * weights.calories +
    sugarScore   * weights.sugar    +
    fatScore     * weights.fat      +
    sodiumScore  * weights.sodium   +
    proteinScore * weights.protein  +
    fiberScore   * weights.fiber;

  
  const badCount = [
    sugar    > 12,
    fat      > 20,
    sodium   > 500,
    calories > 350,
  ].filter(Boolean).length;

  if (badCount >= 3) base *= 0.65;        // truly junk — hard 35% cut
  else if (badCount === 2) base *= 0.80;  // problematic — 20% cut

  
  if (sugar    > 30)  base = Math.min(base, 30);  // candy / soda territory
  if (fat      > 35)  base = Math.min(base, 35);  // deep-fried / butter
  if (sodium   > 900) base = Math.min(base, 35);  // extremely salty
  if (calories > 550) base = Math.min(base, 40);

 
  let modifier = 0;

  if (goal === "weight_loss") {
    if (calories > 300)  modifier -= 8;
    else if (calories < 150) modifier += 5;
    if (fat > 15)        modifier -= 5;
    if (fiber > 4)       modifier += 5;
    if (sugar > 10)      modifier -= 5;
  }

  if (goal === "muscle_gain") {
    if (protein > 20)    modifier += 10;
    else if (protein > 12) modifier += 6;
    else if (protein < 5)  modifier -= 8; // low-protein is bad for this goal
    if (carbs > 40 && protein > 10) modifier += 4; // acceptable carb+protein combo
  }

  if (goal === "general") {
    // Small bonus for genuinely clean profiles only
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
    if (["A", "B"].includes(grade))   positives.push(`Nutri-Score ${grade} (official rating)`);
    else if (["D", "E"].includes(grade)) negatives.push(`Nutri-Score ${grade} (officially rated poor)`);
    else negatives.push(`Nutri-Score ${grade}`);
  }

  const parts = [];
  if (negatives.length) parts.push(`Issues: ${negatives.join(", ")}.`);
  if (positives.length) parts.push(`Positives: ${positives.join(", ")}.`);
  if (!parts.length)    parts.push("Nutrition profile looks balanced.");

  return parts.join(" ");
}


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
        sodium:   round2((n.sodium_100g || n.sodium || 0) * 1000), // g → mg
        carbs:    round2(n.carbohydrates_100g || 0),
      },
    };
  } catch (err) {
    console.error("Open Food Facts barcode error:", err.message);
    return null;
  }
}


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


async function getNutritionFromEdamam(foodName) {
  try {
    const res = await axios.get("https://api.edamam.com/api/nutrition-data", {
      params: {
        app_id:  process.env.EDAMAM_APP_ID,
        app_key: process.env.EDAMAM_APP_KEY,
        ingr:    `100g ${foodName}`,
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
        protein:  round2(n.PROCNT?.quantity || 0),
        fat:      round2(n.FAT?.quantity || 0),
        sugar:    round2(n.SUGAR?.quantity || 0),
        fiber:    round2(n.FIBTG?.quantity || 0),
        sodium:   round2(n.NA?.quantity || 0),
        carbs:    round2(n.CHOCDF?.quantity || 0),
      },
    };
  } catch (err) {
    console.error("Edamam error:", err.response?.data || err.message);
    return null;
  }
}


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


function detectInputType(req) {
  const barcode   = req.body.barcode?.trim();
  const textQuery = req.body.query?.trim();
  const hasImage  = !!req.file;

  if (barcode && /^\d{8,14}$/.test(barcode))
    return { type: "barcode", value: barcode };
  if (hasImage) return { type: "image", value: req.file.buffer };
  if (textQuery) return { type: "text", value: textQuery };

  return { type: "unknown" };
}


exports.analyzeFoodImage = async (req, res) => {
  try {
    const { userId, goal = "general" } = req.body;
    const input = detectInputType(req);

    let productData = null;
    let logmealMeta = null;
    let warning     = null;


    if (input.type === "barcode") {
      console.log("📦 Barcode scan:", input.value);
      productData = await getProductByBarcode(input.value);

      if (!productData) {
        return res.status(404).json({
          message: "Product not found for this barcode, Check Your Internet Connection or Try searching by name.",
        });
      }

    } else if (input.type === "image") {
      
      console.log("🖼️  Image analysis starting...");

      try {
        logmealMeta = await recognizeFoodFromImage(input.value);
      } catch (logmealErr) {
        console.error("LogMeal failed:", logmealErr.message);
        warning = "Image recognition service unavailable. Please try a text search.";
        return res.status(503).json({ message: warning });
      }

      let { name: logmealName, confidence } = logmealMeta;

      if (logmealName) {
        logmealName = await normalizeFoodWikipedia(logmealName);
      }
      console.log(`LogMeal → "${logmealName}" (${round2(confidence * 100)}%)`);

      if (!logmealName || confidence < 0.3) {
        warning = "Low confidence image recognition. Falling back to food database search.";
        if (logmealName) {
          productData =
            (await searchOpenFoodFacts(logmealName)) ||
            (await getNutritionFromEdamam(logmealName));
        }
        if (!productData) {
          return res.status(422).json({
            message: "Could not identify this food. Try uploading a clearer image or use text/barcode search.",
            logmealResults: logmealMeta?.allResults || [],
          });
        }
      } else {
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

        if (confidence < 0.6) {
          warning = `Detection confidence is ${round2(confidence * 100)}% — results may not be fully accurate.`;
        }

        productData.foodName = logmealName;
      }

    } else if (input.type === "text") {
      
      console.log("🔤 Text search:", input.value);

      let query = await normalizeFoodWikipedia(input.value);
      console.log("🧠 Normalized query:", query);

      productData = await searchOpenFoodFacts(query);
      if (!productData) productData = await getNutritionFromEdamam(query);

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

    
    const {
      nutrition,
      foodName,
      brand,
      imageUrl,
      nutriScore,
      ingredients,
      source,
    } = productData;

    const fallbackImage = `https://source.unsplash.com/300x200/?${encodeURIComponent(foodName)}`;

    const finalImageUrl =
      imageUrl ||
      productData.image_front_url ||
      productData.image_small_url ||
      fallbackImage;

    const score  = calculateScore(nutrition, goal);
    const status = classify(score);
    const reason = generateReason(nutrition, nutriScore, goal);

    console.log(`[Score] ${foodName} → ${score} (${status}) | goal: ${goal}`);
    console.log("[Nutrition]", nutrition);

    
    const food = await Food.create({
      userId,
      foodName,
      brand,
      imageUrl: finalImageUrl,
      ...nutrition,
      score,
      status,
      reason,
      source,
    });

    
    return res.json({
      foodName,
      brand,
      score,
      status,
      reason,
      warning,
      nutrition,
      nutriScore,
      ingredients,
      imageUrl,
      source,

      
      ...(logmealMeta && {
        detectionConfidence:   round2(logmealMeta.confidence * 100),
        alternativeDetections: logmealMeta.allResults,
      }),


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


exports.searchFood = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: "Query is required" });

  const result =
    (await searchOpenFoodFacts(query)) ||
    (await getNutritionFromEdamam(query));

  if (!result) {
    return res.status(404).json({ message: `No results for "${query}"` });
  }

  return res.json(result);
};

exports.getUserFoods = async (req, res) => {
  try {
    const { userId } = req.query;

    const foods = await Food.find({ userId }).sort({ createdAt: -1 });

    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch foods" });
  }
};
