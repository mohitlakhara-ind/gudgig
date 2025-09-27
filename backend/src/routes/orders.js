import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  deliverOrder
} from '../controllers/orderController.js';

const router = express.Router();

router.use(protect);

router.post('/', [
  body('serviceId').isString().notEmpty(),
  body('packageName').isIn(['Basic', 'Standard', 'Premium'])
], createOrder);

router.get('/', getOrders);
router.get('/:id', getOrder);
router.put('/:id/status', body('status').isString().notEmpty(), updateOrderStatus);
router.post('/:id/deliver', deliverOrder);

export default router;


