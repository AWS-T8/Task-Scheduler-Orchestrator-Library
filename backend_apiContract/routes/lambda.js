const express = require("express");
const router = express.Router();

// Importing Controllers
const controllers = require("../controllers/lambdaControllers");

// Getting All
router.post("/", controllers.postLambda);

// Creating One
router.get("/", controllers.getLambda);

// Setting Status
router.get("/:key", controllers.getLambda);

module.exports = router;
