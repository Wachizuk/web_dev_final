const express = require("express");
const router = express.Router();

const userController = require("../controllers/user");
const groupController = require("../controllers/group");


// GET: show "create group" feed
// submit the form to create a group
router.route("/new")
.get(userController.isLoggedIn, groupController.createGroupPage)
.post(userController.isLoggedIn, groupController.createGroup);



// show specific group feed
router.get("/:groupName", userController.isLoggedIn, groupController.groupPage);



// get group membership status
router.get("/:groupName/membership", userController.isLoggedIn, groupController.getMembership);
// toggle follow/unfollow
router.post("/:groupName/follow", userController.isLoggedIn, groupController.toggleFollow);
// remove a member (admin only)
router.post('/:groupName/members/:userId/remove', groupController.removeMember);
// set member role (admin only)
router.post('/:groupName/members/:userId/role', groupController.setMemberRole);



// get group members list
router.get("/:groupName/members", userController.isLoggedIn, groupController.getMembers);

module.exports = router;
