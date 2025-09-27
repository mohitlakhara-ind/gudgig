import Company from '../models/Company.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

// @desc    Verify company
// @route   PUT /api/companies/:id/verify
// @access  Private (Admin only)
export const verifyCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    company.isVerified = true;
    company.verifiedAt = new Date();
    company.verifiedBy = req.user.id;

    await company.save();

    res.status(200).json({
      success: true,
      message: 'Company verified successfully',
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all companies with filtering and pagination
// @route   GET /api/companies
// @access  Public
export const getCompanies = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      industry,
      size,
      location,
      verified,
      featured
    } = req.query;

    // Build query
    let query = {};

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (industry) query.industry = industry;
    if (size) query.size = size;
    if (location) {
      query.$or = [
        { headquarters: { $regex: location, $options: 'i' } },
        { 'locations.city': { $regex: location, $options: 'i' } },
        { 'locations.state': { $regex: location, $options: 'i' } }
      ];
    }
    if (verified !== undefined) query.verified = verified === 'true';
    if (featured !== undefined) query.featured = featured === 'true';

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const companies = await Company.find(query)
      .populate('jobsCount')
      .sort({ featured: -1, verified: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Company.countDocuments(query);

    res.status(200).json({
      success: true,
      count: companies.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      },
      data: companies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Public
export const getCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate({
        path: 'jobs',
        match: { status: 'active' },
        select: 'title type location salary createdAt'
      });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new company
// @route   POST /api/companies
// @access  Private (Employer/Admin only)
export const createCompany = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const company = await Company.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private (Company owner or Admin only)
export const updateCompany = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check ownership (if user has a company assigned)
    if (req.user.company && req.user.company.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this company'
      });
    }

    company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private/Admin
export const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check permissions
    if (req.user.company && req.user.company.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this company'
      });
    }

    await Company.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company by slug
// @route   GET /api/companies/slug/:slug
// @access  Public
export const getCompanyBySlug = async (req, res, next) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug })
      .populate({
        path: 'jobs',
        match: { status: 'active' },
        select: 'title type location salary createdAt'
      });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow/Unfollow company
// @route   POST /api/companies/:id/follow
// @access  Private
export const toggleFollow = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const user = await User.findById(req.user.id);
    const isFollowing = user.following && user.following.includes(req.params.id);

    if (isFollowing) {
      // Unfollow
      user.following = user.following.filter(id => id.toString() !== req.params.id);
      company.followersCount -= 1;
    } else {
      // Follow
      if (!user.following) user.following = [];
      user.following.push(req.params.id);
      company.followersCount += 1;
    }

    await user.save();
    await company.save();

    res.status(200).json({
      success: true,
      message: isFollowing ? 'Company unfollowed' : 'Company followed',
      isFollowing: !isFollowing
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company statistics
// @route   GET /api/companies/stats/overview
// @access  Private (Company owner or Admin only)
export const getCompanyStats = async (req, res, next) => {
  try {
    const companyId = req.user.company || req.params.id;

    const stats = await Company.aggregate([
      { $match: { _id: companyId } },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: 'company',
          as: 'jobs'
        }
      },
      {
        $lookup: {
          from: 'applications',
          localField: 'jobs._id',
          foreignField: 'job',
          as: 'allApplications'
        }
      },
      {
        $project: {
          jobsCount: { $size: '$jobs' },
          activeJobsCount: {
            $size: {
              $filter: {
                input: '$jobs',
                cond: { $eq: ['$$this.status', 'active'] }
              }
            }
          },
          totalApplications: { $size: '$allApplications' },
          followersCount: 1,
          viewsCount: { $sum: '$jobs.views' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        jobsCount: 0,
        activeJobsCount: 0,
        totalApplications: 0,
        followersCount: 0,
        viewsCount: 0
      }
    });
  } catch (error) {
    next(error);
  }
};
