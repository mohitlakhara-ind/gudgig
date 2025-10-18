import mongoose from 'mongoose';
import Job from '../models/Job.js';
import Bid from '../models/Bid.js';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import FreelancerProfile from '../models/FreelancerProfile.js';

// @desc    Get comprehensive dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
export const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Get user role to determine analytics type
    const user = await User.findById(userId).select('role');
    const isFreelancer = user?.role === 'freelancer' || user?.role === 'gigseeker';

    if (isFreelancer) {
      // Freelancer/GigSeeker Analytics
      const [
        // Basic stats
        totalBids,
        successfulBids,
        pendingBids,
        failedBids,
        
        // Financial stats
        totalSpent,
        monthlySpent,
        averageBidFee,
        
        // Time-based stats
        bidsThisMonth,
        bidsLastMonth,
        bidsThisYear,
        
        // Category breakdown
        bidsByCategory,
        jobsByCategory,
        
        // Recent activity
        recentBids,
        recentJobs,
        
        // Profile stats
        profileCompleteness,
        profileViews,
        
        // Performance metrics
        successRate,
        responseTime,
        
        // Trends
        monthlyTrends,
        categoryPerformance
      ] = await Promise.all([
        // Basic stats
        Bid.countDocuments({ userId }),
        Bid.countDocuments({ userId, paymentStatus: 'succeeded' }),
        Bid.countDocuments({ userId, paymentStatus: 'pending' }),
        Bid.countDocuments({ userId, paymentStatus: 'failed' }),
        
        // Financial stats
        Bid.aggregate([
          { $match: { userId, paymentStatus: 'succeeded' } },
          { $group: { _id: null, total: { $sum: '$bidFeePaid' } } }
        ]),
        Bid.aggregate([
          { $match: { userId, paymentStatus: 'succeeded', createdAt: { $gte: monthStart } } },
          { $group: { _id: null, total: { $sum: '$bidFeePaid' } } }
        ]),
        Bid.aggregate([
          { $match: { userId } },
          { $group: { _id: null, avg: { $avg: '$bidFeePaid' } } }
        ]),
        
        // Time-based stats
        Bid.countDocuments({ userId, createdAt: { $gte: monthStart } }),
        Bid.countDocuments({ userId, createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
        Bid.countDocuments({ userId, createdAt: { $gte: yearStart } }),
        
        // Category breakdown
        Bid.aggregate([
          { $match: { userId } },
          { $lookup: { from: 'jobs', localField: 'jobId', foreignField: '_id', as: 'job' } },
          { $unwind: '$job' },
          { $group: { _id: '$job.category', count: { $sum: 1 }, totalSpent: { $sum: '$bidFeePaid' } } },
          { $sort: { count: -1 } }
        ]),
        Job.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        
        // Recent activity
        Bid.find({ userId })
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('jobId', 'title category createdAt')
          .select('jobId bidFeePaid paymentStatus createdAt'),
        Job.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('title category createdAt company'),
        
        // Profile stats
        getProfileCompleteness(userId),
        getProfileViews(userId),
        
        // Performance metrics
        getSuccessRate(userId),
        getAverageResponseTime(userId),
        
        // Trends
        getMonthlyTrends(userId, 12),
        getCategoryPerformance(userId)
      ]);

      const analytics = {
        overview: {
          totalBids,
          successfulBids,
          pendingBids,
          failedBids,
          successRate: successRate || 0,
          profileCompleteness: profileCompleteness || 0,
          profileViews: profileViews || 0
        },
        financial: {
          totalSpent: totalSpent[0]?.total || 0,
          monthlySpent: monthlySpent[0]?.total || 0,
          averageBidFee: Math.round((averageBidFee[0]?.avg || 0) * 100) / 100,
          pendingAmount: pendingBids * (averageBidFee[0]?.avg || 0)
        },
        trends: {
          bidsThisMonth,
          bidsLastMonth,
          bidsThisYear,
          monthlyGrowth: bidsLastMonth > 0 ? 
            Math.round(((bidsThisMonth - bidsLastMonth) / bidsLastMonth) * 100) : 0,
          monthlyTrends: monthlyTrends || []
        },
        categories: {
          myBidsByCategory: bidsByCategory || [],
          availableJobsByCategory: jobsByCategory || [],
          categoryPerformance: categoryPerformance || []
        },
        activity: {
          recentBids: recentBids.map(bid => ({
            _id: bid._id,
            jobTitle: bid.jobId?.title || 'Unknown Job',
            category: bid.jobId?.category || 'Unknown',
            amount: bid.bidFeePaid,
            status: bid.paymentStatus,
            createdAt: bid.createdAt
          })),
          recentJobs: recentJobs.map(job => ({
            _id: job._id,
            title: job.title,
            category: job.category,
            company: job.company,
            createdAt: job.createdAt
          }))
        },
        performance: {
          successRate: successRate || 0,
          averageResponseTime: responseTime || 0,
          profileCompleteness: profileCompleteness || 0
        }
      };

      res.status(200).json({
        success: true,
        data: analytics
      });
    } else {
      // Employer/Client Analytics
      const [
        totalJobs,
        activeJobs,
        completedJobs,
        totalApplications,
        applicationsThisMonth,
        averageApplicationsPerJob,
        jobsByCategory,
        applicationsByStatus,
        recentJobs,
        recentApplications,
        jobPerformance
      ] = await Promise.all([
        Job.countDocuments({ createdBy: userId }),
        Job.countDocuments({ createdBy: userId, status: 'active' }),
        Job.countDocuments({ createdBy: userId, status: 'completed' }),
        Bid.countDocuments({ jobId: { $in: await Job.find({ createdBy: userId }).select('_id') } }),
        Bid.countDocuments({ 
          jobId: { $in: await Job.find({ createdBy: userId }).select('_id') },
          createdAt: { $gte: monthStart }
        }),
        Job.aggregate([
          { $match: { createdBy: userId } },
          { $lookup: { from: 'bids', localField: '_id', foreignField: 'jobId', as: 'bids' } },
          { $project: { title: 1, bidCount: { $size: '$bids' } } },
          { $group: { _id: null, avg: { $avg: '$bidCount' } } }
        ]),
        Job.aggregate([
          { $match: { createdBy: userId } },
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ]),
        Bid.aggregate([
          { $match: { jobId: { $in: await Job.find({ createdBy: userId }).select('_id') } } },
          { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
        ]),
        Job.find({ createdBy: userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('title category status createdAt'),
        Bid.find({ jobId: { $in: await Job.find({ createdBy: userId }).select('_id') } })
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('userId', 'name email')
          .populate('jobId', 'title category')
          .select('userId jobId bidFeePaid paymentStatus createdAt'),
        getJobPerformance(userId)
      ]);

      const analytics = {
        overview: {
          totalJobs,
          activeJobs,
          completedJobs,
          totalApplications,
          applicationsThisMonth,
          averageApplicationsPerJob: Math.round((averageApplicationsPerJob[0]?.avg || 0) * 100) / 100
        },
        categories: {
          jobsByCategory: jobsByCategory || [],
          applicationsByStatus: applicationsByStatus || []
        },
        activity: {
          recentJobs: recentJobs || [],
          recentApplications: recentApplications.map(app => ({
            _id: app._id,
            jobTitle: app.jobId?.title || 'Unknown Job',
            freelancerName: app.userId?.name || 'Anonymous',
            amount: app.bidFeePaid,
            status: app.paymentStatus,
            createdAt: app.createdAt
          }))
        },
        performance: {
          jobPerformance: jobPerformance || []
        }
      };

      res.status(200).json({
        success: true,
        data: analytics
      });
    }
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics'
    });
  }
};

// @desc    Get earnings analytics
// @route    GET /api/analytics/earnings
// @access  Private
export const getEarningsAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '12' } = req.query;
    const months = parseInt(period);
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);

    // Get earnings data from orders (for freelancers) or bid fees (for gig seekers)
    const user = await User.findById(userId).select('role');
    const isFreelancer = user?.role === 'freelancer';

    if (isFreelancer) {
      // Freelancer earnings from orders
      const orders = await Order.find({ 
        sellerId: userId,
        status: 'completed',
        createdAt: { $gte: startDate }
      }).sort({ createdAt: 1 });

      const monthlyEarnings = {};
      const categoryEarnings = {};
      
      orders.forEach(order => {
        const month = order.createdAt.toISOString().substring(0, 7);
        monthlyEarnings[month] = (monthlyEarnings[month] || 0) + order.price;
        
        const category = order.serviceId?.category || 'Other';
        categoryEarnings[category] = (categoryEarnings[category] || 0) + order.price;
      });

      const totalEarnings = orders.reduce((sum, order) => sum + order.price, 0);
      const averageOrderValue = orders.length > 0 ? totalEarnings / orders.length : 0;

      res.status(200).json({
        success: true,
        data: {
          totalEarnings,
          averageOrderValue: Math.round(averageOrderValue * 100) / 100,
          monthlyEarnings: Object.entries(monthlyEarnings).map(([month, amount]) => ({
            month,
            amount
          })),
          categoryEarnings: Object.entries(categoryEarnings).map(([category, amount]) => ({
            category,
            amount
          })),
          ordersCount: orders.length
        }
      });
    } else {
      // Gig seeker spending analytics
      const bids = await Bid.find({
        userId,
        paymentStatus: 'succeeded',
        createdAt: { $gte: startDate }
      }).sort({ createdAt: 1 });

      const monthlySpending = {};
      const categorySpending = {};
      
      // Get all job categories first
      const jobIds = bids.map(bid => bid.jobId);
      const jobs = await Job.find({ _id: { $in: jobIds } }).select('category');
      const jobCategoryMap = new Map(jobs.map(job => [String(job._id), job.category]));
      
      bids.forEach(bid => {
        const month = bid.createdAt.toISOString().substring(0, 7);
        monthlySpending[month] = (monthlySpending[month] || 0) + bid.bidFeePaid;
        
        // Get job category from map
        const category = jobCategoryMap.get(String(bid.jobId)) || 'Other';
        categorySpending[category] = (categorySpending[category] || 0) + bid.bidFeePaid;
      });

      const totalSpent = bids.reduce((sum, bid) => sum + bid.bidFeePaid, 0);
      const averageBidFee = bids.length > 0 ? totalSpent / bids.length : 0;

      res.status(200).json({
        success: true,
        data: {
          totalSpent,
          averageBidFee: Math.round(averageBidFee * 100) / 100,
          monthlySpending: Object.entries(monthlySpending).map(([month, amount]) => ({
            month,
            amount
          })),
          categorySpending: Object.entries(categorySpending).map(([category, amount]) => ({
            category,
            amount
          })),
          bidsCount: bids.length
        }
      });
    }
  } catch (error) {
    console.error('Error fetching earnings analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching earnings analytics'
    });
  }
};

// @desc    Get performance metrics
// @route    GET /api/analytics/performance
// @access  Private
export const getPerformanceAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('role');
    const isFreelancer = user?.role === 'freelancer';

    if (isFreelancer) {
      // Freelancer performance metrics
      const [
        orders,
        reviews,
        services
      ] = await Promise.all([
        Order.find({ sellerId: userId }),
        Review.find({ revieweeId: userId }),
        Service.find({ createdBy: userId })
      ]);

      const completedOrders = orders.filter(o => o.status === 'completed');
      const averageRating = reviews.length > 0 ? 
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
      
      const completionRate = orders.length > 0 ? 
        (completedOrders.length / orders.length) * 100 : 0;

      const responseTime = await getAverageResponseTime(userId);
      const profileCompleteness = await getProfileCompleteness(userId);

      res.status(200).json({
        success: true,
        data: {
          completionRate: Math.round(completionRate * 100) / 100,
          averageRating: Math.round(averageRating * 100) / 100,
          totalReviews: reviews.length,
          responseTime,
          profileCompleteness,
          activeServices: services.filter(s => s.isActive).length,
          totalServices: services.length
        }
      });
    } else {
      // Client performance metrics
      const jobs = await Job.find({ createdBy: userId });
      const totalApplications = await Bid.countDocuments({
        jobId: { $in: jobs.map(j => j._id) }
      });

      const averageApplicationsPerJob = jobs.length > 0 ? 
        totalApplications / jobs.length : 0;

      res.status(200).json({
        success: true,
        data: {
          totalJobs: jobs.length,
          totalApplications,
          averageApplicationsPerJob: Math.round(averageApplicationsPerJob * 100) / 100,
          activeJobs: jobs.filter(j => j.status === 'active').length,
          completedJobs: jobs.filter(j => j.status === 'completed').length
        }
      });
    }
  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching performance analytics'
    });
  }
};

// Helper functions
async function getProfileCompleteness(userId) {
  try {
    const profile = await FreelancerProfile.findOne({ userId });
    if (!profile) return 30;

    let completeness = 30; // Base for having an account
    if (profile.title) completeness += 10;
    if (profile.bio) completeness += 10;
    if (profile.skills?.length > 0) completeness += 15;
    if (profile.portfolio?.length > 0) completeness += 15;
    if (profile.experience?.length > 0) completeness += 10;
    if (profile.hourlyRate) completeness += 10;

    return Math.min(completeness, 100);
  } catch (error) {
    return 30;
  }
}

async function getProfileViews(userId) {
  // Placeholder - would need to implement view tracking
  return 0;
}

async function getSuccessRate(userId) {
  try {
    const [totalBids, successfulBids] = await Promise.all([
      Bid.countDocuments({ userId }),
      Bid.countDocuments({ userId, paymentStatus: 'succeeded' })
    ]);

    return totalBids > 0 ? (successfulBids / totalBids) * 100 : 0;
  } catch (error) {
    return 0;
  }
}

async function getAverageResponseTime(userId) {
  // Placeholder - would need to implement response time tracking
  return 0;
}

async function getMonthlyTrends(userId, months) {
  try {
    const now = new Date();
    const trends = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const bids = await Bid.countDocuments({
        userId,
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });

      trends.push({
        month: monthStart.toISOString().substring(0, 7),
        count: bids
      });
    }

    return trends;
  } catch (error) {
    return [];
  }
}

async function getCategoryPerformance(userId) {
  try {
    const categoryStats = await Bid.aggregate([
      { $match: { userId } },
      { $lookup: { from: 'jobs', localField: 'jobId', foreignField: '_id', as: 'job' } },
      { $unwind: '$job' },
      { $group: {
        _id: '$job.category',
        totalBids: { $sum: 1 },
        successfulBids: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'succeeded'] }, 1, 0] } },
        totalSpent: { $sum: '$bidFeePaid' }
      }},
      { $addFields: { successRate: { $multiply: [{ $divide: ['$successfulBids', '$totalBids'] }, 100] } } },
      { $sort: { totalBids: -1 } }
    ]);

    return categoryStats;
  } catch (error) {
    return [];
  }
}

async function getJobPerformance(userId) {
  try {
    const jobs = await Job.find({ createdBy: userId });
    const jobIds = jobs.map(j => j._id);

    const jobStats = await Bid.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: {
        _id: '$jobId',
        totalBids: { $sum: 1 },
        successfulBids: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'succeeded'] }, 1, 0] } },
        totalRevenue: { $sum: '$bidFeePaid' }
      }},
      { $lookup: { from: 'jobs', localField: '_id', foreignField: '_id', as: 'job' } },
      { $unwind: '$job' },
      { $project: {
        jobTitle: '$job.title',
        jobCategory: '$job.category',
        totalBids: 1,
        successfulBids: 1,
        totalRevenue: 1,
        successRate: { $multiply: [{ $divide: ['$successfulBids', '$totalBids'] }, 100] }
      }},
      { $sort: { totalBids: -1 } }
    ]);

    return jobStats;
  } catch (error) {
    return [];
  }
}
