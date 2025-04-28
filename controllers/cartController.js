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

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }

    res.json({
      success: true,
      cart: cart,
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
