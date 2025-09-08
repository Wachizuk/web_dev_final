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

// ---------------- SEARCH BAR ROUTE ----------------

router.route("/friends")
.get(userController.isLoggedIn, userController.getFriends);

router.route("/friends/is-friend/:id")
.get(userController.isLoggedIn, userController.isFriend);

router.route("/friends/:userId")
.post( userController.isLoggedIn, userController.addFriend);

router.route("/friends/:userId")
.delete(userController.isLoggedIn, userController.removeFriend);


// ---------------- PROFILE ROUTE ----------------
router.route("/profile")
.get(userController.isLoggedIn , userController.profilePage)

router.route("/profile/:username")
.get(userController.isLoggedIn , userController.selectedProfilePage)

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

router.route("/change-address").post(userController.isLoggedIn,userController.updateAddress);


module.exports = router;