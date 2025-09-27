import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  uploadResume,
  uploadCompanyLogo,
  getUploadedFile,
  deleteUploadedFile
} from '../controllers/uploadController.js';
import { protect, authorize } from '../middleware/auth.js';

// Configure multer for different file types
const resumeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/resumes/');
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const logoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/logos/');
  },
  filename: function (req, file, cb) {
    cb(null, `logo-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter for resumes
const resumeFilter = function (req, file, cb) {
  if (file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and Word documents are allowed for resumes'));
  }
};

// File filter for logos
const logoFilter = function (req, file, cb) {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for logos'));
  }
};

// Multer configurations
const resumeUpload = multer({
  storage: resumeStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: resumeFilter
});

const uploadLogo = multer({
  storage: logoStorage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: logoFilter
});

const router = express.Router();

// All routes require authentication
router.use(protect);

// Jobseeker routes
router.post('/resume', authorize('jobseeker'), resumeUpload.single('resume'), uploadResume);

// Employer routes
router.post('/logo', authorize('employer'), uploadLogo.single('logo'), uploadCompanyLogo);

// General file routes
router.get('/:filename', getUploadedFile);
router.delete('/:filename', deleteUploadedFile);

export default router;
