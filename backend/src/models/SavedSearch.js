import mongoose from 'mongoose';

const savedSearchSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Saved search must belong to a user']
  },
  name: {
    type: String,
    required: [true, 'Please provide a name for this search'],
    trim: true,
    maxlength: [100, 'Search name cannot be more than 100 characters']
  },
  searchCriteria: {
    query: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      trim: true
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance', 'micro-task', 'short-project', 'hourly', 'fixed-price']
    },
    experienceLevel: {
      type: String,
      enum: ['fresher', '1-2 years', '3-5 years', '5-10 years', '10+ years']
    },
    salaryMin: {
      type: Number,
      min: 0
    },
    salaryMax: {
      type: Number,
      min: 0
    },
    remote: {
      type: Boolean,
      default: false
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
    },
    skills: [{
      type: String,
      trim: true
    }],
    benefits: [{
      type: String,
      trim: true
    }],
    industries: [{
      type: String,
      trim: true
    }]
  },
  alertSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['immediate', 'daily', 'weekly', 'monthly'],
      default: 'daily'
    },
    lastSent: {
      type: Date,
      default: null
    },
    nextSend: {
      type: Date,
      default: null
    },
    emailEnabled: {
      type: Boolean,
      default: true
    },
    pushEnabled: {
      type: Boolean,
      default: false
    },
    smsEnabled: {
      type: Boolean,
      default: false
    }
  },
  statistics: {
    totalMatches: {
      type: Number,
      default: 0
    },
    newMatches: {
      type: Number,
      default: 0
    },
    lastChecked: {
      type: Date,
      default: Date.now
    },
    alertsSent: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
savedSearchSchema.index({ user: 1, isActive: 1 });
savedSearchSchema.index({ 'alertSettings.enabled': 1, 'alertSettings.nextSend': 1 });
savedSearchSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate next send time
savedSearchSchema.pre('save', function(next) {
  if (this.isModified('alertSettings.frequency') || this.isNew) {
    const now = new Date();
    switch (this.alertSettings.frequency) {
      case 'immediate':
        this.alertSettings.nextSend = now;
        break;
      case 'daily':
        this.alertSettings.nextSend = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        this.alertSettings.nextSend = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        this.alertSettings.nextSend = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
    }
  }
  next();
});

// Instance method to update next send time
savedSearchSchema.methods.updateNextSendTime = function() {
  const now = new Date();
  switch (this.alertSettings.frequency) {
    case 'immediate':
      this.alertSettings.nextSend = now;
      break;
    case 'daily':
      this.alertSettings.nextSend = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'weekly':
      this.alertSettings.nextSend = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      this.alertSettings.nextSend = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      break;
  }
  this.alertSettings.lastSent = now;
  this.alertSettings.alertsSent += 1;
  return this.save();
};

// Static method to find searches ready for alerts
savedSearchSchema.statics.findReadyForAlert = function() {
  return this.find({
    'alertSettings.enabled': true,
    'alertSettings.nextSend': { $lte: new Date() },
    isActive: true
  });
};

export default mongoose.model('SavedSearch', savedSearchSchema);