import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, required: true },
  status: { type: String, enum: ['active','past_due','trialing','inactive','canceled'], default: 'active' },
  trialEnd: { type: Date },
  currentPeriodEnd: { type: Date },
  gracePeriodEnd: { type: Date },
  autoRenew: { type: Boolean, default: true },
  lastPaymentFailedNotifiedAt: { type: Date },
  metadata: { type: Object, default: {} }
}, {
  timestamps: true
});

export default mongoose.model('Subscription', subscriptionSchema);
