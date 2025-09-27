import User from '../models/User.js';
import Job from '../models/Job.js';
import Company from '../models/Company.js';
import Application from '../models/Application.js';
import asyncHandler from '../middleware/asyncHandler.js';
import AuditLog from '../models/AuditLog.js';

// Audit logger persisted to collection
async function logModerationAction(action, adminId, details = {}) {
  try {
    await AuditLog.create({
      entity: details.jobId ? 'Job' : (details.entity || 'Unknown'),
      entityId: details.jobId || details.entityId,
      action,
      actorId: adminId,
      details
    });
  } catch (_err) {}
}

// @desc    Get pending jobs with pagination and filters
// @route   GET /api/admin/jobs/pending
// @access  Private (Admin)
export const getPendingJobs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const { category, q, from, to } = req.query;

  const filter = { moderationStatus: 'pending' };
  if (category) filter.category = category;
  if (q) filter.title = { $regex: q, $options: 'i' };
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate('employer', 'name email')
      .populate('company', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Job.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: jobs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Approve a job
// @route   PUT /api/admin/jobs/:id/approve
// @access  Private (Admin)
export const approveJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  job.moderationStatus = 'approved';
  // Ensure visible in public listings
  if (job.status === 'draft') job.status = 'active';
  await job.save();

  await logModerationAction('approve_job', req.user.id, { jobId: job._id });

  res.json({ success: true, message: 'Job approved', data: { id: job._id } });
});

// @desc    Reject a job
// @route   PUT /api/admin/jobs/:id/reject
// @access  Private (Admin)
export const rejectJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const job = await Job.findById(id).populate('employer', 'email');
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  job.moderationStatus = 'rejected';
  job.status = 'paused';
  await job.save();

  await logModerationAction('reject_job', req.user.id, { jobId: job._id, reason });

  // Optional: notify employer via email/in-app (placeholder)
  res.json({ success: true, message: 'Job rejected', data: { id: job._id } });
});

// @desc    Bulk moderate jobs (approve/reject)
// @route   PUT /api/admin/jobs/bulk-moderate
// @access  Private (Admin)
export const bulkModerateJobs = asyncHandler(async (req, res) => {
  const { jobIds, action, reason } = req.body;
  if (!Array.isArray(jobIds) || jobIds.length === 0) {
    return res.status(400).json({ success: false, message: 'jobIds array is required' });
  }
  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Invalid action' });
  }

  let update;
  if (action === 'approve') {
    update = { moderationStatus: 'approved', status: 'active' };
  } else {
    update = { moderationStatus: 'rejected', status: 'paused' };
  }

  const result = await Job.updateMany({ _id: { $in: jobIds } }, update);
  await logModerationAction('bulk_moderate_jobs', req.user.id, { action, count: result.modifiedCount || result.nModified || 0 });

  res.json({ success: true, message: `Bulk ${action} completed`, data: { affected: result.modifiedCount || result.nModified || 0 } });
});

// @desc    Get user statistics
// @route   GET /api/admin/stats/users
// @access  Private (Admin)
export const getUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  const recentUsers = await User.find()
    .sort('-createdAt')
    .limit(5)
    .select('name email role createdAt');

  res.json({
    success: true,
    data: {
      total: totalUsers,
      byRole: usersByRole,
      recent: recentUsers
    }
  });
});

// @desc    Get job statistics
// @route   GET /api/admin/stats/jobs
// @access  Private (Admin)
export const getJobStats = asyncHandler(async (req, res) => {
  const totalJobs = await Job.countDocuments();
  const jobsByCategory = await Job.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);

  const jobsByType = await Job.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);

  const recentJobs = await Job.find()
    .sort('-createdAt')
    .limit(5)
    .select('title company category type location createdAt');

  res.json({
    success: true,
    data: {
      total: totalJobs,
      byCategory: jobsByCategory,
      byType: jobsByType,
      recent: recentJobs
    }
  });
});

// @desc    Get company statistics
// @route   GET /api/admin/stats/companies
// @access  Private (Admin)
export const getCompanyStats = asyncHandler(async (req, res) => {
  const totalCompanies = await Company.countDocuments();
  const verifiedCompanies = await Company.countDocuments({ isVerified: true });
  const companiesByIndustry = await Company.aggregate([
    {
      $group: {
        _id: '$industry',
        count: { $sum: 1 }
      }
    }
  ]);

  const recentCompanies = await Company.find()
    .sort('-createdAt')
    .limit(5)
    .select('name industry size location isVerified createdAt');

  res.json({
    success: true,
    data: {
      total: totalCompanies,
      verified: verifiedCompanies,
      unverified: totalCompanies - verifiedCompanies,
      byIndustry: companiesByIndustry,
      recent: recentCompanies
    }
  });
});

// @desc    Get application statistics
// @route   GET /api/admin/stats/applications
// @access  Private (Admin)
export const getApplicationStats = asyncHandler(async (req, res) => {
  const totalApplications = await Application.countDocuments();
  const applicationsByStatus = await Application.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const recentApplications = await Application.find()
    .sort('-createdAt')
    .limit(5)
    .populate('applicantDetails', 'name email')
    .populate('jobDetails', 'title company')
    .select('status createdAt');

  res.json({
    success: true,
    data: {
      total: totalApplications,
      byStatus: applicationsByStatus,
      recent: recentApplications
    }
  });
});

// @desc    Get all users (with pagination and filtering)
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const { role, search } = req.query;

  // Build filter object
  let filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(filter)
    .skip(startIndex)
    .limit(limit)
    .sort('-createdAt');

  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    data: users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete your own account'
    });
  }

  await User.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['jobseeker', 'employer', 'admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role'
    });
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: user
  });
});
