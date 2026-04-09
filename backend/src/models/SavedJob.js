import mongoose from 'mongoose';

const savedJobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  jobId: {
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

// Compound index to ensure unique user-job combinations
savedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

// Index for efficient querying by user
savedJobSchema.index({ userId: 1, savedAt: -1 });

// Index for efficient querying by job
savedJobSchema.index({ jobId: 1 });

// Virtual for populated job data
savedJobSchema.virtual('job', {
  ref: 'Gig',
  localField: 'jobId',
  foreignField: '_id',
  justOne: true
});

// Ensure the model is not already compiled
const SavedJob = mongoose.models.SavedJob || mongoose.model('SavedJob', savedJobSchema);

export default SavedJob;


