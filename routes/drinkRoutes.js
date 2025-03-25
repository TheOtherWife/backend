const express = require("express");
const drinkController = require("../controllers/drinkController");
const { vendorAuthMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", vendorAuthMiddleware, drinkController.createDrink);
router.get("/:vendorId", drinkController.getDrinksByVendorId);
router.put("/:drinkId", vendorAuthMiddleware, drinkController.updateDrink);
router.delete("/:drinkId", vendorAuthMiddleware, drinkController.deleteDrink);
router.patch(
  "/:drinkId/unavailable",
  vendorAuthMiddleware,
  drinkController.makeDrinkUnavailable
);

module.exports = router;
