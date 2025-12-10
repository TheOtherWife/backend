const Order = require("../../models/orderModel");
const User = require("../../models/User");
const Vendor = require("../../models/Vendor");
const VendorTransaction = require("../../models/vendorTransactionModel");

class DashboardService {
  async getDashboardStats() {
    try {
      const [totalOrders, activeUsers, registeredVendors, recentTransactions] =
        await Promise.all([
          Order.countDocuments(),
          User.countDocuments(),
          Vendor.countDocuments(),
          VendorTransaction.find().sort({ createdAt: -1 }).limit(5),
        ]);

      // Calculate revenue (sum of all completed transactions)
      const revenueResult = await VendorTransaction.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

      // Get recent orders
      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "firstName lastName")
        .populate("vendorId", "displayName");

      return {
        totalOrders,
        activeUsers,
        registeredVendors,
        revenue,
        recentTransactions,
        recentOrders,
      };
    } catch (error) {
      throw error;
    }
  }

  async getSalesData(timeRange = "monthly") {
    try {
      let groupBy,
        dateFormat,
        match = {};
      const now = new Date();

      switch (timeRange) {
        case "weekly":
          match.createdAt = { $gte: new Date(now.setDate(now.getDate() - 7)) };
          groupBy = { $dayOfMonth: "$createdAt" };
          dateFormat = "%d";
          break;
        case "yearly":
          match.createdAt = {
            $gte: new Date(now.setFullYear(now.getFullYear() - 1)),
          };
          groupBy = { $month: "$createdAt" };
          dateFormat = "%m";
          break;
        default: // monthly
          match.createdAt = {
            $gte: new Date(now.setMonth(now.getMonth() - 1)),
          };
          groupBy = { $dayOfMonth: "$createdAt" };
          dateFormat = "%d";
      }

      const salesData = await VendorTransaction.aggregate([
        { $match: { ...match, status: "completed", type: "credit" } },
        {
          $group: {
            _id: groupBy,
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return salesData.map((item) => ({
        name:
          timeRange === "yearly"
            ? new Date(0, item._id - 1).toLocaleString("default", {
                month: "short",
              })
            : item._id.toString(),
        value: item.total,
      }));
    } catch (error) {
      throw error;
    }
  }

  async getOrderStatusData() {
    try {
      const statusData = await Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const statusMap = {
        pending: "Pending",
        confirmed: "Confirmed",
        preparing: "Preparing",
        ready: "Ready",
        on_delivery: "On Delivery",
        delivered: "Delivered",
        cancelled: "Cancelled",
      };

      return statusData.map((item) => ({
        name: statusMap[item._id] || item._id,
        value: item.count,
      }));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new DashboardService();
