import { validationResult } from 'express-validator';
import Service from '../models/Service.js';

// GET /api/services
export const getServices = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      subcategory,
      minPrice,
      maxPrice,
      deliveryMax,
      sellerLevel,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = { status: 'active' };

    if (search) {
      query.$text = { $search: search };
    }
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (featured !== undefined) query.featured = featured === 'true';

    if (minPrice || maxPrice) {
      query.startingPrice = {};
      if (minPrice) query.startingPrice.$gte = parseInt(minPrice);
      if (maxPrice) query.startingPrice.$lte = parseInt(maxPrice);
    }
    if (deliveryMax) {
      query.averageDeliveryDays = { $lte: parseInt(deliveryMax) };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    sortOptions.featured = -1;
    sortOptions['rating.average'] = -1;

    const services = await Service.find(query)
      .populate('seller', 'name avatar email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Service.countDocuments(query);

    res.status(200).json({
      success: true,
      count: services.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      },
      data: services
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/services/:id
export const getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('seller', 'name avatar bio');

    if (!service || service.status === 'deleted') {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Increment analytics impressions for detail views as a simple metric
    service.analytics.clicks += 1;
    await service.save();

    res.status(200).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id/services
export const getServicesByUser = async (req, res, next) => {
  try {
    const services = await Service.find({ seller: req.params.id, status: { $ne: 'deleted' } })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (error) {
    next(error);
  }
};

// POST /api/services
export const createService = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { title } = req.body;
    const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    const startingPrice = Array.isArray(req.body.packages) && req.body.packages.length > 0
      ? Math.min(...req.body.packages.map(p => p.price))
      : req.body.startingPrice;

    const averageDeliveryDays = Array.isArray(req.body.packages) && req.body.packages.length > 0
      ? Math.round(req.body.packages.reduce((sum, p) => sum + (p.deliveryTimeDays || 0), 0) / req.body.packages.length)
      : req.body.averageDeliveryDays || 3;

    const service = await Service.create({
      ...req.body,
      slug,
      seller: req.user.id,
      startingPrice,
      averageDeliveryDays,
      status: req.body.status || 'draft'
    });

    res.status(201).json({ success: true, message: 'Service created successfully', data: service });
  } catch (error) {
    next(error);
  }
};

// PUT /api/services/:id
export const updateService = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    let service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (service.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this service' });
    }

    // Recompute derived fields if packages updated
    if (req.body.packages && Array.isArray(req.body.packages) && req.body.packages.length > 0) {
      req.body.startingPrice = Math.min(...req.body.packages.map(p => p.price));
      req.body.averageDeliveryDays = Math.round(req.body.packages.reduce((sum, p) => sum + (p.deliveryTimeDays || 0), 0) / req.body.packages.length);
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: 'Service updated successfully', data: service });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/services/:id
export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    if (service.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this service' });
    }
    service.status = 'deleted';
    await service.save();
    res.status(200).json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// PUT /api/services/:id/status
export const updateServiceStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['draft', 'active', 'paused', 'denied'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    if (service.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update status' });
    }

    service.status = status;
    await service.save();
    res.status(200).json({ success: true, message: 'Status updated', data: service });
  } catch (error) {
    next(error);
  }
};

// GET /api/services/stats/overview
export const getServiceStats = async (req, res, next) => {
  try {
    const match = req.user.role === 'admin' ? {} : { seller: req.user._id };
    const stats = await Service.aggregate([
      { $match: match },
      { $group: {
        _id: null,
        totalServices: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        paused: { $sum: { $cond: [{ $eq: ['$status', 'paused'] }, 1, 0] } },
        denied: { $sum: { $cond: [{ $eq: ['$status', 'denied'] }, 1, 0] } },
        featured: { $sum: { $cond: [{ $eq: ['$featured', true] }, 1, 0] } },
        totalImpressions: { $sum: '$analytics.impressions' },
        totalClicks: { $sum: '$analytics.clicks' },
        totalOrders: { $sum: '$analytics.orders' },
        averageRating: { $avg: '$rating.average' }
      }}
    ]);

    res.status(200).json({ success: true, data: stats[0] || {} });
  } catch (error) {
    next(error);
  }
};


