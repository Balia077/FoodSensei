const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const {
  analyzeFoodImage,
  lookupBarcode,
  searchFood,
} = require("../controllers/food.controller");

// 📷 Image upload OR barcode in body OR text query in body
router.post("/analyze-image", upload.single("image"), analyzeFoodImage);

// 📦 Barcode lookup  →  GET /api/food/barcode/8901058857846
router.get("/barcode/:barcode", lookupBarcode);

// 🔤 Text search     →  GET /api/food/search?query=maggi noodles
router.get("/search", searchFood);

module.exports = router;