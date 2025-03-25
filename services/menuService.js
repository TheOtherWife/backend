const Menu = require("../models/menuModel");

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

module.exports = {
  createMenu,
  getMenusByVendorId,
  updateMenu,
  deleteMenu,
  makeMenuUnavailable,
};
