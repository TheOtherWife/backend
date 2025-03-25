const mongoose = require("mongoose");

const additiveSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name of the additive (e.g., plantain)
  price: { type: Number, required: true }, // Additional price for the additive
  image: { type: String }, // Optional image for the additive
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  }, // Reference to the vendor
  isAvailable: { type: Boolean, default: true }, // Availability status
});

module.exports = mongoose.model("Additive", additiveSchema);
