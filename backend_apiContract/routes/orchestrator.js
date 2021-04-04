const express = require("express");
const router = express.Router();

// Importing Controllers
const controllers = require("../controllers/orchestratorControllers");

// Getting One
router.get(
  "/:id",
  controllers.getOrchestrator,
  controllers.getOrchestratorById
);

//Creating One
router.post("/", controllers.postOrchestrator);

//Updating One
router.patch(
  "/:id",
  controllers.getOrchestrator,
  controllers.updateOrchestrator
);

//Cancelling One
router.patch(
  "/cancel/:id",
  controllers.getOrchestrator,
  controllers.cancelOrchestrator
);

module.exports = router;
