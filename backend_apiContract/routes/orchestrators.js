const express = require("express");
const router = express.Router();

// Importing Controllers
const controllers = require("../controllers/orchestratorsController");

// Getting All
router.get("/", controllers.getOrchestrators);

// Getting all by Status
router.get("/:status", controllers.getOrchestratorsByStatus);

module.exports = router;
