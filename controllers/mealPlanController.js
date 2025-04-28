// controllers/mealPlanController.js
const mealPlanService = require("../services/mealPlanService");
const { validationResult } = require("express-validator");

class MealPlanController {
  // Create a new meal plan
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId } = req.user;
      const mealPlan = await mealPlanService.createMealPlan(userId, req.body);

      res.status(201).json({
        success: true,
        message: "Meal plan created successfully",
        data: mealPlan,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get all meal plans for user
  async getAll(req, res) {
    try {
      const { userId } = req.user;
      const mealPlans = await mealPlanService.getUserMealPlans(userId);

      res.json({
        success: true,
        data: mealPlans,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get a specific meal plan
  async getOne(req, res) {
    try {
      const { userId } = req.user;
      const { mealPlanId } = req.params;

      const mealPlan = await MealPlan.findOne({ _id: mealPlanId, userId });
      if (!mealPlan) {
        return res.status(404).json({
          success: false,
          message: "Meal plan not found",
        });
      }

      res.json({
        success: true,
        data: mealPlan,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update a meal plan
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId } = req.user;
      const { mealPlanId } = req.params;

      const mealPlan = await mealPlanService.updateMealPlan(
        userId,
        mealPlanId,
        req.body
      );

      res.json({
        success: true,
        message: "Meal plan updated successfully",
        data: mealPlan,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Pause a meal plan
  async pause(req, res) {
    try {
      const { userId } = req.user;
      const { mealPlanId } = req.params;

      const mealPlan = await mealPlanService.pauseMealPlan(userId, mealPlanId);

      res.json({
        success: true,
        message: "Meal plan paused successfully",
        data: mealPlan,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Resume a meal plan
  async resume(req, res) {
    try {
      const { userId } = req.user;
      const { mealPlanId } = req.params;

      const mealPlan = await mealPlanService.resumeMealPlan(userId, mealPlanId);

      res.json({
        success: true,
        message: "Meal plan resumed successfully",
        data: mealPlan,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Cancel a meal plan
  async cancel(req, res) {
    try {
      const { userId } = req.user;
      const { mealPlanId } = req.params;

      const mealPlan = await mealPlanService.cancelMealPlan(userId, mealPlanId);

      res.json({
        success: true,
        message: "Meal plan cancelled successfully",
        data: mealPlan,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get upcoming deliveries
  async getUpcoming(req, res) {
    try {
      const { userId } = req.user;
      const mealPlans = await MealPlan.find({
        userId,
        active: true,
        nextDeliveryDate: { $gte: new Date() },
      }).sort({ nextDeliveryDate: 1 });

      res.json({
        success: true,
        data: mealPlans,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new MealPlanController();
