
const express = require('express');
const userController = require('../controllers/user');
const postController = require('../controllers/post')
const router = express.Router();


// ---------------- MAIN PAGE ROUTE ----------------
router.get("/main-feed", userController.isLoggedIn, postController.renderMainFeed);

router.route("/")
.get( userController.isLoggedIn, userController.mainPage);


module.exports = router