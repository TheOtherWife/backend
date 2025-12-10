const Order = require("../../models/orderModel");
const User = require("../../models/User");
const Vendor = require("../../models/Vendor");

class OrderService {
  async getAllOrders(filters = {}, page = 1, limit = 10) {
    try {
      const query = {};

      // Apply filters
      if (filters.status && filters.status !== "all") {
        query.status = filters.status;
      }

      if (filters.searchQuery) {
        query.$or = [
          { orderNumber: { $regex: filters.searchQuery, $options: "i" } },
          {
            "deliveryAddress.street": {
              $regex: filters.searchQuery,
              $options: "i",
            },
          },
        ];
      }

      if (filters.dateRange) {
        const now = new Date();
        let startDate;

        switch (filters.dateRange) {
          case "today":
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case "week":
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case "month":
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
          // All time - no date filter
        }

        if (startDate) {
          query.createdAt = { $gte: startDate };
        }
      }

      const options = {
        page,
        limit,
        sort: { createdAt: -1 },
        populate: [
          { path: "userId", select: "firstName lastName email phoneNumber" },
          { path: "vendorId", select: "displayName email phoneNumber" },
        ],
      };

      const orders = await Order.paginate(query, options);
      return orders;
    } catch (error) {
      throw error;
    }
  }

  async getOrderById(orderId) {
    try {
      const order = await Order.findById(orderId)
        .populate("userId", "firstName lastName email phoneNumber")
        .populate("vendorId", "displayName email phoneNumber");

      if (!order) {
        throw new Error("Order not found");
      }

      return order;
    } catch (error) {
      throw error;
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
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

      if (!order) {
        throw new Error("Order not found");
      }

      return order;
    } catch (error) {
      throw error;
    }
  }

  async getRecentOrders(limit = 5) {
    try {
      const orders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("userId", "firstName lastName")
        .populate("vendorId", "displayName");

      return orders;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new OrderService();
