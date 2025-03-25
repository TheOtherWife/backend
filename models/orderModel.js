const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  menuId: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", required: true },
  name: { type: String, required: true }, // Snapshot of item name at time of order
  packageOption: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "PackageOption" },
    name: String,
    price: Number,
  },
  additives: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Additive" },
      name: String,
      price: Number,
    },
  ],
  drinks: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Drink" },
      name: String,
      price: Number,
    },
  ],
  meats: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Meat" },
      name: String,
      price: Number,
    },
  ],
  stews: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Stew" },
      name: String,
      price: Number,
    },
  ],
  quantity: { type: Number, required: true },
  itemPrice: { type: Number, required: true },
  customizationNotes: String,
});

const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
    enum: ["card", "cash", "mobile_money", "bank_transfer"],
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  transactionId: String,
  amount: { type: Number, required: true },
  paymentDetails: mongoose.Schema.Types.Mixed, // For storing payment gateway responses
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    contactPhone: { type: String, required: true },
    payment: paymentSchema,
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "on_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    estimatedDeliveryTime: Date,
    deliveryPerson: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
      contact: String,
    },
    notes: String,
    rating: {
      score: { type: Number, min: 1, max: 5 },
      comment: String,
    },
  },
  { timestamps: true }
);

// Generate order number before saving
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.models.Order.countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${count.toString().padStart(6, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
