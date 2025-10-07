import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import FreelancerProfile from '../models/FreelancerProfile.js';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import cloudinaryService from '../services/cloudinaryService.js';

// @desc    Get freelancer profile by user ID
// @route   GET /api/freelancer-profiles/:userId
// @access  Public
export const getFreelancerProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const objectUserId = new mongoose.Types.ObjectId(String(userId));
    const profile = await FreelancerProfile.findOne({ userId: objectUserId })
      .populate('userId', 'name email avatar location')
      .exec();
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching freelancer profile:', error?.message);
    if (error?.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// @desc    Get current user's freelancer profile
// @route   GET /api/freelancer-profiles/my
// @access  Private (Freelancer)
export const getMyFreelancerProfile = async (req, res) => {
  try {
    const objectUserId = new mongoose.Types.ObjectId(String(req.user._id));
    const profile = await FreelancerProfile.findOne({ userId: objectUserId })
      .populate('userId', 'name email avatar location')
      .exec();
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching my freelancer profile:', error?.message);
    if (error?.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// @desc    Create freelancer profile
// @route   POST /api/freelancer-profiles
// @access  Private (Freelancer)
export const createFreelancerProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    // Check if profile already exists
    const existingProfile = await FreelancerProfile.findOne({ userId: req.user._id });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Freelancer profile already exists'
      });
    }

    const profileData = {
      userId: req.user._id,
      ...req.body
    };

    const profile = await FreelancerProfile.create(profileData);
    await profile.populate('userId', 'name email avatar location');

    res.status(201).json({
      success: true,
      data: profile,
      message: 'Freelancer profile created successfully'
    });
  } catch (error) {
    console.error('Error creating freelancer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating profile'
    });
  }
};

// @desc    Update freelancer profile
// @route   PUT /api/freelancer-profiles/my
// @access  Private (Freelancer)
export const updateFreelancerProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const profile = await FreelancerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('userId', 'name email avatar location');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
      message: 'Freelancer profile updated successfully'
    });

    // Fire profile completeness nudge if needed
    try {
      const percent = Math.min(100, Math.max(0, (
        (profile.title ? 10 : 0) +
        (profile.bio ? 10 : 0) +
        (Array.isArray(profile.skills) && profile.skills.length ? 15 : 0) +
        (Array.isArray(profile.portfolio) && profile.portfolio.length ? 15 : 0) +
        (Array.isArray(profile.experience) && profile.experience.length ? 10 : 0) +
        (profile.hourlyRate ? 10 : 0) + 30
      )));
      if (percent < 60) {
        const notificationService = (await import('../services/notificationService.js')).default;
        await notificationService.createNotification(
          req.user._id,
          'profile_nudge',
          'Improve your profile',
          `Your profile is ${percent}% complete. Add more details to get better results.`,
          { progress: percent }
        );
      }
    } catch (e) {
      // non-blocking
    }
  } catch (error) {
    console.error('Error updating freelancer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// @desc    Delete freelancer profile
// @route   DELETE /api/freelancer-profiles/my
// @access  Private (Freelancer)
export const deleteFreelancerProfile = async (req, res) => {
  try {
    const profile = await FreelancerProfile.findOneAndDelete({ userId: req.user._id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Freelancer profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting freelancer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting profile'
    });
  }
};

// @desc    Upload portfolio images
// @route   POST /api/freelancer-profiles/my/portfolio/:portfolioId/images
// @access  Private (Freelancer)
export const uploadPortfolioImages = async (req, res) => {
  try {
    const { portfolioId } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const profile = await FreelancerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer profile not found'
      });
    }

    const portfolio = profile.portfolio.id(portfolioId);
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    const imageUploads = [];
    for (const file of req.files) {
      const result = await cloudinaryService.uploadImage(file.buffer, {
        folder: 'portfolio',
        quality: 'auto',
        fetch_format: 'auto'
      });
      // Normalize to schema shape { url, publicId }
      imageUploads.push({ url: result.secure_url, publicId: result.public_id });
    }

    portfolio.images.push(...imageUploads);
    await profile.save();

    res.status(200).json({
      success: true,
      data: portfolio,
      message: 'Portfolio images uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading portfolio images:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading images'
    });
  }
};

// @desc    Get freelancer stats and analytics
// @route   GET /api/freelancer-profiles/my/stats
// @access  Private (Freelancer)
export const getFreelancerStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get services stats
    const services = await Service.find({ createdBy: userId });
    const activeServices = services.filter(s => s.isActive).length;
    
    // Get orders stats
    const orders = await Order.find({ sellerId: userId });
    const totalOrders = orders.length;
    const activeOrders = orders.filter(o => ['active', 'in_progress', 'delivered'].includes(o.status)).length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    
    // Calculate monthly orders
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyOrders = orders.filter(o => new Date(o.createdAt) >= monthStart).length;
    
    // Calculate earnings
    const completedOrdersWithEarnings = orders.filter(o => o.status === 'completed');
    const totalEarnings = completedOrdersWithEarnings.reduce((sum, order) => sum + order.price, 0);
    const monthlyEarnings = completedOrdersWithEarnings
      .filter(o => new Date(o.createdAt) >= monthStart)
      .reduce((sum, order) => sum + order.price, 0);
    
    const pendingOrders = orders.filter(o => ['delivered', 'in_progress'].includes(o.status));
    const pendingEarnings = pendingOrders.reduce((sum, order) => sum + order.price, 0);
    
    // Get reviews stats
    const reviews = await Review.find({ revieweeId: userId });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;
    
    // Get recent data
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(order => ({
        _id: order._id,
        title: order.serviceId?.title || 'Service Order',
        status: order.status,
        price: order.price,
        deadline: order.deadline,
        progress: order.status === 'completed' ? 100 : 
                 order.status === 'delivered' ? 90 :
                 order.status === 'in_progress' ? 50 : 10
      }));
    
    const recentReviews = reviews
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .map(review => ({
        _id: review._id,
        reviewerName: review.reviewerId?.name || 'Anonymous',
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt
      }));
    
    // Generate recent activity
    const recentActivity = [
      ...recentOrders.slice(0, 2).map(order => ({
        _id: `order-${order._id}`,
        type: order.status === 'completed' ? 'order_completed' : 'order_received',
        title: `Order ${order.status === 'completed' ? 'completed' : 'received'}`,
        description: `${order.title} - $${order.price}`,
        createdAt: new Date()
      })),
      ...recentReviews.slice(0, 2).map(review => ({
        _id: `review-${review._id}`,
        type: 'review_received',
        title: 'New review received',
        description: `${review.rating} stars from ${review.reviewerName}`,
        createdAt: review.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Calculate review distribution
    const reviewDistribution = {
      fiveStars: 0,
      fourStars: 0,
      threeStars: 0,
      twoStars: 0,
      oneStar: 0
    };
    
    if (totalReviews > 0) {
      const ratingCounts = reviews.reduce((acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      }, {});
      
      reviewDistribution.fiveStars = Math.round((ratingCounts[5] || 0) / totalReviews * 100);
      reviewDistribution.fourStars = Math.round((ratingCounts[4] || 0) / totalReviews * 100);
      reviewDistribution.threeStars = Math.round((ratingCounts[3] || 0) / totalReviews * 100);
      reviewDistribution.twoStars = Math.round((ratingCounts[2] || 0) / totalReviews * 100);
      reviewDistribution.oneStar = Math.round((ratingCounts[1] || 0) / totalReviews * 100);
    }

    // Calculate earnings growth percentage
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthEarnings = completedOrdersWithEarnings
      .filter(o => new Date(o.createdAt) >= lastMonth && new Date(o.createdAt) <= lastMonthEnd)
      .reduce((sum, order) => sum + order.price, 0);
    
    const earningsGrowthPercentage = lastMonthEarnings > 0 
      ? Math.round(((monthlyEarnings - lastMonthEarnings) / lastMonthEarnings) * 100)
      : monthlyEarnings > 0 ? 100 : 0;

    // Calculate profile completeness
    const profile = await FreelancerProfile.findOne({ userId });
    let profileCompleteness = 30; // Base for having an account
    
    if (profile) {
      if (profile.title) profileCompleteness += 10;
      if (profile.bio) profileCompleteness += 10;
      if (profile.skills?.length > 0) profileCompleteness += 15;
      if (profile.portfolio?.length > 0) profileCompleteness += 15;
      if (profile.experience?.length > 0) profileCompleteness += 10;
      if (profile.hourlyRate) profileCompleteness += 10;
    }

    const stats = {
      // Basic stats for compatibility
      applications: 0,
      interviews: 0, 
      offers: totalOrders,
      profileCompleteness: Math.min(profileCompleteness, 100),
      
      // Enhanced freelancer stats
      activeServices,
      totalServices: services.length,
      totalOrders,
      monthlyOrders,
      activeOrders,
      completedOrders,
      totalEarnings,
      monthlyEarnings,
      pendingEarnings,
      availableBalance: totalEarnings - pendingEarnings, // Simplified calculation
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      reviewDistribution,
      earningsGrowthPercentage,
      recentOrders,
      recentReviews,
      recentActivity
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching freelancer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stats'
    });
  }
};
