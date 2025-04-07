const express = require("express");
const menuController = require("../controllers/menuController");
const { vendorAuthMiddleware } = require("../middleware/authMiddleware");
const upload = require("../utils/upload"); // Make sure this path is correct

const router = express.Router();

// Create a new menu item
router.post(
  "/",
  vendorAuthMiddleware,
  upload.single("image"),
  menuController.createMenu
);

// Add this to your existing menuRoutes.js
router.get(
  "/menus",
  vendorAuthMiddleware,
  menuController.getMenusForLoggedInVendor
);

router.get(
  "/all-products",
  vendorAuthMiddleware,
  menuController.getAllVendorProducts
);

// Get all menu items for a vendor
router.get("/:vendorId", menuController.getMenusByVendorId);

router.get("/detail/:menuId", menuController.getMenuById);

// Update a menu item
router.put(
  "/:menuId",
  vendorAuthMiddleware,
  upload.single("image"),
  menuController.updateMenu
);

// Delete a menu item
router.delete("/:menuId", vendorAuthMiddleware, menuController.deleteMenu);

// Make a menu item unavailable
router.patch(
  "/:menuId/unavailable",
  vendorAuthMiddleware,
  menuController.makeMenuUnavailable
);

module.exports = router;
