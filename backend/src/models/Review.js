import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  // Review target - can be for service, freelancer, or order
  targetType: {
    type: String,
    enum: ['service', 'freelancer', 'order'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },
  
  // Review participants
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  revieweeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Associated order (for order-based reviews)
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  
  // Associated service (for service reviews)
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  
  // Review content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  // Detailed ratings for different aspects
  aspectRatings: {
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    serviceAsDescribed: {
      type: Number,
      min: 1,
      max: 5
    },
    recommendToFriend: {
      type: Number,
      min: 1,
      max: 5
    },
    deliveryTime: {
      type: Number,
      min: 1,
      max: 5
    },
    quality: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  
  comment: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000
  },
  
  // Review metadata
  isPublic: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Response from reviewee
  response: {
    comment: {
      type: String,
      trim: true,
      maxlength: 500
    },
    respondedAt: Date,
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  
  // Review status and moderation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'approved'
  },
  
  moderationNotes: String,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  
  // Helpful votes
  helpfulVotes: {
    up: {
      type: Number,
      default: 0
    },
    down: {
      type: Number,
      default: 0
    },
    voters: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      vote: {
        type: String,
        enum: ['up', 'down']
      }
    }]
  },
  
  // Flags and reports
  flags: [{
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'fake', 'offensive', 'other']
    },
    description: String,
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    flaggedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Review authenticity
  isAuthentic: {
    type: Boolean,
    default: true
  },
  
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
ReviewSchema.index({ targetType: 1, targetId: 1, status: 1 });
ReviewSchema.index({ reviewerId: 1, createdAt: -1 });
ReviewSchema.index({ revieweeId: 1, status: 1, createdAt: -1 });
ReviewSchema.index({ serviceId: 1, status: 1, rating: -1 });
ReviewSchema.index({ orderId: 1 });
ReviewSchema.index({ rating: -1, createdAt: -1 });
ReviewSchema.index({ status: 1, isPublic: 1 });

// Compound index for preventing duplicate reviews
ReviewSchema.index({ 
  reviewerId: 1, 
  targetType: 1, 
  targetId: 1, 
  orderId: 1 
}, { unique: true });

// Virtual for helpful score
ReviewSchema.virtual('helpfulScore').get(function() {
  return this.helpfulVotes.up - this.helpfulVotes.down;
});

// Virtual for total votes
ReviewSchema.virtual('totalVotes').get(function() {
  return this.helpfulVotes.up + this.helpfulVotes.down;
});

// Virtual for average aspect rating
ReviewSchema.virtual('averageAspectRating').get(function() {
  if (!this.aspectRatings) return null;
  
  const ratings = Object.values(this.aspectRatings).filter(rating => rating != null);
  if (ratings.length === 0) return null;
  
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
});

// Instance methods
ReviewSchema.methods.addHelpfulVote = function(userId, voteType) {
  // Remove existing vote from this user
  this.helpfulVotes.voters = this.helpfulVotes.voters.filter(
    voter => voter.userId.toString() !== userId.toString()
  );
  
  // Add new vote
  this.helpfulVotes.voters.push({ userId, vote: voteType });
  
  // Recalculate vote counts
  const upVotes = this.helpfulVotes.voters.filter(v => v.vote === 'up').length;
  const downVotes = this.helpfulVotes.voters.filter(v => v.vote === 'down').length;
  
  this.helpfulVotes.up = upVotes;
  this.helpfulVotes.down = downVotes;
  
  return this.save();
};

ReviewSchema.methods.addResponse = function(responseComment) {
  this.response = {
    comment: responseComment,
    respondedAt: new Date(),
    isPublic: true
  };
  return this.save();
};

ReviewSchema.methods.flagReview = function(flagData) {
  this.flags.push({
    ...flagData,
    flaggedAt: new Date()
  });
  
  // Auto-flag if multiple reports
  if (this.flags.length >= 3) {
    this.status = 'flagged';
  }
  
  return this.save();
};

ReviewSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.status = 'rejected';
  return this.save();
};

// Static methods
ReviewSchema.statics.getAverageRating = async function(targetType, targetId) {
  const result = await this.aggregate([
    {
      $match: {
        targetType,
        targetId: new mongoose.Types.ObjectId(targetId),
        status: 'approved',
        isPublic: true,
        isDeleted: false
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);
  
  if (result.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
  
  const data = result[0];
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  data.ratingDistribution.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });
  
  return {
    averageRating: Math.round(data.averageRating * 10) / 10,
    totalReviews: data.totalReviews,
    ratingDistribution: distribution
  };
};

ReviewSchema.statics.getFreelancerStats = async function(freelancerId) {
  const result = await this.aggregate([
    {
      $match: {
        revieweeId: new mongoose.Types.ObjectId(freelancerId),
        status: 'approved',
        isPublic: true,
        isDeleted: false
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        averageCommunication: { $avg: '$aspectRatings.communication' },
        averageQuality: { $avg: '$aspectRatings.quality' },
        averageDeliveryTime: { $avg: '$aspectRatings.deliveryTime' },
        averageServiceAsDescribed: { $avg: '$aspectRatings.serviceAsDescribed' },
        averageRecommendation: { $avg: '$aspectRatings.recommendToFriend' }
      }
    }
  ]);
  
  if (result.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      aspectAverages: {
        communication: 0,
        quality: 0,
        deliveryTime: 0,
        serviceAsDescribed: 0,
        recommendToFriend: 0
      }
    };
  }
  
  const data = result[0];
  return {
    averageRating: Math.round(data.averageRating * 10) / 10,
    totalReviews: data.totalReviews,
    aspectAverages: {
      communication: Math.round((data.averageCommunication || 0) * 10) / 10,
      quality: Math.round((data.averageQuality || 0) * 10) / 10,
      deliveryTime: Math.round((data.averageDeliveryTime || 0) * 10) / 10,
      serviceAsDescribed: Math.round((data.averageServiceAsDescribed || 0) * 10) / 10,
      recommendToFriend: Math.round((data.averageRecommendation || 0) * 10) / 10
    }
  };
};

ReviewSchema.statics.findReviewsForTarget = function(targetType, targetId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'newest',
    minRating,
    maxRating
  } = options;
  
  const filter = {
    targetType,
    targetId,
    status: 'approved',
    isPublic: true,
    isDeleted: false
  };
  
  if (minRating) filter.rating = { $gte: minRating };
  if (maxRating) filter.rating = { ...filter.rating, $lte: maxRating };
  
  let sort = {};
  switch (sortBy) {
    case 'oldest':
      sort = { createdAt: 1 };
      break;
    case 'rating-high':
      sort = { rating: -1, createdAt: -1 };
      break;
    case 'rating-low':
      sort = { rating: 1, createdAt: -1 };
      break;
    case 'helpful':
      sort = { 'helpfulVotes.up': -1, createdAt: -1 };
      break;
    case 'newest':
    default:
      sort = { createdAt: -1 };
      break;
  }
  
  return this.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('reviewerId', 'name email')
    .populate('revieweeId', 'name email');
};

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);

