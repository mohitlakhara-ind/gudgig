import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true,
    maxlength: [100, 'Job title cannot be more than 100 characters']
  },
  slug: String, // URL-friendly version of title
  description: {
    type: String,
    required: [true, 'Please add a job description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot be more than 300 characters']
  },
  employer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Job must belong to an employer']
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: [true, 'Job must belong to a company']
  },
  category: {
    type: String,
    required: [true, 'Please add a job category'],
    enum: [
      'Technology',
      'Healthcare',
      'Finance',
      'Education',
      'Marketing',
      'Sales',
      'Human Resources',
      'Operations',
      'Design',
      'Engineering',
      'Writing',
      'Data Entry',
      'Research',
      'Customer Service',
      'Translation',
      'Virtual Assistance',
      'Social Media',
      'Other'
    ]
  },
  type: {
    type: String,
    required: [true, 'Please add job type'],
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance', 'micro-task', 'short-project', 'hourly', 'fixed-price']
  },
  location: {
    type: String,
    required: [true, 'Please add job location']
  },
  isRemote: {
    type: Boolean,
    default: false
  },
  salary: {
    min: {
      type: Number,
      default: null
    },
    max: {
      type: Number,
      default: null
    },
    currency: {
      type: String,
      default: 'USD'
    },
    isNegotiable: {
      type: Boolean,
      default: false
    },
    period: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly', 'project'],
      default: 'project'
    }
  },
  salaryDisclosure: {
    required: {
      type: Boolean,
      default: false
    },
    min: {
      type: Number,
      default: null
    },
    max: {
      type: Number,
      default: null
    },
    currency: {
      type: String,
      default: 'USD'
    },
    period: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly', 'project'],
      default: 'yearly'
    },
    isNegotiable: {
      type: Boolean,
      default: false
    }
  },
  jobLocationType: {
    type: String,
    enum: ['TELECOMMUTE', 'PHYSICAL_LOCATION', 'HYBRID'],
    default: 'PHYSICAL_LOCATION'
  },
  eeocCompliant: {
    type: Boolean,
    default: false
  },
  federalContractor: {
    type: Boolean,
    default: false
  },
  disabilityAccommodations: {
    type: Boolean,
    default: false
  },
  veteranFriendly: {
    type: Boolean,
    default: false
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot be more than 160 characters']
  },
  canonicalUrl: {
    type: String
  },
  structuredData: {
    type: Object
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  qualityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  fraudFlags: [{
    type: String,
    trim: true
  }],
  verificationLevel: {
    type: String,
    enum: ['none', 'basic', 'verified', 'premium'],
    default: 'none'
  },
  requirements: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  experience: {
    type: String,
    required: [true, 'Please specify experience level'],
    enum: ['fresher', '1-2 years', '3-5 years', '5-10 years', '10+ years']
  },
  education: {
    type: String,
    enum: ['high-school', 'bachelors', 'masters', 'phd', 'any'],
    default: 'any'
  },
  applicationDeadline: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'closed', 'draft'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  urgent: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  applicationInstructions: {
    type: String,
    default: null
  },
  applicationQuestions: [{
    question: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['text', 'textarea', 'select', 'multiselect', 'boolean', 'file'],
      default: 'text'
    },
    options: [{
      type: String,
      trim: true
    }],
    required: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  screening: {
    enabled: {
      type: Boolean,
      default: false
    },
    questions: [{
      question: {
        type: String,
        required: true,
        trim: true
      },
      type: {
        type: String,
        enum: ['yes_no', 'multiple_choice', 'numeric', 'text'],
        default: 'yes_no'
      },
      options: [{
        type: String,
        trim: true
      }],
      correctAnswer: {
        type: String,
        trim: true
      },
      weight: {
        type: Number,
        min: 1,
        max: 10,
        default: 1
      }
    }],
    passingScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 70
    }
  },
  analytics: {
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    applications: {
      type: Number,
      default: 0
    },
    qualifiedApplications: {
      type: Number,
      default: 0
    },
    interviews: {
      type: Number,
      default: 0
    },
    hires: {
      type: Number,
      default: 0
    },
    averageTimeToHire: {
      type: Number,
      default: 0
    },
    costPerHire: {
      type: Number,
      default: 0
    }
  },
  seoData: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title cannot be more than 60 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot be more than 160 characters']
    },
    keywords: [{
      type: String,
      trim: true
    }],
    canonicalUrl: {
      type: String
    }
  },
  promotion: {
    featured: {
      type: Boolean,
      default: false
    },
    urgent: {
      type: Boolean,
      default: false
    },
    highlighted: {
      type: Boolean,
      default: false
    },
    boosted: {
      type: Boolean,
      default: false
    },
    featuredUntil: {
      type: Date,
      default: null
    },
    urgentUntil: {
      type: Date,
      default: null
    },
    highlightedUntil: {
      type: Date,
      default: null
    },
    boostedUntil: {
      type: Date,
      default: null
    }
  },
  teamInfo: {
    teamSize: {
      type: String,
      enum: ['1-5', '6-10', '11-25', '26-50', '50+'],
      default: null
    },
    reportingTo: {
      type: String,
      trim: true
    },
    workingWith: [{
      type: String,
      trim: true
    }]
  },
  workEnvironment: {
    culture: {
      type: String,
      maxlength: [500, 'Culture description cannot be more than 500 characters']
    },
    perks: [{
      type: String,
      trim: true
    }],
    workSchedule: {
      type: String,
      enum: ['standard', 'flexible', 'shift', 'weekend', 'night'],
      default: 'standard'
    },
    travelRequired: {
      type: String,
      enum: ['none', 'minimal', 'occasional', 'frequent'],
      default: 'none'
    }
  },
  diversity: {
    equalOpportunity: {
      type: Boolean,
      default: true
    },
    diversityStatement: {
      type: String,
      maxlength: [500, 'Diversity statement cannot be more than 500 characters']
    },
    accommodations: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug from title and validate compliance before saving
jobSchema.pre('save', function(next) {
  const gigTypes = new Set(['micro-task', 'short-project', 'hourly', 'fixed-price', 'freelance']);
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-');
  }

  // Update lastModified
  this.lastModified = new Date();

  // Validate salary disclosure based on location (simplified - in real implementation, check jurisdiction)
  if (this.location && this.location.toLowerCase().includes('california') || this.location.toLowerCase().includes('new york')) {
    this.salaryDisclosure.required = true;
    if (!this.salaryDisclosure.min || !this.salaryDisclosure.max) {
      return next(new Error('Salary disclosure is required for this location'));
    }
  }

  // Generate canonical URL if not set
  if (!this.canonicalUrl && this.slug) {
    const isGigType = gigTypes.has(this.type);
    this.canonicalUrl = isGigType ? `/gigs/${this.slug}` : `/jobs/${this.slug}`;
  }

  // Adjust salary disclosure period defaults for gig types when not explicitly set
  if (gigTypes.has(this.type)) {
    if (!this.salaryDisclosure) this.salaryDisclosure = {};
    if (!this.salaryDisclosure.period) {
      this.salaryDisclosure.period = this.type === 'hourly' ? 'hourly' : 'project';
    }
  }

  next();
});

// Virtual for applications
jobSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'job',
  justOne: false
});

// Virtual: isGig
jobSchema.virtual('isGig').get(function() {
  const gigTypes = new Set(['micro-task', 'short-project', 'hourly', 'fixed-price', 'freelance']);
  return gigTypes.has(this.type);
});

// Index for better search performance
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ category: 1, type: 1, location: 1 });
jobSchema.index({ employer: 1, status: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ featured: -1, createdAt: -1 });

// New indexes for compliance and search
jobSchema.index({ 'salaryDisclosure.min': 1, 'salaryDisclosure.max': 1 });
jobSchema.index({ eeocCompliant: 1, federalContractor: 1, disabilityAccommodations: 1, veteranFriendly: 1 });
jobSchema.index({ moderationStatus: 1, qualityScore: -1 });
jobSchema.index({ verificationLevel: 1 });
jobSchema.index({ lastModified: -1 });

export default mongoose.model('Job', jobSchema);
