// services/walletService.js
const User = require("../models/User");
const WalletTransaction = require("../models/walletTransactionModel");
const mongoose = require("mongoose");

async function getWalletBalance(userId) {
  const user = await User.findById(userId).select("walletBalance");
  if (!user) throw new Error("User not found");

  return {
    balance: user.walletBalance,
    x,
  };
}

async function getWalletTransactions(userId, page = 1, limit = 10) {
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
  };

  const transactions = await WalletTransaction.paginate({ userId }, options);

  return transactions;
}

async function creditWallet(
  userId,
  amount,
  description,
  reference,
  metadata = {}
) {
  if (amount <= 0) throw new Error("Amount must be positive");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update user balance
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: amount } },
      { new: true, session }
    );

    if (!user) throw new Error("User not found");

    // Create transaction record
    const transaction = new WalletTransaction({
      userId,
      amount,
      type: "credit",
      description,
      reference,
      status: "completed",
      metadata,
    });

    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      newBalance: user.walletBalance,
      transaction,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

async function debitWallet(
  userId,
  amount,
  description,
  reference,
  metadata = {}
) {
  if (amount <= 0) throw new Error("Amount must be positive");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check balance first
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error("User not found");
    if (user.walletBalance < amount) throw new Error("Insufficient balance");

    // Update user balance
    user.walletBalance -= amount;
    await user.save({ session });

    // Create transaction record
    const transaction = new WalletTransaction({
      userId,
      amount,
      type: "debit",
      description,
      reference,
      status: "completed",
      metadata,
    });

    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      newBalance: user.walletBalance,
      transaction,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

async function checkBalance(userId, amount) {
  const user = await User.findById(userId).select("walletBalance");
  if (!user) throw new Error("User not found");

  return {
    hasSufficientBalance: user.walletBalance >= amount,
    currentBalance: user.walletBalance,
  };
}

module.exports = {
  getWalletBalance,
  getWalletTransactions,
  creditWallet,
  debitWallet,
  checkBalance,
};
