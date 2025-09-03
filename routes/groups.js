const userController = require("../controllers/user");
const groupController = require("../controllers/group");

const express = require("express");
const router = express.Router();


// show "create group" feed
router.get("/new", userController.isLoggedIn, groupController.createGroupPage);

// submit the form to create a group
router.post("/", userController.isLoggedIn, groupController.createGroup);

// show specific group feed
router.get("/:groupName", userController.isLoggedIn, groupController.groupPage);


module.exports = router;
