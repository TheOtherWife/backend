const menuService = require("../services/menuService");
const { cloudinaryUpload } = require("../utils/cloudinary"); // Import the Cloudinary upload function

// Create a new menu item
const createMenu = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const menuData = req.body;

    // If file was uploaded, upload to Cloudinary
    if (req.file) {
      const cloudinaryResponse = await cloudinaryUpload(req.file); // Upload the file to Cloudinary
      menuData.image = cloudinaryResponse.secure_url; // Save the Cloudinary URL
    }

    console.log(menuData);

    const menu = await menuService.createMenu(vendorId, menuData);

    res.status(201).json({
      message: "Menu item created successfully",
      menu,
    });
  } catch (error) {
    console.error("Error in createMenu controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// Get all menu items for a vendor
const getMenusByVendorId = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const menus = await menuService.getMenusByVendorId(vendorId);

    res.status(200).json({
      message: "Menu items retrieved successfully",
      menus,
    });
  } catch (error) {
    console.error("Error in getMenusByVendorId controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

const getMenuById = async (req, res) => {
  try {
    const { menuId } = req.params;

    const menu = await menuService.getMenuById(menuId);

    res.status(200).json({
      message: "Menu retrieved successfully",
      menu,
    });
  } catch (error) {
    console.error("Error in getMenuById controller:", error.message);
    res.status(error.message === "Menu not found" ? 404 : 400).json({
      message: error.message,
    });
  }
};

// Update a menu item
const updateMenu = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const { menuId } = req.params;
    const updateData = req.body;

    // If file was uploaded, upload to Cloudinary
    if (req.file) {
      const cloudinaryResponse = await cloudinaryUpload(req.file); // Upload the file to Cloudinary
      updateData.image = cloudinaryResponse.secure_url; // Save the Cloudinary URL
    }
    const menu = await menuService.updateMenu(menuId, vendorId, updateData);

    res.status(200).json({
      message: "Menu item updated successfully",
      menu,
    });
  } catch (error) {
    console.error("Error in updateMenu controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// Delete a menu item
const deleteMenu = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const { menuId } = req.params;

    const menu = await menuService.deleteMenu(menuId, vendorId);

    res.status(200).json({
      message: "Menu item deleted successfully",
      menu,
    });
  } catch (error) {
    console.error("Error in deleteMenu controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// Make a menu item unavailable
const makeMenuUnavailable = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const { menuId } = req.params;

    const menu = await menuService.makeMenuUnavailable(menuId, vendorId);

    res.status(200).json({
      message: "Menu item made unavailable successfully",
      menu,
    });
  } catch (error) {
    console.error("Error in makeMenuUnavailable controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

const getMenusForLoggedInVendor = async (req, res) => {
  try {
    const { vendorId } = req.vendor; // Get vendorId from authenticated vendor

    const menus = await menuService.getMenusByVendorId(vendorId);

    res.status(200).json({
      message: "Menu items retrieved successfully",
      menus,
    });
  } catch (error) {
    console.error(
      "Error in getMenusForLoggedInVendor controller:",
      error.message
    );
    res.status(400).json({ message: error.message });
  }
};

const getAllVendorProducts = async (req, res) => {
  try {
    const { vendorId } = req.vendor;

    const products = await menuService.getAllVendorProducts(vendorId);

    res.status(200).json({
      message: "All vendor products retrieved successfully",
      products,
    });
  } catch (error) {
    console.error("Error in getAllVendorProducts controller:", error.message);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createMenu,
  getMenusByVendorId,
  getMenuById,
  updateMenu,
  deleteMenu,
  makeMenuUnavailable,
  getMenusForLoggedInVendor,
  getAllVendorProducts,
};
