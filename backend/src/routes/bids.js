import express from 'express';
import { body } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import { submitBid, getMyBids, getGigContactDetails } from '../controllers/gmController.js';

const router = express.Router();

router.post('/', protect, authorize('freelancer'), [
  body('gigId').isMongoId(),
  body('quotation').optional().isString().isLength({ max: 2000 }),
  body('proposal').optional().isString().isLength({ max: 5000 }),
  body('bidFeePaid').isFloat({ gt: 0 }),
  body('contactDetails').optional().isObject(),
  body('contactDetails.bidderContact').optional().isObject(),
  body('contactDetails.bidderContact.name').optional().isString().isLength({ min: 2, max: 100 }),
  body('contactDetails.bidderContact.email').optional().isEmail(),
  body('contactDetails.bidderContact.phone').optional().isString(),
  body('contactDetails.bidderContact.countryCode').optional().isString().isLength({ min: 1, max: 3 }),
  body('contactDetails.bidderContact.company').optional().isString().isLength({ max: 100 }),
  body('contactDetails.bidderContact.position').optional().isString().isLength({ max: 100 }),
  body('contactDetails.posterContact').optional().isObject(),
  body('contactDetails.posterContact.name').optional().isString().isLength({ min: 2, max: 100 }),
  body('contactDetails.posterContact.email').optional().isEmail(),
  body('contactDetails.posterContact.phone').optional().isString(),
  body('contactDetails.posterContact.countryCode').optional().isString().isLength({ min: 1, max: 3 }),
  body('contactDetails.posterContact.company').optional().isString().isLength({ max: 100 }),
  body('contactDetails.posterContact.position').optional().isString().isLength({ max: 100 }),
  body('contactDetails.posterContact.alternateContact').optional().isString().isLength({ max: 100 })
], submitBid);

router.get('/my', protect, authorize('freelancer'), getMyBids);
router.get('/:gigId/contacts', protect, authorize('freelancer'), getGigContactDetails);

export default router;


