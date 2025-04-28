// controllers/walletController.js
const walletService = require("../services/walletService");

const getBalance = async (req, res) => {
  try {
    const { userId } = req.user;
    const wallet = await walletService.getWalletBalance(userId);

    res.json({
      success: true,
      balance: wallet.balance,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 10 } = req.query;

    const transactions = await walletService.getWalletTransactions(
      userId,
      page,
      limit
    );

    res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const fundWallet = async (req, res) => {
  try {
    const { userId } = req.user;
    const { amount, reference } = req.body;

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    const result = await walletService.creditWallet(
      userId,
      amount,
      "Wallet funding",
      reference || `fund-${Date.now()}`
    );

    res.json({
      success: true,
      message: "Wallet funded successfully",
      newBalance: result.newBalance,
      transaction: result.transaction,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getBalance,
  getTransactions,
  fundWallet,
};
