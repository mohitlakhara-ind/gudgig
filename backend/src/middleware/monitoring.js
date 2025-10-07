import os from 'os';
import { performance, monitorEventLoopDelay } from 'perf_hooks';
import * as Sentry from '@sentry/node';
import logger from '../utils/logger.js';
import metricsService from '../services/metricsService.js';

export const performanceMonitoring = (req, res, next) => {
  const start = Date.now();
  try { metricsService.recordPageView(req); } catch (_) {}
  // Mark request start early
  res.setHeader('X-Response-Time-Start', String(start));

  // Inject response time header right before headers are written
  const originalWriteHead = res.writeHead;
  res.writeHead = function(...args) {
    try {
      const durationMs = Date.now() - start;
      // Safe to set before headers are sent
      res.setHeader('X-Response-Time', `${durationMs}ms`);
    } catch (_) {}
    return originalWriteHead.apply(this, args);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('request_completed', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      requestId: req.id
    });
  });
  next();
};

export const errorTracking = (err, req, res, next) => {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err, {
      tags: { route: req.originalUrl },
      extra: { method: req.method }
    });
  }
  logger.error('error_tracked', { message: err?.message, stack: err?.stack });
  try { metricsService.incrementErrorCount(); } catch (_) {}
  next(err);
};

export const healthCheck = (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Job Portal Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
};

export const getMetrics = (req, res) => {
  const mem = process.memoryUsage();
  const cpu = process.cpuUsage();
  const loadAvg = os.loadavg();
  const eventLoop = monitorEventLoopDelay({ resolution: 10 });
  eventLoop.enable();
  setTimeout(() => {
    eventLoop.disable();
    res.status(200).json({
      uptime: process.uptime(),
      memoryUsage: mem,
      cpuUser: cpu.user,
      cpuSystem: cpu.system,
      loadAverage: { '1m': loadAvg[0], '5m': loadAvg[1], '15m': loadAvg[2] },
      eventLoopDelay: {
        mean: eventLoop.mean / 1e6,
        max: eventLoop.max / 1e6,
        stddev: eventLoop.stddev / 1e6
      },
      timestamp: new Date().toISOString()
    });
  }, 50);
};