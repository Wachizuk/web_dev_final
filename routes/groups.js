const userController = require("../controllers/user");
const groupController = require("../controllers/group");

const express = require("express");
const router = express.Router();


// GET: show "create group" feed
// submit the form to create a group
router.route("/new")
.get(userController.isLoggedIn, groupController.createGroupPage)
.post(userController.isLoggedIn, groupController.createGroup);



// show specific group feed
router.get("/:groupName", userController.isLoggedIn, groupController.groupPage);


module.exports = router;
