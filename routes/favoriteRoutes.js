const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");
const { protect } = require("../middleware/authMiddleware"); // Assuming you have an auth middleware

// Favorite Menus Routes
router
  .route("/menu")
  .get(protect, favoriteController.getFavoriteMenus) // Get favorite menus
  .post(protect, favoriteController.addFavoriteMenu); // Add a menu to favorites

router
  .route("/menu/:menuId")
  .delete(protect, favoriteController.removeFavoriteMenu); // Remove a menu from favorites

// Favorite Vendors Routes
router
  .route("/vendor")
  .get(protect, favoriteController.getFavoriteVendors) // Get favorite vendors
  .post(protect, favoriteController.addFavoriteVendor); // Add a vendor to favorites

router
  .route("/vendor/:vendorId")
  .delete(protect, favoriteController.removeFavoriteVendor); // Remove a vendor from favorites

module.exports = router;
