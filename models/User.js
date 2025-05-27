const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    deliveryAddresses: [
      {
        addressLine1: { type: String, required: true },
        addressLine2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, default: "Nigeria" }, // Default to Nigeria
        isDefault: { type: Boolean, default: false }, // New field
      },
    ],
    password: { type: String, required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    favoriteMenus: [{ type: mongoose.Schema.Types.ObjectId, ref: "Menu" }], // Array of favorite menu IDs
    favoriteVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }], // Array of favorite vendor IDs
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
