import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'expert'],
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  yearsOfExperience: {
    type: Number,
    min: 0,
    max: 50
  }
}, { _id: false });

const PortfolioItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    alt: String
  }],
  projectUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Project URL must be a valid HTTP/HTTPS URL'
    }
  },
  category: {
    type: String,
    required: true
  },
  technologies: [String],
  completedAt: Date,
  clientName: String,
  isPublic: {
    type: Boolean,
    default: true
  },
  orderCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const ExperienceSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  position: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  isCurrent: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  location: String,
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
    default: 'full-time'
  }
}, { _id: false });

const EducationSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  degree: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  fieldOfStudy: String,
  startYear: {
    type: Number,
    min: 1950,
    max: new Date().getFullYear() + 10
  },
  endYear: {
    type: Number,
    min: 1950,
    max: new Date().getFullYear() + 10
  },
  grade: String,
  description: {
    type: String,
    maxlength: 500
  }
}, { _id: false });

const CertificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  issuer: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  issueDate: {
    type: Date,
    required: true
  },
  expiryDate: Date,
  credentialId: String,
  credentialUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Credential URL must be a valid HTTP/HTTPS URL'
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const LanguageSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  proficiency: {
    type: String,
    enum: ['basic', 'conversational', 'fluent', 'native'],
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const AvailabilitySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['available', 'busy', 'unavailable'],
    default: 'available'
  },
  hoursPerWeek: {
    type: Number,
    min: 1,
    max: 168,
    default: 40
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  workingHours: {
    start: {
      type: String,
      default: '09:00'
    },
    end: {
      type: String,
      default: '17:00'
    }
  },
  workingDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  vacationMode: {
    enabled: {
      type: Boolean,
      default: false
    },
    startDate: Date,
    endDate: Date,
    message: String
  }
}, { _id: false });

const FreelancerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Professional information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 100,
    maxlength: 2000
  },
  tagline: {
    type: String,
    trim: true,
    maxlength: 150
  },
  
  // Profile media
  profileImage: {
    url: String,
    publicId: String
  },
  coverImage: {
    url: String,
    publicId: String
  },
  
  // Skills and expertise
  skills: [SkillSchema],
  primarySkills: [{
    type: String,
    maxlength: 50
  }],
  
  // Portfolio
  portfolio: [PortfolioItemSchema],
  
  // Professional background
  experience: [ExperienceSchema],
  education: [EducationSchema],
  certifications: [CertificationSchema],
  
  // Languages
  languages: [LanguageSchema],
  
  // Availability and rates
  availability: AvailabilitySchema,
  hourlyRate: {
    min: {
      type: Number,
      min: 1
    },
    max: {
      type: Number,
      min: 1
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Location
  location: {
    country: String,
    city: String,
    timezone: String
  },
  
  // Social links
  socialLinks: {
    website: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Website URL must be a valid HTTP/HTTPS URL'
      }
    },
    linkedin: String,
    github: String,
    behance: String,
    dribbble: String,
    instagram: String,
    twitter: String
  },
  
  // Performance statistics
  stats: {
    totalOrders: {
      type: Number,
      default: 0
    },
    completedOrders: {
      type: Number,
      default: 0
    },
    cancelledOrders: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    onTimeDelivery: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    responseTime: {
      type: Number,
      default: 24 // in hours
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    repeatClients: {
      type: Number,
      default: 0
    }
  },
  
  // Freelancer level and badges
  level: {
    type: String,
    enum: ['new', 'level1', 'level2', 'topRated'],
    default: 'new'
  },
  badges: [{
    type: {
      type: String,
      enum: [
        'quickResponder',
        'onTimeDelivery',
        'topRated',
        'risingTalent',
        'expertVerified',
        'clientFavorite',
        'qualityWork'
      ]
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Profile settings
  settings: {
    isPublic: {
      type: Boolean,
      default: true
    },
    showLocation: {
      type: Boolean,
      default: true
    },
    showLastSeen: {
      type: Boolean,
      default: true
    },
    allowDirectContact: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      newOrders: {
        type: Boolean,
        default: true
      },
      orderUpdates: {
        type: Boolean,
        default: true
      },
      messages: {
        type: Boolean,
        default: true
      },
      reviews: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Verification status
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verificationLevel: {
      type: String,
      enum: ['basic', 'plus', 'pro'],
      default: 'basic'
    },
    documents: [{
      type: {
        type: String,
        enum: ['identity', 'address', 'education', 'certification']
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      reviewedAt: Date,
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  
  // Profile completeness
  completeness: {
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    missingFields: [String]
  },
  
  // Activity tracking
  lastActive: {
    type: Date,
    default: Date.now
  },
  profileViews: {
    type: Number,
    default: 0
  },
  profileViewsThisMonth: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
// userId is unique at schema level; avoid duplicate single-field index
FreelancerProfileSchema.index({ 'skills.name': 1, 'settings.isPublic': 1 });
FreelancerProfileSchema.index({ level: 1, 'stats.averageRating': -1 });
FreelancerProfileSchema.index({ 'location.country': 1, 'settings.isPublic': 1 });
FreelancerProfileSchema.index({ 'stats.completionRate': -1, 'settings.isPublic': 1 });
FreelancerProfileSchema.index({ lastActive: -1 });

// Text search index
FreelancerProfileSchema.index({
  title: 'text',
  description: 'text',
  'skills.name': 'text',
  tagline: 'text'
});

// Virtual for years of experience
FreelancerProfileSchema.virtual('totalExperience').get(function() {
  if (!this.experience || this.experience.length === 0) return 0;
  
  let totalMonths = 0;
  this.experience.forEach(exp => {
    const startDate = new Date(exp.startDate);
    const endDate = exp.endDate ? new Date(exp.endDate) : new Date();
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth());
    totalMonths += Math.max(0, months);
  });
  
  return Math.round(totalMonths / 12 * 10) / 10; // Years with 1 decimal
});

// Virtual for active certifications
FreelancerProfileSchema.virtual('activeCertifications').get(function() {
  if (!this.certifications) return [];
  
  const now = new Date();
  return this.certifications.filter(cert => 
    !cert.expiryDate || new Date(cert.expiryDate) > now
  );
});

// Virtual for profile strength
FreelancerProfileSchema.virtual('profileStrength').get(function() {
  let score = 0;
  const maxScore = 100;
  
  // Basic info (30 points)
  if (this.title) score += 5;
  if (this.description && this.description.length >= 100) score += 10;
  if (this.tagline) score += 5;
  if (this.profileImage && this.profileImage.url) score += 10;
  
  // Skills (20 points)
  if (this.skills && this.skills.length >= 3) score += 10;
  if (this.skills && this.skills.some(skill => skill.verified)) score += 10;
  
  // Portfolio (20 points)
  if (this.portfolio && this.portfolio.length >= 1) score += 10;
  if (this.portfolio && this.portfolio.length >= 3) score += 10;
  
  // Experience/Education (15 points)
  if (this.experience && this.experience.length >= 1) score += 8;
  if (this.education && this.education.length >= 1) score += 7;
  
  // Additional (15 points)
  if (this.certifications && this.certifications.length >= 1) score += 5;
  if (this.languages && this.languages.length >= 1) score += 5;
  if (this.verification.isVerified) score += 5;
  
  return Math.min(score, maxScore);
});

// Pre-save middleware
FreelancerProfileSchema.pre('save', function(next) {
  // Update profile completeness
  this.completeness.percentage = this.profileStrength;
  
  // Update missing fields
  const missingFields = [];
  if (!this.title) missingFields.push('title');
  if (!this.description || this.description.length < 100) missingFields.push('description');
  if (!this.skills || this.skills.length === 0) missingFields.push('skills');
  if (!this.portfolio || this.portfolio.length === 0) missingFields.push('portfolio');
  if (!this.profileImage || !this.profileImage.url) missingFields.push('profileImage');
  
  this.completeness.missingFields = missingFields;
  
  // Update level based on stats
  this.updateLevel();
  
  next();
});

// Instance methods
FreelancerProfileSchema.methods.updateLevel = function() {
  const stats = this.stats;
  
  if (stats.totalOrders >= 50 && stats.averageRating >= 4.8 && stats.completionRate >= 95) {
    this.level = 'topRated';
  } else if (stats.totalOrders >= 20 && stats.averageRating >= 4.5 && stats.completionRate >= 90) {
    this.level = 'level2';
  } else if (stats.totalOrders >= 5 && stats.averageRating >= 4.0 && stats.completionRate >= 85) {
    this.level = 'level1';
  } else {
    this.level = 'new';
  }
};

FreelancerProfileSchema.methods.updateStats = function(orderData) {
  // This would be called when an order is completed
  this.stats.totalOrders += 1;
  
  if (orderData.completed) {
    this.stats.completedOrders += 1;
  } else if (orderData.cancelled) {
    this.stats.cancelledOrders += 1;
  }
  
  // Recalculate completion rate
  this.stats.completionRate = Math.round(
    (this.stats.completedOrders / this.stats.totalOrders) * 100
  );
  
  // Update on-time delivery
  if (orderData.onTime) {
    // Logic to calculate on-time delivery percentage
  }
  
  // Update earnings
  if (orderData.earnings) {
    this.stats.totalEarnings += orderData.earnings;
  }
  
  return this.save();
};

FreelancerProfileSchema.methods.addBadge = function(badgeType) {
  const existingBadge = this.badges.find(badge => badge.type === badgeType);
  
  if (!existingBadge) {
    this.badges.push({
      type: badgeType,
      earnedAt: new Date(),
      isActive: true
    });
    return this.save();
  }
  
  return Promise.resolve(this);
};

FreelancerProfileSchema.methods.incrementProfileViews = function() {
  this.profileViews += 1;
  this.profileViewsThisMonth += 1;
  return this.save();
};

// Static methods
FreelancerProfileSchema.statics.findBySkills = function(skills, options = {}) {
  const {
    location,
    minRating = 0,
    level,
    availability = 'available',
    sortBy = 'rating'
  } = options;
  
  const filter = {
    'settings.isPublic': true,
    'skills.name': { $in: skills }
  };
  
  if (location) filter['location.country'] = location;
  if (minRating > 0) filter['stats.averageRating'] = { $gte: minRating };
  if (level) filter.level = level;
  if (availability) filter['availability.status'] = availability;
  
  let sort = {};
  switch (sortBy) {
    case 'experience':
      sort = { totalExperience: -1 };
      break;
    case 'orders':
      sort = { 'stats.totalOrders': -1 };
      break;
    case 'recent':
      sort = { lastActive: -1 };
      break;
    case 'rating':
    default:
      sort = { 'stats.averageRating': -1, 'stats.totalReviews': -1 };
      break;
  }
  
  return this.find(filter).sort(sort).populate('userId', 'name email');
};

FreelancerProfileSchema.statics.getTopFreelancers = function(limit = 10) {
  return this.find({
    'settings.isPublic': true,
    level: { $in: ['level2', 'topRated'] }
  })
  .sort({ 'stats.averageRating': -1, 'stats.totalOrders': -1 })
  .limit(limit)
  .populate('userId', 'name email');
};

export default mongoose.models.FreelancerProfile || mongoose.model('FreelancerProfile', FreelancerProfileSchema);

