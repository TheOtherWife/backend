// routes/mealPlanRoutes.js
const express = require("express");
const router = express.Router();
const mealPlanController = require("../controllers/mealPlanController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { validateMealPlan } = require("../validators/mealPlanValidator");

// Create a new meal plan
router.post("/", authMiddleware, validateMealPlan, mealPlanController.create);

// Get all meal plans for user
router.get("/", authMiddleware, mealPlanController.getAll);

// Get a specific meal plan
router.get("/:mealPlanId", authMiddleware, mealPlanController.getOne);

// Update a meal plan
router.put(
  "/:mealPlanId",
  authMiddleware,
  validateMealPlan,
  mealPlanController.update
);

// Pause a meal plan
router.post("/:mealPlanId/pause", authMiddleware, mealPlanController.pause);

// Resume a meal plan
router.post("/:mealPlanId/resume", authMiddleware, mealPlanController.resume);

// Cancel a meal plan
router.post("/:mealPlanId/cancel", authMiddleware, mealPlanController.cancel);

// Get upcoming deliveries
router.get("/upcoming", authMiddleware, mealPlanController.getUpcoming);

module.exports = router;
