const express = require("express");
const router = express.Router();
const userController = require('../controllers/user');

router.route("/")
.get( userController.isLoggedIn, userController.mainPage);

// ---------------- LOGIN ROUTE ----------------
// This route handles POST requests to "/login"
// Example: POST /login
router.route("/login")
.post(userController.login)
.get(userController.loginPage);
// should delete the session and redirect to login page
router.route("/logout")
.post(userController.logout);

// ---------------- REGISTER ROUTE ----------------
// This route handles POST requests to "/register"
// Example: POST /register
router.route("/register")
.post(userController.register)
.get(userController.registerPage);


// Export the router so it can be used in app.js
module.exports = router;