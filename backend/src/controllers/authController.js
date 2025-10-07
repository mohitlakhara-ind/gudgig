import User from '../models/User.js';
import notificationService from '../services/notificationService.js';
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
    const allowedRoles = ['freelancer'];
    const user = await User.create({
      name,
      email,
      password,
      role: allowedRoles.includes(role) ? role : 'freelancer'
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
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        isActive: user.isActive
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
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
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

// CSRF token endpoint removed

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

    // Send email with reset token
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;
    try {
      const content = {
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset</h2>
          <p>You requested a password reset for your account.</p>
          <p>Click the link below to reset your password:</p>
          <p><a href="${resetUrl}">Reset Password</a></p>
          <p>This link will expire in 10 minutes.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
        `,
        text: `Password Reset\n\nReset link: ${resetUrl}\nThis link expires in 10 minutes.`
      };
      await (await import('../services/notificationService.js')).then(m => m.default.sendEmail(user.email, content.subject, content.html, content.text));
    } catch (mailErr) {
      console.warn('Failed to send password reset email:', mailErr?.message || mailErr);
    }

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
      passwordResetToken: resetPasswordToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
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
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send OTP
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { email, phone, channel, purpose } = req.body;
    const identifier = email ? { email } : { phone };

    let user = await User.findOne(identifier);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = await user.generateOtp();
    user.otpPurpose = purpose;
    user.otpChannel = channel;
    await user.save({ validateBeforeSave: false });

    if (channel === 'email') {
      const content = notificationService.otpTemplate({ otp, purpose, recipientName: user.name });
      await notificationService.sendEmail(user.email, content.subject, content.html, content.text);
    } else if (channel === 'sms') {
      const smsMessage = `Your MicroJobs OTP code is: ${otp}. Valid for 10 minutes. Do not share this code.`;
      await notificationService.sendSMS(user.phone, smsMessage);
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      ...(process.env.NODE_ENV === 'development' && { otp })
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { email, phone, otp, purpose } = req.body;
    const identifier = email ? { email } : { phone };

    const user = await User.findOne(identifier).select('+otp');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.otpPurpose !== purpose) {
      return res.status(400).json({ success: false, message: 'OTP purpose mismatch' });
    }

    if (!user.otpExpires || user.otpExpires.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    if ((user.otpAttempts || 0) >= 5) {
      return res.status(429).json({ success: false, message: 'Too many attempts' });
    }

    const isValid = await user.verifyOtp(otp);
    if (!isValid) {
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({ success: false, message: 'Invalid OTP' });
    }

    user.clearOtp();
    if (purpose === 'signup' || purpose === 'verification') {
      user.isEmailVerified = true;
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = user.getSignedJwtToken();
    const refreshToken = user.getRefreshToken();
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { email, phone, channel, purpose } = req.body;
    const identifier = email ? { email } : { phone };

    const user = await User.findOne(identifier);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If previous OTP exists and is still valid, enforce a 60s cooldown
    if (user.otp && user.otpExpires && user.otpExpires.getTime() > Date.now()) {
      // We do not have the last sent timestamp, approximate by 60s before expiry window end
      const sentAtApprox = new Date(user.otpExpires.getTime() - 10 * 60 * 1000);
      if (Date.now() - sentAtApprox.getTime() < 60 * 1000) {
        return res.status(429).json({ success: false, message: 'Please wait before requesting a new OTP' });
      }
    }

    const otp = await user.generateOtp();
    user.otpPurpose = purpose;
    user.otpChannel = channel;
    await user.save({ validateBeforeSave: false });

    if (channel === 'email') {
      const content = notificationService.otpTemplate({ otp, purpose, recipientName: user.name });
      await notificationService.sendEmail(user.email, content.subject, content.html, content.text);
    } else if (channel === 'sms') {
      const smsMessage = `Your MicroJobs OTP code is: ${otp}. Valid for 10 minutes. Do not share this code.`;
      await notificationService.sendSMS(user.phone, smsMessage);
    }

    return res.status(200).json({ success: true, message: 'OTP resent successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password with OTP
// @route   POST /api/auth/forgot-password-otp
// @access  Public
export const forgotPasswordOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { email, phone, channel } = req.body;
    const identifier = email ? { email } : { phone };

    const user = await User.findOne(identifier);
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email/phone' });
    }

    // Generate OTP for password reset
    const otp = await user.generateOtp();
    user.otpPurpose = 'password-reset';
    user.otpChannel = channel;
    await user.save({ validateBeforeSave: false });

    if (channel === 'email') {
      const content = notificationService.otpTemplate({ 
        otp, 
        purpose: 'password-reset', 
        recipientName: user.name 
      });
      await notificationService.sendEmail(user.email, content.subject, content.html, content.text);
    } else if (channel === 'sms') {
      const smsMessage = `Your MicroJobs password reset code is: ${otp}. Valid for 10 minutes. Do not share this code.`;
      await notificationService.sendSMS(user.phone, smsMessage);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Password reset OTP sent successfully',
      ...(process.env.NODE_ENV === 'development' && { otp })
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and reset password
// @route   POST /api/auth/reset-password-otp
// @access  Public
export const resetPasswordOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { email, phone, otp, newPassword } = req.body;
    const identifier = email ? { email } : { phone };

    const user = await User.findOne(identifier).select('+otp');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify OTP purpose
    if (user.otpPurpose !== 'password-reset') {
      return res.status(400).json({ success: false, message: 'Invalid OTP purpose' });
    }

    // Check OTP expiry
    if (!user.otpExpires || user.otpExpires.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    // Check attempt limit
    if ((user.otpAttempts || 0) >= 5) {
      return res.status(429).json({ success: false, message: 'Too many attempts' });
    }

    // Verify OTP
    const isValid = await user.verifyOtp(otp);
    if (!isValid) {
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({ success: false, message: 'Invalid OTP' });
    }

    // Reset password
    user.password = newPassword;
    user.clearOtp();
    await user.save();

    // Generate new tokens
    const token = user.getSignedJwtToken();
    const refreshToken = user.getRefreshToken();
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};