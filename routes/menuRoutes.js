const express = require("express");
const menuController = require("../controllers/menuController");
const { vendorAuthMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new menu item
router.post("/", vendorAuthMiddleware, menuController.createMenu);

// Get all menu items for a vendor
router.get("/:vendorId", menuController.getMenusByVendorId);

// Update a menu item
router.put("/:menuId", vendorAuthMiddleware, menuController.updateMenu);

// Delete a menu item
router.delete("/:menuId", vendorAuthMiddleware, menuController.deleteMenu);

// Make a menu item unavailable
router.patch(
  "/:menuId/unavailable",
  vendorAuthMiddleware,
  menuController.makeMenuUnavailable
);

module.exports = router;
