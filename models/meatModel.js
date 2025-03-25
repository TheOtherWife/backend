const mongoose = require("mongoose");

const meatSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name of the stew (e.g., tomato stew)
  price: { type: Number, required: true }, // Additional price for the stew
  image: { type: String }, // Optional image for the stew
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  }, // Reference to the vendor
  isAvailable: { type: Boolean, default: true }, // Availability status
});

module.exports = mongoose.model("Meat", meatSchema);
