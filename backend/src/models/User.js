import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    validate: {
      validator: function(value) {
        // Check for complexity: at least one uppercase, one lowercase, one number, one special char
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    },
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['jobseeker', 'employer', 'admin'],
    default: 'jobseeker'
  },
  avatar: {
    type: String, // URL to profile image
    default: null
  },
  phone: {
    type: String,
    default: null
  },
  location: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    default: null
  },
  skills: [{
    name: {
      type: String,
      trim: true,
      required: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      max: 50,
      default: 0
    }
  }],
  experience: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    isCurrent: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      maxlength: [1000, 'Experience description cannot be more than 1000 characters']
    },
    skills: [{
      type: String,
      trim: true
    }]
  }],
  education: [{
    institution: {
      type: String,
      required: true,
      trim: true
    },
    degree: {
      type: String,
      required: true,
      trim: true
    },
    fieldOfStudy: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    isCurrent: {
      type: Boolean,
      default: false
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4
    },
    description: {
      type: String,
      maxlength: [500, 'Education description cannot be more than 500 characters']
    }
  }],
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    issuer: {
      type: String,
      required: true,
      trim: true
    },
    issueDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date
    },
    credentialId: {
      type: String,
      trim: true
    },
    credentialUrl: {
      type: String,
      trim: true
    }
  }],
  portfolio: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      maxlength: [500, 'Portfolio description cannot be more than 500 characters']
    },
    url: {
      type: String,
      trim: true
    },
    imageUrl: {
      type: String,
      trim: true
    },
    technologies: [{
      type: String,
      trim: true
    }],
    category: {
      type: String,
      enum: ['web', 'mobile', 'desktop', 'design', 'data', 'other'],
      default: 'other'
    }
  }],
  experienceLevel: {
    type: String,
    enum: ['fresher', '1-2 years', '3-5 years', '5-10 years', '10+ years'],
    default: 'fresher'
  },
  resume: {
    url: {
      type: String,
      default: null
    },
    publicId: {
      type: String,
      default: null
    },
    originalName: {
      type: String,
      default: null
    },
    uploadedAt: {
      type: Date,
      default: null
    }
  },
  profilePicture: {
    url: {
      type: String,
      default: null
    },
    publicId: {
      type: String,
      default: null
    }
  },
  socialLinks: {
    linkedin: {
      type: String,
      trim: true
    },
    github: {
      type: String,
      trim: true
    },
    portfolio: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    }
  },
  preferences: {
    jobTypes: [{
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance']
    }],
    locations: [{
      type: String,
      trim: true
    }],
    remoteWork: {
      type: String,
      enum: ['no', 'hybrid', 'full', 'flexible'],
      default: 'flexible'
    },
    salaryExpectation: {
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
      },
      period: {
        type: String,
        enum: ['hourly', 'monthly', 'yearly'],
        default: 'yearly'
      }
    },
    industries: [{
      type: String,
      trim: true
    }],
    companySize: [{
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
    }]
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  refreshToken: String,
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  privacyConsent: {
    gdpr: {
      type: Boolean,
      default: false
    },
    ccpa: {
      type: Boolean,
      default: false
    },
    timestamp: {
      type: Date,
      default: null
    }
  },
  dataRetentionExpiry: {
    type: Date,
    default: null
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  accountLocked: {
    type: Boolean,
    default: false
  },
  passwordHistory: [{
    password: {
      type: String,
      select: false
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  }],
  accessibilitySettings: {
    screenReader: {
      type: Boolean,
      default: false
    },
    highContrast: {
      type: Boolean,
      default: false
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    }
  },
  identityVerified: {
    type: Boolean,
    default: false
  },
  backgroundCheckStatus: {
    type: String,
    enum: ['not_started', 'pending', 'completed', 'failed'],
    default: 'not_started'
  },
  kybStatus: {
    type: String,
    enum: ['not_started', 'pending', 'completed', 'failed'],
    default: 'not_started'
  },
  auditTrail: [{
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Seller/Freelancer fields
userSchema.add({
  sellerProfile: {
    isSeller: { type: Boolean, default: false },
    level: { type: String, enum: ['new', 'level_1', 'level_2', 'top_rated'], default: 'new' },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    completedOrders: { type: Number, default: 0 },
    responseTimeHours: { type: Number, default: 24 },
    verifiedSeller: { type: Boolean, default: false },
    profileCompleted: { type: Boolean, default: false },
    tagline: { type: String, maxlength: 120 },
    languages: [{ name: String, proficiency: { type: String, enum: ['basic', 'conversational', 'fluent', 'native'] } }],
    sellerSince: { type: Date },
    earningsCents: { type: Number, default: 0 }
  }
});

// Encrypt password using bcrypt and manage password history
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  // Add current password to history before changing (if not new user)
  if (!this.isNew && this.password) {
    this.passwordHistory.push({
      password: this.password,
      changedAt: new Date()
    });
    // Keep only last 5 passwords
    if (this.passwordHistory.length > 5) {
      this.passwordHistory = this.passwordHistory.slice(-5);
    }
  }

  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Generate refresh token
userSchema.methods.getRefreshToken = function() {
  const refreshToken = jwt.sign(
    { id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' }
  );

  this.refreshToken = refreshToken;
  return refreshToken;
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Generate email verification token
userSchema.methods.getEmailVerificationToken = function() {
  // Generate token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expire
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

// GDPR/CCPA data export
userSchema.methods.exportPersonalData = function() {
  return {
    name: this.name,
    email: this.email,
    phone: this.phone,
    location: this.location,
    bio: this.bio,
    skills: this.skills,
    experience: this.experience,
    resume: this.resume,
    role: this.role,
    avatar: this.avatar,
    privacyConsent: this.privacyConsent,
    accessibilitySettings: this.accessibilitySettings,
    identityVerified: this.identityVerified,
    backgroundCheckStatus: this.backgroundCheckStatus,
    kybStatus: this.kybStatus,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin,
    auditTrail: this.auditTrail
  };
};

// GDPR/CCPA data deletion (anonymize)
userSchema.methods.deletePersonalData = function() {
  this.name = 'Deleted User';
  this.email = `deleted_${this._id}@deleted.com`;
  this.phone = null;
  this.location = null;
  this.bio = null;
  this.skills = [];
  this.resume = null;
  this.avatar = null;
  this.privacyConsent = {};
  this.accessibilitySettings = {};
  this.auditTrail = [];
  this.isActive = false;
  this.dataRetentionExpiry = new Date();
  return this.save();
};

// Add audit entry
userSchema.methods.addAuditEntry = function(action, ipAddress, userAgent) {
  this.auditTrail.push({
    action,
    ipAddress,
    userAgent
  });
  // Keep only last 100 entries
  if (this.auditTrail.length > 100) {
    this.auditTrail = this.auditTrail.slice(-100);
  }
};

// Virtual for applications count
userSchema.virtual('applicationsCount', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'applicant',
  count: true
});

// Virtual for jobs posted count (for employers)
userSchema.virtual('jobsPostedCount', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'employer',
  count: true
});

export default mongoose.model('User', userSchema);
