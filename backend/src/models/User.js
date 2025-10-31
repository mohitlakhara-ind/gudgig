import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['freelancer', 'employer', 'admin'],
    default: 'freelancer'
  },
  // Optional profile fields used by admin UI and profiles
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  countryCode: {
    type: String,
    trim: true,
    default: 'US',
    maxlength: [3, 'Country code cannot be more than 3 characters']
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  avatar: {
    type: String,
    trim: true,
    default: ''
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  refreshToken: String,
  // OTP authentication fields
  otp: { type: String, select: false },
  otpExpires: Date,
  otpAttempts: { type: Number, default: 0 },
  otpPurpose: { type: String, enum: ['signup', 'login', 'password-reset', 'verification'] },
  otpChannel: { type: String, enum: ['email', 'sms'] },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // If set, user is deactivated until this timestamp
  deactivatedUntil: {
    type: Date,
    default: null
  },
  // Soft delete support
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  // Notification preferences
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    chatNotifications: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true },
    // Quiet hours settings
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: '22:00' }, // HH:MM format
      end: { type: String, default: '07:00' }    // HH:MM format
    }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

userSchema.methods.getRefreshToken = function() {
  const refreshToken = jwt.sign(
    { id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' }
  );
  this.refreshToken = refreshToken;
  return refreshToken;
};

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.getEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(20).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  return verificationToken;
};

// Generate a 6-digit OTP, hash and set expiration
userSchema.methods.generateOtp = async function() {
  const plainOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
  this.otp = await bcrypt.hash(plainOtp, salt);
  this.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  this.otpAttempts = 0;
  return plainOtp;
};

// Verify entered OTP against stored hash and track attempts
userSchema.methods.verifyOtp = async function(enteredOtp) {
  if (!this.otp || !this.otpExpires) {
    return false;
  }
  if (this.otpExpires.getTime() < Date.now()) {
    return false;
  }
  const isMatch = await bcrypt.compare(enteredOtp, this.otp);
  this.otpAttempts = (this.otpAttempts || 0) + (isMatch ? 0 : 1);
  return isMatch;
};

// Clear OTP related fields
userSchema.methods.clearOtp = function() {
  this.otp = undefined;
  this.otpExpires = undefined;
  this.otpAttempts = undefined;
  this.otpPurpose = undefined;
  this.otpChannel = undefined;
};

// Performance indexes
// Email already has a unique index via schema; avoid duplicate
userSchema.index({ role: 1 }); // For filtering by role
userSchema.index({ isActive: 1 }); // For filtering by status
userSchema.index({ role: 1, isActive: 1 }); // Compound index for common queries
userSchema.index({ isDeleted: 1 }); // For soft delete queries
userSchema.index({ createdAt: -1 }); // For sorting by creation date
userSchema.index({ deactivatedUntil: 1 });

export default mongoose.model('User', userSchema);
