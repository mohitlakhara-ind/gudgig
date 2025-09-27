import { validationResult } from 'express-validator';
import Order from '../models/Order.js';
import Service from '../models/Service.js';

// POST /api/orders
export const createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { serviceId, packageName, requirementsAnswers } = req.body;

    const service = await Service.findById(serviceId).populate('seller', 'name');
    if (!service || service.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Service not available' });
    }

    const selected = service.packages.find(p => p.name === packageName);
    if (!selected) {
      return res.status(400).json({ success: false, message: 'Invalid package selected' });
    }

    const order = await Order.create({
      buyer: req.user.id,
      seller: service.seller,
      service: service._id,
      package: {
        name: selected.name,
        price: selected.price,
        deliveryTimeDays: selected.deliveryTimeDays,
        revisions: selected.revisions,
        features: selected.features || []
      },
      status: 'pending',
      milestones: [],
      requirementsAnswers: requirementsAnswers || [],
      payment: {
        amount: selected.price,
        currency: 'USD',
        status: 'pending'
      }
    });

    // Update analytics
    service.analytics.orders += 1;
    await service.save();

    res.status(201).json({ success: true, message: 'Order created', data: order });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders
export const getOrders = async (req, res, next) => {
  try {
    const { role, status } = req.query;
    const filter = {};
    if (role === 'buyer') filter.buyer = req.user._id;
    else if (role === 'seller') filter.seller = req.user._id;
    else filter.$or = [{ buyer: req.user._id }, { seller: req.user._id }];
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('buyer', 'name avatar')
      .populate('seller', 'name avatar')
      .populate('service', 'title startingPrice');

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name avatar')
      .populate('seller', 'name avatar')
      .populate('service', 'title startingPrice');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.buyer.toString() !== req.user.id && order.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed'];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    let order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Role-based transitions
    const isBuyer = order.buyer.toString() === req.user.id;
    const isSeller = order.seller.toString() === req.user.id;
    if (!isBuyer && !isSeller && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    order.status = status;
    order.timeline.push({ event: 'status_change', data: { status }, createdAt: new Date() });
    await order.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${order.buyer.toString()}`).emit('order:updated', { id: order._id.toString(), status });
      io.to(`user:${order.seller.toString()}`).emit('order:updated', { id: order._id.toString(), status });
    }

    res.status(200).json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    next(error);
  }
};

// POST /api/orders/:id/deliver
export const deliverOrder = async (req, res, next) => {
  try {
    const { message, files = [] } = req.body;
    let order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only seller can deliver' });
    }
    order.delivery = {
      message: message || '',
      files,
      deliveredAt: new Date()
    };
    order.status = 'delivered';
    order.timeline.push({ event: 'delivered', data: { filesCount: files.length }, createdAt: new Date() });
    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${order.buyer.toString()}`).emit('order:delivered', { id: order._id.toString() });
    }

    res.status(200).json({ success: true, message: 'Order delivered', data: order });
  } catch (error) {
    next(error);
  }
};


