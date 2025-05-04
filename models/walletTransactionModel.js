// models/walletTransactionModel.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
walletTransactionSchema.index({ userId: 1 });
walletTransactionSchema.index({ reference: 1 });
walletTransactionSchema.index({ createdAt: -1 });

walletTransactionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);
