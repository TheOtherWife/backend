const mongoose = require("mongoose");

const drinkSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name of the drink (e.g., coke)
  price: { type: Number, required: true }, // Additional price for the drink
  image: { type: String }, // Optional image for the drink
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  }, // Reference to the vendor
  isAvailable: { type: Boolean, default: true }, // Availability status
});

module.exports = mongoose.model("Drink", drinkSchema);
