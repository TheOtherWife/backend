const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name of the meal (e.g., Jollof Rice)
  basePrice: { type: Number, required: true }, // Base price of the meal
  image: { type: String }, // Optional image for the meal
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  }, // Reference to the vendor
  packageOptions: [
    { type: mongoose.Schema.Types.ObjectId, ref: "PackageOption" },
  ], // Available package options for this meal
  additives: [{ type: mongoose.Schema.Types.ObjectId, ref: "Additive" }], // Available additives for this meal
  drinks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Drink" }], // Available drinks for this meal
  meats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meat" }], // Available meats for this meal
  stews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Stew" }], // Available stews for this meal
  isAvailable: { type: Boolean, default: true }, // Availability status
});

module.exports = mongoose.model("Menu", menuSchema);