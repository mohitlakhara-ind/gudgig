import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.ObjectId,
    ref: 'Job',
    required: [true, 'Application must be for a job']
  },
  applicant: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Application must have an applicant']
  },
  employer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Application must have an employer']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'interviewed', 'rejected', 'accepted', 'withdrawn'],
    default: 'pending'
  },
  coverLetter: {
    type: String,
    required: [true, 'Please provide a cover letter'],
    maxlength: [1000, 'Cover letter cannot be more than 1000 characters']
  },
  resume: {
    type: String, // URL to uploaded resume
    default: null
  },
  additionalInfo: {
    type: String,
    maxlength: [500, 'Additional info cannot be more than 500 characters'],
    default: null
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  },
  notes: [{
    content: {
      type: String,
      required: true
    },
    addedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    isPrivate: {
      type: Boolean,
      default: false // If true, only visible to employer/recruiter
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  interviewDate: {
    type: Date,
    default: null
  },
  interviewFeedback: {
    type: String,
    maxlength: [1000, 'Interview feedback cannot be more than 1000 characters'],
    default: null
  },
  offerDetails: {
    salary: {
      type: Number,
      default: null
    },
    benefits: [{
      type: String
    }],
    startDate: {
      type: Date,
      default: null
    },
    additionalTerms: {
      type: String,
      default: null
    }
  },
  withdrawnAt: {
    type: Date,
    default: null
  },
  withdrawnReason: {
    type: String,
    default: null
  },
  applicationAnswers: [{
    questionId: {
      type: mongoose.Schema.ObjectId,
      required: true
    },
    question: {
      type: String,
      required: true
    },
    answer: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'textarea', 'select', 'multiselect', 'boolean', 'file'],
      required: true
    }
  }],
  screeningResults: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    passed: {
      type: Boolean,
      default: null
    },
    answers: [{
      questionId: {
        type: mongoose.Schema.ObjectId,
        required: true
      },
      question: {
        type: String,
        required: true
      },
      answer: {
        type: String,
        required: true
      },
      correct: {
        type: Boolean,
        required: true
      },
      points: {
        type: Number,
        required: true
      }
    }],
    completedAt: {
      type: Date,
      default: null
    }
  },
  timeline: [{
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'shortlisted', 'interviewed', 'rejected', 'accepted', 'withdrawn'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      trim: true
    },
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  }],
  interviews: [{
    type: {
      type: String,
      enum: ['phone', 'video', 'in-person', 'technical', 'panel'],
      required: true
    },
    scheduledAt: {
      type: Date,
      required: true
    },
    duration: {
      type: Number, // in minutes
      default: 60
    },
    location: {
      type: String,
      trim: true
    },
    meetingLink: {
      type: String,
      trim: true
    },
    interviewer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    interviewers: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }],
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled'
    },
    feedback: {
      type: String,
      trim: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    notes: {
      type: String,
      trim: true
    },
    completedAt: {
      type: Date
    }
  }],
  documents: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['resume', 'cover_letter', 'portfolio', 'certificate', 'other'],
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  communication: [{
    type: {
      type: String,
      enum: ['email', 'message', 'call', 'meeting'],
      required: true
    },
    subject: {
      type: String,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    from: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    to: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  }],
  analytics: {
    timeToReview: {
      type: Number, // in hours
      default: null
    },
    timeToInterview: {
      type: Number, // in hours
      default: null
    },
    timeToDecision: {
      type: Number, // in hours
      default: null
    },
    source: {
      type: String,
      enum: ['direct', 'job_board', 'referral', 'social_media', 'company_website', 'other'],
      default: 'direct'
    },
    referrer: {
      type: String,
      trim: true
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// Index for better query performance
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ employer: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ createdAt: -1 });

// Virtual for applicant details
applicationSchema.virtual('applicantDetails', {
  ref: 'User',
  localField: 'applicant',
  foreignField: '_id',
  justOne: true
});

// Virtual for job details
applicationSchema.virtual('jobDetails', {
  ref: 'Job',
  localField: 'job',
  foreignField: '_id',
  justOne: true
});

export default mongoose.model('Application', applicationSchema);
