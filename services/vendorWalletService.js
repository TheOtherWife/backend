// services/vendorWalletService.js
// const Vendor = require("../models/vendorModel");
const Vendor = require("../models/Vendor");
const VendorTransaction = require("../models/vendorTransactionModel");
const Order = require("../models/orderModel");
const mongoose = require("mongoose");

async function creditVendorForOrder(orderId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) throw new Error("Order not found");
    if (order.status !== "delivered") throw new Error("Order not delivered");

    // Calculate vendor's earnings (subtract any platform fees)
    const vendorEarnings = order.total * 0.9; // Example: 10% platform fee

    // Update vendor's pending balance
    const vendor = await Vendor.findByIdAndUpdate(
      order.vendorId,
      { $inc: { pendingBalance: vendorEarnings } },
      { new: true, session }
    );

    // Create transaction record
    const transaction = new VendorTransaction({
      vendorId: order.vendorId,
      orderId: order._id,
      amount: vendorEarnings,
      type: "credit",
      status: "completed",
      description: `Earnings from order ${order.orderNumber}`,
      reference: `order-${order._id}`,
      metadata: {
        orderTotal: order.total,
        platformFee: order.total * 0.1, // 10% fee
        netAmount: vendorEarnings,
      },
    });

    await transaction.save({ session });
    await session.commitTransaction();
    session.endSession();

    return {
      vendor,
      transaction,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

async function processDailyPayouts() {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find vendors with pending balance
    const vendors = await Vendor.find({ pendingBalance: { $gt: 0 } }).session(
      session
    );

    const payoutResults = [];
    const today = new Date();

    for (const vendor of vendors) {
      // Transfer from pending to wallet balance
      vendor.walletBalance += vendor.pendingBalance;
      vendor.pendingBalance = 0;
      vendor.lastPayoutDate = today;
      await vendor.save({ session });

      // Create payout transaction
      const transaction = new VendorTransaction({
        vendorId: vendor._id,
        amount: vendor.pendingBalance,
        type: "payout",
        status: "completed",
        description: "Daily payout",
        reference: `payout-${today.toISOString().split("T")[0]}`,
        metadata: {
          payoutDate: today,
        },
      });

      await transaction.save({ session });
      payoutResults.push({
        vendorId: vendor._id,
        amount: vendor.pendingBalance,
      });
    }

    await session.commitTransaction();
    session.endSession();
    return payoutResults;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

async function getVendorBalance(vendorId) {
  const vendor = await Vendor.findById(vendorId).select(
    "walletBalance pendingBalance lastPayoutDate"
  );
  if (!vendor) throw new Error("Vendor not found");

  return {
    walletBalance: vendor.walletBalance,
    pendingBalance: vendor.pendingBalance,
    lastPayoutDate: vendor.lastPayoutDate,
  };
}

async function getVendorTransactions(vendorId, page = 1, limit = 10) {
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
  };

  return await VendorTransaction.paginate({ vendorId }, options);
}

module.exports = {
  creditVendorForOrder,
  processDailyPayouts,
  getVendorBalance,
  getVendorTransactions,
};
