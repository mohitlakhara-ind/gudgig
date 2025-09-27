import asyncHandler from '../middleware/asyncHandler.js';
import AnalyticsService from '../services/analyticsService.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import User from '../models/User.js';

// @desc    Get employer statistics
// @route   GET /api/stats/employer
// @access  Private (Employer only)
const getEmployerStats = asyncHandler(async (req, res) => {
  const employerId = req.user._id;
  const { timeframe = '30d' } = req.query;

  // Calculate date range based on timeframe
  const now = new Date();
  let startDate;
  
  switch (timeframe) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Get employer's jobs
  const jobs = await Job.find({ employer: employerId });
  const jobIds = jobs.map(job => job._id);

  // Active jobs count
  const activeJobs = await Job.countDocuments({
    employer: employerId,
    status: 'active'
  });

  // Total applications
  const totalApplications = await Application.countDocuments({
    job: { $in: jobIds }
  });

  // Applications in timeframe
  const recentApplications = await Application.countDocuments({
    job: { $in: jobIds },
    createdAt: { $gte: startDate }
  });

  // Interview count
  const interviews = await Application.countDocuments({
    job: { $in: jobIds },
    status: 'interview'
  });

  // Hires count
  const hires = await Application.countDocuments({
    job: { $in: jobIds },
    status: 'hired'
  });

  // Job views (using analytics service)
  const jobViews = await AnalyticsService.getJobViews(jobIds, startDate, now);

  // Response rate calculation
  const respondedApplications = await Application.countDocuments({
    job: { $in: jobIds },
    status: { $in: ['interview', 'hired', 'rejected'] }
  });
  const responseRate = totalApplications > 0 ? (respondedApplications / totalApplications * 100).toFixed(1) : 0;

  // Application status breakdown
  const statusBreakdown = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Top performing jobs
  const topJobs = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    { $group: { _id: '$job', applicationCount: { $sum: 1 } } },
    { $sort: { applicationCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'jobs',
        localField: '_id',
        foreignField: '_id',
        as: 'jobDetails'
      }
    },
    { $unwind: '$jobDetails' },
    {
      $project: {
        title: '$jobDetails.title',
        applicationCount: 1
      }
    }
  ]);

  const stats = {
    activeJobs,
    totalApplications,
    recentApplications,
    interviews,
    hires,
    interviewsScheduled: interviews, // Alias for frontend compatibility
    hiresThisMonth: hires, // Alias for frontend compatibility
    viewsThisMonth: jobViews.totalViews || 0, // Alias for frontend compatibility
    jobViews: jobViews.totalViews || 0,
    responseRate: parseFloat(responseRate),
    statusBreakdown: statusBreakdown.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    topJobs,
    timeframe
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Get job seeker statistics
// @route   GET /api/stats/jobseeker
// @access  Private (Job Seeker only)
const getJobSeekerStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { timeframe = '30d' } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate;
  
  switch (timeframe) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Total applications
  const totalApplications = await Application.countDocuments({
    applicant: userId
  });

  // Recent applications
  const recentApplications = await Application.countDocuments({
    applicant: userId,
    createdAt: { $gte: startDate }
  });

  // Interview count
  const interviews = await Application.countDocuments({
    applicant: userId,
    status: 'interview'
  });

  // Offers count
  const offers = await Application.countDocuments({
    applicant: userId,
    status: { $in: ['hired', 'offer'] }
  });

  // Application status breakdown
  const statusBreakdown = await Application.aggregate([
    { $match: { applicant: userId } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Profile completeness calculation
  const user = await User.findById(userId);
  let profileCompleteness = 0;
  const requiredFields = ['name', 'email', 'phone', 'location', 'skills', 'experience'];
  const completedFields = requiredFields.filter(field => {
    if (field === 'skills') return user.skills && user.skills.length > 0;
    if (field === 'experience') return user.experience && user.experience.length > 0;
    return user[field] && user[field].toString().trim() !== '';
  });
  profileCompleteness = Math.round((completedFields.length / requiredFields.length) * 100);

  // Recent activity
  const recentActivity = await Application.find({
    applicant: userId
  })
  .sort({ updatedAt: -1 })
  .limit(5)
  .populate('job', 'title company')
  .select('status updatedAt job');

  const stats = {
    totalApplications,
    applications: totalApplications, // Alias for frontend compatibility
    recentApplications,
    interviews,
    offers,
    profileCompleteness,
    statusBreakdown: statusBreakdown.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    recentActivity,
    timeframe
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Get admin statistics
// @route   GET /api/stats/admin
// @access  Private (Admin only)
const getAdminStats = asyncHandler(async (req, res) => {
  const { timeframe = '30d' } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate;
  
  switch (timeframe) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // User statistics
  const totalUsers = await User.countDocuments();
  const newUsers = await User.countDocuments({
    createdAt: { $gte: startDate }
  });
  const activeUsers = await User.countDocuments({
    lastLogin: { $gte: startDate }
  });

  // User breakdown by role
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);

  // Job statistics
  const totalJobs = await Job.countDocuments();
  const activeJobs = await Job.countDocuments({ status: 'active' });
  const newJobs = await Job.countDocuments({
    createdAt: { $gte: startDate }
  });

  // Application statistics
  const totalApplications = await Application.countDocuments();
  const newApplications = await Application.countDocuments({
    createdAt: { $gte: startDate }
  });

  // Application status breakdown
  const applicationsByStatus = await Application.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Growth metrics
  const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
  const previousNewUsers = await User.countDocuments({
    createdAt: { $gte: previousPeriodStart, $lt: startDate }
  });
  const userGrowthRate = previousNewUsers > 0 ? 
    ((newUsers - previousNewUsers) / previousNewUsers * 100).toFixed(1) : 0;

  const stats = {
    users: {
      total: totalUsers,
      new: newUsers,
      active: activeUsers,
      growthRate: parseFloat(userGrowthRate),
      byRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    },
    jobs: {
      total: totalJobs,
      active: activeJobs,
      new: newJobs
    },
    applications: {
      total: totalApplications,
      new: newApplications,
      byStatus: applicationsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    },
    timeframe
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});

export {
  getEmployerStats,
  getJobSeekerStats,
  getAdminStats
};