import ContactDetails from '../models/ContactDetails.js';
import { validationResult } from 'express-validator';

// @desc    Get all contact details for current user
// @route   GET /api/contact-details
// @access  Private
export const getContactDetails = async (req, res, next) => {
  try {
    const contactDetails = await ContactDetails.find({ 
      userId: req.user.id, 
      isActive: true 
    }).sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: contactDetails
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new contact details
// @route   POST /api/contact-details
// @access  Private
export const createContactDetails = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, phone, countryCode, company, position, notes, isDefault } = req.body;

    // Check if email already exists for this user
    const existingContact = await ContactDetails.findOne({ 
      userId: req.user.id, 
      email: email.toLowerCase(),
      isActive: true
    });

    if (existingContact) {
      return res.status(400).json({
        success: false,
        message: 'Contact with this email already exists'
      });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await ContactDetails.updateMany(
        { userId: req.user.id },
        { isDefault: false }
      );
    }

    const contactDetails = await ContactDetails.create({
      userId: req.user.id,
      name,
      email: email.toLowerCase(),
      phone,
      countryCode,
      company,
      position,
      notes,
      isDefault: isDefault || false
    });

    res.status(201).json({
      success: true,
      message: 'Contact details created successfully',
      data: contactDetails
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact details
// @route   PUT /api/contact-details/:id
// @access  Private
export const updateContactDetails = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if contact exists and belongs to user
    const contactDetails = await ContactDetails.findOne({ 
      _id: id, 
      userId: req.user.id,
      isActive: true
    });

    if (!contactDetails) {
      return res.status(404).json({
        success: false,
        message: 'Contact details not found'
      });
    }

    // If email is being updated, check for duplicates
    if (updateData.email && updateData.email !== contactDetails.email) {
      const existingContact = await ContactDetails.findOne({ 
        userId: req.user.id, 
        email: updateData.email.toLowerCase(),
        _id: { $ne: id },
        isActive: true
      });

      if (existingContact) {
        return res.status(400).json({
          success: false,
          message: 'Contact with this email already exists'
        });
      }
      updateData.email = updateData.email.toLowerCase();
    }

    // If setting as default, unset other defaults
    if (updateData.isDefault) {
      await ContactDetails.updateMany(
        { userId: req.user.id, _id: { $ne: id } },
        { isDefault: false }
      );
    }

    const updatedContact = await ContactDetails.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Contact details updated successfully',
      data: updatedContact
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete contact details
// @route   DELETE /api/contact-details/:id
// @access  Private
export const deleteContactDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if contact exists and belongs to user
    const contactDetails = await ContactDetails.findOne({ 
      _id: id, 
      userId: req.user.id,
      isActive: true
    });

    if (!contactDetails) {
      return res.status(404).json({
        success: false,
        message: 'Contact details not found'
      });
    }

    // Soft delete by setting isActive to false
    await ContactDetails.findByIdAndUpdate(id, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Contact details deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set contact as default
// @route   PATCH /api/contact-details/:id/default
// @access  Private
export const setDefaultContactDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if contact exists and belongs to user
    const contactDetails = await ContactDetails.findOne({ 
      _id: id, 
      userId: req.user.id,
      isActive: true
    });

    if (!contactDetails) {
      return res.status(404).json({
        success: false,
        message: 'Contact details not found'
      });
    }

    // Unset all other defaults
    await ContactDetails.updateMany(
      { userId: req.user.id },
      { isDefault: false }
    );

    // Set this contact as default
    const updatedContact = await ContactDetails.findByIdAndUpdate(
      id,
      { isDefault: true },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Default contact updated successfully',
      data: updatedContact
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contact details (admin only)
// @route   GET /api/contact-details/admin/all
// @access  Private (Admin)
export const getAllContactDetails = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { page = 1, limit = 10, userId, search } = req.query;
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    // Build filter
    const filter = { isActive: true };
    if (userId) {
      filter.userId = userId;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const [contactDetails, total] = await Promise.all([
      ContactDetails.find(filter)
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),
      ContactDetails.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: contactDetails,
      pagination: {
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
        total,
        limit: pageSize
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create contact details for any user (admin only)
// @route   POST /api/contact-details/admin
// @access  Private (Admin)
export const adminCreateContactDetails = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { userId, name, email, phone, countryCode, company, position, notes, isDefault } = req.body;

    // Check if user exists
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email already exists for this user
    const existingContact = await ContactDetails.findOne({ 
      userId, 
      email: email.toLowerCase(),
      isActive: true
    });

    if (existingContact) {
      return res.status(400).json({
        success: false,
        message: 'Contact with this email already exists for this user'
      });
    }

    // If this is set as default, unset other defaults for this user
    if (isDefault) {
      await ContactDetails.updateMany(
        { userId },
        { isDefault: false }
      );
    }

    const contactDetails = await ContactDetails.create({
      userId,
      name,
      email: email.toLowerCase(),
      phone,
      countryCode,
      company,
      position,
      notes,
      isDefault: isDefault || false
    });

    // Populate user data
    await contactDetails.populate('userId', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Contact details created successfully',
      data: contactDetails
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact details for any user (admin only)
// @route   PUT /api/contact-details/admin/:id
// @access  Private (Admin)
export const adminUpdateContactDetails = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if contact exists
    const contactDetails = await ContactDetails.findById(id);
    if (!contactDetails) {
      return res.status(404).json({
        success: false,
        message: 'Contact details not found'
      });
    }

    // If email is being updated, check for duplicates
    if (updateData.email && updateData.email !== contactDetails.email) {
      const existingContact = await ContactDetails.findOne({ 
        userId: contactDetails.userId, 
        email: updateData.email.toLowerCase(),
        _id: { $ne: id },
        isActive: true
      });

      if (existingContact) {
        return res.status(400).json({
          success: false,
          message: 'Contact with this email already exists for this user'
        });
      }
      updateData.email = updateData.email.toLowerCase();
    }

    // If setting as default, unset other defaults for this user
    if (updateData.isDefault) {
      await ContactDetails.updateMany(
        { userId: contactDetails.userId, _id: { $ne: id } },
        { isDefault: false }
      );
    }

    const updatedContact = await ContactDetails.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Contact details updated successfully',
      data: updatedContact
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete contact details for any user (admin only)
// @route   DELETE /api/contact-details/admin/:id
// @access  Private (Admin)
export const adminDeleteContactDetails = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { id } = req.params;

    // Check if contact exists
    const contactDetails = await ContactDetails.findById(id);
    if (!contactDetails) {
      return res.status(404).json({
        success: false,
        message: 'Contact details not found'
      });
    }

    // Soft delete by setting isActive to false
    await ContactDetails.findByIdAndUpdate(id, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Contact details deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
