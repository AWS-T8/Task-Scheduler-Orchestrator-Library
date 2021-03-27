const express = require("express");
const router = express.Router();

// Importing Controllers
const controllers = require("../controllers/taskControllers.js");

// Getting One
router.get("/:id", controllers.getTask, controllers.getTaskById);

//Creating One
router.post("/", controllers.postTask);

//Updating One
router.patch("/:id", controllers.getTask, controllers.updateTask);

//Cancelling One
router.patch("/cancel/:id", controllers.getTask, controllers.cancelTask);

module.exports = router;
