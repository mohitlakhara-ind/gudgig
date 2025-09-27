import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  channel: { type: String, enum: ['sms', 'email'], required: true },
  destination: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: true },
  attempts: { type: Number, default: 0 }
}, {
  timestamps: true
});

otpSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('OTP', otpSchema);


