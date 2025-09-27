import User from '../models/User.js';
import Job from '../models/Job.js';
import Company from '../models/Company.js';
import Application from '../models/Application.js';

// @desc    Handle GDPR data subject access request
// @route   GET /api/compliance/gdpr/data/:userId
// @access  Private (User or Admin)
export const getUserData = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if requesting user owns the data or is admin
    if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this data'
      });
    }

    const userData = user.exportPersonalData();

    // Get user's jobs and applications
    const jobs = await Job.find({ employer: user._id }).select('title description location salary');
    const applications = await Application.find({ applicant: user._id }).populate('job', 'title company');

    res.status(200).json({
      success: true,
      data: {
        user: userData,
        jobs: jobs,
        applications: applications
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle GDPR data deletion request
// @route   DELETE /api/compliance/gdpr/delete/:userId
// @access  Private (User or Admin)
export const deleteUserData = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check authorization
    if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this data'
      });
    }

    // Anonymize user data instead of hard delete (for audit purposes)
    await user.deletePersonalData();

    // Close all user's jobs
    await Job.updateMany(
      { employer: user._id, status: 'active' },
      { status: 'closed', lastModified: new Date() }
    );

    res.status(200).json({
      success: true,
      message: 'User data has been anonymized and account deactivated'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle CCPA data portability request
// @route   GET /api/compliance/ccpa/portability/:userId
// @access  Private (User or Admin)
export const exportUserDataCCPA = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is in California (simplified check)
    if (!user.location || !user.location.toLowerCase().includes('california')) {
      return res.status(400).json({
        success: false,
        message: 'CCPA applies only to California residents'
      });
    }

    const userData = user.exportPersonalData();

    res.status(200).json({
      success: true,
      data: userData,
      message: 'Data exported under CCPA'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate salary transparency for job posting
// @route   POST /api/compliance/salary/validate
// @access  Private
export const validateSalaryTransparency = async (req, res, next) => {
  try {
    const { location, salaryDisclosure } = req.body;

    let required = false;
    const reasons = [];

    // Check jurisdiction-based requirements
    if (location) {
      const loc = location.toLowerCase();
      if (loc.includes('california')) {
        required = true;
        reasons.push('California salary transparency law');
      }
      if (loc.includes('new york')) {
        required = true;
        reasons.push('New York City salary transparency law');
      }
      if (loc.includes('colorado')) {
        required = true;
        reasons.push('Colorado salary transparency law');
      }
    }

    const isValid = !required || (salaryDisclosure && salaryDisclosure.min && salaryDisclosure.max);

    res.status(200).json({
      success: true,
      data: {
        required,
        isValid,
        reasons,
        message: required ?
          'Salary disclosure is required for this location' :
          'Salary disclosure is not required for this location'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get EEO compliance report
// @route   GET /api/compliance/eeo/report
// @access  Private (Admin)
export const getEEOReport = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const totalJobs = await Job.countDocuments();
    const eeocCompliantJobs = await Job.countDocuments({ eeocCompliant: true });
    const disabilityFriendlyJobs = await Job.countDocuments({ disabilityAccommodations: true });
    const veteranFriendlyJobs = await Job.countDocuments({ veteranFriendly: true });

    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        eeocCompliantJobs,
        eeocComplianceRate: totalJobs > 0 ? (eeocCompliantJobs / totalJobs * 100).toFixed(2) : 0,
        disabilityFriendlyJobs,
        veteranFriendlyJobs,
        reportGenerated: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get compliance dashboard data
// @route   GET /api/compliance/dashboard
// @access  Private (Admin)
export const getComplianceDashboard = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const [
      totalUsers,
      gdprConsentedUsers,
      ccpaConsentedUsers,
      totalJobs,
      salaryTransparentJobs,
      verifiedCompanies
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ 'privacyConsent.gdpr': true }),
      User.countDocuments({ 'privacyConsent.ccpa': true }),
      Job.countDocuments(),
      Job.countDocuments({ 'salaryDisclosure.min': { $exists: true } }),
      Company.countDocuments({ verificationStatus: 'verified' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        privacyCompliance: {
          totalUsers,
          gdprConsentRate: totalUsers > 0 ? (gdprConsentedUsers / totalUsers * 100).toFixed(2) : 0,
          ccpaConsentRate: totalUsers > 0 ? (ccpaConsentedUsers / totalUsers * 100).toFixed(2) : 0
        },
        jobCompliance: {
          totalJobs,
          salaryTransparencyRate: totalJobs > 0 ? (salaryTransparentJobs / totalJobs * 100).toFixed(2) : 0
        },
        companyCompliance: {
          verifiedCompanies
        },
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate privacy notice based on location
// @route   GET /api/compliance/privacy-notice
// @access  Public
export const getPrivacyNotice = async (req, res, next) => {
  try {
    const { country = 'US', region } = req.query;

    let notice = {
      gdpr: false,
      ccpa: false,
      content: 'Standard privacy policy applies.'
    };

    // GDPR for EU countries
    const euCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];
    if (euCountries.includes(country.toUpperCase())) {
      notice.gdpr = true;
      notice.content = 'GDPR privacy notice: You have rights to access, rectify, erase, and port your data.';
    }

    // CCPA for California
    if (country === 'US' && region && region.toLowerCase().includes('california')) {
      notice.ccpa = true;
      notice.content = 'CCPA privacy notice: You have rights to know about, delete, and opt-out of sale of your personal information.';
    }

    res.status(200).json({
      success: true,
      data: notice
    });
  } catch (error) {
    next(error);
  }
};