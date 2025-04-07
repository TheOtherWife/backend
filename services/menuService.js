const Menu = require("../models/menuModel");

const Additive = require("../models/additiveModel");
const Meat = require("../models/meatModel");
const PackageOption = require("../models/packageModel");
const Stew = require("../models/stewModel");
const Drink = require("../models/drinkModel");

// Add this new service function
const getAllVendorProducts = async (vendorId) => {
  try {
    // Fetch all categories in parallel for better performance
    const [menus, packageOptions, additives, meats, stews, drinks] =
      await Promise.all([
        Menu.find({ vendorId }).lean(),
        PackageOption.find({ vendorId }).lean(),
        Additive.find({ vendorId }).lean(),
        Meat.find({ vendorId }).lean(),
        Stew.find({ vendorId }).lean(),
        Drink.find({ vendorId }).lean(),
      ]);

    return {
      menus,
      packageOptions,
      additives,
      meats,
      stews,
      drinks,
    };
  } catch (error) {
    console.error("Error in getAllVendorProducts service:", error.message);
    throw error;
  }
};

// Create a new menu item
const createMenu = async (vendorId, menuData) => {
  try {
    const menu = new Menu({ ...menuData, vendorId });
    await menu.save();
    return menu;
  } catch (error) {
    console.error("Error in createMenu service:", error.message);
    throw error;
  }
};

// Get all menu items for a vendor
const getMenusByVendorId = async (vendorId) => {
  try {
    const menus = await Menu.find({ vendorId })
      .populate("packageOptions")
      .populate("additives")
      .populate("drinks")
      .populate("meats")
      .populate("stews");

    return menus;
  } catch (error) {
    console.error("Error in getMenusByVendorId service:", error.message);
    throw error;
  }
};

const getMenuById = async (menuId) => {
  try {
    const menu = await Menu.findById(menuId)
      .populate("packageOptions")
      .populate("additives")
      .populate("drinks")
      .populate("meats")
      .populate("stews")
      .populate({
        path: "vendorId",
        select: "firstName lastName email phone city", // Include the vendor fields you want
      });

    if (!menu) {
      throw new Error("Menu not found");
    }

    return menu;
  } catch (error) {
    console.error("Error in getMenuById service:", error.message);
    throw error;
  }
};

// Update a menu item
const updateMenu = async (menuId, vendorId, updateData) => {
  try {
    const menu = await Menu.findOneAndUpdate(
      { _id: menuId, vendorId }, // Ensure the menu item belongs to the vendor
      updateData,
      { new: true } // Return the updated document
    );

    if (!menu) {
      throw new Error("Menu item not found or unauthorized");
    }

    return menu;
  } catch (error) {
    console.error("Error in updateMenu service:", error.message);
    throw error;
  }
};

// Delete a menu item
const deleteMenu = async (menuId, vendorId) => {
  try {
    const menu = await Menu.findOneAndDelete({ _id: menuId, vendorId });

    if (!menu) {
      throw new Error("Menu item not found or unauthorized");
    }

    return menu;
  } catch (error) {
    console.error("Error in deleteMenu service:", error.message);
    throw error;
  }
};

// Make a menu item unavailable
const makeMenuUnavailable = async (menuId, vendorId) => {
  try {
    const menu = await Menu.findOneAndUpdate(
      { _id: menuId, vendorId },
      { isAvailable: false },
      { new: true }
    );

    if (!menu) {
      throw new Error("Menu item not found or unauthorized");
    }

    return menu;
  } catch (error) {
    console.error("Error in makeMenuUnavailable service:", error.message);
    throw error;
  }
};

// You can add this (but it's essentially the same as getMenusByVendorId)
const getMenusForVendor = async (vendorId) => {
  try {
    const menus = await Menu.find({ vendorId })
      .populate("packageOptions")
      .populate("additives")
      .populate("drinks")
      .populate("meats")
      .populate("stews");

    return menus;
  } catch (error) {
    console.error("Error in getMenusForVendor service:", error.message);
    throw error;
  }
};

module.exports = {
  createMenu,
  getMenusByVendorId,
  getMenuById,
  updateMenu,
  deleteMenu,
  makeMenuUnavailable,
  getMenusForVendor,
  getAllVendorProducts,
};
