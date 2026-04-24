const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  analyzeFoodImage,
  lookupBarcode,
  searchFood,
  getUserFoods
} = require("../controllers/food.controller");

// 📷 Image upload OR barcode in body OR text query in body
// upload runs first (parses multipart), then auth reads req.user from JWT cookie
router.post("/analyze-image", upload.single("image"), authMiddleware, analyzeFoodImage);

// 📦 Barcode lookup  →  GET /api/food/barcode/8901058857846
router.get("/barcode/:barcode", authMiddleware, lookupBarcode);

// 🔤 Text search     →  GET /api/food/search?query=maggi noodles
router.get("/search", authMiddleware, searchFood);

// 📋 User food history  →  GET /api/food/list
router.get("/list", getUserFoods);

module.exports = router;