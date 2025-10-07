import { validationResult } from 'express-validator';
import AdminSettings from '../models/AdminSettings.js';

const SETTINGS_KEY = 'gm-config';

async function getOrCreateSettings() {
  let settings = await AdminSettings.findOne({ key: SETTINGS_KEY });
  if (!settings) {
    settings = await AdminSettings.create({ key: SETTINGS_KEY });
  }
  return settings;
}

export const getSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    return res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const settings = await getOrCreateSettings();

    const updatable = [
      'bidFeesEnabled',
      'bidFeeOptions',
      'currentBidFee',
      'minimumBidFeePaise',
      'maximumBidFeePaise',
      'paymentProvider',
      'razorpayKeyId',
      'razorpayKeySecret',
      'currency',
      'refundPolicy'
    ];

    for (const key of updatable) {
      if (req.body[key] !== undefined) {
        settings[key] = req.body[key];
      }
    }

    // Ensure currentBidFee is one of the options
    if (settings.currentBidFee && Array.isArray(settings.bidFeeOptions) && !settings.bidFeeOptions.includes(settings.currentBidFee)) {
      return res.status(400).json({ success: false, message: 'currentBidFee must be one of bidFeeOptions' });
    }

    await settings.save();
    return res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

export const getBidFees = async (req, res, next) => {
  try {
    const s = await getOrCreateSettings();
    return res.status(200).json({ success: true, data: { bidFeeOptions: s.bidFeeOptions, currentBidFee: s.currentBidFee } });
  } catch (err) {
    next(err);
  }
};

export const setBidFees = async (req, res, next) => {
  try {
    const { fees, active } = req.body;
    if (!Array.isArray(fees) || fees.length === 0 || fees.some(f => typeof f !== 'number' || f <= 0)) {
      return res.status(400).json({ success: false, message: 'fees must be an array of positive numbers' });
    }
    if (active !== undefined && !fees.includes(active)) {
      return res.status(400).json({ success: false, message: 'active must be one of fees' });
    }
    const s = await getOrCreateSettings();
    s.bidFeeOptions = fees;
    if (active !== undefined) s.currentBidFee = active;
    await s.save();
    return res.status(200).json({ success: true, data: { bidFeeOptions: s.bidFeeOptions, currentBidFee: s.currentBidFee } });
  } catch (err) {
    next(err);
  }
};


