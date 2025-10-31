const fs = require('fs');
const path = require('path');

// For a simple gig bidding platform, we only need:
// - User management (auth)
// - Gig management 
// - Bid management
// - Basic admin functions
// - Notifications

// Files to KEEP (essential for gig bidding)
const keepFiles = [
  'src/models/User.js',
  'src/models/Gig.js', 
  'src/models/Bid.js',
  'src/models/Notification.js',
  'src/models/AdminSettings.js',
  'src/models/SavedJob.js',
  'src/controllers/authController.js',
  'src/controllers/gmController.js',
  'src/controllers/notificationController.js',
  'src/controllers/adminSettingsController.js',
  'src/routes/auth.js',
  'src/routes/gigs.js',
  'src/routes/bids.js',
  'src/routes/notifications.js',
  'src/routes/saved-jobs.js',
  'src/routes/admin-settings.js',
  'src/routes/admin-bid-fees.js',
  'src/routes/admin-bids.js',
  'src/routes/admin.js',
  'src/routes/payments.js',
  'src/services/automationService.js',
  'src/services/notificationService.js',
  'src/services/gmPaymentService.js',
  'src/middleware/auth.js',
  'src/middleware/errorHandler.js',
  'src/middleware/security.js',
  'src/middleware/caching.js',
  'src/middleware/monitoring.js',
  'src/middleware/requestId.js',
  'src/config/database.js',
  'src/config/env.js',
  'src/utils/logger.js',
  'src/server-simplified.js'
];

// Files to REMOVE (unnecessary for simple gig bidding)
const removeFiles = [
  // Unused models
  'src/models/Application.js',
  'src/models/Service.js',
  'src/models/Order.js', 
  'src/models/Review.js',
  'src/models/FreelancerProfile.js',
  
  // Unused controllers
  'src/controllers/applicationController.js',
  'src/controllers/serviceController.js',
  'src/controllers/orderController.js',
  'src/controllers/reviewController.js',
  'src/controllers/freelancerProfileController.js',
  'src/controllers/jobController.js',
  'src/controllers/conversationController.js',
  'src/controllers/complianceController.js',
  'src/controllers/uploadController.js',
  'src/controllers/profilePhotoController.js',
  'src/controllers/adminUserController.js',
  'src/controllers/analyticsController.js',
  
  // Unused routes
  'src/routes/applications.js',
  'src/routes/services.js',
  'src/routes/orders.js',
  'src/routes/reviews.js',
  'src/routes/freelancer-profiles.js',
  'src/routes/jobs.js',
  'src/routes/profilePhoto.js',
  'src/routes/support.js',
  'src/routes/uploads.js',
  'src/routes/user-gigs.js',
  'src/routes/app-api.js',
  'src/routes/adminAnalytics.js',
  'src/routes/adminUsers.js',
  'src/routes/analytics.js',
  
  // Unused services
  'src/services/analyticsService.js',
  'src/services/searchService.js',
  'src/services/metricsService.js',
  'src/services/cloudinaryService.js',
  'src/services/keepAliveService.js',
  'src/services/paymentService.js',
  
  // Unused middleware
  'src/middleware/compliance.js',
  'src/middleware/subscription.js',
  
  // Unused directories
  'src/jobs',
  'src/seeders',
  'src/tests',
  'src/__tests__',
  'src/payments'
];

// Directories to check for cleanup
const dirsToCheck = [
  'src/controllers',
  'src/routes',
  'src/services',
  'src/middleware',
  'src/models'
];

console.log('🚀 Starting aggressive cleanup...');

// Remove unnecessary files
removeFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    try {
      if (fs.statSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
        console.log(`🗑️  Removed directory: ${file}`);
      } else {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Removed file: ${file}`);
      }
    } catch (error) {
      console.error(`❌ Error removing ${file}:`, error.message);
    }
  }
});

// Check for empty directories and remove them
dirsToCheck.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    try {
      const files = fs.readdirSync(dirPath);
      if (files.length === 0) {
        fs.rmdirSync(dirPath);
        console.log(`🗑️  Removed empty directory: ${dir}`);
      }
    } catch (error) {
      console.error(`❌ Error checking directory ${dir}:`, error.message);
    }
  }
});

// Create a minimal package.json for the cleaned backend
const minimalPackageJson = {
  "name": "gig-portal-backend",
  "version": "1.0.0",
  "description": "Simple gig bidding platform backend",
  "main": "src/server-simplified.js",
  "scripts": {
    "start": "node src/server-simplified.js",
    "dev": "nodemon src/server-simplified.js",
    "test": "echo \"No tests configured\""
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "compression": "^1.7.4",
    "morgan": "^1.10.0",
    "express-rate-limit": "^6.10.0",
    "dotenv": "^16.3.1",
    "cloudinary": "^1.40.0",
    "socket.io": "^4.7.2",
    "express-validator": "^7.0.1",
    "node-cron": "^3.0.2",
    "@sentry/node": "^7.50.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
};

fs.writeFileSync(
  path.join(__dirname, 'package-minimal.json'), 
  JSON.stringify(minimalPackageJson, null, 2)
);

console.log('✅ Aggressive cleanup complete!');
console.log('📦 Created package-minimal.json with only essential dependencies');
console.log('🎯 Backend is now minimal and focused on gig bidding only');
