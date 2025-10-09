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
    default: 0
  },
  location: {
    type: String,
    trim: true,
    default: 'Remote'
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
    required: true
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
  }
}, { timestamps: true });

// Indexes for frequent queries
JobSchema.index({ category: 1 });
JobSchema.index({ createdBy: 1 });
JobSchema.index({ createdAt: -1 });

export default mongoose.models.Job || mongoose.model('Job', JobSchema);


