// routes/walletRoutes.js
const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/balance", authMiddleware, walletController.getBalance);
router.get("/transactions", authMiddleware, walletController.getTransactions);
router.post("/fund", authMiddleware, walletController.fundWallet);

module.exports = router;
