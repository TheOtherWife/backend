const mongoose = require("mongoose");

const deliveryAddressSchema = new mongoose.Schema(
  {
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: "Nigeria" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String }, // Not required for Google users
    deliveryAddresses: [deliveryAddressSchema],

    password: {
      type: String,
      required: function () {
        return this.authProvider === "local"; // Only required for email/password
      },
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: { type: String }, // Stores Google user ID if login via Google

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    walletBalance: { type: Number, default: 0, min: 0 },

    profileImage: { type: String }, // optional, for Google profile

    favoriteMenus: [{ type: mongoose.Schema.Types.ObjectId, ref: "Menu" }],
    favoriteVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
