const mongoose = require("mongoose");

const packageOptionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name of the package option (e.g., Fried Rice)
  price: { type: Number, required: true }, // Price for the package option
  image: { type: String }, // Optional image for the package option
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  }, // Reference to the vendor
  isAvailable: { type: Boolean, default: true }, // Availability status
});

module.exports = mongoose.model("PackageOption", packageOptionSchema);
