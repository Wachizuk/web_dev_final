const express = require("express");
const router = express.Router();
const userController = require('../controllers/user');

// ---------------- LOGIN ROUTE ----------------
// This route handles POST requests to "/login"
// Example: POST /auth/login
router.route("/login").post(userController.login);

// Export the router so it can be used in app.js
module.exports = router;