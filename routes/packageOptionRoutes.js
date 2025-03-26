const express = require("express");
const packageOptionController = require("../controllers/packageOptionController");
const { vendorAuthMiddleware } = require("../middleware/authMiddleware");
const upload = require("../utils/upload"); // Make sure this path is correct

const router = express.Router();

// Create a new package option
router.post(
  "/",
  vendorAuthMiddleware,
  upload.single("image"),
  packageOptionController.createPackageOption
);

// Get package options for a specific vendor
router.get("/:vendorId", packageOptionController.getPackageOptionsByVendorId);

// Update a package option
router.put(
  "/:packageOptionId",
  vendorAuthMiddleware,
  upload.single("image"),
  packageOptionController.updatePackageOption
);

// Delete a package option
router.delete(
  "/:packageOptionId",
  vendorAuthMiddleware,
  packageOptionController.deletePackageOption
);

// Make a package option unavailable
router.patch(
  "/:packageOptionId/unavailable",
  vendorAuthMiddleware,
  packageOptionController.makePackageOptionUnavailable
);

module.exports = router;
