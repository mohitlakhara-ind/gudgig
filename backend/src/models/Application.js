import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: [
      'pending',        // Application submitted, waiting for review
      'reviewing',      // Application is being reviewed
      'shortlisted',    // Moved to shortlist
      'interviewing',   // Interview scheduled/in progress
      'rejected',       // Application rejected
      'accepted',       // Application accepted/hired
      'withdrawn'       // Applicant withdrew application
    ],
    default: 'pending',
    index: true
  },
  coverLetter: {
    type: String,
    maxlength: 2000,
    trim: true
  },
  resume: {
    filename: String,
    url: String,
    cloudinaryId: String
  },
  portfolio: {
    filename: String,
    url: String,
    cloudinaryId: String
  },
  expectedSalary: {
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  availability: {
    type: String,
    enum: ['immediate', '2-weeks', '1-month', '2-months', 'negotiable'],
    default: 'negotiable'
  },
  questionnaire: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true,
      maxlength: 1000
    }
  }],
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    years: {
      type: Number,
      min: 0,
      max: 50
    },
    level: {
      type: String,
      enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'architect']
    }
  },
  // Interview scheduling
  interviews: [{
    type: {
      type: String,
      enum: ['phone', 'video', 'in-person', 'technical', 'final'],
      required: true
    },
    scheduledAt: {
      type: Date,
      required: true
    },
    duration: {
      type: Number, // minutes
      default: 60
    },
    location: String, // for in-person or video link
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled'
    },
    notes: String,
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String,
      interviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Employer notes and feedback
  employerNotes: [{
    note: {
      type: String,
      required: true,
      maxlength: 1000
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isPrivate: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Status change history
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: String,
    changedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Application source tracking
  source: {
    type: String,
    enum: ['direct', 'referral', 'job-board', 'social-media', 'company-website'],
    default: 'direct'
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Communication tracking
  lastContactedAt: Date,
  communicationCount: {
    type: Number,
    default: 0
  },
  // Metadata
  appliedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  },
  // Soft delete
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  deletedAt: Date
}, {
  timestamps: true
});

// Compound indexes for common queries
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true }); // Prevent duplicate applications
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ appliedAt: -1 });
applicationSchema.index({ status: 1, appliedAt: -1 });

// Middleware to update lastUpdatedAt on save
applicationSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastUpdatedAt = new Date();
  }
  next();
});

// Virtual for calculating days since application
applicationSchema.virtual('daysSinceApplication').get(function() {
  return Math.floor((new Date() - this.appliedAt) / (1000 * 60 * 60 * 24));
});

// Method to update status with history tracking
applicationSchema.methods.updateStatus = function(newStatus, changedBy, reason) {
  const oldStatus = this.status;
  
  // Add to status history
  this.statusHistory.push({
    status: oldStatus,
    changedBy,
    reason,
    changedAt: new Date()
  });
  
  // Update current status
  this.status = newStatus;
  this.lastUpdatedAt = new Date();
  
  return this.save();
};

// Method to add employer note
applicationSchema.methods.addEmployerNote = function(note, addedBy, isPrivate = true) {
  this.employerNotes.push({
    note,
    addedBy,
    isPrivate,
    createdAt: new Date()
  });
  
  this.lastUpdatedAt = new Date();
  return this.save();
};

// Method to schedule interview
applicationSchema.methods.scheduleInterview = function(interviewData) {
  this.interviews.push({
    ...interviewData,
    createdAt: new Date()
  });
  
  this.lastUpdatedAt = new Date();
  return this.save();
};

// Static method to get application statistics
applicationSchema.statics.getApplicationStats = async function(filters = {}) {
  const pipeline = [
    { $match: { isActive: true, ...filters } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ];
  
  const stats = await this.aggregate(pipeline);
  
  // Convert to object format
  const result = {
    total: 0,
    pending: 0,
    reviewing: 0,
    shortlisted: 0,
    interviewing: 0,
    rejected: 0,
    accepted: 0,
    withdrawn: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  return result;
};

// Static method to get applications with pagination and population
applicationSchema.statics.getApplicationsWithDetails = async function(filters = {}, options = {}) {
  const {
    page = 1,
    limit = 20,
    sort = { appliedAt: -1 },
    populate = ['job', 'applicant']
  } = options;
  
  const skip = (page - 1) * limit;
  
  const query = this.find({ isActive: true, ...filters })
    .skip(skip)
    .limit(parseInt(limit))
    .sort(sort);
  
  // Add population
  if (populate.includes('job')) {
    query.populate('job', 'title company location type salary status');
  }
  if (populate.includes('applicant')) {
    query.populate('applicant', 'name email avatar profile');
  }
  
  const applications = await query.exec();
  const total = await this.countDocuments({ isActive: true, ...filters });
  
  return {
    applications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export default mongoose.model('Application', applicationSchema);



