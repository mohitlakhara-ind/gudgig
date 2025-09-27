import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Import local modules
import connectDB from './config/database.js';
import { etag, setCacheHeaders, cacheJobs, cacheSearch, cacheStats, getCacheStats, clearCache } from './middleware/caching.js';
import { performanceMonitoring, errorTracking, healthCheck, getMetrics } from './middleware/monitoring.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import gigRoutes from './routes/gigs.js';
import userRoutes from './routes/users.js';
import companyRoutes from './routes/companies.js';
import applicationRoutes from './routes/applications.js';
import uploadRoutes from './routes/uploads.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';
import billingRoutes from './routes/billing.js';
import statsRoutes from './routes/stats.js';
import subscriptionRoutes from './routes/subscriptions.js';
import searchRoutes from './routes/search.js';
import serviceRoutes from './routes/services.js';
import orderRoutes from './routes/orders.js';
import conversationRoutes from './routes/conversations.js';
import NotificationService from './services/notificationService.js';
import { startSubscriptionCron, stopSubscriptionCron } from './jobs/subscriptionCron.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
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

// Health check endpoint
app.get('/health', healthCheck);
app.get('/metrics', getMetrics);

// API Routes
app.use(etag);
app.use(setCacheHeaders(300)); // Set default cache for 5 minutes

app.use('/api/jobs', cacheJobs, jobRoutes);
app.use('/api/gigs', cacheJobs, gigRoutes);
app.use('/api/search', cacheSearch, searchRoutes);
app.use('/api/services', cacheSearch, serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/stats', cacheStats, statsRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

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
  console.log(`User connected: ${socket.id} (User ID: ${socket.userId})`);

  // Join user to their personal room
  socket.join(`user:${socket.userId}`);
  
  // Join role-based rooms
  socket.join(`role:${socket.userRole}`);

  // Handle user joining specific rooms
  socket.on('join', (data) => {
    if (typeof data === 'string') {
      // Handle string room ID (legacy support)
      socket.join(data);
      console.log(`User ${socket.userId} joined room: ${data}`);
    } else if (typeof data === 'object' && data !== null) {
      // Handle object with userId and role
      if (data.userId) {
        socket.join(`user:${data.userId}`);
        console.log(`User ${socket.userId} joined user room: user:${data.userId}`);
      }
      if (data.role) {
        socket.join(`role:${data.role}`);
        console.log(`User ${socket.userId} joined role room: role:${data.role}`);
      }
    }
  });

  // Handle leaving rooms
  socket.on('leave', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.userId} left room: ${roomId}`);
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
      console.error('Error marking notification as read:', error);
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
    console.log(`User disconnected: ${socket.id} (User ID: ${socket.userId})`);
    
    // Broadcast user offline status
    socket.broadcast.emit('user:offline', { userId: socket.userId });
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Make io accessible to our routes
app.set('io', io);

// Set Socket.io instance in NotificationService
NotificationService.setSocketIO(io);

// Error handling middleware (must be last)
app.use(errorTracking);
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
🚀 Job Portal Backend Server is running!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 Health Check: http://localhost:${PORT}/health
📚 API Base URL: http://localhost:${PORT}/api
  `);
  try {
    startSubscriptionCron();
    console.log('📅 Subscription lifecycle cron started');
  } catch (err) {
    console.error('Failed to start subscription cron:', err);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  try { stopSubscriptionCron(); } catch {}
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app;
