const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const User = require("../models/user.model");

exports.generateMealPlan = async (req, res) => {
  const { budget, currency, currencySymbol, diets } = req.body;

  if (!budget || budget <= 0)
    return res.status(400).json({ message: "Invalid budget" });

  const prompt = `You are a world-class nutritionist and chef. A user has a daily food budget of ${currencySymbol}${budget} ${currency}.
${diets?.length ? `Dietary preferences: ${diets.join(", ")}.` : ""}

Create an optimized FULL DAY meal plan (Breakfast, Lunch, Snack, Dinner) within this budget that maximizes nutrition.
Each meal MUST contain: protein, fiber, healthy fats, vitamins, and minerals. Meals should be realistic, affordable, and delicious.

Respond ONLY with a valid JSON object (no markdown, no extra text) in this exact structure:
{
  "meals": [
    {
      "mealType": "Breakfast",
      "name": "Meal name",
      "description": "Short appetizing 1-sentence description",
      "estimatedCost": 50,
      "ingredients": ["ingredient1", "ingredient2", "ingredient3", "ingredient4", "ingredient5"],
      "nutrition": {
        "calories": 350,
        "protein": 18,
        "carbs": 40,
        "fat": 12,
        "fiber": 6,
        "sodium": 280,
        "vitamins": ["Vitamin C", "Vitamin B12"],
        "minerals": ["Iron", "Calcium"]
      },
      "healthBenefit": "One-line key health benefit"
    }
  ],
  "summary": {
    "totalCost": 200,
    "totalCalories": 1800,
    "totalProtein": 80,
    "totalFiber": 28,
    "budgetUsed": 85,
    "tip": "A short practical nutrition tip for the day"
  }
}

IMPORTANT:
- All costs must be in ${currency} and sum to at most ${budget}
- Calories should total 1600-2200 kcal for a healthy adult
- Protein total should be 60-120g
- Make meals culturally appropriate and realistic for ${currency} purchasing power
- Do NOT use markdown fences or any text outside the JSON`;

  try {
    const model  = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text   = result.response.text().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    console.error("Meal plan error:", err.message);
    res.status(500).json({ message: "Failed to generate meal plan" });
  }
};

// POST /api/meal/save
exports.saveMealPlan = async (req, res) => {
  try {
    const { meals, summary, currency, currencySymbol, budget } = req.body;
    if (!meals?.length) return res.status(400).json({ message: "No meals to save" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.savedMeals.push({ meals, summary, currency, currencySymbol, budget });
    await user.save();

    res.json({ message: "Meal plan saved successfully", total: user.savedMeals.length });
  } catch (err) {
    console.error("Save meal error:", err.message);
    res.status(500).json({ message: "Failed to save meal plan" });
  }
};

// GET /api/meal/saved
exports.getSavedMeals = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("savedMeals");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Return newest first
    const sorted = [...user.savedMeals].reverse();
    res.json({ savedMeals: sorted });
  } catch (err) {
    console.error("Get saved meals error:", err.message);
    res.status(500).json({ message: "Failed to fetch saved meals" });
  }
};

// DELETE /api/meal/saved/:id
exports.deleteSavedMeal = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.savedMeals = user.savedMeals.filter(m => m._id.toString() !== req.params.id);
    await user.save();

    res.json({ message: "Meal plan deleted" });
  } catch (err) {
    console.error("Delete meal error:", err.message);
    res.status(500).json({ message: "Failed to delete meal plan" });
  }
};