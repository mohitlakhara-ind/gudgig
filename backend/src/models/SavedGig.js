import mongoose from 'mongoose';

const savedGigSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true,
    index: true
  },
  savedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  // Additional metadata for better tracking
  metadata: {
    source: {
      type: String,
      enum: ['gigs_listing', 'gig_detail', 'search_results'],
      default: 'gigs_listing'
    },
    category: String,
    budget: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure unique user-gig combinations
savedGigSchema.index({ userId: 1, gigId: 1 }, { unique: true });

// Index for efficient querying by user
savedGigSchema.index({ userId: 1, savedAt: -1 });

// Index for efficient querying by gig
savedGigSchema.index({ gigId: 1 });

// Virtual for populated gig data
savedGigSchema.virtual('gig', {
  ref: 'Gig',
  localField: 'gigId',
  foreignField: '_id',
  justOne: true
});

// Ensure the model is not already compiled
const SavedGig = mongoose.models.SavedGig || mongoose.model('SavedGig', savedGigSchema);

export default SavedGig;





