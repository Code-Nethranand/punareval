const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  subjects: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed', 'cancelled'],
    default: 'pending'
  },
  orderToken: {
    type: String
  },
  paymentSessionId: {
    type: String
  },
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ orderId: 1 }, { unique: true });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
