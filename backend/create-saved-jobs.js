import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SavedJob from './src/models/SavedJob.js';
import User from './src/models/User.js';
import Job from './src/models/Job.js';

// Load environment variables
dotenv.config();

const createSavedJobs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal');
    console.log('✅ Connected to MongoDB');

    // Get a user and some jobs
    const user = await User.findOne({ email: 'alice@gigsmint.com' });
    const jobs = await Job.find().limit(3);

    if (!user) {
      console.log('❌ No user found');
      return;
    }

    if (jobs.length === 0) {
      console.log('❌ No jobs found');
      return;
    }

    console.log(`👤 Using user: ${user.email}`);
    console.log(`💼 Found ${jobs.length} jobs`);

    // Clear existing saved jobs for this user
    await SavedJob.deleteMany({ userId: user._id });
    console.log('🗑️ Cleared existing saved jobs');

    // Create saved jobs
    const savedJobs = [];
    for (const job of jobs) {
      const savedJob = new SavedJob({
        userId: user._id,
        jobId: job._id,
        savedAt: new Date(),
        metadata: {
          source: 'gigs_listing',
          category: job.category,
          budget: job.budget
        }
      });
      await savedJob.save();
      savedJobs.push(savedJob);
      console.log(`💾 Saved job: ${job.title}`);
    }

    console.log(`✅ Created ${savedJobs.length} saved jobs`);
    console.log(`👤 User ID: ${user._id}`);
    console.log(`📧 User Email: ${user.email}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

createSavedJobs();

