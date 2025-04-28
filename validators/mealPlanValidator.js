// validators/mealPlanValidator.js
const { check } = require("express-validator");

exports.validateMealPlan = [
  check("name").notEmpty().withMessage("Meal plan name is required"),
  check("items")
    .isArray({ min: 1 })
    .withMessage("At least one item is required"),
  check("items.*.menuId").notEmpty().withMessage("Menu item is required"),
  check("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  check("schedule.frequency")
    .isIn(["daily", "weekly", "biweekly", "monthly", "custom"])
    .withMessage("Invalid schedule frequency"),
  check("schedule.startDate")
    .isDate()
    .withMessage("Valid start date is required"),
  check("schedule.deliveryTime")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Delivery time must be in HH:MM format"),
  check("deliveryAddress.street")
    .notEmpty()
    .withMessage("Street address is required"),
  check("deliveryAddress.city").notEmpty().withMessage("City is required"),
  check("deliveryAddress.state").notEmpty().withMessage("State is required"),
  check("contactPhone").notEmpty().withMessage("Contact phone is required"),
];
