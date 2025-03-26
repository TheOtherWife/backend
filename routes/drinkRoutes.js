const express = require("express");
const drinkController = require("../controllers/drinkController");
const { vendorAuthMiddleware } = require("../middleware/authMiddleware");
const upload = require("../utils/upload"); // Make sure this path is correct

const router = express.Router();

router.post(
  "/",
  vendorAuthMiddleware,
  upload.single("image"),
  drinkController.createDrink
);
router.get("/:vendorId", drinkController.getDrinksByVendorId);
router.put(
  "/:drinkId",
  vendorAuthMiddleware,
  upload.single("image"),
  drinkController.updateDrink
);
router.delete("/:drinkId", vendorAuthMiddleware, drinkController.deleteDrink);
router.patch(
  "/:drinkId/unavailable",
  vendorAuthMiddleware,
  drinkController.makeDrinkUnavailable
);

module.exports = router;
