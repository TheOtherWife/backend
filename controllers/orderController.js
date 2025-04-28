const orderService = require("../services/orderService");
const vendorServices = require("../services/vendorService");
const Order = require("../models/orderModel");
const Vendor = require("../models/Vendor");
const User = require("../models/User");
const vendorWalletService = require("../services/vendorWalletService");

async function checkout(req, res) {
  try {
    const { userId } = req.user;
    const checkoutData = req.body;

    const user = await User.findById(userId);

    // If addressId is provided, find the matching address
    if (checkoutData.addressId) {
      const selectedAddress = user.deliveryAddresses.id(checkoutData.addressId);
      if (!selectedAddress) {
        throw new Error("Address not found");
      }

      // Assign selected address to checkoutData.deliveryAddress
      checkoutData.deliveryAddress = {
        street: selectedAddress.addressLine1,
        city: selectedAddress.city,
        state: selectedAddress.state,
        country: selectedAddress.country,
        postalCode: "100001", // Optionally you can add this in the model
        coordinates: {
          lat: 6.5244, // Optional: Use geocoding API to make this dynamic
          lng: 3.3792,
        },
      };
    } else if (!checkoutData.deliveryAddress) {
      // Fallback: use default address
      const defaultAddress = user.deliveryAddresses.find(
        (addr) => addr.isDefault
      );
      if (!defaultAddress) {
        throw new Error(
          "No delivery address provided and no default address found"
        );
      }

      checkoutData.deliveryAddress = {
        street: defaultAddress.addressLine1,
        city: defaultAddress.city,
        state: defaultAddress.state,
        country: defaultAddress.country,
        postalCode: "100001",
        coordinates: {
          lat: 6.5244,
          lng: 3.3792,
        },
      };
    }

    // Fallback for contactPhone
    if (!checkoutData.contactPhone) {
      checkoutData.contactPhone = user.phoneNumber;
    }

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

    // If order was delivered, get the transaction details
    let transaction = null;
    if (status === "delivered") {
      const result = await vendorWalletService.creditVendorForOrder(orderId);
      transaction = result.transaction;
    }

    res.json({
      success: true,
      message: "Order status updated",
      order,
      transaction,
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
