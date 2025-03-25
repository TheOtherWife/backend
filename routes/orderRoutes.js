const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const {
  authMiddleware,
  vendorAuthMiddleware,
} = require("../middleware/authMiddleware");

// User routes
router.post("/checkout", authMiddleware, orderController.checkout);
router.get("/user", authMiddleware, orderController.getUserOrders);
router.get("/:orderId", authMiddleware, orderController.getOrder);

// Payment callback (could be from payment gateway)
router.post("/:orderId/payment-callback", orderController.paymentCallback);

// Vendor routes
router.get("/vendor", vendorAuthMiddleware, orderController.getVendorOrders);
router.patch(
  "/:orderId/status",
  vendorAuthMiddleware,
  orderController.updateStatus
);
router.patch(
  "/:orderId/assign-delivery",
  vendorAuthMiddleware,
  orderController.assignDelivery
);

module.exports = router;
