// routes/vendorWalletRoutes.js
const express = require("express");
const router = express.Router();
const vendorWalletController = require("../controllers/vendorWalletController");
const { vendorAuthMiddleware } = require("../middleware/authMiddleware");

router.get("/balance", vendorAuthMiddleware, vendorWalletController.getBalance);
router.get(
  "/transactions",
  vendorAuthMiddleware,
  vendorWalletController.getTransactions
);
router.post(
  "/payout",
  vendorAuthMiddleware,
  vendorWalletController.initiatePayout
);

module.exports = router;
