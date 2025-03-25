const orderService = require("../services/orderService");

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

module.exports = {
  checkout,
  paymentCallback,
  updateStatus,
  assignDelivery,
  getOrder,
  getUserOrders,
  getVendorOrders,
};
