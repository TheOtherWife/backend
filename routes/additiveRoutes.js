const express = require("express");
const additiveController = require("../controllers/additiveController");
const { vendorAuthMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", vendorAuthMiddleware, additiveController.createAdditive);
router.get("/:vendorId", additiveController.getAdditivesByVendorId);
router.put(
  "/:additiveId",
  vendorAuthMiddleware,
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
