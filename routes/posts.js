const postController = require('../controllers/post');
const userController = require('../controllers/user');

// Import Express framework
const express = require('express');

// Create a new router object for handling routes
const router = express.Router();


router.get('/', userController.isLoggedIn, postController.getAllPosts);
router.route('/create').get(userController.isLoggedIn, postController.getCreatePostWindow)
.post( userController.isLoggedIn, postController.createPost);
router.get('/uploads/:folder/:filename', userController.isLoggedIn, postController.getPostFile);
router.get('/card/:id', userController.isLoggedIn, postController.getPostCardById);
router.route('/edit/:id')
.patch(userController.isLoggedIn, postController.updatePostContent);

router.route("/:id")
.get(userController.isLoggedIn, postController.getPostById)
.delete(userController.isLoggedIn, postController.deletePost);

module.exports = router