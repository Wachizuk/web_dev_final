
const express = require('express');
const userController = require('../controllers/user');
const router = express.Router();


// ---------------- MAIN PAGE ROUTE ----------------
router.route("/")
.get( userController.isLoggedIn, userController.mainPage);


module.exports = router