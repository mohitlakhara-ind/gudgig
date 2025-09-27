import Application from '../models/Application.js';
import asyncHandler from '../middleware/asyncHandler.js';
import NotificationService from '../services/notificationService.js';
import Job from '../models/Job.js';
import { validationResult } from 'express-validator';

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Jobseeker)
export const applyForJob = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
  }
  const { job: jobId, coverLetter, additionalInfo } = req.body;

  // Check if user already applied for this job
  const existingApplication = await Application.findOne({
    job: jobId,
    applicant: req.user.id
  });

  if (existingApplication) {
    return res.status(400).json({
      success: false,
      message: 'You have already applied for this job'
    });
  }

  // Get job details to get the employer
  const job = await Job.findById(jobId);
  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }

  const application = await Application.create({
    job: jobId,
    applicant: req.user.id,
    employer: job.employer,
    coverLetter,
    additionalInfo
  });

  // Send notification to employer
  await NotificationService.createNotification(
    job.employer,
    'job_new_application',
    'New Job Application',
    `You have received a new application for ${job.title}`,
    {
      jobId: job._id,
      applicationId: application._id,
      applicantName: req.user.name
    }
  );

  // Usage tracking moved to success-based middleware to avoid double increments

  res.status(201).json({
    success: true,
    data: application
  });
});

// @desc    Get user's applications
// @route   GET /api/applications
// @access  Private
export const getMyApplications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (page - 1) * limit;

  const query = { applicant: req.user.id };
  if (status) {
    query.status = status;
  }

  const applications = await Application.find(query)
    .populate('job', 'title company location type salary')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Application.countDocuments(query);

  res.json({
    success: true,
    data: applications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get employer's applications across all their jobs
// @route   GET /api/applications/employer
// @access  Private (Employer/Admin)
export const getEmployerApplications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  const skip = (page - 1) * limit;

  const employerId = req.user.role === 'admin' ? (req.query.employer || undefined) : req.user.id;

  const query = { employer: employerId };
  if (status) query.status = status;

  // Optional search by applicant name or job title
  if (search) {
    query.$or = [
      { coverLetter: { $regex: search, $options: 'i' } }
    ];
  }

  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const applications = await Application.find(query)
    .populate('job', 'title company location type salary')
    .populate('applicant', 'name email location skills')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Application.countDocuments(query);

  res.json({
    success: true,
    data: applications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get applications for a specific job
// @route   GET /api/applications/:jobId
// @access  Private (Employer/Admin)
export const getJobApplications = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const applications = await Application.find({ job: jobId })
    .populate('applicantDetails', 'name email phone location')
    .sort('-createdAt');

  res.json({
    success: true,
    count: applications.length,
    data: applications
  });
});

// @desc    Update application status
// @route   PUT /api/applications/:id
// @access  Private (Employer/Admin)
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes, rating, interviewDate, interviewFeedback } = req.body;

  let application = await Application.findById(id).populate('job', 'title').populate('applicant', 'name email');

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  const oldStatus = application.status;

  // Update fields
  application.status = status || application.status;
  application.reviewedAt = new Date();
  application.reviewedBy = req.user.id;

  if (notes) {
    application.notes.push({
      content: notes,
      addedBy: req.user.id,
      isPrivate: true
    });
  }

  if (rating) application.rating = rating;
  if (interviewDate) application.interviewDate = interviewDate;
  if (interviewFeedback) application.interviewFeedback = interviewFeedback;

  await application.save();

  // Send notification to applicant if status changed
  if (status && status !== oldStatus) {
    const statusMessages = {
      'reviewed': 'Your application has been reviewed',
      'interview': 'You have been selected for an interview',
      'hired': 'Congratulations! You have been hired',
      'rejected': 'Your application was not selected this time'
    };

    await NotificationService.createNotification(
      application.applicant._id,
      'application_status',
      'Application Status Update',
      statusMessages[status] || `Your application status has been updated to ${status}`,
      {
        jobId: application.job._id,
        applicationId: application._id,
        jobTitle: application.job.title,
        newStatus: status
      }
    );
  }

  res.json({
    success: true,
    data: application
  });
});

// @desc    Withdraw application
// @route   PUT /api/applications/:id/withdraw
// @access  Private
export const withdrawApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const application = await Application.findById(id).populate('job', 'title employer');

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  // Check if user owns the application
  if (application.applicant.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to withdraw this application'
    });
  }

  // Check if application can be withdrawn
  if (['hired', 'rejected'].includes(application.status)) {
    return res.status(400).json({
      success: false,
      message: 'Cannot withdraw application with current status'
    });
  }

  application.status = 'withdrawn';
  application.withdrawnAt = new Date();
  if (reason) {
    application.notes.push({
      content: `Withdrawal reason: ${reason}`,
      addedBy: req.user.id,
      isPrivate: false
    });
  }
  await application.save();

  // Notify employer about withdrawal
  await NotificationService.createNotification(
    application.job.employer,
    'application_status',
    'Application Withdrawn',
    `An applicant has withdrawn their application for ${application.job.title}`,
    {
      jobId: application.job._id,
      applicationId: application._id,
      jobTitle: application.job.title
    }
  );

  res.json({
    success: true,
    message: 'Application withdrawn successfully'
  });
});

// @desc    Get application statistics
// @route   GET /api/applications/stats/overview
// @access  Private (Admin)
export const getApplicationStats = asyncHandler(async (req, res) => {
  const stats = await Application.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalApplications = await Application.countDocuments();

  res.json({
    success: true,
    data: {
      total: totalApplications,
      byStatus: stats
    }
  });
});

// @desc    Get employer-specific application stats
// @route   GET /api/applications/stats/employer
// @access  Private (Employer/Admin)
export const getEmployerApplicationStats = asyncHandler(async (req, res) => {
  const employerId = req.user.role === 'admin' ? (req.query.employer || undefined) : req.user._id;

  const match = { employer: employerId };

  const grouped = await Application.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const totals = grouped.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const total = await Application.countDocuments(match);

  res.json({
    success: true,
    data: {
      total,
      pending: totals.pending || 0,
      reviewing: totals.reviewing || 0,
      shortlisted: totals.shortlisted || 0,
      interviewed: totals.interviewed || 0,
      rejected: totals.rejected || 0,
      accepted: totals.accepted || 0,
      withdrawn: totals.withdrawn || 0
    }
  });
});
