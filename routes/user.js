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
.post(userController.isLoggedIn, userController.logout);

// ---------------- REGISTER ROUTE ----------------
router.route("/register")
.post(userController.register)
.get(userController.registerPage);

// ---------------- PROFILE ROUTE ----------------
router.route("/profile")
.get(userController.isLoggedIn , userController.profilePage)

router.route("/settings")
.get(userController.isLoggedIn, userController.settingsPage)

router.route("/change/username")
.patch(userController.isLoggedIn, userController.updateUsername);

router.route("/change/email")
.patch(userController.isLoggedIn, userController.updateEmail);

router.route("/change/password")
.patch(userController.isLoggedIn, userController.updatePassword);

router.route("/delete/account")
.delete(userController.isLoggedIn, userController.removeAccount);

module.exports = router;