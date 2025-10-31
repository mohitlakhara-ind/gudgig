import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import notificationService from './services/notificationService.js';
import automationService from './services/automationService.js';
import * as Sentry from '@sentry/node';
import logger from './utils/logger.js';
import { securityHeaders } from './middleware/security.js';

// Import local modules
import connectDB from './config/database.js';
import { env } from './config/env.js';
import { etag, setCacheHeaders, getCacheStats, clearCache } from './middleware/caching.js';
import { performanceMonitoring, errorTracking, healthCheck, getMetrics } from './middleware/monitoring.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import jobsRoutes from './routes/jobs.js';
import gigsRoutes from './routes/gigs.js';
import bidsRoutes from './routes/bids.js';
import adminBidFeesRoutes from './routes/admin-bid-fees.js';
import adminSettingsRoutes from './routes/admin-settings.js';
import adminBidsRoutes from './routes/admin-bids.js';
import adminRoutes from './routes/admin.js';
import serviceRoutes from './routes/services.js';
import orderRoutes from './routes/orders.js';
import reviewRoutes from './routes/reviews.js';
import freelancerProfileRoutes from './routes/freelancer-profiles.js';
import notificationRoutes from './routes/notifications.js';
import applicationRoutes from './routes/applications.js';
import appApiRoutes from './routes/app-api.js';
import userRoutes from './routes/users.js';
import savedJobsRoutes from './routes/saved-jobs.js';
import savedGigsRoutes from './routes/saved-gigs.js';
import paymentsRoutes from './routes/payments.js';
import userGigsRoutes from './routes/user-gigs.js';
import supportRoutes from './routes/support.js';
import uploadsRoutes from './routes/uploads.js';
import analyticsRoutes from './routes/analytics.js';
import contactDetailsRoutes from './routes/contactDetails.js';
import requestId from './middleware/requestId.js';

// Load environment variables
dotenv.config();

// Sentry init (error tracking + APM) with optional profiling
if (process.env.SENTRY_DSN) {
  (async () => {
    const integrations = [];
    try {
      if (process.env.SENTRY_ENABLE_PROFILING !== 'false') {
        const profiling = await import('@sentry/profiling-node');
        if (profiling?.nodeProfilingIntegration) {
          integrations.push(profiling.nodeProfilingIntegration());
        }
      }
    } catch (e) {
      // Profiling not available on this platform/runtime; continue without it
      logger?.warn && logger.warn('sentry_profiling_unavailable', { error: e?.message });
    }

    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      integrations,
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
      profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),
    });
  })();
}

const app = express();
const server = createServer(app);
// Configure Node.js HTTP server timeouts to prevent premature disconnects
// KeepAlive must be lower than headers timeout; requestTimeout controls overall request duration
server.keepAliveTimeout = 61000; // 61s
server.headersTimeout = 65000; // 65s
server.requestTimeout = 120000; // 120s overall per request
// Harden Express defaults
app.disable('x-powered-by');
app.enable('trust proxy');

// Attach request ID
app.use(requestId);

// Sentry request handler (error tracking + APM)
if (process.env.SENTRY_DSN) {
  // Request handler must be the first middleware on the app
  // Includes tracing for performance monitoring
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// Trust proxy for correct protocol detection (needed behind reverse proxies)
app.set('trust proxy', 1);

// Validate JWT secrets strength in production
const validateSecret = (name, value) => {
  if (!value || value.length < 32) {
    const msg = `[security] ${name} is missing or too short. Use a random 32+ character string.`;
    if (process.env.NODE_ENV === 'production') {
      logger.error(msg);
      process.exit(1);
    } else {
      logger.warn(msg);
    }
  }
};
validateSecret('JWT_SECRET', env.jwtSecret);
validateSecret('REFRESH_TOKEN_SECRET', env.refreshSecret);

// Socket.io setup with broader CORS (supports 3000 and 3001 in dev)
const allowedOrigins = [
  env.clientUrl || 'http://localhost:3000',
  process.env.CLIENT_URL,
  'http://localhost:3001'
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  // Increase ping timeouts to reduce false disconnects on slow networks
  pingInterval: 20000, // 20s
  pingTimeout: 25000 // 25s
});

// Connect to MongoDB (skip in tests)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Initialize Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  logger.info('[cloudinary] Initialized successfully');
} else {
  logger.warn('[cloudinary] Missing credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
}

// Security middleware
app.use(helmet());
app.use(securityHeaders);

// Enforce HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const proto = (req.headers['x-forwarded-proto'] || req.protocol);
    if (proto !== 'https') {
      const host = req.headers.host;
      return res.redirect(301, `https://${host}${req.originalUrl}`);
    }
  }
  next();
});

// CORS configuration (allow dev ports)
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
// Need to support Stripe webhook raw body on a specific route; use conditional raw parser
app.use((req, res, next) => {
  if (req.originalUrl === '/api/billing/stripe/webhook') {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  // More detailed performance monitoring in dev
  app.use(performanceMonitoring);
} else {
  app.use(morgan('combined'));
}

// Health and diagnostics endpoints
app.get('/health', healthCheck);

const adminToken = process.env.ADMIN_DASHBOARD_TOKEN;
const adminOnly = (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') return next();
  if (!adminToken) {
    return res.status(404).json({ message: 'Not found' });
  }
  const token = req.headers['x-admin-token'] || req.query.token;
  if (token !== adminToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// Protect diagnostics in production
app.get('/metrics', adminOnly, getMetrics);
app.get('/ready', adminOnly, (req, res) => {
  res.status(200).json({ ready: true, timestamp: new Date().toISOString() });
});
app.get('/dashboard/health', adminOnly, async (req, res) => {
  try {
    const metrics = await (async () => new Promise((resolve) => {
      const fakeRes = { status: () => ({ json: (data) => resolve(data) }) };
      getMetrics(req, fakeRes);
    }))();
    res.status(200).json({
      status: 'OK',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      metrics
    });
  } catch (e) {
    logger.error('dashboard_health_error', { error: e?.message });
    res.status(500).json({ status: 'ERROR' });
  }
});

// API Routes
app.use(etag);
app.use(setCacheHeaders(60));

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/gigs', gigsRoutes);
app.use('/api/bids', bidsRoutes);
app.use('/api/admin/bid-fees', adminBidFeesRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/admin/bids', adminBidsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/freelancer-profiles', freelancerProfileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/saved-jobs', savedJobsRoutes);
app.use('/api/saved-gigs', savedGigsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/user/gigs', userGigsRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/contact-details', contactDetailsRoutes);
app.use('/app-api', appApiRoutes);

// Cache debugging endpoints
app.get('/cache/stats', getCacheStats);
app.delete('/cache/clear', clearCache);

// Socket.io connection handling with authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    // Verify JWT token
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const User = (await import('./models/User.js')).default;
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user._id.toString();
    socket.userRole = user.role;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  logger.info('socket_connected', { socketId: socket.id, userId: socket.userId });

  // Join user to their personal room
  socket.join(`user:${socket.userId}`);
  
  // Join role-based rooms
  socket.join(`role:${socket.userRole}`);

  // Handle user joining specific rooms
  socket.on('join', (data) => {
    if (typeof data === 'string') {
      // Handle string room ID (legacy support)
      socket.join(data);
      logger.debug('socket_join_room', { userId: socket.userId, room: data });
    } else if (typeof data === 'object' && data !== null) {
      // Handle object with userId and role
      if (data.userId) {
        socket.join(`user:${data.userId}`);
        logger.debug('socket_join_user_room', { userId: socket.userId, target: data.userId });
      }
      if (data.role) {
        socket.join(`role:${data.role}`);
        logger.debug('socket_join_role_room', { userId: socket.userId, role: data.role });
      }
    }
  });

  // Handle leaving rooms
  socket.on('leave', (roomId) => {
    socket.leave(roomId);
    logger.debug('socket_left_room', { userId: socket.userId, room: roomId });
  });

  // Handle notification events
  socket.on('notification:read', async (notificationId) => {
    try {
      const Notification = (await import('./models/Notification.js')).default;
      await Notification.findByIdAndUpdate(notificationId, {
        read: true,
        readAt: new Date()
      });
      
      // Broadcast to user's room
      socket.to(`user:${socket.userId}`).emit('notification:updated', {
        id: notificationId,
        read: true
      });
    } catch (error) {
      logger.error('notification_mark_read_error', { error: error?.message });
    }
  });

  // Handle application status updates
  socket.on('application:statusUpdate', (data) => {
    // Broadcast to relevant users (employer and applicant)
    if (data.employerId) {
      socket.to(`user:${data.employerId}`).emit('application:statusChanged', data);
    }
    if (data.applicantId) {
      socket.to(`user:${data.applicantId}`).emit('application:statusChanged', data);
    }
  });

  // Handle job application events
  socket.on('job:newApplication', (data) => {
    // Notify employer about new application
    if (data.employerId) {
      socket.to(`user:${data.employerId}`).emit('job:newApplication', data);
    }
  });

  // Handle user presence
  socket.on('user:setOnline', () => {
    socket.broadcast.emit('user:online', { userId: socket.userId });
  });

  socket.on('disconnect', () => {
    logger.info('socket_disconnected', { socketId: socket.id, userId: socket.userId });
    
    // Broadcast user offline status
    socket.broadcast.emit('user:offline', { userId: socket.userId });
  });

  // Handle errors
  socket.on('error', (error) => {
    logger.error('socket_error', { error: error?.message });
  });
});

// Schedule daily automation at 09:00 server time
try {
  const cron = (await import('node-cron')).default;
  cron.schedule('0 9 * * *', async () => {
    try {
      const n1 = await automationService.nudgeIncompleteProfiles();
      const n2 = await automationService.nudgeNoRecentBids();
      const n3 = await automationService.celebrateMilestones();
      console.log(`[automation] daily run: profile=${n1}, bids=${n2}, milestones=${n3}`);
    } catch (e) {
      console.error('[automation] daily run failed', e);
    }
  });
} catch (e) {
  console.warn('[automation] cron not scheduled', e?.message);
}

// Make io accessible to our routes
app.set('io', io);


// Notifications removed in simplified version

// Error handling middleware (must be last)
app.use(errorTracking);
if (process.env.SENTRY_DSN) {
  // Sentry error handler must be before any other error middleware
  app.use(Sentry.Handlers.errorHandler());
}
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    logger.info('server_started', {
      message: `
🚀 Job Portal Backend Server is running!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 Health Check: http://localhost:${PORT}/health
📚 API Base URL: http://localhost:${PORT}/api
🔧 Admin Endpoints: http://localhost:${PORT}/api/admin
    `
    });
    // Simplified: no subscription cron
    // Verify SMTP configuration at startup
    if (typeof notificationService.verifySMTP === 'function') {
      notificationService.verifySMTP().catch((err) => {
        logger.warn('[notificationService] SMTP verification failed', { error: err?.message || String(err) });
      });
    }
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('sigterm_received');
  server.close(() => {
    logger.info('server_closed');
  });
});

// Global process error handlers
process.on('unhandledRejection', (reason) => {
  logger.error('unhandled_rejection', { reason: String(reason) });
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(reason);
  }
});
process.on('uncaughtException', (error) => {
  logger.error('uncaught_exception', { error: error?.message, stack: error?.stack });
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error);
  }
});

export default app;
