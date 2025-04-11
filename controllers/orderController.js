const orderService = require("../services/orderService");
const vendorServices = require("../services/vendorService");
const Order = require("../models/orderModel");
const Vendor = require("../models/Vendor");

async function checkout(req, res) {
  try {
    const { userId } = req.user;
    const checkoutData = req.body;

    const order = await orderService.checkoutCart(userId, checkoutData);

    res.json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function paymentCallback(req, res) {
  try {
    const { orderId } = req.params;
    const paymentData = req.body;

    const order = await orderService.processPayment(orderId, paymentData);

    res.json({
      success: true,
      message: "Payment status updated",
      order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateStatus(req, res) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await orderService.updateOrderStatus(orderId, status);

    res.json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function assignDelivery(req, res) {
  try {
    const { orderId } = req.params;
    const deliveryPersonData = req.body;

    const order = await orderService.assignDeliveryPerson(
      orderId,
      deliveryPersonData
    );

    res.json({
      success: true,
      message: "Delivery person assigned",
      order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getOrder(req, res) {
  try {
    const { orderId } = req.params;
    const order = await orderService.getOrderById(orderId);

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getUserOrders(req, res) {
  try {
    const { userId } = req.user;
    const orders = await orderService.getUserOrders(userId);

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getVendorOrders(req, res) {
  try {
    const { vendorId } = req.vendor;
    const orders = await orderService.getVendorOrders(vendorId);

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

const submitRating = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.user;
    const { score, comment } = req.body;

    // Validate input
    if (!score || score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid rating between 1 and 5",
      });
    }

    // Find the order
    const order = await Order.findOne({
      _id: orderId,
      userId,
      status: "delivered",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not eligible for rating",
      });
    }

    // Improved check for existing rating
    if (order.rating && order.rating.score) {
      console.log("Existing rating found:", order.rating);
      return res.status(400).json({
        success: false,
        message: "You've already rated this order",
      });
    }

    // Update the order with rating
    order.rating = {
      score: Number(score),
      comment: comment || "",
      ratedAt: new Date(),
    };

    const savedOrder = await order.save();
    console.log("Order after rating saved:", savedOrder);

    // Update vendor's average rating
    await vendorServices.updateVendorRating(order.vendorId);

    return res.json({
      success: true,
      message: "Thank you for your rating!",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Error submitting rating:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

module.exports = {
  checkout,
  paymentCallback,
  updateStatus,
  assignDelivery,
  getOrder,
  getUserOrders,
  getVendorOrders,
  submitRating,
};
