import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 120
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: {
      values: [
        'website development',
        'graphic design',
        'content writing',
        'social media management',
        'SEO',
        'app development',
        'game development'
      ],
      message: 'Category must be one of the Gigs Mint categories'
    }
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10000
  },
  requirements: {
    type: [String],
    default: []
  },
  budget: {
    type: Number,
    default: 0,
    min: 0,
    index: true
  },
  location: {
    type: String,
    trim: true,
    default: 'Remote',
    index: true
  },
  experienceLevel: {
    type: String,
    enum: ['any', 'junior', 'mid', 'senior'],
    default: 'any'
  },
  skills: {
    type: [String],
    default: []
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Track selected freelancer (if any) as part of post-selection flow
  selectedFreelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  selection: {
    status: { type: String, enum: ['none', 'in_progress', 'selected', 'completed'], default: 'none', index: true },
    selectedBidId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' },
    selectedAt: { type: Date }
  },
  // Additional fields for better gig management
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'cancelled'],
    default: 'active',
    index: true
  },
  deadline: {
    type: Date,
    index: true
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  tags: {
    type: [String],
    default: []
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for frequent queries
JobSchema.index({ category: 1 });
JobSchema.index({ createdBy: 1 });
JobSchema.index({ createdAt: -1 });
JobSchema.index({ budget: 1 });
JobSchema.index({ status: 1 });
JobSchema.index({ location: 1 });

// Text index for search functionality
JobSchema.index({ 
  title: 'text', 
  description: 'text', 
  skills: 'text',
  tags: 'text'
});

// Virtual for formatted budget
JobSchema.virtual('formattedBudget').get(function() {
  if (this.budget === 0) return 'Not specified';
  return `₹${this.budget.toLocaleString()}`;
});

// Virtual for days since posted
JobSchema.virtual('daysAgo').get(function() {
  const now = new Date();
  const posted = new Date(this.createdAt);
  const diffTime = Math.abs(now - posted);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

export default mongoose.models.Job || mongoose.model('Job', JobSchema);


