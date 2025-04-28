// controllers/vendorWalletController.js
const vendorWalletService = require("../services/vendorWalletService");

const getBalance = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const balance = await vendorWalletService.getVendorBalance(vendorId);

    res.json({
      success: true,
      balance,
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
    const { vendorId } = req.vendor;
    const { page = 1, limit = 10 } = req.query;

    const transactions = await vendorWalletService.getVendorTransactions(
      vendorId,
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

const initiatePayout = async (req, res) => {
  try {
    const { vendorId } = req.vendor;
    const { amount } = req.body;

    // Verify vendor has sufficient balance
    const vendor = await Vendor.findById(vendorId);
    if (vendor.walletBalance < amount) {
      throw new Error("Insufficient balance for payout");
    }

    // Process payout (this would integrate with your payment gateway)
    // For now, we'll just deduct from wallet
    vendor.walletBalance -= amount;
    await vendor.save();

    // Record transaction
    const transaction = new VendorTransaction({
      vendorId,
      amount,
      type: "payout",
      status: "completed",
      description: "Manual payout",
      reference: `payout-${Date.now()}`,
      metadata: {
        initiatedBy: req.vendor._id,
        payoutMethod: "bank_transfer",
      },
    });

    await transaction.save();

    res.json({
      success: true,
      message: "Payout initiated successfully",
      newBalance: vendor.walletBalance,
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
  initiatePayout,
};
