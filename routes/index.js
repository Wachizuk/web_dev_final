// Import the 'path' module to work with file and directory paths
const path = require('path');

// Import Express framework
const express = require('express');

// Create a new router object for handling routes
const router = express.Router();

// GET /
// When the client sends a GET request to the root path ("/"),
// send back the 'index.html' file from the 'public' folder
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Export the router so it can be used in app.js
module.exports = router;