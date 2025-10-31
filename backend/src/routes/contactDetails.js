import express from 'express';
import { body } from 'express-validator';
import {
  getContactDetails,
  createContactDetails,
  updateContactDetails,
  deleteContactDetails,
  setDefaultContactDetails,
  getAllContactDetails,
  adminCreateContactDetails,
  adminUpdateContactDetails,
  adminDeleteContactDetails
} from '../controllers/contactDetailsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const contactDetailsValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .custom((value) => {
      if (!value) {
        throw new Error('Phone number is required');
      }
      // Basic phone validation - allow international formats
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        throw new Error('Please provide a valid phone number');
      }
      return true;
    }),
  body('countryCode')
    .isLength({ min: 1, max: 3 })
    .withMessage('Country code is required'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot be more than 100 characters'),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position cannot be more than 100 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot be more than 500 characters')
];

const updateContactDetailsValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .custom((value) => {
      if (!value) return true; // Optional field
      // Basic phone validation - allow international formats
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        throw new Error('Please provide a valid phone number');
      }
      return true;
    }),
  body('countryCode')
    .optional()
    .isLength({ min: 1, max: 3 })
    .withMessage('Country code is required'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot be more than 100 characters'),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position cannot be more than 100 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot be more than 500 characters')
];

// All routes are protected
router.use(protect);

// GET /api/contact-details - Get all contact details for current user
router.get('/', getContactDetails);

// POST /api/contact-details - Create new contact details
router.post('/', contactDetailsValidation, createContactDetails);

// PUT /api/contact-details/:id - Update contact details
router.put('/:id', updateContactDetailsValidation, updateContactDetails);

// DELETE /api/contact-details/:id - Delete contact details
router.delete('/:id', deleteContactDetails);

// PATCH /api/contact-details/:id/default - Set as default contact
router.patch('/:id/default', setDefaultContactDetails);

// Admin routes
const adminContactDetailsValidation = [
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .custom((value) => {
      if (!value) {
        throw new Error('Phone number is required');
      }
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        throw new Error('Please provide a valid phone number');
      }
      return true;
    }),
  body('countryCode')
    .isLength({ min: 1, max: 3 })
    .withMessage('Country code is required'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot be more than 100 characters'),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position cannot be more than 100 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot be more than 500 characters'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean value')
];

const adminUpdateContactDetailsValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .custom((value) => {
      if (!value) return true; // Optional field
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        throw new Error('Please provide a valid phone number');
      }
      return true;
    }),
  body('countryCode')
    .optional()
    .isLength({ min: 1, max: 3 })
    .withMessage('Country code is required'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot be more than 100 characters'),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position cannot be more than 100 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot be more than 500 characters'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean value')
];

// GET /api/contact-details/admin/all - Get all contact details (admin only)
router.get('/admin/all', authorize('admin'), getAllContactDetails);

// POST /api/contact-details/admin - Create contact details for any user (admin only)
router.post('/admin', authorize('admin'), adminContactDetailsValidation, adminCreateContactDetails);

// PUT /api/contact-details/admin/:id - Update contact details for any user (admin only)
router.put('/admin/:id', authorize('admin'), adminUpdateContactDetailsValidation, adminUpdateContactDetails);

// DELETE /api/contact-details/admin/:id - Delete contact details for any user (admin only)
router.delete('/admin/:id', authorize('admin'), adminDeleteContactDetails);

export default router;
