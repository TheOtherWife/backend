const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Menu = require("../models/menuModel");
const vendorWalletService = require("./vendorWalletService");
const walletService = require("./walletService");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

async function checkoutCart(userId, checkoutData) {
  // Get user's cart with populated data
  const cart = await Cart.findOne({ userId })
    .populate("items.menuId")
    .populate("items.packageOptionId")
    .populate("items.additives.additiveId")
    .populate("items.drinks.drinkId")
    .populate("items.meats.meatId")
    .populate("items.stews.stewId");

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

  // Prepare order items with price snapshots and counts
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
      id: additive.additiveId._id,
      name: additive.additiveId.name,
      price: additive.additiveId.price,
      count: additive.count || 1,
    })),
    drinks: item.drinks.map((drink) => ({
      id: drink.drinkId._id,
      name: drink.drinkId.name,
      price: drink.drinkId.price,
      count: drink.count || 1,
    })),
    meats: item.meats.map((meat) => ({
      id: meat.meatId._id,
      name: meat.meatId.name,
      price: meat.meatId.price,
      count: meat.count || 1,
    })),
    stews: item.stews.map((stew) => ({
      id: stew.stewId._id,
      name: stew.stewId.name,
      price: stew.stewId.price,
      count: stew.count || 1,
    })),
    quantity: item.quantity,
    itemPrice: item.itemPrice,
    customizationNotes: item.customizationNotes,
  }));

  // Wallet payment handling
  if (checkoutData.paymentMethod === "wallet") {
    const totalAmount =
      cart.total + (checkoutData.deliveryFee || 0) + (checkoutData.tax || 0);
    const { hasSufficientBalance } = await walletService.checkBalance(
      userId,
      totalAmount
    );

    if (!hasSufficientBalance) {
      throw new Error("Insufficient wallet balance");
    }
  }

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

  // Process wallet payment if applicable
  if (checkoutData.paymentMethod === "wallet") {
    await walletService.debitWallet(
      userId,
      order.total,
      `Payment for order ${order.orderNumber}`,
      order._id.toString(),
      { orderId: order._id }
    );
  }

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

  const MAX_RETRIES = 3;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const order = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true, session }
      );

      if (!order) {
        throw new Error("Order not found");
      }

      if (status === "delivered") {
        await session.commitTransaction(); // commit the order update first
        session.endSession();
        // Then update wallet separately, outside transaction
        await vendorWalletService.creditVendorForOrder(orderId);
        return order;
      }

      await session.commitTransaction();
      return order;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      // Only retry on transient transaction errors
      if (
        error.hasErrorLabel?.("TransientTransactionError") ||
        /Write conflict/.test(error.message)
      ) {
        console.warn(`Transaction conflict. Retrying attempt ${attempt + 1}`);
        if (attempt < MAX_RETRIES - 1) continue;
      }

      throw error;
    } finally {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      session.endSession();
    }
  }
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
    .populate("vendorId", "name address phone")
    .populate({
      path: "items.menuId",
      select: "name image", // Include both name and image
    });
}

async function updateMenuRating(menuId) {
  const orders = await Order.find({
    status: "delivered",
    "menuRatings.menuId": menuId,
  });

  const ratings = orders.flatMap((order) =>
    order.menuRatings.filter((r) => r.menuId.toString() === menuId)
  );

  if (ratings.length === 0) return;

  const total = ratings.reduce((sum, r) => sum + r.score, 0);
  const avg = total / ratings.length;

  await Menu.findByIdAndUpdate(menuId, {
    averageRating: parseFloat(avg.toFixed(1)),
    ratingCount: ratings.length,
  });
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
  updateMenuRating,
};
