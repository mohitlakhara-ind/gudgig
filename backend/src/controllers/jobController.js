import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { validationResult } from 'express-validator';

// @desc    Get all jobs with filtering and pagination
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      type,
      location,
      experience,
      salaryMin,
      salaryMax,
      isRemote,
      company,
      featured,
      urgent,
      jobLocationType,
      remoteStates,
      remoteCountries,
      eeocCompliant,
      disabilityAccommodations,
      veteranFriendly,
      verificationLevel,
      qualityScoreMin,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (category) query.category = category;
    if (type) query.type = type;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (experience) query.experience = experience;
    if (company) query.company = company;
    if (featured !== undefined) query.featured = featured === 'true';
    if (urgent !== undefined) query.urgent = urgent === 'true';
    if (isRemote !== undefined) query.isRemote = isRemote === 'true';
    if (jobLocationType) query.jobLocationType = jobLocationType;
    if (eeocCompliant !== undefined) query.eeocCompliant = eeocCompliant === 'true';
    if (disabilityAccommodations !== undefined) query.disabilityAccommodations = disabilityAccommodations === 'true';
    if (veteranFriendly !== undefined) query.veteranFriendly = veteranFriendly === 'true';
    if (verificationLevel) query.verificationLevel = verificationLevel;
    if (qualityScoreMin) query.qualityScore = { $gte: parseInt(qualityScoreMin) };

    // Remote eligibility filters
    if (remoteStates) {
      const states = remoteStates.split(',').map(s => s.trim());
      query['remoteEligibility.allowedStates'] = { $in: states };
    }
    if (remoteCountries) {
      const countries = remoteCountries.split(',').map(c => c.trim());
      query['remoteEligibility.allowedCountries'] = { $in: countries };
    }

    // Salary range (updated for salaryDisclosure)
    if (salaryMin || salaryMax) {
      query.$or = [
        { 'salary.min': { $gte: parseInt(salaryMin || 0), $lte: parseInt(salaryMax || Infinity) } },
        { 'salaryDisclosure.min': { $gte: parseInt(salaryMin || 0), $lte: parseInt(salaryMax || Infinity) } }
      ];
    }

    // Only active jobs
    query.status = 'active';

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    // Always prioritize featured and urgent jobs
    sortOptions.featured = -1;
    sortOptions.urgent = -1;

    // Execute query
    const jobs = await Job.find(query)
      .populate('employer', 'name avatar email')
      .populate('company', 'name logo description website industry size headquarters rating')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Job.countDocuments(query);

    // Subscription metadata for client gating UX
    const subscription = req.subscription || null;
    const subscriptionMeta = subscription ? {
      plan: subscription.plan,
      status: subscription.status,
      hasFullAccess: subscription.isActive(),
      jobViewsToday: subscription.getDailyUsage('jobViews')
    } : { plan: 'free', status: 'inactive', hasFullAccess: false, jobViewsToday: 0 };

    // Mask details for non-full-access users
    const data = subscriptionMeta.hasFullAccess ? jobs : jobs.map(j => ({
      _id: j._id,
      title: j.title,
      company: j.company ? { name: j.company.name, logo: j.company.logo, website: j.company.website } : null,
      location: j.location,
      type: j.type,
      salaryDisclosure: j.salaryDisclosure || null,
      featured: j.featured,
      urgent: j.urgent,
      createdAt: j.createdAt,
      promotion: j.promotion,
      previewDescription: j.shortDescription || 'Upgrade to view the full job description and application details.'
    }));

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      },
      subscription: subscriptionMeta,
      data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
export const getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'name avatar email')
      .populate('company', 'name logo description website industry');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment view count
    job.views += 1;
    await job.save();

    // Generate structured data for SEO
    const structuredData = {
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      title: job.title,
      description: job.description,
      datePosted: job.createdAt,
      validThrough: job.applicationDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      employmentType: job.type.toUpperCase(),
      hiringOrganization: {
        '@type': 'Organization',
        name: job.company?.name,
        logo: job.company?.logo
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: job.location,
          addressCountry: 'US' // Default, should be dynamic
        }
      }
    };

    // Add salary information if available
    if (job.salaryDisclosure && job.salaryDisclosure.min) {
      structuredData.baseSalary = {
        '@type': 'MonetaryAmount',
        currency: job.salaryDisclosure.currency,
        value: {
          '@type': 'QuantitativeValue',
          minValue: job.salaryDisclosure.min,
          maxValue: job.salaryDisclosure.max,
          unitText: job.salaryDisclosure.period
        }
      };
    }

    // Subscription-based masking
    const hasFullAccess = req.subscriptionHasFullJobAccess === true;
    let responseJob = job;
    if (!hasFullAccess) {
      responseJob = {
        _id: job._id,
        title: job.title,
        company: job.company ? { name: job.company.name, logo: job.company.logo, website: job.company.website } : null,
        location: job.location,
        type: job.type,
        salaryDisclosure: job.salaryDisclosure || null,
        featured: job.featured,
        urgent: job.urgent,
        createdAt: job.createdAt,
        // Mask detailed fields
        description: 'Upgrade to view the full job description.',
        requirements: [],
        benefits: [],
        applicationInstructions: null
      };
    }

    // Usage tracking is handled by middleware to avoid double increments and ensure success-only accounting

    res.status(200).json({
      success: true,
      data: responseJob,
      structuredData,
      subscription: req.subscription ? { plan: req.subscription.plan, status: req.subscription.status, hasFullAccess } : { plan: 'free', status: 'inactive', hasFullAccess }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update jobs
// @route   PUT /api/jobs/bulk
// @access  Private (Employer/Admin only)
export const bulkUpdateJobs = async (req, res, next) => {
  try {
    const { jobIds, updates } = req.body;

    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Job IDs array is required'
      });
    }

    // Verify ownership for all jobs
    const jobs = await Job.find({
      _id: { $in: jobIds },
      employer: req.user.role === 'admin' ? { $exists: true } : req.user._id
    });

    if (jobs.length !== jobIds.length) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update all specified jobs'
      });
    }

    // Perform bulk update
    const result = await Job.updateMany(
      {
        _id: { $in: jobIds },
        employer: req.user.role === 'admin' ? { $exists: true } : req.user._id
      },
      { ...updates, lastModified: new Date() },
      { runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} jobs updated successfully`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auto-refresh expired jobs
// @route   POST /api/jobs/auto-refresh
// @access  Private (Employer/Admin only)
export const autoRefreshJobs = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await Job.updateMany(
      {
        employer: req.user.role === 'admin' ? { $exists: true } : req.user._id,
        status: 'active',
        lastModified: { $lt: thirtyDaysAgo },
        featured: false
      },
      {
        lastModified: new Date(),
        updatedAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} jobs auto-refreshed`,
      data: {
        refreshed: result.modifiedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Employer/Admin only)
export const createJob = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Add employer to job data
    req.body.employer = req.user.id;

    // Salary transparency validation based on location
    if (req.body.location) {
      const location = req.body.location.toLowerCase();
      if (location.includes('california') || location.includes('new york') || location.includes('colorado')) {
        if (!req.body.salaryDisclosure || !req.body.salaryDisclosure.min || !req.body.salaryDisclosure.max) {
          return res.status(400).json({
            success: false,
            message: 'Salary disclosure is required for jobs in this location due to transparency laws'
          });
        }
      }
    }

    // Basic fraud detection
    const recentJobs = await Job.countDocuments({
      employer: req.user.id,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    if (recentJobs >= 10) { // Rate limit: max 10 jobs per day
      return res.status(429).json({
        success: false,
        message: 'Job posting limit exceeded. Please try again tomorrow.'
      });
    }

    // Quality scoring (basic implementation)
    let qualityScore = 50; // Base score
    if (req.body.description && req.body.description.length > 100) qualityScore += 10;
    if (req.body.requirements && req.body.requirements.length > 0) qualityScore += 10;
    if (req.body.skills && req.body.skills.length > 0) qualityScore += 10;
    if (req.body.salaryDisclosure && req.body.salaryDisclosure.min) qualityScore += 10;
    if (req.body.company) qualityScore += 10;

    req.body.qualityScore = Math.min(qualityScore, 100);

    const job = await Job.create(req.body);

    // Populate the created job
    await job.populate('employer', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Job owner or Admin only)
export const updateJob = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check ownership
    if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('employer', 'name avatar');

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Job owner or Admin only)
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check ownership
    if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get jobs by employer
// @route   GET /api/jobs/employer/:employerId
// @access  Public
export const getJobsByEmployer = async (req, res, next) => {
  try {
    const jobs = await Job.find({
      employer: req.params.employerId,
      status: 'active'
    })
      .populate('employer', 'name avatar')
      .populate('company', 'name logo')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get job statistics
// @route   GET /api/jobs/stats/overview
// @access  Private (Employer/Admin only)
export const getJobStats = async (req, res, next) => {
  try {
    const matchCondition = {
      employer: req.user.role === 'admin' ? { $exists: true } : req.user._id
    };

    const stats = await Job.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          activeJobs: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          pausedJobs: {
            $sum: { $cond: [{ $eq: ['$status', 'paused'] }, 1, 0] }
          },
          closedJobs: {
            $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
          },
          totalViews: { $sum: '$views' },
          totalApplications: { $sum: '$applicationsCount' },
          averageQualityScore: { $avg: '$qualityScore' },
          featuredJobs: {
            $sum: { $cond: [{ $eq: ['$featured', true] }, 1, 0] }
          },
          verifiedJobs: {
            $sum: { $cond: [{ $eq: ['$verificationLevel', 'verified'] }, 1, 0] }
          }
        }
      }
    ]);

    // Additional analytics
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentStats = await Job.aggregate([
      {
        $match: {
          ...matchCondition,
          createdAt: { $gte: last30Days }
        }
      },
      {
        $group: {
          _id: null,
          jobsPostedLast30Days: { $sum: 1 },
          viewsLast30Days: { $sum: '$views' },
          applicationsLast30Days: { $sum: '$applicationsCount' }
        }
      }
    ]);

    const baseStats = stats[0] || {
      totalJobs: 0,
      activeJobs: 0,
      pausedJobs: 0,
      closedJobs: 0,
      totalViews: 0,
      totalApplications: 0,
      averageQualityScore: 0,
      featuredJobs: 0,
      verifiedJobs: 0
    };

    const recent = recentStats[0] || {
      jobsPostedLast30Days: 0,
      viewsLast30Days: 0,
      applicationsLast30Days: 0
    };

    res.status(200).json({
      success: true,
      data: {
        ...baseStats,
        ...recent,
        conversionRate: baseStats.totalApplications > 0 ? (baseStats.totalApplications / baseStats.totalViews * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    next(error);
  }
};
