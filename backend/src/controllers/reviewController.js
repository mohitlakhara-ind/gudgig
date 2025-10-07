import { validationResult } from 'express-validator';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Service from '../models/Service.js';
import FreelancerProfile from '../models/FreelancerProfile.js';
import notificationService from '../services/notificationService.js';

// Create a review
export const createReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      targetType,
      targetId,
      orderId,
      rating,
      aspectRatings,
      title,
      comment
    } = req.body;

    // Validate order exists and user is authorized
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Only buyer or seller can review
      const isAuthorized = order.buyerId.toString() === req.user._id.toString() || 
                          order.sellerId.toString() === req.user._id.toString();
      
      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to review this order'
        });
      }

      // Order must be completed to review
      if (order.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Can only review completed orders'
        });
      }
    }

    // Determine reviewee based on target type and user role
    let revieweeId;
    if (targetType === 'service') {
      const service = await Service.findById(targetId);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }
      revieweeId = service.createdBy;
    } else if (targetType === 'freelancer') {
      revieweeId = targetId;
    } else if (targetType === 'order' && orderId) {
      const order = await Order.findById(orderId);
      // Buyer reviews seller, seller reviews buyer
      revieweeId = order.buyerId.toString() === req.user._id.toString() 
        ? order.sellerId 
        : order.buyerId;
    }

    // Check for duplicate review
    const existingReview = await Review.findOne({
      reviewerId: req.user._id,
      targetType,
      targetId,
      orderId: orderId || undefined
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this'
      });
    }

    // Create review
    const review = await Review.create({
      targetType,
      targetId,
      reviewerId: req.user._id,
      revieweeId,
      orderId,
      serviceId: targetType === 'service' ? targetId : undefined,
      rating,
      aspectRatings,
      title,
      comment,
      isVerified: !!orderId // Reviews from completed orders are verified
    });

    await review.populate([
      { path: 'reviewerId', select: 'name email' },
      { path: 'revieweeId', select: 'name email' }
    ]);

    // Update target ratings
    await updateTargetRatings(targetType, targetId);

    // Update freelancer profile stats if reviewing a freelancer
    if (targetType === 'freelancer' || targetType === 'service') {
      await updateFreelancerStats(revieweeId);
    }

    // Send notification to reviewee
    await notificationService.sendNotification(
      revieweeId,
      'review_received',
      {
        reviewerName: req.user.name,
        rating: rating,
        reviewId: review._id,
        title: title || 'New Review',
        comment: comment
      },
      ['email', 'inApp']
    );

    return res.status(201).json({
      success: true,
      data: review
    });
  } catch (err) {
    next(err);
  }
};

// Get reviews for a target (service, freelancer, etc.)
export const getReviews = async (req, res, next) => {
  try {
    const { targetType, targetId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'newest',
      minRating,
      maxRating
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const [reviews, total, stats] = await Promise.all([
      Review.findReviewsForTarget(targetType, targetId, {
        page: pageNumber,
        limit: pageSize,
        sortBy,
        minRating: minRating ? parseInt(minRating) : undefined,
        maxRating: maxRating ? parseInt(maxRating) : undefined
      }),
      Review.countDocuments({
        targetType,
        targetId,
        status: 'approved',
        isPublic: true,
        isDeleted: false
      }),
      Review.getAverageRating(targetType, targetId)
    ]);

    return res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      stats,
      data: reviews
    });
  } catch (err) {
    next(err);
  }
};

// Get single review
export const getReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId)
      .populate('reviewerId', 'name email')
      .populate('revieweeId', 'name email')
      .populate('serviceId', 'title')
      .populate('orderId', 'orderNumber');

    if (!review || review.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    next(err);
  }
};

// Update review (only by reviewer)
export const updateReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { reviewId } = req.params;
    const { rating, aspectRatings, title, comment } = req.body;

    const review = await Review.findById(reviewId);
    if (!review || review.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Only reviewer can update their review
    if (review.reviewerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Update review
    review.rating = rating;
    review.aspectRatings = aspectRatings || review.aspectRatings;
    review.title = title || review.title;
    review.comment = comment;
    
    await review.save();
    await review.populate([
      { path: 'reviewerId', select: 'name email' },
      { path: 'revieweeId', select: 'name email' }
    ]);

    // Update target ratings
    await updateTargetRatings(review.targetType, review.targetId);

    return res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    next(err);
  }
};

// Delete review (soft delete)
export const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review || review.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Only reviewer or admin can delete
    const canDelete = review.reviewerId.toString() === req.user._id.toString() || 
                     req.user.role === 'admin';

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await review.softDelete();

    // Update target ratings
    await updateTargetRatings(review.targetType, review.targetId);

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Add response to review (by reviewee)
export const addReviewResponse = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { reviewId } = req.params;
    const { comment } = req.body;

    const review = await Review.findById(reviewId);
    if (!review || review.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Only reviewee can respond
    if (review.revieweeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this review'
      });
    }

    await review.addResponse(comment);
    await review.populate([
      { path: 'reviewerId', select: 'name email' },
      { path: 'revieweeId', select: 'name email' }
    ]);

    // Notify reviewer about response
    await notificationService.sendNotification(
      review.reviewerId,
      'review_response',
      {
        responderName: req.user.name,
        reviewId: review._id,
        responseComment: comment
      },
      ['email', 'inApp']
    );

    return res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    next(err);
  }
};

// Vote on review helpfulness
export const voteOnReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { voteType } = req.body; // 'up' or 'down'

    if (!['up', 'down'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Vote type must be "up" or "down"'
      });
    }

    const review = await Review.findById(reviewId);
    if (!review || review.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Users cannot vote on their own reviews
    if (review.reviewerId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot vote on your own review'
      });
    }

    await review.addHelpfulVote(req.user._id, voteType);

    return res.status(200).json({
      success: true,
      data: {
        helpfulVotes: review.helpfulVotes,
        helpfulScore: review.helpfulScore
      }
    });
  } catch (err) {
    next(err);
  }
};

// Flag review
export const flagReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { reviewId } = req.params;
    const { reason, description } = req.body;

    const review = await Review.findById(reviewId);
    if (!review || review.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Users cannot flag their own reviews
    if (review.reviewerId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot flag your own review'
      });
    }

    await review.flagReview({
      reason,
      description,
      flaggedBy: req.user._id
    });

    return res.status(200).json({
      success: true,
      message: 'Review flagged successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Get user's reviews (given and received)
export const getUserReviews = async (req, res, next) => {
  try {
    const {
      type = 'received', // 'given' or 'received'
      page = 1,
      limit = 10,
      sortBy = 'newest'
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const field = type === 'given' ? 'reviewerId' : 'revieweeId';
    const filter = {
      [field]: req.user._id,
      status: 'approved',
      isDeleted: false
    };

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
      case 'newest':
      default:
        sort = { createdAt: -1 };
        break;
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort(sort)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .populate('reviewerId', 'name email')
        .populate('revieweeId', 'name email')
        .populate('serviceId', 'title')
        .populate('orderId', 'orderNumber'),
      Review.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      data: reviews
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Moderate review
export const moderateReview = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { reviewId } = req.params;
    const { status, moderationNotes } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.status = status;
    review.moderationNotes = moderationNotes;
    review.moderatedBy = req.user._id;
    review.moderatedAt = new Date();

    await review.save();

    // Update target ratings if status changed
    if (status === 'approved' || status === 'rejected') {
      await updateTargetRatings(review.targetType, review.targetId);
    }

    return res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to update target ratings
const updateTargetRatings = async (targetType, targetId) => {
  try {
    const stats = await Review.getAverageRating(targetType, targetId);
    
    if (targetType === 'service') {
      await Service.findByIdAndUpdate(targetId, {
        'rating.average': stats.averageRating,
        'rating.count': stats.totalReviews
      });
    } else if (targetType === 'freelancer') {
      const freelancerStats = await Review.getFreelancerStats(targetId);
      await FreelancerProfile.findOneAndUpdate(
        { userId: targetId },
        {
          'stats.averageRating': freelancerStats.averageRating,
          'stats.totalReviews': freelancerStats.totalReviews
        }
      );
    }
  } catch (error) {
    console.error('Error updating target ratings:', error);
  }
};

// Helper function to update freelancer stats
const updateFreelancerStats = async (freelancerId) => {
  try {
    const stats = await Review.getFreelancerStats(freelancerId);
    await FreelancerProfile.findOneAndUpdate(
      { userId: freelancerId },
      {
        'stats.averageRating': stats.averageRating,
        'stats.totalReviews': stats.totalReviews
      }
    );
  } catch (error) {
    console.error('Error updating freelancer stats:', error);
  }
};
