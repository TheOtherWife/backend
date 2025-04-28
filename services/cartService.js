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
  additives,
  drinks,
  meats,
  stews
) {
  const menuItem = await Menu.findById(menuId);
  if (!menuItem) throw new Error("Menu item not found");

  let price = menuItem.basePrice;

  // Add package option price if selected
  if (packageOptionId) {
    const packageOption = await PackageOption.findById(packageOptionId);
    if (packageOption) price += packageOption.price;
  }

  // Calculate additives prices with counts
  if (additives && additives.length > 0) {
    const additivePrices = await Additive.find({
      _id: { $in: additives.map((a) => a.additiveId) },
    });

    const additiveMap = new Map(
      additivePrices.map((a) => [a._id.toString(), a.price])
    );

    price += additives.reduce((sum, additive) => {
      return (
        sum +
        additiveMap.get(additive.additiveId.toString()) * (additive.count || 1)
      );
    }, 0);
  }

  // Calculate meats prices with counts
  if (meats && meats.length > 0) {
    const meatPrices = await Meat.find({
      _id: { $in: meats.map((m) => m.meatId) },
    });

    const meatMap = new Map(meatPrices.map((m) => [m._id.toString(), m.price]));

    price += meats.reduce((sum, meat) => {
      return sum + meatMap.get(meat.meatId.toString()) * (meat.count || 1);
    }, 0);
  }

  // Calculate drinks prices with counts
  if (drinks && drinks.length > 0) {
    const drinkPrices = await Drink.find({
      _id: { $in: drinks.map((d) => d.drinkId) },
    });

    const drinkMap = new Map(
      drinkPrices.map((d) => [d._id.toString(), d.price])
    );

    price += drinks.reduce((sum, drink) => {
      return sum + drinkMap.get(drink.drinkId.toString()) * (drink.count || 1);
    }, 0);
  }

  // Calculate stews prices with counts
  if (stews && stews.length > 0) {
    const stewPrices = await Stew.find({
      _id: { $in: stews.map((s) => s.stewId) },
    });

    const stewMap = new Map(stewPrices.map((s) => [s._id.toString(), s.price]));

    price += stews.reduce((sum, stew) => {
      return sum + stewMap.get(stew.stewId.toString()) * (stew.count || 1);
    }, 0);
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
    additives = [],
    drinks = [],
    meats = [],
    stews = [],
    quantity,
    customizationNotes,
  } = cartItemData;

  // Calculate the item price with counts
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
  const existingItem = cart.items.find((item) => {
    // Basic comparison
    if (!item.menuId.equals(menuId)) return false;
    if (
      (item.packageOptionId && !packageOptionId) ||
      (!item.packageOptionId && packageOptionId)
    )
      return false;
    if (item.packageOptionId && !item.packageOptionId.equals(packageOptionId))
      return false;

    // Helper function to compare arrays of items with counts
    const compareItems = (arr1, arr2, idField) => {
      if (arr1.length !== arr2.length) return false;
      return arr1.every((item1) => {
        const item2 = arr2.find(
          (item2) => item1[idField].toString() === item2[idField].toString()
        );
        return item2 && item1.count === item2.count;
      });
    };

    // Compare additives with counts
    if (!compareItems(item.additives, additives, "additiveId")) return false;
    if (!compareItems(item.meats, meats, "meatId")) return false;
    if (!compareItems(item.drinks, drinks, "drinkId")) return false;
    if (!compareItems(item.stews, stews, "stewId")) return false;

    return true;
  });

  if (existingItem) {
    // Update quantity if same item exists
    existingItem.quantity += quantity;
    existingItem.customizationNotes =
      customizationNotes || existingItem.customizationNotes;
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

  // Find the item index
  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1) throw new Error("Item not found in cart");

  // Update fields if provided
  if (updateData.quantity !== undefined) {
    cart.items[itemIndex].quantity = updateData.quantity;
  }

  if (updateData.customizationNotes !== undefined) {
    cart.items[itemIndex].customizationNotes = updateData.customizationNotes;
  }

  await cart.save();

  // Return the fully populated cart
  return await getCart(userId);
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
    .populate({
      path: "items.additives.additiveId",
      model: "Additive",
    })
    .populate({
      path: "items.drinks.drinkId",
      model: "Drink",
    })
    .populate({
      path: "items.meats.meatId",
      model: "Meat",
    })
    .populate({
      path: "items.stews.stewId",
      model: "Stew",
    });

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
