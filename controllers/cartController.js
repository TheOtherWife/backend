const cartService = require("../services/cartService");

async function addItem(req, res) {
  try {
    const { userId } = req.user;
    const cartItemData = req.body;
    const cart = await cartService.addToCart(userId, cartItemData);
    res.json({
      success: true,
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function get(req, res) {
  try {
    const { userId } = req.user;
    const cart = await cartService.getCart(userId);

    // Ensure all items have names for display
    const formattedCart = {
      ...cart.toObject(),
      items: cart.items.map((item) => ({
        ...item,
        name: item.menuId?.name || "Unknown Item",
        additives: item.additives.map((add) => ({
          ...add,
          name: add.additiveId?.name || "Unknown Additive",
        })),
        drinks: item.drinks.map((drink) => ({
          ...drink,
          name: drink.drinkId?.name || "Unknown Drink",
        })),
        meats: item.meats.map((meat) => ({
          ...meat,
          name: meat.meatId?.name || "Unknown Meat",
        })),
        stews: item.stews.map((stew) => ({
          ...stew,
          name: stew.stewId?.name || "Unknown Stew",
        })),
      })),
    };

    res.json({
      success: true,
      cart: formattedCart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateItem(req, res) {
  try {
    const { userId } = req.user;
    const { itemId } = req.params;
    const updateData = req.body;
    const cart = await cartService.updateCartItem(userId, itemId, updateData);

    res.json({
      success: true,
      message: "Cart item updated",
      cart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function removeItem(req, res) {
  try {
    const { userId } = req.user;
    const { itemId } = req.params;
    const cart = await cartService.removeFromCart(userId, itemId);
    res.json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function clear(req, res) {
  try {
    const { userId } = req.user;
    const cart = await cartService.clearCart(userId);
    res.json({
      success: true,
      message: "Cart cleared",
      cart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// async function get(req, res) {
//   try {
//     const { userId } = req.user;
//     const cart = await cartService.getCart(userId);
//     res.json({
//       success: true,
//       cart,
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// }

module.exports = {
  addItem,
  updateItem,
  removeItem,
  clear,
  get,
};
