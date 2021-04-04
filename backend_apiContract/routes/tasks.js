const express = require("express");
const router = express.Router();

// Importing Controllers
const controllers = require("../controllers/tasksControllers.js");

// Getting All
router.get("/", controllers.getTasks);

// Getting all by Status
router.get("/:status", controllers.getTasksByStatus);

module.exports = router;
