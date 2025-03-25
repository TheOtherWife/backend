const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    alternatePhoneNumber: { type: String },
    state: { type: String, required: true },
    city: { type: String, required: true },
    addresses: [
      {
        addressLine1: { type: String, required: true },
        addressLine2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, default: "Nigeria" },
      },
    ],
    socialMedia: {
      instagram: { type: String },
      facebook: { type: String },
      youtube: { type: String },
      xHandle: { type: String },
    },
    yearsOfExperience: { type: Number, required: true },
    cuisineSpecifications: {
      type: String,
      enum: [
        "Local",
        "Continental",
        "Vegan",
        "African",
        "Asian",
        "European",
        "American",
        "Fusion",
        "Other",
      ],
      required: true,
    },
    bvn: { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true },
    bankName: { type: String, required: true },
    idImage: { type: String, required: true }, // File path or URL
    certificateImage: { type: String, required: true }, // File path or URL
    password: { type: String, required: true }, // Add password field
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
