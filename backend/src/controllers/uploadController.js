import path from 'path';
import fs from 'fs/promises';
import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// @desc    Upload user resume
// @route   POST /api/users/upload-resume
// @access  Private (Jobseeker)
export const uploadUserResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a resume file'
    });
  }

  // Validate file type
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Only PDF and Word documents are allowed for resumes'
    });
  }

  // Validate file size (5MB max)
  if (req.file.size > 5 * 1024 * 1024) {
    return res.status(400).json({
      success: false,
      message: 'Resume file size must be less than 5MB'
    });
  }

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'job-portal/resumes',
      resource_type: 'raw',
      public_id: `resume_${req.user.id}_${Date.now()}`,
      use_filename: true,
      unique_filename: false
    });

    // Update user's resume URL
    await User.findByIdAndUpdate(req.user.id, {
      resume: {
        url: result.secure_url,
        publicId: result.public_id,
        originalName: req.file.originalname,
        uploadedAt: new Date()
      }
    });

    // Clean up temporary file after successful upload
    try {
      await fs.unlink(req.file.path);
    } catch (unlinkError) {
      console.warn('Failed to delete temporary file:', unlinkError);
      // Don't fail the request if cleanup fails
    }

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        originalName: req.file.originalname,
        size: req.file.size,
        uploadedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    
    // Clean up temporary file on error too
    try {
      await fs.unlink(req.file.path);
    } catch (unlinkError) {
      console.warn('Failed to delete temporary file after error:', unlinkError);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error uploading resume'
    });
  }
});

// @desc    Upload user avatar
// @route   POST /api/users/upload-avatar
// @access  Private
export const uploadUserAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image file'
    });
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Only JPEG, PNG, GIF, and WebP images are allowed'
    });
  }

  // Validate file size (2MB max)
  if (req.file.size > 2 * 1024 * 1024) {
    return res.status(400).json({
      success: false,
      message: 'Avatar file size must be less than 2MB'
    });
  }

  try {
    // Upload to Cloudinary with transformations
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'job-portal/avatars',
      public_id: `avatar_${req.user.id}_${Date.now()}`,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    // Update user's avatar URL
    await User.findByIdAndUpdate(req.user.id, {
      avatar: {
        url: result.secure_url,
        publicId: result.public_id,
        uploadedAt: new Date()
      }
    });

    // Clean up temporary file after successful upload
    try {
      await fs.unlink(req.file.path);
    } catch (unlinkError) {
      console.warn('Failed to delete temporary file:', unlinkError);
      // Don't fail the request if cleanup fails
    }

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        uploadedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    
    // Clean up temporary file on error too
    try {
      await fs.unlink(req.file.path);
    } catch (unlinkError) {
      console.warn('Failed to delete temporary file after error:', unlinkError);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error uploading avatar'
    });
  }
});

// @desc    Upload resume (legacy endpoint)
// @route   POST /api/uploads/resume
// @access  Private (Jobseeker)
export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a file'
    });
  }

  // File is already saved by multer, return the file info
  res.json({
    success: true,
    data: {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/api/uploads/${req.file.filename}`
    }
  });
});

// @desc    Upload company logo
// @route   POST /api/uploads/logo
// @access  Private (Employer)
export const uploadCompanyLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a file'
    });
  }

  // File is already saved by multer, return the file info
  res.json({
    success: true,
    data: {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/api/uploads/${req.file.filename}`
    }
  });
});

// @desc    Get uploaded file
// @route   GET /api/uploads/:filename
// @access  Private
export const getUploadedFile = asyncHandler(async (req, res) => {
  const { filename } = req.params;

  // In a real application, you might want to check if the user has permission to access this file
  // For now, we'll just serve the file if it exists

  const filePath = path.join(process.cwd(), 'uploads', filename);

  // Check if file exists (basic check)
  res.json({
    success: true,
    message: 'File access endpoint',
    filename,
    // In production, you would serve the actual file here
    // res.sendFile(filePath);
  });
});

// @desc    Delete uploaded file
// @route   DELETE /api/uploads/:filename
// @access  Private
export const deleteUploadedFile = asyncHandler(async (req, res) => {
  const { filename } = req.params;

  // In a real application, you would:
  // 1. Check if user owns the file
  // 2. Delete the file from storage
  // 3. Update database references

  res.json({
    success: true,
    message: 'File deletion endpoint',
    filename
  });
});
