const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    menuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    packageOptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PackageOption",
    },
    additives: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Additive",
      },
    ],
    drinks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Drink",
      },
    ],
    meats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Meat",
      },
    ],
    stews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stew",
      },
    ],
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    itemPrice: {
      type: Number,
      required: true,
    },
    customizationNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    subtotal: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Calculate totals before saving
cartSchema.pre("save", function (next) {
  this.subtotal = this.items.reduce(
    (sum, item) => sum + item.itemPrice * item.quantity,
    0
  );
  this.total = this.subtotal + this.deliveryFee + this.tax;
  next();
});

module.exports = mongoose.model("Cart", cartSchema);
