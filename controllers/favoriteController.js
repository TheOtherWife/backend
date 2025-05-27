const favoriteService = require("../services/favoriteService");

// Favorite Menus
const getFavoriteMenus = async (req, res) => {
  try {
    const userId = req.user.userId; // Extract userId from the req.user object
    const favoriteMenus = await favoriteService.getFavoriteMenus(userId);
    if (!favoriteMenus) {
      return res.status(404).json({
        status: "fail",
        message: "No favorite menus found",
      });
    }
    res.status(200).json({
      status: "success",
      data: favoriteMenus,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Similarly for other endpoints
const addFavoriteMenu = async (req, res) => {
  try {
    const userId = req.user.userId; // Extract userId
    const { menuId } = req.body;
    const updatedFavorites = await favoriteService.addFavoriteMenu(
      userId,
      menuId
    );
    res.status(201).json({
      status: "success",
      data: updatedFavorites,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

const removeFavoriteMenu = async (req, res) => {
  try {
    const userId = req.user.userId; // Extract userId
    const { menuId } = req.params;
    const updatedFavorites = await favoriteService.removeFavoriteMenu(
      userId,
      menuId
    );
    res.status(200).json({
      status: "success",
      data: updatedFavorites,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Repeat for vendor-related endpoints
const getFavoriteVendors = async (req, res) => {
  try {
    const userId = req.user.userId; // Extract userId
    const favoriteVendors = await favoriteService.getFavoriteVendors(userId);
    if (!favoriteVendors) {
      return res.status(404).json({
        status: "fail",
        message: "No favorite vendors found",
      });
    }
    res.status(200).json({
      status: "success",
      data: favoriteVendors,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

const addFavoriteVendor = async (req, res) => {
  try {
    const userId = req.user.userId; // Extract userId
    const { vendorId } = req.body;
    const updatedFavorites = await favoriteService.addFavoriteVendor(
      userId,
      vendorId
    );
    res.status(201).json({
      status: "success",
      data: updatedFavorites,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

const removeFavoriteVendor = async (req, res) => {
  try {
    const userId = req.user.userId; // Extract userId
    const { vendorId } = req.params;
    const updatedFavorites = await favoriteService.removeFavoriteVendor(
      userId,
      vendorId
    );
    res.status(200).json({
      status: "success",
      data: updatedFavorites,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

module.exports = {
  getFavoriteMenus,
  addFavoriteMenu,
  removeFavoriteMenu,
  getFavoriteVendors,
  addFavoriteVendor,
  removeFavoriteVendor,
};
