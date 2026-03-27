import express from 'express';
import mongoose from 'mongoose';
import os from 'os';
import { v2 as cloudinary } from 'cloudinary';
import notificationService from '../services/notificationService.js';

const router = express.Router();

/**
 * @route   GET /api/system/health
 * @desc    Get detailed system health report
 * @access  Public (should be protected in a strict app, but useful for public debugging)
 */
router.get('/health', async (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'down',
      cloudinary: 'unconfigured',
      smtp: 'unknown'
    },
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      load: os.loadavg(),
      platform: os.platform(),
      nodeVersion: process.version
    }
  };

  // 1. Check Database
  try {
    const dbStatus = mongoose.connection.readyState;
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    healthData.services.database = states[dbStatus] || 'unknown';
    if (dbStatus !== 1) {
      healthData.status = 'degraded';
    }
  } catch (err) {
    healthData.services.database = 'error';
    healthData.status = 'degraded';
  }

  // 2. Check Cloudinary
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      // Basic check: we could do a ping, but a presence of config is a good start
      healthData.services.cloudinary = 'configured';
    }
  } catch (err) {
    healthData.services.cloudinary = 'error';
  }

  // 3. Check SMTP (Email)
  try {
    // Note: this might take time if the SMTP server is slow
    const smtpVerified = await notificationService.verifySMTP();
    healthData.services.smtp = smtpVerified ? 'connected' : 'failed';
    if (!smtpVerified) {
      healthData.status = 'degraded';
    }
  } catch (err) {
    healthData.services.smtp = 'error';
  }

  // Determine final status
  if (healthData.services.database !== 'connected') {
    healthData.status = 'down';
    return res.status(503).json(healthData);
  }

  res.status(healthData.status === 'healthy' ? 200 : 207).json(healthData);
});

export default router;
