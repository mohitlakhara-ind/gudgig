import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add company name'],
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  slug: String, // URL-friendly version of name
  description: {
    type: String,
    required: [true, 'Please add company description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  website: {
    type: String,
    match: [
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      'Please add a valid website URL'
    ]
  },
  logo: {
    type: String, // URL to company logo
    default: null
  },
  industry: {
    type: String,
    required: [true, 'Please add industry'],
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
      'Other'
    ]
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    default: '1-10'
  },
  founded: {
    type: Number,
    min: [1800, 'Founded year must be after 1800'],
    max: [new Date().getFullYear(), 'Founded year cannot be in the future']
  },
  headquarters: {
    type: String,
    default: null
  },
  locations: [{
    city: String,
    state: String,
    country: String
  }],
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String
  },
  culture: {
    type: String,
    maxlength: [500, 'Culture description cannot be more than 500 characters']
  },
  benefits: [{
    type: String,
    trim: true
  }],
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified'
  },
  businessLicense: {
    type: String,
    default: null
  },
  taxId: {
    type: String,
    default: null
  },
  kybDocuments: [{
    type: String, // URLs to documents
    required: false
  }],
  verifiedDate: {
    type: Date,
    default: null
  },
  featured: {
    type: Boolean,
    default: false
  },
  jobsCount: {
    type: Number,
    default: 0
  },
  followersCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  eeocStatement: {
    type: String,
    default: null
  },
  diversityPolicy: {
    type: String,
    default: null
  },
  accessibilityStatement: {
    type: String,
    default: null
  },
  privacyPolicy: {
    type: String,
    default: null
  },
  trustScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  employeeCount: {
    type: Number,
    default: 0
  },
  foundedYear: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear()
  },
  certifications: [{
    type: String,
    trim: true
  }],
  glassdoorRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  linkedinUrl: {
    type: String,
    default: null
  },
  offices: [{
    city: String,
    state: String,
    country: String,
    isHeadquarters: {
      type: Boolean,
      default: false
    }
  }],
  remotePolicy: {
    type: String,
    enum: ['no_remote', 'hybrid', 'full_remote', 'flexible'],
    default: 'no_remote'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug from name before saving
companySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-');
  }
  next();
});

// Virtual for jobs posted by this company
companySchema.virtual('jobs', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'company',
  justOne: false
});

// Virtual for employees (users who work at this company)
companySchema.virtual('employees', {
  ref: 'User',
  localField: '_id',
  foreignField: 'company',
  justOne: false
});

// KYB verification methods
companySchema.methods.submitForVerification = function() {
  if (this.verificationStatus === 'unverified' && this.businessLicense && this.taxId && this.kybDocuments.length > 0) {
    this.verificationStatus = 'pending';
    return this.save();
  }
  throw new Error('Company must have business license, tax ID, and KYB documents to submit for verification');
};

companySchema.methods.approveVerification = function() {
  this.verificationStatus = 'verified';
  this.verifiedDate = new Date();
  return this.save();
};

companySchema.methods.rejectVerification = function(reason) {
  this.verificationStatus = 'rejected';
  // Could add rejection reason field if needed
  return this.save();
};

companySchema.methods.isVerified = function() {
  return this.verificationStatus === 'verified';
};

// Index for better search performance
companySchema.index({ name: 'text', description: 'text' });
companySchema.index({ industry: 1, size: 1 });
companySchema.index({ verificationStatus: 1, trustScore: -1 });
companySchema.index({ featured: -1, createdAt: -1 });
companySchema.index({ employeeCount: 1 });
companySchema.index({ remotePolicy: 1 });

export default mongoose.model('Company', companySchema);
