const express = require("express");
const router = express.Router();

// Importing Controllers
const controllers = require("../controllers/userController");

// Register
router.post("/register", controllers.register);

// Login
router.post("/login", controllers.login);

module.exports = router;
