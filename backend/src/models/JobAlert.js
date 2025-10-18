import mongoose from 'mongoose';

const jobAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  keyword: {
    type: String,
    trim: true,
    maxlength: 100
  },
  category: {
    type: String,
    trim: true,
    enum: {
      values: [
        'website development',
        'graphic design',
        'content writing',
        'social media management',
        'seo',
        'app development',
        'game development'
      ],
      message: 'Category must be one of the Gigs Mint categories'
    }
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100
  },
  gigType: {
    type: String,
    enum: ['all', 'full-time', 'part-time', 'contract', 'remote'],
    default: 'all'
  },
  salaryMin: {
    type: Number,
    min: 0
  },
  salaryMax: {
    type: Number,
    min: 0
  },
  frequency: {
    type: String,
    enum: ['immediate', 'daily', 'weekly'],
    default: 'daily'
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastTriggered: {
    type: Date
  },
  matchCount: {
    type: Number,
    default: 0
  },
  // Additional metadata
  metadata: {
    source: {
      type: String,
      enum: ['manual', 'imported', 'suggested'],
      default: 'manual'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
jobAlertSchema.index({ userId: 1, isActive: 1 });
jobAlertSchema.index({ userId: 1, createdAt: -1 });
jobAlertSchema.index({ keyword: 'text', category: 'text', location: 'text' });

// Virtual for days since last triggered
jobAlertSchema.virtual('daysSinceLastTriggered').get(function() {
  if (!this.lastTriggered) return null;
  const now = new Date();
  const diffTime = Math.abs(now - this.lastTriggered);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure the model is not already compiled
const JobAlert = mongoose.models.JobAlert || mongoose.model('JobAlert', jobAlertSchema);

export default JobAlert;

