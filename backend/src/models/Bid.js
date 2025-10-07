import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  quotation: { type: String, trim: true, maxlength: 2000 },
  proposal: { type: String, trim: true, maxlength: 5000 },
  bidFeePaid: { type: Number, required: true, min: 0 },
  paymentStatus: { type: String, enum: ['pending', 'succeeded', 'failed'], default: 'pending' },
  // Selection workflow (by employer/admin)
  selectionStatus: { type: String, enum: ['pending', 'accepted', 'rejected', 'withdrawn'], default: 'pending', index: true },
  selectedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

bidSchema.index({ jobId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Bid', bidSchema);


