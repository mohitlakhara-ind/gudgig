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
    const alice = await User.findOne({ email: 'alice@gigsmint.com' }).lean().catch(() => null);
    const bob = await User.findOne({ email: 'bob@gigsmint.com' }).lean().catch(() => null);
    const john = await User.findOne({ email: 'john@techcorp.com' }).lean().catch(() => null);

    const samples = [
      {
        user: alice?._id,
        name: alice ? alice.name : 'Sarah Johnson',
        role: 'Freelance Designer',
        company: 'Design Studio',
        content: 'Gigsmint helped me find consistent high-quality gigs. I unlocked contacts with confidence and landed two clients in a week.',
        rating: 5,
        approved: true
      },
      {
        user: bob?._id,
        name: bob ? bob.name : 'Michael Chen',
        role: 'Software Developer',
        company: 'Freelance',
        content: 'The alerts are excellent — I get relevant gigs and the unlocking flow is quick. Highly recommended for freelancers.',
        rating: 5,
        approved: true
      },
      {
        user: john?._id,
        name: john ? john.name : 'John Smith',
        role: 'Hiring Manager',
        company: 'TechCorp',
        content: 'We hired two contractors through this platform. The dashboard and candidate previews made shortlisting easy.',
        rating: 5,
        approved: true
      },
      {
        name: 'Emily Rodriguez',
        role: 'Marketing Manager',
        company: 'BrandCo',
        content: 'Found talented freelancers quickly and the communication tools made onboarding painless.',
        rating: 5,
        approved: true
      },
      {
        name: 'David Kim',
        role: 'Content Writer',
        company: 'Writesmith',
        content: 'I landed a steady client via Gigsmint and the platform fees are very reasonable for the value.',
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
