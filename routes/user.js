const express = require("express");
const router = express.Router();
const userController = require('../controllers/user');

// ---------------- LOGIN ROUTE ----------------
// This route handles POST requests to "/login"
router.route("/login")
.post(userController.login)
.get(userController.loginPage);

// ---------------- LOGOUT ROUTE ----------------
router.route("/logout")
.post(userController.logout);

// ---------------- REGISTER ROUTE ----------------
router.route("/register")
.post(userController.register)
.get(userController.registerPage);


module.exports = router;