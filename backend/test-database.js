// Test script to check database and saved jobs functionality
import mongoose from 'mongoose';

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal';

async function testDatabase() {
  try {
    console.log('🔍 Testing Database Connection and Data...\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import models
    const SavedJob = mongoose.model('SavedJob', new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
      savedAt: { type: Date, default: Date.now }
    }, { timestamps: true }));

    const Job = mongoose.model('Job', new mongoose.Schema({
      title: { type: String, required: true },
      category: { type: String, required: true },
      description: { type: String, required: true },
      budget: { type: Number, default: 0 },
      location: { type: String, default: 'Remote' },
      requirements: { type: [String], default: [] },
      skills: { type: [String], default: [] },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    }, { timestamps: true }));

    const User = mongoose.model('User', new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      role: { type: String, default: 'freelancer' }
    }));

    // Check counts
    const jobCount = await Job.countDocuments();
    const savedJobCount = await SavedJob.countDocuments();
    const userCount = await User.countDocuments();

    console.log(`📊 Database Stats:`);
    console.log(`   Jobs: ${jobCount}`);
    console.log(`   Saved Jobs: ${savedJobCount}`);
    console.log(`   Users: ${userCount}`);

    if (jobCount === 0) {
      console.log('\n⚠️  No jobs found in database!');
      console.log('   This explains why saved gigs show "Unknown Gig"');
      console.log('   You need to create some jobs first.');
    }

    if (savedJobCount === 0) {
      console.log('\n⚠️  No saved jobs found!');
      console.log('   Users need to save some gigs first.');
    }

    if (savedJobCount > 0) {
      console.log('\n🔍 Checking saved jobs data...');
      const savedJobs = await SavedJob.find().populate('jobId').limit(3);
      
      savedJobs.forEach((savedJob, index) => {
        console.log(`\nSaved Job ${index + 1}:`);
        console.log(`  ID: ${savedJob._id}`);
        console.log(`  User ID: ${savedJob.userId}`);
        console.log(`  Job ID: ${savedJob.jobId}`);
        
        if (savedJob.jobId && typeof savedJob.jobId === 'object') {
          console.log(`  Job Title: ${savedJob.jobId.title}`);
          console.log(`  Job Category: ${savedJob.jobId.category}`);
          console.log(`  Job Budget: ${savedJob.jobId.budget}`);
        } else {
          console.log(`  Job data: ${savedJob.jobId} (not populated or null)`);
        }
      });
    }

    console.log('\n🎯 Recommendations:');
    if (jobCount === 0) {
      console.log('   1. Create some sample jobs in the database');
      console.log('   2. Or use the admin panel to post gigs');
    }
    if (savedJobCount === 0) {
      console.log('   1. Login to the frontend');
      console.log('   2. Browse gigs and save some');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

testDatabase();
