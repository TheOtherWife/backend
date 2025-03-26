const express = require("express");
const stewController = require("../controllers/stewController");
const { vendorAuthMiddleware } = require("../middleware/authMiddleware");
const upload = require("../utils/upload"); // Make sure this path is correct

const router = express.Router();

// Create a new stew
router.post(
  "/",
  vendorAuthMiddleware,
  upload.single("image"),
  stewController.createStew
);

// Get stews for a specific vendor
router.get("/:vendorId", stewController.getStewsByVendorId);

// Update a stew
router.put(
  "/:stewId",
  vendorAuthMiddleware,
  upload.single("image"),
  stewController.updateStew
);

// Delete a stew
router.delete("/:stewId", vendorAuthMiddleware, stewController.deleteStew);

// Make a stew unavailable
router.patch(
  "/:stewId/unavailable",
  vendorAuthMiddleware,
  stewController.makeStewUnavailable
);

module.exports = router;
