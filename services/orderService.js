const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Menu = require("../models/menuModel");
const { v4: uuidv4 } = require("uuid");

async function checkoutCart(userId, checkoutData) {
  // Get user's cart
  const cart = await Cart.findOne({ userId })
    .populate("items.menuId")
    .populate("items.packageOptionId")
    .populate("items.additives")
    .populate("items.drinks")
    .populate("items.meats")
    .populate("items.stews");

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // Verify all items are from the same vendor
  const vendorId = cart.items[0].vendorId;
  const mixedVendors = cart.items.some(
    (item) => !item.vendorId.equals(vendorId)
  );
  if (mixedVendors) {
    throw new Error("All items must be from the same vendor");
  }

  // Prepare order items with price snapshots
  const orderItems = cart.items.map((item) => ({
    menuId: item.menuId._id,
    name: item.menuId.name,
    packageOption: item.packageOptionId
      ? {
          id: item.packageOptionId._id,
          name: item.packageOptionId.name,
          price: item.packageOptionId.price,
        }
      : null,
    additives: item.additives.map((additive) => ({
      id: additive._id,
      name: additive.name,
      price: additive.price,
    })),
    drinks: item.drinks.map((drink) => ({
      id: drink._id,
      name: drink.name,
      price: drink.price,
    })),
    meats: item.meats.map((meat) => ({
      id: meat._id,
      name: meat.name,
      price: meat.price,
    })),
    stews: item.stews.map((stew) => ({
      id: stew._id,
      name: stew.name,
      price: stew.price,
    })),
    quantity: item.quantity,
    itemPrice: item.itemPrice,
    customizationNotes: item.customizationNotes,
  }));

  // Create payment record
  const payment = {
    method: checkoutData.paymentMethod,
    status: checkoutData.paymentMethod === "cash" ? "pending" : "completed",
    amount: cart.total,
    transactionId: checkoutData.paymentMethod !== "cash" ? uuidv4() : null,
  };

  // Create the order
  const order = new Order({
    userId,
    vendorId,
    items: orderItems,
    subtotal: cart.subtotal,
    deliveryFee: checkoutData.deliveryFee || 0,
    tax: checkoutData.tax || 0,
    total:
      cart.total + (checkoutData.deliveryFee || 0) + (checkoutData.tax || 0),
    deliveryAddress: checkoutData.deliveryAddress,
    contactPhone: checkoutData.contactPhone,
    payment,
    status: "pending",
    estimatedDeliveryTime: new Date(Date.now() + 60 * 60 * 1000), // Default 1 hour estimate
  });

  await order.save();

  // Clear the cart after successful checkout
  await Cart.findOneAndUpdate({ userId }, { items: [], subtotal: 0, total: 0 });

  return order;
}

async function processPayment(orderId, paymentData) {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  // Update payment status
  order.payment.status = paymentData.status;
  order.payment.transactionId = paymentData.transactionId;
  order.payment.paymentDetails = paymentData.paymentDetails;

  // Update order status if payment is completed
  if (paymentData.status === "completed") {
    order.status = "confirmed";
  }

  await order.save();
  return order;
}

async function updateOrderStatus(orderId, status) {
  const validStatuses = [
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "on_delivery",
    "delivered",
    "cancelled",
  ];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status");
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  );

  if (!order) throw new Error("Order not found");
  return order;
}

async function assignDeliveryPerson(orderId, deliveryPersonData) {
  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      deliveryPerson: {
        id: deliveryPersonData.userId,
        name: deliveryPersonData.name,
        contact: deliveryPersonData.contact,
      },
      status: "on_delivery",
    },
    { new: true }
  );

  if (!order) throw new Error("Order not found");
  return order;
}

async function getOrderById(orderId) {
  return await Order.findById(orderId)
    .populate("userId", "name email phone")
    .populate("vendorId", "name address phone");
}

// async function getUserOrders(userId) {
//   return await Order.find({ userId })
//     .sort({ createdAt: -1 })
//     .populate("vendorId", "name");
// }

async function getUserOrders(userId) {
  return await Order.find({ userId })
    .sort({ createdAt: -1 })
    .populate("vendorId", "name")
    .populate({
      path: "items.menuId",
      select: "name image", // Include both name and image
    });
}

async function getVendorOrders(vendorId) {
  return await Order.find({ vendorId })
    .sort({ createdAt: -1 })
    .populate("userId", "name phone");
}

module.exports = {
  checkoutCart,
  processPayment,
  updateOrderStatus,
  assignDeliveryPerson,
  getOrderById,
  getUserOrders,
  getVendorOrders,
};
