const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const vendorSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    displayName: { type: String, required: true },
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
    displayImage: { type: String, required: true }, // File path or URL
    certificateImage: { type: String, required: true }, // File path or URL

    password: { type: String, select: false },
    passwordChangedAt: Date,
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    pendingBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastPayoutDate: Date,
  },
  { timestamps: true }
);

// Middleware to hash password before saving
vendorSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  try {
    // Hash the password with cost of 10
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    // Set passwordChangedAt (minus 1 second to ensure token is created after)
    this.passwordChangedAt = Date.now() - 1000;
    next();
  } catch (err) {
    next(err);
  }
});

// Method to check if password was changed after token was issued
vendorSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Method to compare entered password with hashed password
vendorSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword = this.password
) {
  // Add validation
  if (!candidatePassword || !userPassword) {
    throw new Error("Both password and hash are required for comparison");
  }

  return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to check if password changed after token was issued
vendorSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

module.exports = mongoose.model("Vendor", vendorSchema);
