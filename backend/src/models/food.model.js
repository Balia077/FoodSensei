const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  userId: String,
  foodName: String,
  calories: Number,
  protien: Number,
  fat: Number,
  sugar: Number,
  score: Number,
  status: String,
  reason: String,
}, {timestamps: true});

const foodModel = mongoose.model("Food", foodSchema);

module.exports = foodModel;