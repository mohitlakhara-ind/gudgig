import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import OTP from '../models/OTP.js';
import NotificationService from '../services/notificationService.js';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'jobseeker'
    });

    // Generate verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    // TODO: Send verification email
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Email Verification',
    //   message: `Please verify your email: ${verificationToken}`
    // });

    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = user.getSignedJwtToken();
    const refreshToken = user.getRefreshToken();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('company', 'name logo');

    const subscription = await Subscription.findOne({ user: req.user.id });

    // Calculate counts using aggregation if needed
    let applicationsCount = 0;
    let jobsPostedCount = 0;

    if (user.role === 'jobseeker') {
      const Application = (await import('../models/Application.js')).default;
      applicationsCount = await Application.countDocuments({ applicant: user._id });
    } else if (user.role === 'employer') {
      const Job = (await import('../models/Job.js')).default;
      jobsPostedCount = await Job.countDocuments({ employer: user._id });
    }

    // Add computed counts to user data
    const userData = user.toObject();
    userData.applicationsCount = applicationsCount;
    userData.jobsPostedCount = jobsPostedCount;

    res.status(200).json({
      success: true,
      data: {
        ...userData,
        subscription: subscription ? {
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
        } : { plan: 'free', status: 'inactive' }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      location: req.body.location,
      bio: req.body.bio,
      skills: req.body.skills,
      experience: req.body.experience
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'User details updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Check if user still exists and token is valid
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const token = user.getSignedJwtToken();
    const newRefreshToken = user.getRefreshToken();
    await user.save();

    res.status(200).json({
      success: true,
      token,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear refresh token
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    // Clear refresh token
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// CSRF token endpoint removed - JWT tokens provide sufficient protection
// for API endpoints when properly implemented

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Send email with reset token
    // const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
      // In development, return the token
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify/:token
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    const verificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: verificationToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

// OTP Authentication
// @desc    Send OTP to email or phone
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOTP = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Email or phone is required' });
    }

    const query = {};
    if (email) query.email = email.toLowerCase();
    if (phone) query.phone = phone;

    let user = await User.findOne(query);
    if (!user) {
      // Auto-register lightweight account if using OTP-only flow with phone
      if (phone && !email) {
        user = await User.create({ name: 'User', email: `otp_${phone}@placeholder.local`, password: crypto.randomBytes(12).toString('hex'), phone });
      } else {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
    }

    // Rate limiting at OTP model level
    const recent = await OTP.findOne({ user: user._id }).sort({ createdAt: -1 });
    if (recent && Date.now() - recent.createdAt.getTime() < 60 * 1000) {
      return res.status(429).json({ success: false, message: 'Please wait before requesting another code' });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await OTP.create({ user: user._id, channel: phone ? 'sms' : 'email', destination: phone || email, code, expiresAt, attempts: 0 });

    const content = { code, expiresInMinutes: 10 };
    if (phone) {
      await NotificationService.sendSMS(phone, `Your verification code is ${code}. It expires in 10 minutes.`);
    }
    if (email) {
      await NotificationService.sendEmail(email, 'Your verification code', `<p>Your verification code is <strong>${code}</strong>. It expires in 10 minutes.</p>`, `Your verification code is ${code}. It expires in 10 minutes.`);
    }

    res.json({ success: true, message: 'OTP sent' });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and login
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, phone, code } = req.body;
    if (!code || (!email && !phone)) {
      return res.status(400).json({ success: false, message: 'Code and identifier are required' });
    }

    const user = await User.findOne({ ...(email ? { email: email.toLowerCase() } : {}), ...(phone ? { phone } : {}) });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const record = await OTP.findOne({ user: user._id }).sort({ createdAt: -1 });
    if (!record) {
      return res.status(400).json({ success: false, message: 'No OTP requested' });
    }
    if (record.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }
    if (record.attempts >= 5) {
      return res.status(429).json({ success: false, message: 'Too many attempts. Request a new code.' });
    }
    if (record.code !== code) {
      record.attempts += 1;
      await record.save();
      return res.status(401).json({ success: false, message: 'Invalid code' });
    }

    // Success: delete used OTP
    await OTP.deleteMany({ user: user._id });

    user.lastLogin = new Date();
    await user.save();

    const token = user.getSignedJwtToken();
    const refreshToken = user.getRefreshToken();
    await user.save();

    res.json({ success: true, message: 'Login successful', token, refreshToken, user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Email or phone is required' });
    }
    // Throttle by deleting prior and invoking sendOTP
    const user = await User.findOne({ ...(email ? { email: email.toLowerCase() } : {}), ...(phone ? { phone } : {}) });
    if (user) await OTP.deleteMany({ user: user._id });
    req.body = { email, phone };
    return await sendOTP(req, res, next);
  } catch (error) {
    next(error);
  }
};
