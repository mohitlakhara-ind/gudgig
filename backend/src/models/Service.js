import mongoose from 'mongoose';

const ServicePackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['basic', 'standard', 'premium'],
  },
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
  price: {
    type: Number,
    required: true,
    min: 1
  },
  deliveryTime: {
    type: Number,
    required: true,
    min: 1,
    max: 365 // days
  },
  revisions: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  features: [{
    type: String,
    trim: true,
    maxlength: 100
  }]
}, { _id: false });

const ServiceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 120
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 50,
    maxlength: 2000
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
        'game development',
        'digital marketing',
        'video editing',
        'logo design',
        'translation',
        'data entry'
      ],
      message: 'Category must be one of the available service categories'
    }
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: 50
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  packages: {
    basic: {
      type: ServicePackageSchema,
      required: true
    },
    standard: ServicePackageSchema,
    premium: ServicePackageSchema
  },
  gallery: {
    images: [{
      url: {
        type: String,
        required: true
      },
      publicId: String, // Cloudinary public ID
      alt: String
    }],
    videos: [{
      url: String,
      publicId: String,
      thumbnail: String
    }]
  },
  faq: [{
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    answer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    }
  }],
  requirements: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'deleted'],
    default: 'draft'
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  orderCount: {
    type: Number,
    default: 0,
    min: 0
  },
  impressions: {
    type: Number,
    default: 0,
    min: 0
  },
  clicks: {
    type: Number,
    default: 0,
    min: 0
  },
  // SEO and search optimization
  searchKeywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  // Pricing helpers
  startingPrice: {
    type: Number,
    required: true,
    min: 1
  },
  // Featured service (admin can promote)
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredUntil: Date,
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
ServiceSchema.index({ category: 1, status: 1 });
ServiceSchema.index({ createdBy: 1, status: 1 });
ServiceSchema.index({ status: 1, createdAt: -1 });
ServiceSchema.index({ startingPrice: 1, status: 1 });
ServiceSchema.index({ 'rating.average': -1, status: 1 });
ServiceSchema.index({ tags: 1, status: 1 });
ServiceSchema.index({ searchKeywords: 1, status: 1 });
ServiceSchema.index({ isFeatured: -1, status: 1, createdAt: -1 });

// Text search index
ServiceSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  searchKeywords: 'text'
});

// Virtual for click-through rate
ServiceSchema.virtual('ctr').get(function() {
  return this.impressions > 0 ? (this.clicks / this.impressions) * 100 : 0;
});

// Pre-save middleware to set starting price
ServiceSchema.pre('save', function(next) {
  if (this.packages && this.packages.basic) {
    this.startingPrice = this.packages.basic.price;
  }
  
  // Generate search keywords from title and description
  if (this.isModified('title') || this.isModified('description') || this.isModified('tags')) {
    const keywords = new Set();
    
    // Add words from title
    this.title.toLowerCase().split(/\s+/).forEach(word => {
      if (word.length > 2) keywords.add(word);
    });
    
    // Add words from description
    this.description.toLowerCase().split(/\s+/).forEach(word => {
      if (word.length > 2) keywords.add(word);
    });
    
    // Add tags
    this.tags.forEach(tag => keywords.add(tag.toLowerCase()));
    
    this.searchKeywords = Array.from(keywords);
  }
  
  next();
});

// Static methods
ServiceSchema.statics.findActive = function() {
  return this.find({ status: 'active', isDeleted: false });
};

ServiceSchema.statics.findByCategory = function(category) {
  return this.find({ category, status: 'active', isDeleted: false });
};

ServiceSchema.statics.findFeatured = function() {
  return this.find({ 
    isFeatured: true, 
    status: 'active', 
    isDeleted: false,
    $or: [
      { featuredUntil: { $exists: false } },
      { featuredUntil: { $gte: new Date() } }
    ]
  });
};

// Instance methods
ServiceSchema.methods.incrementImpressions = function() {
  this.impressions += 1;
  return this.save();
};

ServiceSchema.methods.incrementClicks = function() {
  this.clicks += 1;
  return this.save();
};

ServiceSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating.average * this.rating.count) + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

ServiceSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.status = 'deleted';
  return this.save();
};

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema);

