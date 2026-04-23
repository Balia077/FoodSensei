const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload");

const {
  analyzeFoodImage
} = require("../controllers/food.controller");

// ✅ Correct
router.post(
  "/analyze-image",
  upload.single("image"),
  analyzeFoodImage
);

module.exports = router;