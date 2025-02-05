const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    subjects: [{
      type: String,
      required: true,
    }],
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    transactionId: {
      type: String,
    },
    paymentMethod: {
      type: Object,
    },
    linkUrl: {
      type: String,
    },
    linkId: {
      type: String,
    },
    linkExpiryTime: {
      type: Date,
    },
    cfLinkId: {
      type: String,
    },
    paymentResponse: {
      type: Object,
    }
  },
  {
    timestamps: true,
  }
);

// Create indexes for commonly queried fields
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
