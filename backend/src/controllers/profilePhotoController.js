import { v2 as cloudinary } from 'cloudinary';
import User from '../models/User.js';

// @desc    Upload profile photo
// @route   POST /api/profile/photo
// @access  Private
export const uploadProfilePhoto = async (req, res, next) => {
  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(503).json({
        success: false,
        message: 'File upload service is not configured. Please contact administrator.',
        error: 'CLOUDINARY_NOT_CONFIGURED'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const userId = req.user._id;
    const { buffer, originalname, mimetype } = req.file;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      });
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (buffer.length > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }

    // Get current user to check for existing avatar
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old avatar from Cloudinary if it exists
    if (user.avatar) {
      try {
        const publicId = user.avatar.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`job-portal/profiles/${publicId}`);
      } catch (error) {
        console.warn('Failed to delete old avatar:', error.message);
        // Continue with upload even if deletion fails
      }
    }

    // Upload new photo to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'job-portal/profiles',
          resource_type: 'image',
          use_filename: true,
          unique_filename: true,
          filename_override: `profile_${userId}_${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(buffer);
    });

    // Update user avatar in database
    user.avatar = uploadResult.secure_url;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        avatar: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes
      }
    });

  } catch (error) {
    console.error('Profile photo upload error:', error);
    next(error);
  }
};

// @desc    Delete profile photo
// @route   DELETE /api/profile/photo
// @access  Private
export const deleteProfilePhoto = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.avatar) {
      return res.status(400).json({
        success: false,
        message: 'No profile photo to delete'
      });
    }

    // Delete from Cloudinary
    try {
      const publicId = user.avatar.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`job-portal/profiles/${publicId}`);
    } catch (error) {
      console.warn('Failed to delete avatar from Cloudinary:', error.message);
      // Continue with database update even if Cloudinary deletion fails
    }

    // Remove avatar from user record
    user.avatar = '';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile photo deleted successfully'
    });

  } catch (error) {
    console.error('Profile photo deletion error:', error);
    next(error);
  }
};

// @desc    Get profile photo info
// @route   GET /api/profile/photo
// @access  Private
export const getProfilePhoto = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('avatar name email');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        avatar: user.avatar || null,
        hasAvatar: !!user.avatar,
        user: {
          name: user.name,
          email: user.email
        }
      }
    });

  } catch (error) {
    console.error('Get profile photo error:', error);
    next(error);
  }
};
