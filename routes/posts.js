const postController = require('../controllers/post');
const userController = require('../controllers/user');

// Import Express framework
const express = require('express');

// Create a new router object for handling routes
const router = express.Router();

router.get('/', userController.isLoggedIn, postController.getAllPosts);
router.get('/uploads/:folder/:filename', userController.isLoggedIn, postController.getPostFile);
router.get('/card/:id', userController.isLoggedIn, postController.getPostCardById);
router.get('/:id', userController.isLoggedIn, postController.getPostById);

module.exports = router