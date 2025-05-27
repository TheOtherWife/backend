const User = require("../models/User");
const Menu = require("../models/menuModel");
const Vendor = require("../models/Vendor");

// Favorite Menus
const getFavoriteMenus = async (userId) => {
  const user = await User.findById(userId)
    .populate("favoriteMenus")
    .select("favoriteMenus");
  if (!user) {
    throw new Error("User not found");
  }
  return user.favoriteMenus;
};

const addFavoriteMenu = async (userId, menuId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const menu = await Menu.findById(menuId);
  if (!menu) {
    throw new Error("Menu not found");
  }

  if (!user.favoriteMenus.includes(menuId)) {
    user.favoriteMenus.push(menuId);
    await user.save();
  }

  return user.favoriteMenus;
};

const removeFavoriteMenu = async (userId, menuId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  user.favoriteMenus = user.favoriteMenus.filter(
    (id) => id.toString() !== menuId.toString()
  );
  await user.save();

  return user.favoriteMenus;
};

// Favorite Vendors
const getFavoriteVendors = async (userId) => {
  const user = await User.findById(userId)
    .populate("favoriteVendors")
    .select("favoriteVendors");
  if (!user) {
    throw new Error("User not found");
  }
  return user.favoriteVendors;
};

const addFavoriteVendor = async (userId, vendorId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw new Error("Vendor not found");
  }

  if (!user.favoriteVendors.includes(vendorId)) {
    user.favoriteVendors.push(vendorId);
    await user.save();
  }

  return user.favoriteVendors;
};

const removeFavoriteVendor = async (userId, vendorId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  user.favoriteVendors = user.favoriteVendors.filter(
    (id) => id.toString() !== vendorId.toString()
  );
  await user.save();

  return user.favoriteVendors;
};

module.exports = {
  getFavoriteMenus,
  addFavoriteMenu,
  removeFavoriteMenu,
  getFavoriteVendors,
  addFavoriteVendor,
  removeFavoriteVendor,
};
