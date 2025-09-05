const express = require("express");
const router = express.Router();
const uploadsController = require("../controllers/uploads");
const userController = require("../controllers/user")

// Middleware: accept raw image bytes (no external libraries used)
const rawImage = express.raw({
  type: ["image/png", "image/jpeg", "image/webp"],
  limit: "10mb",
});

// GET: return an avatar by filename (e.g. /uploads/avatar/alice.jpg)
// POST: upload a new avatar for a user (e.g. /uploads/avatar/alice)
router.route("/avatar/:filename",).get( userController.isLoggedIn ,uploadsController.getAvatar);
router.route("/avatar/new").post( userController.isLoggedIn, rawImage , uploadsController.uploadAvatar);



module.exports = router;
