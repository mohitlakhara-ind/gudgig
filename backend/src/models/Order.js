import mongoose from 'mongoose';

const OrderEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'order_placed',
      'payment_confirmed',
      'order_started',
      'delivery_submitted',
      'revision_requested',
      'revision_submitted',
      'order_completed',
      'order_cancelled',
      'dispute_opened',
      'dispute_resolved'
    ],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

const DeliverableSchema = new mongoose.Schema({
  files: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    filename: {
      type: String,
      required: true
    },
    fileType: String,
    fileSize: Number
  }],
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  deliveredAt: {
    type: Date,
    default: Date.now
  },
  isRevision: {
    type: Boolean,
    default: false
  },
  revisionNumber: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const RevisionRequestSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'rejected'],
    default: 'pending'
  },
  dueDate: Date,
  response: {
    description: String,
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  // Basic order information
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  packageType: {
    type: String,
    enum: ['basic', 'standard', 'premium'],
    required: true
  },
  
  // Parties involved
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Order status and timeline
  status: {
    type: String,
    enum: [
      'pending_payment',
      'payment_confirmed',
      'in_progress',
      'delivered',
      'revision_requested',
      'completed',
      'cancelled',
      'disputed',
      'refunded'
    ],
    default: 'pending_payment'
  },
  
  // Pricing and payment
  packageDetails: {
    title: String,
    description: String,
    price: {
      type: Number,
      required: true,
      min: 0
    },
    deliveryTime: {
      type: Number,
      required: true,
      min: 1
    },
    revisions: {
      type: Number,
      required: true,
      min: 0
    },
    features: [String]
  },
  
  // Additional services/extras
  extras: [{
    name: String,
    description: String,
    price: Number,
    deliveryTime: Number
  }],
  
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  platformFee: {
    type: Number,
    default: 0,
    min: 0
  },
  
  sellerEarnings: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Timeline and deadlines
  orderDate: {
    type: Date,
    default: Date.now
  },
  expectedDeliveryDate: {
    type: Date,
    required: true
  },
  actualDeliveryDate: Date,
  completionDate: Date,
  
  // Order requirements and communication
  requirements: {
    type: String,
    maxlength: 2000
  },
  buyerInstructions: {
    type: String,
    maxlength: 1000
  },
  
  // Deliverables and revisions
  deliverables: [DeliverableSchema],
  revisions: {
    requested: {
      type: Number,
      default: 0
    },
    completed: {
      type: Number,
      default: 0
    },
    remaining: {
      type: Number,
      default: function() {
        return this.packageDetails.revisions || 0;
      }
    },
    requests: [RevisionRequestSchema]
  },
  
  // Payment information
  payment: {
    status: {
      type: String,
      enum: ['pending', 'processing', 'held', 'released', 'refunded', 'failed'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['stripe', 'paypal', 'razorpay'],
      required: true
    },
    transactionId: String,
    paymentIntentId: String,
    paidAt: Date,
    releasedAt: Date,
    refundedAt: Date,
    refundAmount: Number,
    escrowReleaseDate: Date
  },
  
  // Quality and feedback
  rating: {
    buyerRating: {
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String,
      createdAt: Date
    },
    sellerRating: {
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String,
      createdAt: Date
    }
  },
  
  // Dispute management
  dispute: {
    isDisputed: {
      type: Boolean,
      default: false
    },
    reason: String,
    description: String,
    openedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    openedAt: Date,
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'closed']
    },
    resolution: {
      decision: String,
      refundAmount: Number,
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      resolvedAt: Date,
      notes: String
    }
  },
  
  // Order timeline and events
  timeline: [OrderEventSchema],
  
  // Metadata and tracking
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Communication thread ID for order-specific messages
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  },
  
  // Cancellation information
  cancellation: {
    reason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    refundAmount: Number
  },
  
  // Auto-completion settings
  autoComplete: {
    enabled: {
      type: Boolean,
      default: true
    },
    daysAfterDelivery: {
      type: Number,
      default: 3
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
OrderSchema.index({ buyerId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ sellerId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ serviceId: 1, status: 1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1, expectedDeliveryDate: 1 });
OrderSchema.index({ 'payment.status': 1, createdAt: -1 });
OrderSchema.index({ expectedDeliveryDate: 1, status: 1 });

// Virtual for order progress percentage
OrderSchema.virtual('progressPercentage').get(function() {
  const statusProgress = {
    'pending_payment': 10,
    'payment_confirmed': 20,
    'in_progress': 50,
    'delivered': 80,
    'revision_requested': 70,
    'completed': 100,
    'cancelled': 0,
    'disputed': 60,
    'refunded': 0
  };
  return statusProgress[this.status] || 0;
});

// Virtual for days until delivery
OrderSchema.virtual('daysUntilDelivery').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') return 0;
  const now = new Date();
  const deliveryDate = new Date(this.expectedDeliveryDate);
  const diffTime = deliveryDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Virtual for order age in days
OrderSchema.virtual('orderAge').get(function() {
  const now = new Date();
  const orderDate = new Date(this.createdAt);
  const diffTime = now - orderDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for is overdue
OrderSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') return false;
  return new Date() > new Date(this.expectedDeliveryDate);
});

// Pre-save middleware
OrderSchema.pre('save', function(next) {
  // Generate order number if not exists
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.orderNumber = `ORD-${timestamp}-${random}`.toUpperCase();
  }
  
  // Calculate seller earnings (platform takes 10% fee)
  if (this.isModified('totalAmount')) {
    this.platformFee = Math.round(this.totalAmount * 0.10); // 10% platform fee
    this.sellerEarnings = this.totalAmount - this.platformFee;
  }
  
  // Update remaining revisions
  if (this.packageDetails && this.packageDetails.revisions !== undefined) {
    this.revisions.remaining = Math.max(0, this.packageDetails.revisions - this.revisions.completed);
  }
  
  // Set escrow release date (7 days after delivery for auto-completion)
  if (this.status === 'delivered' && !this.payment.escrowReleaseDate) {
    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + (this.autoComplete.daysAfterDelivery || 3));
    this.payment.escrowReleaseDate = releaseDate;
  }
  
  next();
});

// Instance methods
OrderSchema.methods.addTimelineEvent = function(type, description, createdBy, metadata = {}) {
  this.timeline.push({
    type,
    description,
    createdBy,
    metadata
  });
  return this.save();
};

OrderSchema.methods.canRequestRevision = function() {
  return this.status === 'delivered' && this.revisions.remaining > 0;
};

OrderSchema.methods.canDeliver = function() {
  return this.status === 'in_progress' || this.status === 'revision_requested';
};

OrderSchema.methods.canComplete = function() {
  return this.status === 'delivered';
};

OrderSchema.methods.canCancel = function() {
  return ['pending_payment', 'payment_confirmed', 'in_progress'].includes(this.status);
};

OrderSchema.methods.markAsDelivered = function(deliverable) {
  this.deliverables.push(deliverable);
  this.status = 'delivered';
  this.actualDeliveryDate = new Date();
  
  return this.addTimelineEvent(
    'delivery_submitted',
    'Order has been delivered',
    deliverable.createdBy || this.sellerId
  );
};

OrderSchema.methods.requestRevision = function(revisionData) {
  if (!this.canRequestRevision()) {
    throw new Error('Cannot request revision for this order');
  }
  
  this.revisions.requests.push(revisionData);
  this.revisions.requested += 1;
  this.status = 'revision_requested';
  
  return this.addTimelineEvent(
    'revision_requested',
    `Revision requested: ${revisionData.description}`,
    revisionData.requestedBy
  );
};

OrderSchema.methods.completeOrder = function(completedBy) {
  this.status = 'completed';
  this.completionDate = new Date();
  this.payment.status = 'released';
  this.payment.releasedAt = new Date();
  
  return this.addTimelineEvent(
    'order_completed',
    'Order has been completed',
    completedBy
  );
};

// Static methods
OrderSchema.statics.findByUser = function(userId, role = 'buyer') {
  const field = role === 'buyer' ? 'buyerId' : 'sellerId';
  return this.find({ [field]: userId }).sort({ createdAt: -1 });
};

OrderSchema.statics.findActiveOrders = function() {
  return this.find({
    status: { $in: ['payment_confirmed', 'in_progress', 'delivered', 'revision_requested'] }
  });
};

OrderSchema.statics.findOverdueOrders = function() {
  return this.find({
    status: { $in: ['in_progress', 'revision_requested'] },
    expectedDeliveryDate: { $lt: new Date() }
  });
};

OrderSchema.statics.findOrdersForAutoCompletion = function() {
  return this.find({
    status: 'delivered',
    'payment.escrowReleaseDate': { $lte: new Date() },
    'autoComplete.enabled': true
  });
};

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);

