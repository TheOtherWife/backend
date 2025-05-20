const mongoose = require("mongoose");
const Vendor = require("../models/Vendor");
const Order = require("../models/orderModel");

const getVendorStats = async (vendorId) => {
  try {
    // Convert vendorId to ObjectId
    const vendorObjectId = new mongoose.Types.ObjectId(vendorId);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Get today's orders count
    const todaysOrdersCount = await Order.countDocuments({
      vendorId: vendorObjectId,
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    // Get today's earnings
    const todaysEarningsResult = await Order.aggregate([
      {
        $match: {
          vendorId: vendorObjectId,
          createdAt: { $gte: todayStart, $lte: todayEnd },
          status: { $in: ["delivered", "completed"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]);
    const todaysEarnings = todaysEarningsResult[0]?.total || 0;

    // Get pending orders count
    const pendingOrdersCount = await Order.countDocuments({
      vendorId: vendorObjectId,
      status: { $in: ["pending", "confirmed", "preparing"] },
    });

    // Get vendor rating info
    const vendor = await Vendor.findById(vendorObjectId)
      .select("averageRating ratingCount")
      .lean();

    // Get earnings history (last 30 days)
    const earningsHistory = await Order.aggregate([
      {
        $match: {
          vendorId: vendorObjectId,
          status: "delivered",
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$total" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      todaysOrdersCount,
      todaysEarnings,
      pendingOrdersCount,
      averageRating: vendor?.averageRating || 0,
      ratingCount: vendor?.ratingCount || 0,
      earningsHistory,
    };
  } catch (error) {
    console.error("Error getting vendor stats:", error);
    throw error;
  }
};

const getVendorEarningsHistory = async (vendorId, days = 30) => {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const earningsHistory = await Order.aggregate([
      {
        $match: {
          vendorId: mongoose.Types.ObjectId(vendorId),
          status: "delivered",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$total" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return earningsHistory;
  } catch (error) {
    console.error("Error getting vendor earnings history:", error);
    throw error;
  }
};

module.exports = {
  getVendorStats,
  getVendorEarningsHistory,
};
