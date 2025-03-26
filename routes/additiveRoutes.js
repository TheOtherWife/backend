const express = require("express");
const additiveController = require("../controllers/additiveController");
const { vendorAuthMiddleware } = require("../middleware/authMiddleware");
const upload = require("../utils/upload"); // Make sure this path is correct

const router = express.Router();

// Add upload.single('image') for the create and update routes
router.post(
  "/",
  vendorAuthMiddleware,
  upload.single("image"),
  additiveController.createAdditive
);

router.get("/:vendorId", additiveController.getAdditivesByVendorId);

router.put(
  "/:additiveId",
  vendorAuthMiddleware,
  upload.single("image"),
  additiveController.updateAdditive
);

router.delete(
  "/:additiveId",
  vendorAuthMiddleware,
  additiveController.deleteAdditive
);

router.patch(
  "/:additiveId/unavailable",
  vendorAuthMiddleware,
  additiveController.makeAdditiveUnavailable
);

module.exports = router;
