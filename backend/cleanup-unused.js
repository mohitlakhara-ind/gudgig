const fs = require('fs');
const path = require('path');

// List of files to remove (unused models, routes, controllers)
const filesToRemove = [
  'src/models/Application.js',
  'src/models/Service.js', 
  'src/models/Order.js',
  'src/models/Review.js',
  'src/routes/applications.js',
  'src/routes/services.js',
  'src/routes/orders.js',
  'src/routes/reviews.js',
  'src/routes/freelancer-profiles.js',
  'src/routes/jobs.js', // Replaced by gigs
  'src/controllers/applicationController.js',
  'src/controllers/serviceController.js',
  'src/controllers/orderController.js',
  'src/controllers/reviewController.js',
  'src/controllers/freelancerProfileController.js',
  'src/controllers/jobController.js', // Replaced by gig controller
  'src/controllers/conversationController.js',
  'src/controllers/complianceController.js',
  'src/controllers/uploadController.js',
  'src/controllers/profilePhotoController.js',
  'src/routes/profilePhoto.js',
  'src/routes/support.js',
  'src/routes/uploads.js',
  'src/routes/user-gigs.js',
  'src/routes/app-api.js',
  'src/routes/adminAnalytics.js',
  'src/routes/adminUsers.js',
  'src/controllers/adminUserController.js',
  'src/controllers/uploadController.js',
  'src/controllers/complianceController.js',
  'src/controllers/conversationController.js',
  'src/controllers/profilePhotoController.js',
  'src/controllers/analyticsController.js',
  'src/services/analyticsService.js',
  'src/services/searchService.js',
  'src/services/metricsService.js',
  'src/middleware/compliance.js',
  'src/middleware/subscription.js',
  'src/jobs/subscriptionCron.js',
  'src/seeders/subscriptionSeeder.js'
];

// List of directories to remove if empty
const dirsToCheck = [
  'src/controllers',
  'src/routes', 
  'src/services',
  'src/middleware',
  'src/jobs',
  'src/seeders'
];

console.log('Cleaning up unused files...');

// Remove files
filesToRemove.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Removed: ${file}`);
    } catch (error) {
      console.error(`Error removing ${file}:`, error.message);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});

// Check and remove empty directories
dirsToCheck.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    try {
      const files = fs.readdirSync(dirPath);
      if (files.length === 0) {
        fs.rmdirSync(dirPath);
        console.log(`Removed empty directory: ${dir}`);
      }
    } catch (error) {
      console.error(`Error checking directory ${dir}:`, error.message);
    }
  }
});

console.log('Cleanup complete!');
