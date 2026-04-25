const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const User = require("../models/user.model");

exports.generateMealPlan = async (req, res) => {
  const { budget, currency, currencySymbol, diets } = req.body;

  if (!budget || budget <= 0)
    return res.status(400).json({ message: "Invalid budget" });

  const prompt = `You are a precise nutritionist and food cost analyst. A user has a daily food budget of ${currencySymbol}${budget} (currency: ${currency}, symbol: "${currencySymbol}").
${diets?.length ? `Dietary preferences: ${diets.join(", ")}.` : ""}

CRITICAL CURRENCY RULE (read first):
- The budget is ${currencySymbol}${budget} ${currency}. This is the FINAL amount. Do NOT convert it to any other currency.
- ALL estimatedCost values in your response MUST be in ${currency} and use the symbol "${currencySymbol}".
- If budget is $5 USD, every cost is in USD (e.g. estimatedCost: 1, meaning $1). NOT ₹440 or any converted value.
- If budget is ₹200 INR, every cost is in INR. NOT $2 or any converted value.
- NEVER do currency conversion. Use the exact currency given: ${currency} with symbol ${currencySymbol}.

Create a realistic FULL DAY meal plan (Breakfast, Lunch, Snack, Dinner) that fits within this budget.

══════════════════════════════════════════════
CRITICAL RULE #1 — NUTRITION MUST MATCH COST
══════════════════════════════════════════════
You MUST calculate nutrition based on the ACTUAL INGREDIENTS and their REAL quantities that the budget can buy.
DO NOT inflate protein, calories, or any other values. Be conservative and accurate.

REAL protein content per cheap ingredient (for reference):
- 1 whole egg (~₹6-8 INR / $0.10 USD): 6g protein
- 100g cooked dal/lentils (~₹5 INR): 9g protein
- 100g cooked rice (~₹3 INR): 2.7g protein
- 1 roti/chapati (~₹2 INR): 3g protein
- 100g paneer (~₹40-50 INR / $0.60 USD): 18g protein
- 100g chicken (~₹25-35 INR / $0.40 USD): 27g protein
- 30g peanuts (~₹5 INR): 8g protein
- 200ml whole milk (~₹10 INR): 6.6g protein
- 1 banana (~₹5 INR): 1.3g protein
- 50g besan/gram flour (~₹4 INR): 11g protein (but this is RAW weight, cooked cheela = ~2 tbsp besan = 5-6g protein)
- 30g oats (~₹5 INR): 4g protein

REAL calorie reference:
- 100g cooked rice: ~130 kcal
- 1 roti: ~100 kcal
- 1 egg: ~70 kcal
- 100g cooked dal: ~115 kcal
- 1 tbsp oil: ~120 kcal
- 1 banana: ~90 kcal

══════════════════════════════════════════════
CRITICAL RULE #2 — REALISTIC LOCAL PRICING
══════════════════════════════════════════════
The currency is ${currency}. Do NOT convert. All costs stay in ${currency}.

Realistic food costs IN ${currency} for common ingredients:
${currency === "INR"
  ? `- 1 egg: ₹6-8 | 100g dal (cooked): ₹4-6 | 1 roti: ₹2 | 100g rice (cooked): ₹3 | 30g peanuts: ₹5 | 1 banana: ₹5 | 200ml milk: ₹10 | 100g paneer: ₹45 | 100g chicken: ₹30`
  : `- 1 egg: $0.15 | 1 cup oats: $0.30 | 1 slice bread: $0.10 | 100g canned tuna: $0.80 | 1 banana: $0.20 | 1 cup rice (cooked): $0.15 | 100g chicken breast: $0.60 | 1 cup lentils (cooked): $0.25`
}

For a budget of ${currencySymbol}${budget} ${currency}:
- Calculate what ingredients can ACTUALLY be bought at the prices above
- Then calculate nutrition from those REAL quantities
- NEVER claim more protein than the ingredients can realistically provide
- NEVER convert the budget to another currency — stay in ${currency} throughout

══════════════════════════════════════════════
CRITICAL RULE #3 — DAILY TOTALS MUST BE HONEST
══════════════════════════════════════════════
- If budget is very low (e.g. ₹50), total protein may only be 20-35g/day. That is HONEST and ACCEPTABLE.
- Do NOT force protein to 60-120g if the budget cannot support it. Be truthful.
- If budget is adequate (₹200+, $10+), aim for 50-80g protein across the day.
- Total calories should match what the food actually provides, not an idealized number.

══════════════════════════════════════════════
OUTPUT FORMAT
══════════════════════════════════════════════
Respond ONLY with a valid JSON object (no markdown, no extra text):
{
  "meals": [
    {
      "mealType": "Breakfast",
      "name": "Meal name",
      "description": "Short appetizing 1-sentence description",
      "estimatedCost": 20,
      "ingredients": ["ingredient with quantity e.g. 2 eggs", "50g besan", "1 onion"],
      "nutrition": {
        "calories": 180,
        "protein": 12,
        "carbs": 15,
        "fat": 8,
        "fiber": 3,
        "sodium": 200,
        "vitamins": ["Vitamin A", "Vitamin B12"],
        "minerals": ["Iron", "Calcium"]
      },
      "healthBenefit": "One-line honest health benefit"
    }
  ],
  "summary": {
    "totalCost": 50,
    "totalCalories": 1100,
    "totalProtein": 35,
    "totalFiber": 18,
    "budgetUsed": 90,
    "tip": "A practical tip about eating well on this budget"
  }
}

FINAL CHECKS before responding:
1. Sum of all estimatedCost == totalCost and <= ${budget}
2. budgetUsed = round((totalCost / ${budget}) * 100)
3. Protein in each meal is achievable from the listed ingredients at the listed cost
4. Do NOT use markdown fences or any text outside the JSON`;

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