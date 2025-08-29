
const userController = require('../controllers/user');

// Import Express framework
const express = require('express');

// Create a new router object for handling routes
const router = express.Router();

// GET /
// if user is logged in give main page, otherwise redirect to login page
router.get('/', userController.isLoggedIn, userController.mainPage);


// Export the router so it can be used in app.js
module.exports = router;