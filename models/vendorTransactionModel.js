// models/vendorTransactionModel.js
const mongoose = require("mongoose");

const vendorTransactionSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit", "payout"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
    description: String,
    reference: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

// Indexes
vendorTransactionSchema.index({ vendorId: 1 });
vendorTransactionSchema.index({ orderId: 1 });
vendorTransactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model("VendorTransaction", vendorTransactionSchema);
