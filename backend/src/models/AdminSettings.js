import mongoose from 'mongoose';

const adminSettingsSchema = new mongoose.Schema({
  // unique key to allow multiple config groups if needed
  key: { type: String, required: true, unique: true },

  // Bidding configuration
  bidFeesEnabled: { type: Boolean, default: true },
  bidFeeOptions: { type: [Number], default: [1, 5, 10, 20] },
  currentBidFee: { type: Number, default: 1 },
  minimumBidFeePaise: { type: Number, default: 100 }, // ₹1
  maximumBidFeePaise: { type: Number, default: 10000 }, // ₹100

  // Payments configuration
  paymentProvider: { type: String, default: 'razorpay' },
  razorpayKeyId: { type: String, default: '' },
  razorpayKeySecret: { type: String, default: '' },
  currency: { type: String, default: 'INR' },
  refundPolicy: { type: String, default: 'non-refundable' }
}, {
  timestamps: true
});

export default mongoose.model('AdminSettings', adminSettingsSchema);


