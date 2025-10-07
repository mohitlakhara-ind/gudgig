import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';
import notificationService from '../services/notificationService.js';

// Submit a new job application
export const submitApplication = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const applicantId = req.user.id;
    const {
      job,
      coverLetter,
      expectedSalary,
      availability,
      questionnaire,
      skills,
      experience,
      source,
      referredBy
    } = req.body;

    // Check if job exists and is active
    const jobDoc = await Job.findById(job);
    if (!jobDoc) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (jobDoc.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Job is not accepting applications'
      });
    }

    // Check if user has already applied for this job
    const existingApplication = await Application.findOne({
      job,
      applicant: applicantId,
      isActive: true
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create the application
    const application = await Application.create({
      job,
      applicant: applicantId,
      coverLetter,
      expectedSalary,
      availability,
      questionnaire,
      skills,
      experience,
      source,
      referredBy,
      statusHistory: [{
        status: 'pending',
        changedBy: applicantId,
        reason: 'Application submitted',
        changedAt: new Date()
      }]
    });

    // Populate the application with job and applicant details
    const populatedApplication = await Application.findById(application._id)
      .populate('job', 'title company location type')
      .populate('applicant', 'name email avatar');

    // Update job's application count
    await Job.findByIdAndUpdate(job, {
      $inc: { applicationsCount: 1 }
    });

    // Send notification to job poster
    try {
      await notificationService.sendNotification(
        jobDoc.createdBy,
        'new_application',
        {
          title: 'New Job Application',
          message: `Someone applied for your job: ${jobDoc.title}`,
          jobId: job,
          applicationId: application._id,
          applicantName: req.user.name
        },
        ['email', 'push']
      );
    } catch (notificationError) {
      console.error('Failed to send application notification:', notificationError);
    }

    res.status(201).json({
      success: true,
      data: populatedApplication,
      message: 'Application submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting application'
    });
  }
};

// Get user's applications (for job seekers)
export const getUserApplications = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const sortBy = req.query.sortBy || 'newest';

    // Build filter
    const filter = {
      applicant: userId,
      isActive: true
    };

    if (status && status !== 'all') {
      filter.status = status;
    }

    // Build sort
    let sort = { appliedAt: -1 }; // default: newest first
    switch (sortBy) {
      case 'oldest':
        sort = { appliedAt: 1 };
        break;
      case 'status':
        sort = { status: 1, appliedAt: -1 };
        break;
      case 'job-title':
        sort = { 'job.title': 1 };
        break;
    }

    const result = await Application.getApplicationsWithDetails(filter, {
      page,
      limit,
      sort,
      populate: ['job']
    });

    res.status(200).json({
      success: true,
      data: result.applications,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications'
    });
  }
};

// Get applications for a specific job (for employers)
export const getJobApplications = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { jobId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const sortBy = req.query.sortBy || 'newest';

    // Check if user owns the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.createdBy.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these applications'
      });
    }

    // Build filter
    const filter = {
      job: jobId,
      isActive: true
    };

    if (status && status !== 'all') {
      filter.status = status;
    }

    // Build sort
    let sort = { appliedAt: -1 };
    switch (sortBy) {
      case 'oldest':
        sort = { appliedAt: 1 };
        break;
      case 'status':
        sort = { status: 1, appliedAt: -1 };
        break;
      case 'name':
        sort = { 'applicant.name': 1 };
        break;
    }

    const result = await Application.getApplicationsWithDetails(filter, {
      page,
      limit,
      sort,
      populate: ['applicant']
    });

    res.status(200).json({
      success: true,
      data: result.applications,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications'
    });
  }
};

// Get single application details
export const getApplication = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { applicationId } = req.params;
    const userId = req.user.id;

    const application = await Application.findById(applicationId)
      .populate('job', 'title company location type salary createdBy')
      .populate('applicant', 'name email avatar profile')
      .populate('statusHistory.changedBy', 'name')
      .populate('employerNotes.addedBy', 'name')
      .populate('interviews.feedback.interviewer', 'name');

    if (!application || !application.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check permissions
    const isApplicant = application.applicant._id.toString() === userId;
    const isJobOwner = application.job.createdBy.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isApplicant && !isJobOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    // Filter sensitive data based on user role
    let responseData = application.toObject();
    
    if (isApplicant && !isJobOwner && !isAdmin) {
      // Job seekers shouldn't see private employer notes
      responseData.employerNotes = responseData.employerNotes.filter(note => !note.isPrivate);
    }

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching application'
    });
  }
};

// Update application status (for employers)
export const updateApplicationStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { applicationId } = req.params;
    const { status, reason } = req.body;
    const userId = req.user.id;

    const application = await Application.findById(applicationId)
      .populate('job', 'title createdBy')
      .populate('applicant', 'name email');

    if (!application || !application.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check permissions
    const isJobOwner = application.job.createdBy.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isJobOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    // Update status using the model method
    await application.updateStatus(status, userId, reason);

    // Send notification to applicant
    try {
      const statusMessages = {
        reviewing: 'Your application is being reviewed',
        shortlisted: 'Congratulations! You have been shortlisted',
        interviewing: 'You have been selected for an interview',
        rejected: 'Your application was not selected',
        accepted: 'Congratulations! Your application has been accepted'
      };

      await notificationService.sendNotification(
        application.applicant._id,
        'application_status_update',
        {
          title: 'Application Status Update',
          message: statusMessages[status] || `Your application status has been updated to ${status}`,
          jobTitle: application.job.title,
          status,
          applicationId: application._id
        },
        ['email', 'push']
      );
    } catch (notificationError) {
      console.error('Failed to send status update notification:', notificationError);
    }

    res.status(200).json({
      success: true,
      data: application,
      message: `Application status updated to ${status}`
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating application'
    });
  }
};

// Add employer note to application
export const addEmployerNote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { applicationId } = req.params;
    const { note, isPrivate = true } = req.body;
    const userId = req.user.id;

    const application = await Application.findById(applicationId)
      .populate('job', 'createdBy');

    if (!application || !application.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check permissions
    const isJobOwner = application.job.createdBy.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isJobOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add notes to this application'
      });
    }

    // Add note using the model method
    await application.addEmployerNote(note, userId, isPrivate);

    res.status(200).json({
      success: true,
      data: application,
      message: 'Note added successfully'
    });

  } catch (error) {
    console.error('Error adding employer note:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding note'
    });
  }
};

// Withdraw application (for job seekers)
export const withdrawApplication = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { applicationId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const application = await Application.findById(applicationId)
      .populate('job', 'title createdBy')
      .populate('applicant', 'name');

    if (!application || !application.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns the application
    if (application.applicant._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application'
      });
    }

    // Check if application can be withdrawn
    if (['accepted', 'rejected'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw application with status: ${application.status}`
      });
    }

    // Update status to withdrawn
    await application.updateStatus('withdrawn', userId, reason || 'Withdrawn by applicant');

    // Update job's application count
    await Job.findByIdAndUpdate(application.job._id, {
      $inc: { applicationsCount: -1 }
    });

    // Send notification to employer
    try {
      await notificationService.sendNotification(
        application.job.createdBy,
        'application_withdrawn',
        {
          title: 'Application Withdrawn',
          message: `${application.applicant.name} withdrew their application for ${application.job.title}`,
          jobTitle: application.job.title,
          applicantName: application.applicant.name,
          applicationId: application._id
        },
        ['email']
      );
    } catch (notificationError) {
      console.error('Failed to send withdrawal notification:', notificationError);
    }

    res.status(200).json({
      success: true,
      data: application,
      message: 'Application withdrawn successfully'
    });

  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while withdrawing application'
    });
  }
};

// Get application statistics
export const getApplicationStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let filter = {};

    if (userRole === 'job_seeker' || userRole === 'freelancer') {
      // For job seekers, get their application stats
      filter.applicant = userId;
    } else if (userRole === 'employer') {
      // For employers, get stats for their jobs
      const userJobs = await Job.find({ createdBy: userId }).select('_id');
      const jobIds = userJobs.map(job => job._id);
      filter.job = { $in: jobIds };
    }
    // Admins get all stats (no filter)

    const stats = await Application.getApplicationStats(filter);

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching application statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
};

// Admin: Get all applications
export const getAllApplications = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const jobId = req.query.jobId;
    const applicantId = req.query.applicantId;
    const sortBy = req.query.sortBy || 'newest';

    // Build filter
    const filter = { isActive: true };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (jobId) {
      filter.job = jobId;
    }
    if (applicantId) {
      filter.applicant = applicantId;
    }

    // Build sort
    let sort = { appliedAt: -1 };
    switch (sortBy) {
      case 'oldest':
        sort = { appliedAt: 1 };
        break;
      case 'status':
        sort = { status: 1, appliedAt: -1 };
        break;
    }

    const result = await Application.getApplicationsWithDetails(filter, {
      page,
      limit,
      sort,
      populate: ['job', 'applicant']
    });

    res.status(200).json({
      success: true,
      data: result.applications,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error fetching all applications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications'
    });
  }
};



