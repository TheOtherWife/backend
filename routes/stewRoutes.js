const express = require("express");
const stewController = require("../controllers/stewController");
const { vendorAuthMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new stew
router.post("/", vendorAuthMiddleware, stewController.createStew);

// Get stews for a specific vendor
router.get("/:vendorId", stewController.getStewsByVendorId);

// Update a stew
router.put("/:stewId", vendorAuthMiddleware, stewController.updateStew);

// Delete a stew
router.delete("/:stewId", vendorAuthMiddleware, stewController.deleteStew);

// Make a stew unavailable
router.patch(
  "/:stewId/unavailable",
  vendorAuthMiddleware,
  stewController.makeStewUnavailable
);

module.exports = router;
