import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Testimonial from '../models/Testimonial.js';
import User from '../models/User.js';

dotenv.config();

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/jobportal';
    await mongoose.connect(mongoUri, { connectTimeoutMS: 10000 });
    console.log('Connected to MongoDB for testimonials seeding');

    // Optional: don't wipe existing testimonials, just insert sample ones if collection empty
    const count = await Testimonial.countDocuments();
    if (count > 0) {
      console.log(`Found ${count} existing testimonials — will still insert additional sample testimonials.`);
    }

    // Try to find a few users to attach to testimonials
    const arjun = await User.findOne({ email: 'arjun@gudgig.com' }).lean().catch(() => null);
    const priya = await User.findOne({ email: 'priya@gudgig.com' }).lean().catch(() => null);
    const sanjay = await User.findOne({ email: 'sanjay@techventures.in' }).lean().catch(() => null);

    const samples = [
      {
        user: arjun?._id,
        name: arjun ? arjun.name : 'Arjun Mehta',
        role: 'Full-Stack Developer',
        company: 'Freelance',
        content: 'Gudgig helped me find consistent high-quality gigs. I unlocked contacts with confidence and landed two clients in a week.',
        rating: 5,
        approved: true
      },
      {
        user: priya?._id,
        name: priya ? priya.name : 'Priya Sharma',
        role: 'Graphic Designer',
        company: 'CreativeFlow',
        content: 'The alerts are excellent — I get relevant gigs and the unlocking flow is quick. Highly recommended for freelancers.',
        rating: 5,
        approved: true
      },
      {
        user: sanjay?._id,
        name: sanjay ? sanjay.name : 'Sanjay Kapoor',
        role: 'Hiring Manager',
        company: 'TechVentures',
        content: 'We hired two contractors through this platform. The dashboard and candidate previews made shortlisting easy.',
        rating: 5,
        approved: true
      },
      {
        name: 'Sneha Kulkarni',
        role: 'Marketing Manager',
        company: 'Digital Edge',
        content: 'Found talented freelancers quickly and the communication tools made onboarding painless.',
        rating: 5,
        approved: true
      },
      {
        name: 'Rahul Verma',
        role: 'Technical Writer',
        company: 'WordSmith India',
        content: 'I landed a steady client via Gudgig and the platform fees are very reasonable for the value.',
        rating: 5,
        approved: true
      }
    ];

    const inserted = await Testimonial.insertMany(samples);
    console.log(`Inserted ${inserted.length} sample testimonials`);

    process.exit(0);
  } catch (e) {
    console.error('Failed to seed testimonials', e);
    process.exit(1);
  }
}

seed();
