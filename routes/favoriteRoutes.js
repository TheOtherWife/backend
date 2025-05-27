const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");
// const { authMiddleware } = require("../middleware/authMiddleware");
const { authMiddleware } = require("../middleware/authMiddleware");

// Favorite Menus Routes
router
  .route("/menu")
  .get(authMiddleware, favoriteController.getFavoriteMenus) // Get favorite menus
  .post(authMiddleware, favoriteController.addFavoriteMenu); // Add a menu to favorites

router
  .route("/menu/:menuId")
  .delete(authMiddleware, favoriteController.removeFavoriteMenu); // Remove a menu from favorites

// Favorite Vendors Routes
router
  .route("/vendor")
  .get(authMiddleware, favoriteController.getFavoriteVendors) // Get favorite vendors
  .post(authMiddleware, favoriteController.addFavoriteVendor); // Add a vendor to favorites

router
  .route("/vendor/:vendorId")
  .delete(authMiddleware, favoriteController.removeFavoriteVendor); // Remove a vendor from favorites

module.exports = router;
