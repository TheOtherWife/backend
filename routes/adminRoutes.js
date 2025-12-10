const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getSalesData,
  getOrderStatusData,
} = require("../controllers/admin/dashboardController");
const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/admin/orderController");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
} = require("../controllers/admin/userController");
const {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  updateVendorStatus,
  deleteVendor,
  getVendorStats,
} = require("../controllers/admin/vendorController");
// const {
//   getSettings,
//   updateSettings,
// } = require("../controllers/admin/settingsController");

// Dashboard routes
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/sales", getSalesData);
router.get("/dashboard/order-status", getOrderStatusData);

// Order routes
router.get("/orders", getAllOrders);
router.get("/orders/:orderId", getOrderById);
router.put("/orders/:orderId/status", updateOrderStatus);

// User routes
router.get("/users", getAllUsers);
router.get("/users/:userId", getUserById);
router.post("/users", createUser);
router.put("/users/:userId", updateUser);
router.delete("/users/:userId", deleteUser);
router.get("/users/:userId/stats", getUserStats);

// Vendor routes
router.get("/vendors", getAllVendors);
router.get("/vendors/:vendorId", getVendorById);
router.post("/vendors", createVendor);
router.put("/vendors/:vendorId", updateVendor);
router.put("/vendors/:vendorId/status", updateVendorStatus);
router.delete("/vendors/:vendorId", deleteVendor);
router.get("/vendors/:vendorId/stats", getVendorStats);

// Settings routes
// router.get("/settings", getSettings);
// router.put("/settings", updateSettings);

module.exports = router;
