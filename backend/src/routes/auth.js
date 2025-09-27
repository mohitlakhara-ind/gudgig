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
  sendOTP,
  verifyOTP,
  resendOTP
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

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
    .isIn(['jobseeker', 'employer', 'admin'])
    .withMessage('Role must be jobseeker, employer, or admin')
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
// CSRF route removed - JWT tokens provide sufficient protection
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/verify/:token', verifyEmail);

// OTP routes with validation and rate limiting
const otpLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 10 });
const sendOtpValidation = [
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone'),
];
const verifyOtpValidation = [
  body('code').isLength({ min: 4, max: 10 }).withMessage('Invalid code'),
  body('email').optional().isEmail(),
  body('phone').optional().isMobilePhone('any')
];
router.post('/send-otp', otpLimiter, sendOtpValidation, sendOTP);
router.post('/verify-otp', otpLimiter, verifyOtpValidation, verifyOTP);
router.post('/resend-otp', otpLimiter, sendOtpValidation, resendOTP);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetailsValidation, updateDetails);
router.put('/updatepassword', protect, updatePasswordValidation, updatePassword);
router.post('/logout', protect, logout);

export default router;
