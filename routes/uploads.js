const express = require("express");
const router = express.Router();
const uploadsController = require("../controllers/uploads");
const userController = require("../controllers/user")

// Middleware: accept raw image bytes (no external libraries used)
const rawImage = express.raw({
  type: ["image/png", "image/jpeg", "image/webp"],
  limit: "10mb",
});

// posts have both videos and images
const rawFile = express.raw({
  type: ["image/png", "image/jpeg", "image/webp", "video/mp4"],
  limit: "10mb",
});

// GET: return an avatar by filename (e.g. /uploads/avatar/alice.jpg)
// POST: upload a new avatar for a user (e.g. /uploads/avatar/alice)
router.route("/avatar/:filename",).get( userController.isLoggedIn ,uploadsController.getAvatar);
router.route("/avatar/new").post( userController.isLoggedIn, rawImage , uploadsController.uploadAvatar);


router.route("/posts/:postId/:blockIndex/:fileName")
.post(userController.isLoggedIn , rawFile,  uploadsController.uploadPostFile);

router.route("/posts/:postId/:filename")
.get( userController.isLoggedIn ,uploadsController.getPostFile)



module.exports = router;
