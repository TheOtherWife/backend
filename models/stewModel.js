const mongoose = require("mongoose");

const stewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  isAvailable: { type: Boolean, default: true },
});

// Check if the model already exists before defining it
const Stew = mongoose.models.Stew || mongoose.model("Stew", stewSchema);

module.exports = Stew;
