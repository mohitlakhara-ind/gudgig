import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  forgotPasswordOtp,
  resetPasswordOtp
} from '../controllers/authController.js';
import { sendOtp, verifyOtp, resendOtp } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['freelancer'])
    .withMessage('Role must be freelancer')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateDetailsValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('experience')
    .optional()
    .isIn(['fresher', '1-2 years', '3-5 years', '5-10 years', '10+ years'])
    .withMessage('Invalid experience level')
];

const updatePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refreshToken);
// CSRF token endpoint (stateless basic token)
router.get('/csrf-token', (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  res.json({ success: true, csrfToken: token });
});
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/verify/:token', verifyEmail);

// OTP Validation rules
const sendOtpValidation = [
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone required'),
  body().custom((value) => {
    if (!value.email && !value.phone) {
      throw new Error('Either email or phone is required');
    }
    return true;
  }),
  body('channel')
    .isIn(['email', 'sms'])
    .withMessage('Channel must be one of email or sms'),
  body('purpose')
    .isIn(['signup', 'login', 'password-reset', 'verification'])
    .withMessage('Invalid purpose')
];

const verifyOtpValidation = [
  body('email').optional().isEmail(),
  body('phone').optional().isMobilePhone(),
  body().custom((value) => {
    if (!value.email && !value.phone) {
      throw new Error('Either email or phone is required');
    }
    return true;
  }),
  body('otp').isString().matches(/^\d{6}$/).withMessage('OTP must be 6 digits'),
  body('purpose').isIn(['signup', 'login', 'password-reset', 'verification'])
];

const resendOtpValidation = sendOtpValidation;

// Forgot password OTP validation
const forgotPasswordOtpValidation = [
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone required'),
  body().custom((value) => {
    if (!value.email && !value.phone) {
      throw new Error('Either email or phone is required');
    }
    return true;
  }),
  body('channel')
    .isIn(['email', 'sms'])
    .withMessage('Channel must be one of email or sms')
];

const resetPasswordOtpValidation = [
  body('email').optional().isEmail(),
  body('phone').optional().isMobilePhone(),
  body().custom((value) => {
    if (!value.email && !value.phone) {
      throw new Error('Either email or phone is required');
    }
    return true;
  }),
  body('otp').isString().matches(/^\d{6}$/).withMessage('OTP must be 6 digits'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// OTP routes
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: 'Too many OTP requests, please try again later.'
});

router.post('/send-otp', sendOtpValidation, sendOtp);
router.post('/verify-otp', verifyOtpValidation, verifyOtp);
router.post('/resend-otp', otpLimiter, resendOtpValidation, resendOtp);

// Forgot password OTP routes
router.post('/forgot-password-otp', forgotPasswordOtpValidation, forgotPasswordOtp);
router.post('/reset-password-otp', resetPasswordOtpValidation, resetPasswordOtp);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetailsValidation, updateDetails);
router.put('/updatepassword', protect, updatePasswordValidation, updatePassword);
router.post('/logout', protect, logout);

export default router;
