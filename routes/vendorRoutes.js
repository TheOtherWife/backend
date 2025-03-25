const express = require("express");
const vendorController = require("../controllers/vendorController");
const upload = require("../utils/upload");
const { vendorAuthMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Get list of vendors with search
router.get("/all", vendorController.getVendors);

// Vendor registration
router.post(
  "/register",
  upload.fields([
    { name: "idImage", maxCount: 1 },
    { name: "certificateImage", maxCount: 1 },
  ]),
  vendorController.registerVendor
);

// Vendor login
router.post("/login", vendorController.loginVendor);

// Forgot password
router.post("/forgot-password", vendorController.forgotPassword);

// Change password
router.put(
  "/change-password",
  vendorAuthMiddleware,
  vendorController.changePassword
);

// Edit profile
router.put("/profile", vendorAuthMiddleware, vendorController.updateProfile);

// Get a vendor by ID
router.get("/:id", vendorController.getVendor);

module.exports = router;
