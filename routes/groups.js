const userController = require("../controllers/user");
const groupController = require("../controllers/group");

const express = require("express");
const router = express.Router();



router.get("/new", userController.isLoggedIn, groupController.createGroupPage);
router.get("/:groupName", userController.isLoggedIn, groupController.groupPage);


module.exports = router;
