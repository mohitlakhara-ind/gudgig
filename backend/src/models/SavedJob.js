import mongoose from 'mongoose';

const savedJobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure unique user-job combinations
savedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

// Index for efficient querying by user
savedJobSchema.index({ userId: 1, savedAt: -1 });

const SavedJob = mongoose.model('SavedJob', savedJobSchema);

export default SavedJob;


