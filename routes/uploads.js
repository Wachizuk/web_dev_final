const express = require("express");
const router = express.Router();
const uploadsController = require("../controllers/uploads");

// Middleware: accept raw image bytes (no external libraries used)
const rawImage = express.raw({
  type: ["image/png", "image/jpeg", "image/webp"],
  limit: "5mb",
});

// GET: return an avatar by filename (e.g. /uploads/avatar/alice.jpg)
// POST: upload a new avatar for a user (e.g. /uploads/avatar/alice)
router.get("/avatar/:filename", uploadsController.getAvatar);
router.post("/avatar/:userId", rawImage, uploadsController.uploadAvatar);

module.exports = router;
