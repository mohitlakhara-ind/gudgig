import { validationResult } from 'express-validator';
import Service from '../models/Service.js';
import User from '../models/User.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService.js';

// Helper function to validate service ownership
const validateServiceOwnership = async (serviceId, userId, userRole) => {
  const service = await Service.findById(serviceId);
  if (!service) {
    const error = new Error('Service not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Admin can access any service, freelancers can only access their own
  if (userRole !== 'admin' && service.createdBy.toString() !== userId.toString()) {
    const error = new Error('Not authorized to access this service');
    error.statusCode = 403;
    throw error;
  }
  
  return service;
};

// Create a new service (freelancers only)
export const createService = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Only freelancers can create services
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({
        success: false,
        message: 'Only freelancers can create services'
      });
    }

    const {
      title,
      description,
      category,
      subcategory,
      tags,
      packages,
      faq,
      requirements
    } = req.body;

    // Validate packages
    if (!packages || !packages.basic) {
      return res.status(400).json({
        success: false,
        message: 'Basic package is required'
      });
    }

    const service = await Service.create({
      title,
      description,
      category,
      subcategory,
      tags: Array.isArray(tags) ? tags : [],
      packages,
      faq: Array.isArray(faq) ? faq : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      createdBy: req.user._id,
      status: 'draft'
    });

    await service.populate('createdBy', 'name email');

    return res.status(201).json({
      success: true,
      data: service
    });
  } catch (err) {
    next(err);
  }
};

// Get all services with filtering and pagination
export const getServices = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subcategory,
      minPrice,
      maxPrice,
      search,
      sortBy = 'newest',
      featured
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10)));

    // Build filter
    const filter = { status: 'active', isDeleted: false };

    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (featured === 'true') filter.isFeatured = true;

    // Price range filter
    if (minPrice || maxPrice) {
      filter.startingPrice = {};
      if (minPrice) filter.startingPrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.startingPrice.$lte = parseFloat(maxPrice);
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'price-low':
        sort = { startingPrice: 1 };
        break;
      case 'price-high':
        sort = { startingPrice: -1 };
        break;
      case 'rating':
        sort = { 'rating.average': -1, 'rating.count': -1 };
        break;
      case 'popular':
        sort = { orderCount: -1, 'rating.average': -1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 };
        break;
    }

    // Add featured services to top if not specifically filtering
    if (!featured) {
      sort = { isFeatured: -1, ...sort };
    }

    const [services, total] = await Promise.all([
      Service.find(filter)
        .sort(sort)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .populate('createdBy', 'name email')
        .lean(),
      Service.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      count: services.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      data: services
    });
  } catch (err) {
    next(err);
  }
};

// Get single service by ID
export const getServiceById = async (req, res, next) => {
  try {
    const { serviceId } = req.params;

    const service = await Service.findById(serviceId)
      .populate('createdBy', 'name email')
      .lean();

    if (!service || service.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Increment impressions for active services
    if (service.status === 'active') {
      await Service.findByIdAndUpdate(serviceId, { $inc: { impressions: 1 } });
    }

    return res.status(200).json({
      success: true,
      data: service
    });
  } catch (err) {
    next(err);
  }
};

// Update service (owner or admin only)
export const updateService = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { serviceId } = req.params;
    const service = await validateServiceOwnership(serviceId, req.user._id, req.user.role);

    const allowedUpdates = [
      'title', 'description', 'category', 'subcategory', 'tags',
      'packages', 'faq', 'requirements', 'status'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Only admin can change featured status
    if (req.user.role === 'admin' && req.body.isFeatured !== undefined) {
      updates.isFeatured = req.body.isFeatured;
      if (req.body.featuredUntil) {
        updates.featuredUntil = new Date(req.body.featuredUntil);
      }
    }

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    return res.status(200).json({
      success: true,
      data: updatedService
    });
  } catch (err) {
    next(err);
  }
};

// Delete service (soft delete)
export const deleteService = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const service = await validateServiceOwnership(serviceId, req.user._id, req.user.role);

    await service.softDelete();

    return res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Get services by freelancer (my services)
export const getMyServices = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'newest'
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const filter = { 
      createdBy: req.user._id,
      isDeleted: false
    };

    if (status) filter.status = status;

    let sort = {};
    switch (sortBy) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'orders':
        sort = { orderCount: -1 };
        break;
      case 'rating':
        sort = { 'rating.average': -1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 };
        break;
    }

    const [services, total] = await Promise.all([
      Service.find(filter)
        .sort(sort)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Service.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      count: services.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      data: services
    });
  } catch (err) {
    next(err);
  }
};

// Upload service gallery images
export const uploadServiceGallery = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const service = await validateServiceOwnership(serviceId, req.user._id, req.user.role);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, {
        folder: `services/${serviceId}`,
        resource_type: 'auto'
      })
    );

    const uploadResults = await Promise.all(uploadPromises);

    const newImages = uploadResults.map(result => ({
      url: result.secure_url,
      publicId: result.public_id,
      alt: req.body.alt || service.title
    }));

    service.gallery.images.push(...newImages);
    await service.save();

    return res.status(200).json({
      success: true,
      data: {
        images: newImages,
        totalImages: service.gallery.images.length
      }
    });
  } catch (err) {
    next(err);
  }
};

// Delete service gallery image
export const deleteServiceGalleryImage = async (req, res, next) => {
  try {
    const { serviceId, imageId } = req.params;
    const service = await validateServiceOwnership(serviceId, req.user._id, req.user.role);

    const imageIndex = service.gallery.images.findIndex(
      img => img._id.toString() === imageId
    );

    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const image = service.gallery.images[imageIndex];

    // Delete from Cloudinary
    if (image.publicId) {
      await deleteFromCloudinary(image.publicId);
    }

    // Remove from service
    service.gallery.images.splice(imageIndex, 1);
    await service.save();

    return res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Get service analytics (owner or admin only)
export const getServiceAnalytics = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const service = await validateServiceOwnership(serviceId, req.user._id, req.user.role);

    const analytics = {
      impressions: service.impressions,
      clicks: service.clicks,
      ctr: service.ctr,
      orderCount: service.orderCount,
      rating: service.rating,
      // Add more analytics as needed
    };

    return res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Get all services with advanced filtering
export const adminGetServices = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const {
      page = 1,
      limit = 20,
      status,
      category,
      freelancerId,
      sortBy = 'newest'
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const filter = { isDeleted: false };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (freelancerId) filter.createdBy = freelancerId;

    let sort = {};
    switch (sortBy) {
      case 'orders':
        sort = { orderCount: -1 };
        break;
      case 'rating':
        sort = { 'rating.average': -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 };
        break;
    }

    const [services, total] = await Promise.all([
      Service.find(filter)
        .sort(sort)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .populate('createdBy', 'name email')
        .lean(),
      Service.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      count: services.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      data: services
    });
  } catch (err) {
    next(err);
  }
};

// Get service categories with counts
export const getServiceCategories = async (req, res, next) => {
  try {
    const categories = await Service.aggregate([
      { $match: { status: 'active', isDeleted: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      data: categories.map(cat => ({
        category: cat._id,
        count: cat.count
      }))
    });
  } catch (err) {
    next(err);
  }
};

