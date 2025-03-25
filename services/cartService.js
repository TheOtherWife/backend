const Cart = require("../models/cartModel");
const Menu = require("../models/menuModel");
const PackageOption = require("../models/packageModel");
const Additive = require("../models/additiveModel");
const Drink = require("../models/drinkModel");
const Meat = require("../models/meatModel");
const Stew = require("../models/stewModel");

async function calculateItemPrice(
  menuId,
  packageOptionId,
  additiveIds,
  drinkIds,
  meatIds,
  stewIds
) {
  const menuItem = await Menu.findById(menuId);
  if (!menuItem) throw new Error("Menu item not found");

  let price = menuItem.basePrice;

  // Add package option price if selected
  if (packageOptionId) {
    const packageOption = await PackageOption.findById(packageOptionId);
    if (packageOption) price += packageOption.price;
  }

  // Add additives prices
  if (additiveIds && additiveIds.length > 0) {
    const additives = await Additive.find({ _id: { $in: additiveIds } });
    price += additives.reduce((sum, additive) => sum + additive.price, 0);
  }

  // Add drinks prices
  if (drinkIds && drinkIds.length > 0) {
    const drinks = await Drink.find({ _id: { $in: drinkIds } });
    price += drinks.reduce((sum, drink) => sum + drink.price, 0);
  }

  // Add meats prices
  if (meatIds && meatIds.length > 0) {
    const meats = await Meat.find({ _id: { $in: meatIds } });
    price += meats.reduce((sum, meat) => sum + meat.price, 0);
  }

  // Add stews prices
  if (stewIds && stewIds.length > 0) {
    const stews = await Stew.find({ _id: { $in: stewIds } });
    price += stews.reduce((sum, stew) => sum + stew.price, 0);
  }

  return price;
}

async function findOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId });
    await cart.save();
  }
  return cart;
}

async function addToCart(userId, cartItemData) {
  const {
    menuId,
    vendorId,
    packageOptionId,
    additives,
    drinks,
    meats,
    stews,
    quantity,
    customizationNotes,
  } = cartItemData;

  // Calculate the item price
  const itemPrice = await calculateItemPrice(
    menuId,
    packageOptionId,
    additives,
    drinks,
    meats,
    stews
  );

  // Find or create cart
  const cart = await findOrCreateCart(userId);

  // Check if identical item already exists in cart
  const existingItem = cart.items.find(
    (item) =>
      item.menuId.equals(menuId) &&
      (item.packageOptionId?.equals(packageOptionId) ||
        (!item.packageOptionId && !packageOptionId)) &&
      JSON.stringify(item.additives.map((id) => id.toString()).sort()) ===
        JSON.stringify(additives.map((id) => id.toString()).sort()) &&
      JSON.stringify(item.drinks.map((id) => id.toString()).sort()) ===
        JSON.stringify(drinks.map((id) => id.toString()).sort()) &&
      JSON.stringify(item.meats.map((id) => id.toString()).sort()) ===
        JSON.stringify(meats.map((id) => id.toString()).sort()) &&
      JSON.stringify(item.stews.map((id) => id.toString()).sort()) ===
        JSON.stringify(stews.map((id) => id.toString()).sort())
  );

  if (existingItem) {
    // Update quantity if same item exists
    existingItem.quantity += quantity;
  } else {
    // Add new item to cart
    cart.items.push({
      menuId,
      vendorId,
      packageOptionId,
      additives,
      drinks,
      meats,
      stews,
      quantity,
      itemPrice,
      customizationNotes,
    });
  }

  await cart.save();
  return cart;
}

async function updateCartItem(userId, itemId, updateData) {
  const cart = await findOrCreateCart(userId);
  const item = cart.items.id(itemId);

  if (!item) throw new Error("Item not found in cart");

  // Update quantity if provided
  if (updateData.quantity !== undefined) {
    item.quantity = updateData.quantity;
  }

  // Update customizations if provided
  if (updateData.customizationNotes !== undefined) {
    item.customizationNotes = updateData.customizationNotes;
  }

  await cart.save();
  return cart;
}

async function removeFromCart(userId, itemId) {
  const cart = await findOrCreateCart(userId);
  cart.items.pull(itemId);
  await cart.save();
  return cart;
}

async function clearCart(userId) {
  const cart = await findOrCreateCart(userId);
  cart.items = [];
  await cart.save();
  return cart;
}

async function getCart(userId) {
  const cart = await Cart.findOne({ userId })
    .populate("items.menuId")
    .populate("items.packageOptionId")
    .populate("items.additives")
    .populate("items.drinks")
    .populate("items.meats")
    .populate("items.stews");

  if (!cart) {
    return await findOrCreateCart(userId);
  }
  return cart;
}

module.exports = {
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCart,
};
