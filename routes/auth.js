const express = require("express");
const router = express.Router();
const userController = require('../controllers/user');

// ---------------- LOGIN ROUTE ----------------
// This route handles POST requests to "/login"
// Example: POST /auth/login
router.route("/login")
.post(userController.login)
.get(userController.loginPage);

// NOTE: NOT YET TESTED BECAUSE CLIENT SIDE IS MISSING
// should delete the session and redirect to login page
router.route("/logout")
.post(userController.logout);


// Export the router so it can be used in app.js
module.exports = router;