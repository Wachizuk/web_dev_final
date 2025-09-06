const router = require("express").Router();
const suggestController = require("../controllers/suggest");
const userController = require("../controllers/user"); // optional auth

router.get("/", userController.isLoggedIn, suggestController.suggest);

module.exports = router;
