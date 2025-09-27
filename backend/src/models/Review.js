import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true, index: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: { type: String, maxlength: 120 },
  comment: { type: String, maxlength: 2000 },
  response: { type: String, maxlength: 2000 },
  helpfulVotes: { type: Number, default: 0 },
  reported: { type: Boolean, default: false },
  metadata: { type: Object, default: {} }
}, { timestamps: true });

reviewSchema.index({ reviewee: 1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);


