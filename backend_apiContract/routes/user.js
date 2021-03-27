const express = require("express");
const router = express.Router();

// Importing Controllers
const controllers = require("../controllers/userController");

// Getting One
router.post("/register", controllers.register);

//Creating One
router.post("/login", controllers.login);

module.exports = router;
