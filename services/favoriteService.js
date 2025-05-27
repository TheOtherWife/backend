const User = require("../models/User");
const Menu = require("../models/menuModel");
const Vendor = require("../models/Vendor");

const getFavoriteMenus = async (userId) => {
  console.log("Received userId:", userId); // Debug the input
  if (typeof userId !== "string" || !userId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid userId format");
  }
  const user = await User.findById(userId)
    .populate("favoriteMenus")
    .select("favoriteMenus");
  if (!user) {
    throw new Error("User not found");
  }
  if (!user.favoriteMenus || user.favoriteMenus.length === 0) {
    return []; // Return an empty array if no favorite menus
  }
  return user.favoriteMenus;
};

const addFavoriteMenu = async (userId, menuId) => {
  if (typeof userId !== "string" || !userId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid userId format");
  }
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
  if (typeof userId !== "string" || !userId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid userId format");
  }
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

const getFavoriteVendors = async (userId) => {
  console.log("Received userId:", userId); // Debug the input
  if (typeof userId !== "string" || !userId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid userId format");
  }
  const user = await User.findById(userId)
    .populate("favoriteVendors")
    .select("favoriteVendors");
  if (!user) {
    throw new Error("User not found");
  }
  if (!user.favoriteVendors || user.favoriteVendors.length === 0) {
    return []; // Return an empty array if no favorite vendors
  }
  return user.favoriteVendors;
};

const addFavoriteVendor = async (userId, vendorId) => {
  if (typeof userId !== "string" || !userId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid userId format");
  }
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
  if (typeof userId !== "string" || !userId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid userId format");
  }
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
