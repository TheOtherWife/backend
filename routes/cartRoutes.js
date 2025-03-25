const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Add item to cart
router.post("/", authMiddleware, cartController.addItem);

// Get cart
router.get("/", authMiddleware, cartController.get);

// Update cart item
router.put("/:itemId", authMiddleware, cartController.updateItem);

// Remove item from cart
router.delete("/:itemId", authMiddleware, cartController.removeItem);

// Clear cart
router.delete("/", authMiddleware, cartController.clear);

module.exports = router;
