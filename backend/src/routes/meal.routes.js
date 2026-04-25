const express = require("express");
const router  = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  generateMealPlan,
  saveMealPlan,
  getSavedMeals,
  deleteSavedMeal,
} = require("../controllers/meal.controller");

router.post("/generate", authMiddleware, generateMealPlan);
router.post("/save",     authMiddleware, saveMealPlan);
router.get("/saved",     authMiddleware, getSavedMeals);
router.delete("/saved/:id", authMiddleware, deleteSavedMeal);

module.exports = router;