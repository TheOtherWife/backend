const orderService = require("../../services/admin/orderService");

exports.getAllOrders = async (req, res) => {
  try {
    const { status, searchQuery, dateRange, page = 1, limit = 10 } = req.query;
    const filters = { status, searchQuery, dateRange };

    const orders = await orderService.getAllOrders(
      filters,
      parseInt(page),
      parseInt(limit)
    );
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderService.getOrderById(orderId);
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await orderService.updateOrderStatus(orderId, status);
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
