import { validationResult } from 'express-validator';
import Order from '../models/Order.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import { createPaymentIntent, confirmPaymentIntent, createEscrowPayment } from '../services/paymentService.js';
import notificationService from '../services/notificationService.js';

// Helper to decide when to expose contact details
const canExposeContacts = (order) => {
  const paymentStatus = order?.payment?.status;
  const orderStatus = order?.status;
  const paymentOk = ['held', 'released'].includes(paymentStatus);
  const orderOk = ['payment_confirmed', 'in_progress', 'delivered', 'revision_requested', 'completed'].includes(orderStatus);
  return paymentOk || orderOk;
};

// Compose contact details from buyer/seller profile if missing
const buildContactDetails = (order) => {
  const buyer = order?.buyerId || {};
  const seller = order?.sellerId || {};
  return {
    bidderContact: {
      name: buyer?.name || '',
      email: buyer?.email || '',
      phone: buyer?.phone || '',
      countryCode: buyer?.countryCode || '',
      company: buyer?.company || '',
      position: buyer?.position || ''
    },
    posterContact: {
      name: seller?.name || '',
      email: seller?.email || '',
      phone: seller?.phone || '',
      countryCode: seller?.countryCode || '',
      company: seller?.company || '',
      position: seller?.position || '',
      alternateContact: ''
    }
  };
};

// Helper function to validate order ownership
const validateOrderAccess = async (orderId, userId, userRole) => {
  const order = await Order.findById(orderId)
    .populate('serviceId', 'title')
    .populate('buyerId', 'name email')
    .populate('sellerId', 'name email');
    
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Admin can access any order, buyers/sellers can only access their own
  const hasAccess = userRole === 'admin' || 
                   order.buyerId._id.toString() === userId.toString() || 
                   order.sellerId._id.toString() === userId.toString();
  
  if (!hasAccess) {
    const error = new Error('Not authorized to access this order');
    error.statusCode = 403;
    throw error;
  }
  
  return order;
};

// Create a new order (purchase a service)
export const createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      serviceId,
      packageType,
      requirements,
      buyerInstructions,
      extras = [],
      paymentMethod = 'stripe',
      contactDetails
    } = req.body;

    // Get service details
    const service = await Service.findById(serviceId).populate('createdBy', 'name email');
    if (!service || service.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Service not found or not available'
      });
    }

    // Prevent self-purchase
    if (service.createdBy._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot purchase your own service'
      });
    }

    // Get package details
    const packageDetails = service.packages[packageType];
    if (!packageDetails) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package type'
      });
    }

    // Calculate pricing
    let totalAmount = packageDetails.price;
    const extrasTotal = extras.reduce((sum, extra) => sum + (extra.price || 0), 0);
    totalAmount += extrasTotal;

    // Calculate delivery date
    const baseDeliveryTime = packageDetails.deliveryTime;
    const extrasDeliveryTime = extras.reduce((max, extra) => 
      Math.max(max, extra.deliveryTime || 0), 0);
    const totalDeliveryTime = baseDeliveryTime + extrasDeliveryTime;
    
    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + totalDeliveryTime);

    // Create order
    const order = await Order.create({
      serviceId: service._id,
      packageType,
      buyerId: req.user._id,
      sellerId: service.createdBy._id,
      packageDetails: {
        title: packageDetails.title,
        description: packageDetails.description,
        price: packageDetails.price,
        deliveryTime: packageDetails.deliveryTime,
        revisions: packageDetails.revisions,
        features: packageDetails.features
      },
      extras,
      totalAmount,
      requirements,
      buyerInstructions,
      expectedDeliveryDate,
      // Store contact details if provided (will be shown after payment confirmed)
      ...(contactDetails ? { contactDetails } : {}),
      payment: {
        method: paymentMethod,
        status: 'pending'
      }
    });

    // Create escrow payment
    try {
      const paymentIntent = await createEscrowPayment({
        amount: totalAmount,
        currency: 'USD',
        orderId: order._id.toString(),
        buyerId: req.user._id.toString(),
        sellerId: service.createdBy._id.toString(),
        description: `Payment for ${service.title} - ${packageDetails.title}`
      });

      order.payment.paymentIntentId = paymentIntent.id;
      await order.save();

      // Add timeline event
      await order.addTimelineEvent(
        'order_placed',
        'Order has been placed and payment is being processed',
        req.user._id
      );

      // Send notifications
      await notificationService.sendNotification(
        service.createdBy._id,
        'order_placed',
        {
          buyerName: req.user.name,
          serviceName: service.title,
          orderNumber: order.orderNumber,
          amount: totalAmount
        },
        ['email', 'inApp']
      );

      return res.status(201).json({
        success: true,
        data: {
          order,
          paymentIntent: {
            id: paymentIntent.id,
            clientSecret: paymentIntent.client_secret
          }
        }
      });
    } catch (paymentError) {
      // Delete order if payment setup fails
      await Order.findByIdAndDelete(order._id);
      throw paymentError;
    }
  } catch (err) {
    next(err);
  }
};

// Confirm payment and start order
export const confirmPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { paymentIntentId } = req.body;

    const order = await validateOrderAccess(orderId, req.user._id, req.user.role);

    if (order.payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been processed'
      });
    }

    // Confirm payment with payment provider
    const paymentConfirmation = await confirmPaymentIntent(paymentIntentId);
    
    if (paymentConfirmation.status === 'succeeded') {
      order.payment.status = 'held'; // Money is held in escrow
      order.payment.paidAt = new Date();
      order.status = 'payment_confirmed';
      
      await order.save();

      // Add timeline event
      await order.addTimelineEvent(
        'payment_confirmed',
        'Payment confirmed and funds are held in escrow',
        req.user._id
      );

      // Notify seller
      await notificationService.sendNotification(
        order.sellerId._id,
        'payment_confirmed',
        {
          buyerName: order.buyerId.name,
          serviceName: order.serviceId.title,
          orderNumber: order.orderNumber,
          amount: order.totalAmount
        },
        ['email', 'inApp']
      );

      return res.status(200).json({
        success: true,
        data: order
      });
    } else {
      order.payment.status = 'failed';
      order.status = 'cancelled';
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Payment failed'
      });
    }
  } catch (err) {
    next(err);
  }
};

// Start working on order (seller only)
export const startOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await validateOrderAccess(orderId, req.user._id, req.user.role);

    // Only seller can start the order
    if (order.sellerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can start this order'
      });
    }

    if (order.status !== 'payment_confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be started in current status'
      });
    }

    order.status = 'in_progress';
    await order.save();

    await order.addTimelineEvent(
      'order_started',
      'Seller has started working on the order',
      req.user._id
    );

    await notificationService.sendNotification(
      order.buyerId._id,
      'order_started',
      {
        sellerName: order.sellerId.name,
        serviceName: order.serviceId.title,
        orderNumber: order.orderNumber
      },
      ['email', 'inApp']
    );

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// Deliver order (seller only)
export const deliverOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { orderId } = req.params;
    const { description, files = [] } = req.body;

    const order = await validateOrderAccess(orderId, req.user._id, req.user.role);

    // Only seller can deliver
    if (order.sellerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can deliver this order'
      });
    }

    if (!order.canDeliver()) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be delivered in current status'
      });
    }

    const deliverable = {
      files,
      description,
      deliveredAt: new Date(),
      isRevision: order.status === 'revision_requested',
      revisionNumber: order.deliverables.filter(d => d.isRevision).length
    };

    await order.markAsDelivered(deliverable);
    await notificationService.sendNotification(
      order.buyerId._id,
      'order_delivered',
      {
        sellerName: order.sellerId.name,
        serviceName: order.serviceId.title,
        orderNumber: order.orderNumber
      },
      ['email', 'inApp']
    );

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// Request revision (buyer only)
export const requestRevision = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { orderId } = req.params;
    const { description } = req.body;

    const order = await validateOrderAccess(orderId, req.user._id, req.user.role);

    // Only buyer can request revision
    if (order.buyerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the buyer can request revisions'
      });
    }

    if (!order.canRequestRevision()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot request revision for this order'
      });
    }

    const revisionData = {
      description,
      requestedBy: req.user._id,
      status: 'pending',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    };

    await order.requestRevision(revisionData);
    await notificationService.sendNotification(
      order.sellerId._id,
      'revision_requested',
      {
        buyerName: order.buyerId.name,
        serviceName: order.serviceId.title,
        orderNumber: order.orderNumber,
        revisionDescription: description
      },
      ['email', 'inApp']
    );

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// Complete order (buyer only)
export const completeOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await validateOrderAccess(orderId, req.user._id, req.user.role);

    // Only buyer can complete (or auto-completion)
    if (order.buyerId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the buyer can complete this order'
      });
    }

    if (!order.canComplete()) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be completed in current status'
      });
    }

    await order.completeOrder(req.user._id);
    
    // Update service order count
    await Service.findByIdAndUpdate(order.serviceId, { $inc: { orderCount: 1 } });

    await notificationService.sendNotification(
      order.sellerId._id,
      'order_completed',
      {
        buyerName: order.buyerId.name,
        serviceName: order.serviceId.title,
        orderNumber: order.orderNumber,
        earnings: order.sellerEarnings
      },
      ['email', 'inApp']
    );

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// Cancel order
export const cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await validateOrderAccess(orderId, req.user._id, req.user.role);

    if (!order.canCancel()) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled in current status'
      });
    }

    // Calculate refund amount based on order status
    let refundAmount = 0;
    if (order.status === 'pending_payment') {
      refundAmount = 0; // No payment made
    } else if (order.status === 'payment_confirmed') {
      refundAmount = order.totalAmount; // Full refund
    } else if (order.status === 'in_progress') {
      refundAmount = order.totalAmount * 0.8; // 80% refund
    }

    order.status = 'cancelled';
    order.cancellation = {
      reason,
      cancelledBy: req.user._id,
      cancelledAt: new Date(),
      refundAmount
    };

    if (refundAmount > 0) {
      order.payment.status = 'refunded';
      order.payment.refundedAt = new Date();
      order.payment.refundAmount = refundAmount;
    }

    await order.save();

    await order.addTimelineEvent(
      'order_cancelled',
      `Order cancelled: ${reason}`,
      req.user._id
    );

    // Notify the other party about cancellation
    const notifyUserId = req.user._id.toString() === order.buyerId._id.toString() 
      ? order.sellerId._id 
      : order.buyerId._id;
    
    await notificationService.sendNotification(
      notifyUserId,
      'order_cancelled',
      {
        userName: req.user.name,
        serviceName: order.serviceId.title,
        orderNumber: order.orderNumber,
        reason: reason,
        refundAmount: refundAmount
      },
      ['email', 'inApp']
    );

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// Get single order
export const getOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await validateOrderAccess(orderId, req.user._id, req.user.role);

    // Ensure contact details are present when allowed
    let payload = order.toObject();
    if (canExposeContacts(payload)) {
      if (!payload.contactDetails) {
        payload.contactDetails = buildContactDetails(payload);
      }
    } else {
      // Hide if not allowed
      payload.contactDetails = undefined;
    }

    return res.status(200).json({
      success: true,
      data: payload
    });
  } catch (err) {
    next(err);
  }
};

// Get user's orders
export const getUserOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      role = 'buyer', // 'buyer' or 'seller'
      sortBy = 'newest'
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const filter = {};
    
    // Set user role filter
    if (role === 'seller') {
      filter.sellerId = req.user._id;
    } else {
      filter.buyerId = req.user._id;
    }

    if (status) filter.status = status;

    let sort = {};
    switch (sortBy) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'amount-high':
        sort = { totalAmount: -1 };
        break;
      case 'amount-low':
        sort = { totalAmount: 1 };
        break;
      case 'deadline':
        sort = { expectedDeliveryDate: 1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 };
        break;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort(sort)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .populate('serviceId', 'title category')
        .populate('buyerId', 'name email phone countryCode company position')
        .populate('sellerId', 'name email phone countryCode company position')
        .lean(),
      Order.countDocuments(filter)
    ]);

    // Attach contact details conditionally
    const withContacts = orders.map((o) => {
      const order = { ...o };
      if (canExposeContacts(order)) {
        if (!order.contactDetails) {
          order.contactDetails = buildContactDetails(order);
        }
      } else {
        order.contactDetails = undefined;
      }
      return order;
    });

    return res.status(200).json({
      success: true,
      count: withContacts.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      data: withContacts
    });
  } catch (err) {
    next(err);
  }
};

// Get order analytics
export const getOrderAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case '90d':
        dateFilter = { createdAt: { $gte: new Date(now - 90 * 24 * 60 * 60 * 1000) } };
        break;
      case '1y':
        dateFilter = { createdAt: { $gte: new Date(now - 365 * 24 * 60 * 60 * 1000) } };
        break;
    }

    const userFilter = req.user.role === 'admin' ? {} : 
                      { $or: [{ buyerId: req.user._id }, { sellerId: req.user._id }] };

    const filter = { ...dateFilter, ...userFilter };

    const [
      totalOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      averageOrderValue,
      statusDistribution,
      recentOrders
    ] = await Promise.all([
      Order.countDocuments(filter),
      Order.countDocuments({ ...filter, status: 'completed' }),
      Order.countDocuments({ ...filter, status: 'cancelled' }),
      Order.aggregate([
        { $match: { ...filter, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$sellerEarnings' } } }
      ]),
      Order.aggregate([
        { $match: filter },
        { $group: { _id: null, average: { $avg: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Order.find(filter)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('serviceId', 'title')
        .populate('buyerId', 'name')
        .populate('sellerId', 'name')
    ]);

    const analytics = {
      totalOrders,
      completedOrders,
      cancelledOrders,
      completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
      totalRevenue: totalRevenue[0]?.total || 0,
      averageOrderValue: Math.round(averageOrderValue[0]?.average || 0),
      statusDistribution: statusDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentOrders
    };

    return res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Get all orders
export const adminGetOrders = async (req, res, next) => {
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
      buyerId,
      sellerId,
      serviceId,
      sortBy = 'newest'
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const filter = {};
    if (status) filter.status = status;
    if (buyerId) filter.buyerId = buyerId;
    if (sellerId) filter.sellerId = sellerId;
    if (serviceId) filter.serviceId = serviceId;

    let sort = {};
    switch (sortBy) {
      case 'amount':
        sort = { totalAmount: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 };
        break;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort(sort)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .populate('serviceId', 'title category')
        .populate('buyerId', 'name email')
        .populate('sellerId', 'name email'),
      Order.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

// Auto-complete orders (cron job function)
export const autoCompleteOrders = async () => {
  try {
    const ordersToComplete = await Order.findOrdersForAutoCompletion();
    
    for (const order of ordersToComplete) {
      await order.completeOrder(order.buyerId); // Auto-complete as buyer
      
      // Update service order count
      await Service.findByIdAndUpdate(order.serviceId, { $inc: { orderCount: 1 } });
      
      console.log(`Auto-completed order ${order.orderNumber}`);
    }
    
    return ordersToComplete.length;
  } catch (error) {
    console.error('Error in auto-complete orders:', error);
    throw error;
  }
};
