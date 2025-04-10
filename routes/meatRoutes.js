const express = require("express");
const meatController = require("../controllers/meatController");
const { vendorAuthMiddleware } = require("../middleware/authMiddleware");
const upload = require("../utils/upload"); // Make sure this path is correct

const router = express.Router();

// Create a new meat
router.post(
  "/",
  vendorAuthMiddleware,
  upload.single("image"),
  meatController.createMeat
);

// Get meats for a specific vendor
router.get("/:vendorId", meatController.getMeatsByVendorId);

// Update a meat
router.put(
  "/:meatId",
  vendorAuthMiddleware,
  upload.single("image"),
  meatController.updateMeat
);

// Delete a meat
router.delete("/:meatId", vendorAuthMiddleware, meatController.deleteMeat);

// Make a meat unavailable
router.patch(
  "/:meatId/unavailable",
  vendorAuthMiddleware,
  meatController.makeMeatUnavailable
);

module.exports = router;
