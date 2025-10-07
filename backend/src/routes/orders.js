import express from 'express';
import { body, param, query } from 'express-validator';
import {
  createOrder,
  confirmPayment,
  startOrder,
  deliverOrder,
  requestRevision,
  completeOrder,
  cancelOrder,
  getOrder,
  getUserOrders,
  getOrderAnalytics,
  adminGetOrders
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const createOrderValidation = [
  body('serviceId')
    .isMongoId()
    .withMessage('Valid service ID is required'),
  body('packageType')
    .isIn(['basic', 'standard', 'premium'])
    .withMessage('Package type must be basic, standard, or premium'),
  body('requirements')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Requirements cannot exceed 2000 characters'),
  body('buyerInstructions')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Instructions cannot exceed 1000 characters'),
  body('paymentMethod')
    .optional()
    .isIn(['stripe', 'paypal', 'razorpay'])
    .withMessage('Invalid payment method')
];

const deliverOrderValidation = [
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Delivery description must be between 10 and 1000 characters'),
  body('files')
    .optional()
    .isArray()
    .withMessage('Files must be an array')
];

const revisionValidation = [
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Revision description must be between 10 and 1000 characters')
];

const cancelOrderValidation = [
  body('reason')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Cancellation reason must be between 5 and 500 characters')
];

// Protected routes
router.use(protect);

// Create new order
router.post('/',
  createOrderValidation,
  createOrder
);

// Confirm payment for order
router.post('/:orderId/confirm-payment',
  param('orderId').isMongoId().withMessage('Invalid order ID'),
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
  confirmPayment
);

// Start order (seller only)
router.post('/:orderId/start',
  param('orderId').isMongoId().withMessage('Invalid order ID'),
  startOrder
);

// Deliver order (seller only)
router.post('/:orderId/deliver',
  param('orderId').isMongoId().withMessage('Invalid order ID'),
  deliverOrderValidation,
  deliverOrder
);

// Alternative route for updating order status
router.put('/:orderId/status',
  param('orderId').isMongoId().withMessage('Invalid order ID'),
  body('status').notEmpty().withMessage('Status is required'),
  deliverOrder
);

// Request revision (buyer only)
router.post('/:orderId/revision',
  param('orderId').isMongoId().withMessage('Invalid order ID'),
  revisionValidation,
  requestRevision
);

// Complete order (buyer only)
router.post('/:orderId/complete',
  param('orderId').isMongoId().withMessage('Invalid order ID'),
  completeOrder
);

// Accept delivery (buyer only) - alternative route
router.post('/:orderId/accept',
  param('orderId').isMongoId().withMessage('Invalid order ID'),
  completeOrder
);

// Cancel order
router.post('/:orderId/cancel',
  param('orderId').isMongoId().withMessage('Invalid order ID'),
  cancelOrderValidation,
  cancelOrder
);

// Get single order
router.get('/:orderId',
  param('orderId').isMongoId().withMessage('Invalid order ID'),
  getOrder
);

// Get user's orders
router.get('/',
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn([
    'pending_payment', 'payment_confirmed', 'in_progress', 'delivered',
    'revision_requested', 'completed', 'cancelled', 'disputed', 'refunded'
  ]).withMessage('Invalid status'),
  query('role').optional().isIn(['buyer', 'seller']).withMessage('Role must be buyer or seller'),
  query('sortBy').optional().isIn(['newest', 'oldest', 'amount-high', 'amount-low', 'deadline'])
    .withMessage('Invalid sort option'),
  getUserOrders
);

// Get order analytics
router.get('/analytics/stats',
  query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period'),
  getOrderAnalytics
);

// Admin routes
router.get('/admin/all',
  authorize('admin'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn([
    'pending_payment', 'payment_confirmed', 'in_progress', 'delivered',
    'revision_requested', 'completed', 'cancelled', 'disputed', 'refunded'
  ]).withMessage('Invalid status'),
  query('buyerId').optional().isMongoId().withMessage('Invalid buyer ID'),
  query('sellerId').optional().isMongoId().withMessage('Invalid seller ID'),
  query('serviceId').optional().isMongoId().withMessage('Invalid service ID'),
  query('sortBy').optional().isIn(['newest', 'oldest', 'amount']).withMessage('Invalid sort option'),
  adminGetOrders
);

export default router;

