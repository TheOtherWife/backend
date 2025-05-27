const favoriteService = require("../services/favoriteService");

// Favorite Menus
const getFavoriteMenus = async (req, res) => {
  try {
    const userId = req.user._id;
    const favoriteMenus = await favoriteService.getFavoriteMenus(userId);
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

const addFavoriteMenu = async (req, res) => {
  try {
    const userId = req.user._id;
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
    const userId = req.user._id;
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

// Favorite Vendors
const getFavoriteVendors = async (req, res) => {
  try {
    const userId = req.user._id;
    const favoriteVendors = await favoriteService.getFavoriteVendors(userId);
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
    const userId = req.user._id;
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
    const userId = req.user._id;
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
