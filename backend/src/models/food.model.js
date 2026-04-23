const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    foodName: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      default: null,
    },
    source: {
      type: String,
      enum: ["logmeal", "edamam", "openfoodfacts_barcode", "openfoodfacts_search"],
      default: "edamam",
    },

    // Nutrition (per 100g or per serving)
    calories: { type: Number, default: 0 },
    protein:  { type: Number, default: 0 },
    fat:      { type: Number, default: 0 },
    sugar:    { type: Number, default: 0 },
    fiber:    { type: Number, default: 0 },
    sodium:   { type: Number, default: 0 },
    carbs:    { type: Number, default: 0 },

    // Analysis
    score:  { type: Number, required: true },
    status: { type: String, enum: ["HEALTHY", "MODERATE", "UNHEALTHY"], required: true },
    reason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Food", foodSchema);