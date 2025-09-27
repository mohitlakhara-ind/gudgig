import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      'page_view',
      'job_view',
      'job_apply',
      'job_save',
      'job_share',
      'search',
      'profile_update',
      'resume_upload',
      'login',
      'logout',
      'registration',
      'email_open',
      'email_click',
      'notification_click',
      'company_view',
      'application_status_check',
      'interview_scheduled',
      'offer_received',
      'offer_accepted',
      'offer_declined'
    ],
    index: true
  },
  eventData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    referrer: String,
    sessionId: String,
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet'],
      default: 'desktop'
    },
    browser: String,
    os: String,
    country: String,
    city: String,
    source: {
      type: String,
      enum: ['direct', 'search', 'social', 'email', 'referral', 'advertisement'],
      default: 'direct'
    },
    campaign: String,
    medium: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false // We're using our own timestamp field
});

// Compound indexes for efficient querying
analyticsSchema.index({ user: 1, eventType: 1, timestamp: -1 });
analyticsSchema.index({ eventType: 1, timestamp: -1 });
analyticsSchema.index({ timestamp: -1 });
analyticsSchema.index({ 'metadata.sessionId': 1 });

// Static methods for analytics queries
analyticsSchema.statics.getUserActivity = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        lastActivity: { $max: '$timestamp' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

analyticsSchema.statics.getPopularJobs = function(startDate, endDate, limit = 10) {
  return this.aggregate([
    {
      $match: {
        eventType: 'job_view',
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$eventData.jobId',
        views: { $sum: 1 },
        uniqueUsers: { $addToSet: '$user' }
      }
    },
    {
      $addFields: {
        uniqueUserCount: { $size: '$uniqueUsers' }
      }
    },
    {
      $sort: { views: -1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'jobs',
        localField: '_id',
        foreignField: '_id',
        as: 'jobDetails'
      }
    },
    {
      $unwind: '$jobDetails'
    }
  ]);
};

analyticsSchema.statics.getSearchTrends = function(startDate, endDate, limit = 20) {
  return this.aggregate([
    {
      $match: {
        eventType: 'search',
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$eventData.query',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$user' }
      }
    },
    {
      $addFields: {
        uniqueUserCount: { $size: '$uniqueUsers' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

analyticsSchema.statics.getUserEngagement = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          user: '$user',
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          }
        },
        events: { $sum: 1 },
        sessionTime: { $sum: 1 } // Simplified - would need session tracking
      }
    },
    {
      $group: {
        _id: '$_id.user',
        activeDays: { $sum: 1 },
        totalEvents: { $sum: '$events' },
        avgEventsPerDay: { $avg: '$events' }
      }
    },
    {
      $sort: { totalEvents: -1 }
    }
  ]);
};

analyticsSchema.statics.getConversionFunnel = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$user' }
      }
    },
    {
      $addFields: {
        uniqueUserCount: { $size: '$uniqueUsers' }
      }
    }
  ]);
};

// Static method to track event
analyticsSchema.statics.trackEvent = function(userId, eventType, eventData = {}, metadata = {}) {
  return this.create({
    user: userId,
    eventType,
    eventData,
    metadata
  });
};

export default mongoose.model('Analytics', analyticsSchema);