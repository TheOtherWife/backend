const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const {
  authMiddleware,
  vendorAuthMiddleware,
} = require("../middleware/authMiddleware");

// User routes
router.post("/checkout", authMiddleware, orderController.checkout);
router.get("/vendor", vendorAuthMiddleware, orderController.getVendorOrders);
router.get("/vendor/:orderId", vendorAuthMiddleware, orderController.getOrder);
router.get("/user", authMiddleware, orderController.getUserOrders);
router.get("/:orderId", authMiddleware, orderController.getOrder);

// Payment callback (could be from payment gateway)
router.post("/:orderId/payment-callback", orderController.paymentCallback);

router.post("/:orderId/rate", authMiddleware, orderController.submitRating);

// Vendor routes
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
