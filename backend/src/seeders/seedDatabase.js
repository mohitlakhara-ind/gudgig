import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Job from '../models/Job.js';
import AdminSettings from '../models/AdminSettings.js';
import Application from '../models/Application.js';
import FreelancerProfile from '../models/FreelancerProfile.js';
import Service from '../models/Service.js';
import Bid from '../models/Bid.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import SavedJob from '../models/SavedJob.js';

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Job.deleteMany({}),
      AdminSettings.deleteMany({}),
      Application.deleteMany({}),
      FreelancerProfile.deleteMany({}),
      Service.deleteMany({}),
      Bid.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
      Notification.deleteMany({}),
      SavedJob.deleteMany({})
    ]);
    console.log('🗑️ Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'info@gudgig.com',
      password: 'Admin123!',
      role: 'admin',
      isEmailVerified: true,
      phone: '+1-000-000-0000',
      location: 'Remote',
      avatar: ''
    });
    console.log('👤 Created admin user');

    // Create freelancers (use create to trigger pre-save hashing)
    const freelancers = await User.create([
      { name: 'Alice Cooper', email: 'alice@gudgig.com', password: 'Freelancer123!', role: 'freelancer', isEmailVerified: true, phone: '+1-111-111-1111', location: 'San Francisco', avatar: '' },
      { name: 'Bob Wilson', email: 'bob@gudgig.com', password: 'Freelancer123!', role: 'freelancer', isEmailVerified: true, phone: '+1-222-222-2222', location: 'Los Angeles', avatar: '' },
      { name: 'Carol Davis', email: 'carol@gudgig.com', password: 'Freelancer123!', role: 'freelancer', isEmailVerified: true, phone: '+1-333-333-3333', location: 'New York', avatar: '' },
      { name: 'Daniel Lee', email: 'daniel@gudgig.com', password: 'Freelancer123!', role: 'freelancer', isEmailVerified: true, phone: '+1-444-444-4444', location: 'Austin', avatar: '' },
      { name: 'Emily Garcia', email: 'emily@gudgig.com', password: 'Freelancer123!', role: 'freelancer', isEmailVerified: true, phone: '+1-555-555-5555', location: 'Seattle', avatar: '' },
      { name: 'Frank Miller', email: 'frank@gudgig.com', password: 'Freelancer123!', role: 'freelancer', isEmailVerified: true, phone: '+1-666-666-6666', location: 'Chicago', avatar: '' },
      { name: 'Grace Hopper', email: 'grace@gudgig.com', password: 'Freelancer123!', role: 'freelancer', isEmailVerified: true, phone: '+1-777-777-7777', location: 'Boston', avatar: '' },
      { name: 'Henry Ford', email: 'henry@gudgig.com', password: 'Freelancer123!', role: 'freelancer', isEmailVerified: true, phone: '+1-888-888-8888', location: 'Miami', avatar: '' },
      { name: 'Ivy Nguyen', email: 'ivy@gudgig.com', password: 'Freelancer123!', role: 'freelancer', isEmailVerified: true, phone: '+1-999-999-9999', location: 'Denver', avatar: '' }
    ]);
    console.log(`👨‍💻 Created ${freelancers.length} freelancer users`);

    // Create employer users
    const employers = await User.create([
      { name: 'John Smith', email: 'john@techcorp.com', password: 'Employer123!', role: 'employer', isEmailVerified: true, phone: '+1-310-000-0000', location: 'San Jose', avatar: '' },
      { name: 'Sarah Johnson', email: 'sarah@designagency.com', password: 'Employer123!', role: 'employer', isEmailVerified: true, phone: '+1-415-000-0000', location: 'San Francisco', avatar: '' },
      { name: 'Michael Chen', email: 'michael@startup.com', password: 'Employer123!', role: 'employer', isEmailVerified: true, phone: '+1-212-000-0000', location: 'New York', avatar: '' },
      { name: 'Nina Patel', email: 'nina@fintech.io', password: 'Employer123!', role: 'employer', isEmailVerified: true, phone: '+1-617-000-0000', location: 'Boston', avatar: '' },
      { name: 'Omar Ali', email: 'omar@gamehub.co', password: 'Employer123!', role: 'employer', isEmailVerified: true, phone: '+1-702-000-0000', location: 'Las Vegas', avatar: '' }
    ]);
    console.log(`👔 Created ${employers.length} employer users`);

    // AdminSettings with bid fee options
    const settings = await AdminSettings.create({ key: 'gg-config', bidFeeOptions: [50, 100, 200, 500], currentBidFee: 100 });
    console.log('⚙️  Created AdminSettings');

    // Sample jobs across 7 categories
    const sampleJobs = [
      {
        title: 'Build Responsive E-commerce Website',
        description: 'Need a responsive e-commerce site with product pages, cart, checkout, and payment integration. Tech stack flexible.',
        category: 'website development',
        requirements: ['Responsive UI', 'Cart & Checkout', 'Payment integration']
      },
      {
        title: 'Design Modern Logo and Brand Identity',
        description: 'Looking for a versatile logo, color palette, and brand guidelines for a startup.',
        category: 'graphic design',
        requirements: ['Logo design', 'Brand palette', 'Guidelines PDF']
      },
      {
        title: 'Write SEO Blog Articles for Tech Startup',
        description: 'Produce 4 well-researched SEO blog posts per month in the developer tooling niche.',
        category: 'content writing',
        requirements: ['SEO keywords', 'Original content', 'Tech familiarity']
      },
      {
        title: 'Manage Instagram Account for Fashion Brand',
        description: 'Plan, design, and schedule posts and stories; engage audience and grow followers.',
        category: 'social media management',
        requirements: ['Content calendar', 'Community engagement', 'Monthly report']
      },
      {
        title: 'Optimize Website for Google Search Rankings',
        description: 'On-page and technical SEO fixes, site speed improvements, and structured data.',
        category: 'SEO',
        requirements: ['On-page SEO', 'Core Web Vitals', 'Schema markup']
      },
      {
        title: 'Develop iOS Mobile App for Food Delivery',
        description: 'Build an MVP iOS app with menu, ordering, tracking, and notifications.',
        category: 'app development',
        requirements: ['Swift/SwiftUI', 'Push notifications', 'Order tracking']
      },
      {
        title: 'Create 2D Puzzle Game for Mobile',
        description: 'Casual 2D puzzle game with levels, hints, and smooth animations. Monetization optional.',
        category: 'game development',
        requirements: ['Level design', 'Smooth animations', 'Basic analytics']
      }
    ];

    // Extend jobs for variety
    const extraJobs = [
      { title: 'Refactor Legacy Website to Next.js', description: 'Migrate an older site to Next.js 15 with RSC.', category: 'website development', requirements: ['Next.js', 'SEO', 'RSC'] },
      { title: 'Landing Page A/B Test Variants', description: 'Create two landing variants for A/B testing.', category: 'website development', requirements: ['React', 'Analytics'] },
      { title: 'YouTube Thumbnail Pack', description: 'Design 20 thumbnails for a tech channel.', category: 'graphic design', requirements: ['Photoshop', 'Branding'] },
      { title: 'Long-form Technical Article', description: 'Write a 2000-word guide on WebSockets.', category: 'content writing', requirements: ['Tech writing', 'Research'] },
      { title: 'Instagram Reels Campaign', description: 'Plan 30-day reel calendar for fashion brand.', category: 'social media management', requirements: ['Reels', 'Scheduling'] },
      { title: 'Local SEO Audit', description: 'Audit and implement local SEO for SMB.', category: 'SEO', requirements: ['GMB', 'Schema'] },
      { title: 'React Native MVP', description: 'Build MVP with auth and push notifications.', category: 'app development', requirements: ['RN', 'Push'] },
      { title: 'Level Design for Puzzle Game', description: 'Design 50 levels with increasing difficulty.', category: 'game development', requirements: ['Level design', 'Balancing'] },
      { title: 'WordPress WooCommerce Setup', description: 'Set up an e-commerce store with payment gateways.', category: 'website development', requirements: ['WordPress', 'WooCommerce', 'SSL'] },
      { title: 'Custom Shopify Theme Development', description: 'Create a unique Shopify theme for fashion brand.', category: 'website development', requirements: ['Shopify', 'Liquid', 'CSS'] },
      { title: 'Mobile-First Website Redesign', description: 'Redesign existing site with mobile-first approach.', category: 'website development', requirements: ['Responsive design', 'UX/UI'] },
      { title: 'Brand Identity Package', description: 'Complete brand identity including logo, colors, fonts, and guidelines.', category: 'graphic design', requirements: ['Brand design', 'Logo', 'Typography'] },
      { title: 'Social Media Graphics Package', description: 'Create templates and designs for social media posts.', category: 'graphic design', requirements: ['Social media', 'Templates', 'Brand consistency'] },
      { title: 'Illustrated User Manual', description: 'Create illustrated manual with icons and diagrams.', category: 'graphic design', requirements: ['Illustration', 'Technical drawing'] },
      { title: 'Website Copywriting Services', description: 'Write compelling copy for landing pages and product descriptions.', category: 'content writing', requirements: ['Copywriting', 'SEO', 'Conversion'] },
      { title: 'Email Newsletter Content', description: 'Write engaging monthly newsletter content.', category: 'content writing', requirements: ['Email marketing', 'Engaging content'] },
      { title: 'Product Description Writing', description: 'Write 50 unique product descriptions for e-commerce.', category: 'content writing', requirements: ['Product writing', 'SEO'] },
      { title: 'LinkedIn Content Strategy', description: 'Develop and execute LinkedIn content strategy for B2B brand.', category: 'social media management', requirements: ['LinkedIn', 'B2B', 'Content planning'] },
      { title: 'TikTok Growth Strategy', description: 'Grow TikTok account with viral content strategy.', category: 'social media management', requirements: ['TikTok', 'Viral content', 'Growth'] },
      { title: 'Twitter Engagement Campaign', description: 'Manage Twitter account with engaging posts and community management.', category: 'social media management', requirements: ['Twitter', 'Engagement', 'Community'] },
      { title: 'SEO Content Audit & Optimization', description: 'Audit existing content and optimize for better rankings.', category: 'SEO', requirements: ['Content audit', 'Keyword optimization'] },
      { title: 'Technical SEO Fixes', description: 'Fix technical SEO issues like crawl errors, site speed, and indexing.', category: 'SEO', requirements: ['Technical SEO', 'Site speed', 'Crawl errors'] },
      { title: 'Link Building Campaign', description: 'Build high-quality backlinks to improve domain authority.', category: 'SEO', requirements: ['Link building', 'Outreach', 'Content'] },
      { title: 'Cross-Platform Mobile App', description: 'Build app that works on both iOS and Android with shared codebase.', category: 'app development', requirements: ['Flutter', 'React Native', 'Cross-platform'] },
      { title: 'Progressive Web App', description: 'Build a PWA with offline capabilities and push notifications.', category: 'app development', requirements: ['PWA', 'Service workers', 'Offline'] },
      { title: 'API Integration Development', description: 'Integrate multiple third-party APIs into mobile app.', category: 'app development', requirements: ['API integration', 'REST APIs', 'Mobile'] },
      { title: 'Unity 2D Game Development', description: 'Create a 2D platform game using Unity engine.', category: 'game development', requirements: ['Unity', 'C#', 'Game design'] },
      { title: 'Game UI/UX Design', description: 'Design intuitive and engaging UI for mobile games.', category: 'game development', requirements: ['Game UI', 'UX design', 'Mobile games'] }
    ];
    const jobs = await Job.insertMany(
      [...sampleJobs, ...extraJobs].map(j => ({
        ...j,
        createdBy: adminUser._id,
        budget: Math.floor(15000 + Math.random() * 100000),
        location: 'Remote',
        experienceLevel: ['any', 'junior', 'mid', 'senior'][Math.floor(Math.random() * 4)],
        skills: (j.requirements || []).map(r => r.toLowerCase())
      }))
    );
    console.log(`💼 Created ${jobs.length} sample jobs`);

    // Create freelancer profiles
    const freelancerProfiles = await FreelancerProfile.insertMany([
      {
        userId: freelancers[0]._id,
        title: 'Full-Stack Web Developer',
        description: 'Experienced developer specializing in React, Node.js, and modern web technologies. I create responsive, user-friendly applications with clean, maintainable code.',
        tagline: 'Building amazing web experiences',
        skills: [
          { name: 'JavaScript', level: 'expert', yearsOfExperience: 5 },
          { name: 'React', level: 'expert', yearsOfExperience: 4 },
          { name: 'Node.js', level: 'expert', yearsOfExperience: 4 },
          { name: 'MongoDB', level: 'intermediate', yearsOfExperience: 3 }
        ],
        primarySkills: ['JavaScript', 'React', 'Node.js'],
        hourlyRate: { min: 800, max: 1500, currency: 'INR' },
        location: { country: 'India', city: 'Bangalore', timezone: 'IST' },
        languages: [{ language: 'English', proficiency: 'fluent' }, { language: 'Hindi', proficiency: 'native' }]
      },
      {
        userId: freelancers[1]._id,
        title: 'Graphic Designer & Brand Specialist',
        description: 'Creative graphic designer with 6+ years of experience in brand identity, logo design, and digital marketing materials. I help businesses stand out with compelling visual designs.',
        tagline: 'Designing brands that inspire',
        skills: [
          { name: 'Adobe Photoshop', level: 'expert', yearsOfExperience: 6 },
          { name: 'Adobe Illustrator', level: 'expert', yearsOfExperience: 6 },
          { name: 'Brand Design', level: 'expert', yearsOfExperience: 5 },
          { name: 'Logo Design', level: 'expert', yearsOfExperience: 5 }
        ],
        primarySkills: ['Logo Design', 'Brand Design', 'Adobe Creative Suite'],
        hourlyRate: { min: 500, max: 1200, currency: 'INR' },
        location: { country: 'India', city: 'Mumbai', timezone: 'IST' }
      },
      {
        userId: freelancers[2]._id,
        title: 'Content Writer & SEO Specialist',
        description: 'Professional content writer specializing in SEO-optimized articles, blog posts, and marketing copy. I help businesses improve their online presence through engaging content.',
        tagline: 'Words that convert and rank',
        skills: [
          { name: 'Content Writing', level: 'expert', yearsOfExperience: 4 },
          { name: 'SEO', level: 'expert', yearsOfExperience: 3 },
          { name: 'Copywriting', level: 'expert', yearsOfExperience: 4 },
          { name: 'Research', level: 'expert', yearsOfExperience: 5 }
        ],
        primarySkills: ['Content Writing', 'SEO', 'Copywriting'],
        hourlyRate: { min: 400, max: 1000, currency: 'INR' },
        location: { country: 'India', city: 'Delhi', timezone: 'IST' }
      },
      {
        userId: freelancers[3]._id,
        title: 'Social Media Marketing Specialist',
        description: 'Expert in social media strategy, content creation, and community management. I help brands grow their online presence across Instagram, TikTok, and LinkedIn with engaging content and data-driven strategies.',
        tagline: 'Growing brands, one post at a time',
        skills: [
          { name: 'Social Media Marketing', level: 'expert', yearsOfExperience: 4 },
          { name: 'Content Creation', level: 'expert', yearsOfExperience: 4 },
          { name: 'Analytics', level: 'expert', yearsOfExperience: 3 },
          { name: 'Community Management', level: 'expert', yearsOfExperience: 3 }
        ],
        primarySkills: ['Social Media Marketing', 'Content Creation', 'Analytics'],
        hourlyRate: { min: 400, max: 1000, currency: 'INR' },
        location: { country: 'India', city: 'Hyderabad', timezone: 'IST' }
      },
      {
        userId: freelancers[4]._id,
        title: 'SEO Specialist & Digital Marketer',
        description: 'Passionate about SEO and digital marketing. I help businesses improve their search rankings through technical SEO, content optimization, and strategic link building campaigns.',
        tagline: 'Boosting your search visibility',
        skills: [
          { name: 'SEO', level: 'expert', yearsOfExperience: 5 },
          { name: 'Technical SEO', level: 'expert', yearsOfExperience: 4 },
          { name: 'Link Building', level: 'expert', yearsOfExperience: 4 },
          { name: 'Analytics', level: 'expert', yearsOfExperience: 3 }
        ],
        primarySkills: ['SEO', 'Technical SEO', 'Link Building'],
        hourlyRate: { min: 600, max: 1400, currency: 'INR' },
        location: { country: 'India', city: 'Pune', timezone: 'IST' }
      },
      {
        userId: freelancers[5]._id,
        title: 'Mobile App Developer',
        description: 'Mobile app developer specializing in React Native and Flutter. I build cross-platform apps that work seamlessly on both iOS and Android with modern architectures.',
        tagline: 'Creating amazing mobile experiences',
        skills: [
          { name: 'React Native', level: 'expert', yearsOfExperience: 4 },
          { name: 'Flutter', level: 'intermediate', yearsOfExperience: 2 },
          { name: 'Mobile Development', level: 'expert', yearsOfExperience: 5 },
          { name: 'Firebase', level: 'expert', yearsOfExperience: 3 }
        ],
        primarySkills: ['React Native', 'Mobile Development', 'Firebase'],
        hourlyRate: { min: 1000, max: 2000, currency: 'INR' },
        location: { country: 'India', city: 'Chennai', timezone: 'IST' }
      },
      {
        userId: freelancers[6]._id,
        title: 'Game Designer & Developer',
        description: 'Indie game developer with passion for creating engaging gameplay experiences. Specialized in Unity 2D/3D game development, level design, and game mechanics.',
        tagline: 'Creating worlds, one game at a time',
        skills: [
          { name: 'Unity', level: 'expert', yearsOfExperience: 6 },
          { name: 'Game Design', level: 'expert', yearsOfExperience: 5 },
          { name: 'Level Design', level: 'expert', yearsOfExperience: 5 },
          { name: 'C#', level: 'expert', yearsOfExperience: 6 }
        ],
        primarySkills: ['Unity', 'Game Design', 'Level Design'],
        hourlyRate: { min: 800, max: 1800, currency: 'INR' },
        location: { country: 'India', city: 'Gurgaon', timezone: 'IST' }
      },
      {
        userId: freelancers[7]._id,
        title: 'E-commerce Developer',
        description: 'Specialized in building and optimizing e-commerce stores on Shopify, WooCommerce, and custom platforms. I create seamless shopping experiences that convert.',
        tagline: 'Selling online, made simple',
        skills: [
          { name: 'Shopify', level: 'expert', yearsOfExperience: 5 },
          { name: 'WooCommerce', level: 'expert', yearsOfExperience: 4 },
          { name: 'E-commerce', level: 'expert', yearsOfExperience: 5 },
          { name: 'Payment Integration', level: 'expert', yearsOfExperience: 4 }
        ],
        primarySkills: ['Shopify', 'WooCommerce', 'E-commerce'],
        hourlyRate: { min: 800, max: 1800, currency: 'INR' },
        location: { country: 'India', city: 'Ahmedabad', timezone: 'IST' }
      },
      {
        userId: freelancers[8]._id,
        title: 'Digital Marketing Strategist',
        description: 'Strategic digital marketer focused on growth and conversions. I help businesses optimize their digital presence through data-driven strategies and campaigns.',
        tagline: 'Data-driven growth strategies',
        skills: [
          { name: 'Digital Marketing', level: 'expert', yearsOfExperience: 6 },
          { name: 'Growth Marketing', level: 'expert', yearsOfExperience: 5 },
          { name: 'Analytics', level: 'expert', yearsOfExperience: 5 },
          { name: 'Conversion Optimization', level: 'expert', yearsOfExperience: 4 }
        ],
        primarySkills: ['Digital Marketing', 'Growth Marketing', 'Analytics'],
        hourlyRate: { min: 1200, max: 2500, currency: 'INR' },
        location: { country: 'India', city: 'Kolkata', timezone: 'IST' }
      }
    ]);
    console.log(`👤 Created ${freelancerProfiles.length} freelancer profiles`);

    // Create services
    const services = await Service.insertMany([
      {
        title: 'I will develop a responsive website using React and Node.js',
        description: 'Get a fully responsive, modern website built with the latest technologies. I will create a custom website tailored to your needs using React for the frontend and Node.js for the backend.',
        category: 'website development',
        tags: ['react', 'nodejs', 'responsive', 'modern', 'custom'],
        packages: {
          basic: {
            name: 'basic',
            title: 'Basic Website',
            description: 'Simple 3-page website with responsive design',
            price: 15000,
            deliveryTime: 7,
            revisions: 2,
            features: ['3 pages', 'Responsive design', 'Basic SEO', 'Contact form']
          },
          standard: {
            name: 'standard',
            title: 'Standard Website',
            description: 'Professional website with admin panel',
            price: 35000,
            deliveryTime: 14,
            revisions: 3,
            features: ['Up to 7 pages', 'Admin panel', 'Database integration', 'Advanced SEO']
          },
          premium: {
            name: 'premium',
            title: 'Premium Website',
            description: 'Full-featured web application with custom features',
            price: 85000,
            deliveryTime: 21,
            revisions: 5,
            features: ['Unlimited pages', 'Custom features', 'API integration', 'Performance optimization']
          }
        },
        createdBy: freelancers[0]._id,
        status: 'active',
        startingPrice: 15000
      },
      {
        title: 'I will design a professional logo and brand identity',
        description: 'Get a stunning logo and complete brand identity package. I will create a unique, memorable logo that represents your brand perfectly, along with brand guidelines.',
        category: 'graphic design',
        tags: ['logo', 'branding', 'identity', 'professional', 'unique'],
        packages: {
          basic: {
            name: 'basic',
            title: 'Logo Only',
            description: 'Professional logo design with basic concepts',
            price: 8000,
            deliveryTime: 5,
            revisions: 3,
            features: ['3 logo concepts', 'High-res files', 'Commercial license']
          },
          standard: {
            name: 'standard',
            title: 'Logo + Brand Colors',
            description: 'Logo design with brand color palette',
            price: 15000,
            deliveryTime: 7,
            revisions: 4,
            features: ['5 logo concepts', 'Color palette', 'Style guide', 'Multiple formats']
          },
          premium: {
            name: 'premium',
            title: 'Complete Brand Identity',
            description: 'Full brand identity package with guidelines',
            price: 30000,
            deliveryTime: 10,
            revisions: 5,
            features: ['Complete brand identity', 'Business card design', 'Letterhead', 'Brand guidelines']
          }
        },
        createdBy: freelancers[1]._id,
        status: 'active',
        startingPrice: 8000
      },
      {
        title: 'I will write SEO-optimized content for your website or blog',
        description: 'Boost your online visibility with high-quality, SEO-optimized content. I will write engaging articles that rank well in search engines and convert readers into customers.',
        category: 'content writing',
        tags: ['seo', 'content', 'blog', 'articles', 'optimization'],
        packages: {
          basic: {
            name: 'basic',
            title: '1 Article (500 words)',
            description: 'One SEO-optimized article with keyword research',
            price: 4000,
            deliveryTime: 3,
            revisions: 2,
            features: ['500 words', 'Keyword research', 'SEO optimization', 'Engaging content']
          },
          standard: {
            name: 'standard',
            title: '3 Articles (500 words each)',
            description: 'Three SEO-optimized articles with images',
            price: 10000,
            deliveryTime: 7,
            revisions: 2,
            features: ['1500 words total', 'Meta descriptions', 'Image suggestions', 'Content calendar']
          },
          premium: {
            name: 'premium',
            title: '5 Articles + Content Strategy',
            description: 'Five articles with complete content strategy',
            price: 18000,
            deliveryTime: 10,
            revisions: 3,
            features: ['2500 words total', 'Content strategy', 'Competitor analysis', 'Performance tracking']
          }
        },
        createdBy: freelancers[2]._id,
        status: 'active',
        startingPrice: 4000
      },
      {
        title: 'I will manage your brand on Instagram and TikTok',
        description: 'Short-form video content plan, editing, and publishing with analytics.',
        category: 'social media management',
        tags: ['instagram', 'tiktok', 'shorts'],
        packages: {
          basic: { name: 'basic', title: '10 posts', description: '10 posts/month', price: 200, deliveryTime: 30, revisions: 1, features: ['Plan', 'Post', 'Basic analytics'] },
          standard: { name: 'standard', title: '20 posts', description: '20 posts/month', price: 350, deliveryTime: 30, revisions: 2, features: ['Plan', 'Post', 'Community'] },
          premium: { name: 'premium', title: '30 posts', description: '30 posts/month', price: 500, deliveryTime: 30, revisions: 3, features: ['Plan', 'Post', 'Community', 'Reports'] }
        },
        createdBy: freelancers[3]._id,
        status: 'active',
        startingPrice: 200
      },
      {
        title: 'I will optimize your site for Core Web Vitals',
        description: 'Improve LCP, CLS, and INP with targeted optimizations.',
        category: 'SEO',
        tags: ['core-web-vitals', 'performance', 'seo'],
        packages: {
          basic: { name: 'basic', title: 'Audit', description: 'Performance audit and report', price: 120, deliveryTime: 5, revisions: 1, features: ['Audit', 'Report'] },
          standard: { name: 'standard', title: 'Fixes', description: 'Audit + common fixes', price: 300, deliveryTime: 10, revisions: 2, features: ['Audit', 'Fixes'] },
          premium: { name: 'premium', title: 'End-to-end', description: 'Full optimization and monitoring', price: 600, deliveryTime: 14, revisions: 3, features: ['Audit', 'Fixes', 'Monitoring'] }
        },
        createdBy: freelancers[4]._id,
        status: 'active',
        startingPrice: 5000
      }
    ]);
    console.log(`🛍️ Created ${services.length} services`);

    // Create bids on jobs with varied payment statuses and dates
    const startOfThisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 15);
    const twoMonthsAgo = new Date(new Date().getFullYear(), new Date().getMonth() - 2, 10);

    const bids = await Bid.insertMany([
      {
        gigId: jobs[0]._id,
        userId: freelancers[0]._id,
        quotation: 'I can deliver this project in 2 weeks for ₹60,000',
        proposal: 'I have extensive experience in e-commerce development and can create exactly what you need.',
        attachments: [],
        bidFeePaid: 500,
        paymentStatus: 'succeeded',
        createdAt: lastMonth,
        contactDetails: {
          bidderContact: { name: freelancers[0].name, email: freelancers[0].email, phone: freelancers[0].phone },
          posterContact: { name: adminUser.name, email: adminUser.email, phone: adminUser.phone }
        }
      },
      {
        gigId: jobs[1]._id,
        userId: freelancers[1]._id,
        quotation: 'Professional logo design for ₹15,000',
        proposal: 'I specialize in brand identity and will create a memorable logo for your startup.',
        bidFeePaid: 500,
        paymentStatus: 'pending',
        createdAt: startOfThisMonth,
        contactDetails: {
          bidderContact: { name: freelancers[1].name, email: freelancers[1].email, phone: freelancers[1].phone },
          posterContact: { name: adminUser.name, email: adminUser.email, phone: adminUser.phone }
        }
      },
      {
        gigId: jobs[2]._id,
        userId: freelancers[2]._id,
        quotation: 'SEO content package for ₹25,000',
        proposal: 'I will write engaging, SEO-optimized content that ranks well and converts readers.',
        bidFeePaid: 500,
        paymentStatus: 'failed',
        createdAt: twoMonthsAgo,
        contactDetails: {
          bidderContact: { name: freelancers[2].name, email: freelancers[2].email, phone: freelancers[2].phone },
          posterContact: { name: adminUser.name, email: adminUser.email, phone: adminUser.phone }
        }
      },
      {
        gigId: jobs[3]._id,
        userId: freelancers[3]._id,
        quotation: 'Social media monthly management for ₹40,000',
        proposal: 'End-to-end content planning, posting, and engagement with analytics reports.',
        bidFeePaid: 500,
        paymentStatus: 'succeeded',
        createdAt: new Date(),
        contactDetails: {
          bidderContact: { name: freelancers[3].name, email: freelancers[3].email, phone: freelancers[3].phone },
          posterContact: { name: adminUser.name, email: adminUser.email, phone: adminUser.phone }
        }
      }
      ,
      {
        gigId: jobs[4]._id,
        userId: freelancers[4]._id,
        quotation: 'I can grow followers by 20% this month for ₹30,000',
        proposal: 'Content calendar, reels, and community management to drive growth.',
        bidFeePaid: 500,
        paymentStatus: 'pending',
        createdAt: startOfThisMonth,
        contactDetails: {
          bidderContact: { name: freelancers[4].name, email: freelancers[4].email, phone: freelancers[4].phone },
          posterContact: { name: adminUser.name, email: adminUser.email, phone: adminUser.phone }
        }
      },
      {
        gigId: jobs[7]._id,
        userId: freelancers[7]._id,
        quotation: 'Balanced puzzle levels in 7 days for ₹25,000',
        proposal: 'Experienced in level design and difficulty curves.',
        bidFeePaid: 500,
        paymentStatus: 'succeeded',
        createdAt: new Date(),
        contactDetails: {
          bidderContact: { name: freelancers[7].name, email: freelancers[7].email, phone: freelancers[7].phone },
          posterContact: { name: adminUser.name, email: adminUser.email, phone: adminUser.phone }
        }
      },
      {
        gigId: jobs[8]._id,
        userId: freelancers[0]._id,
        quotation: 'WordPress WooCommerce setup for ₹45,000',
        proposal: 'Expert in WordPress and e-commerce. Will set up complete store with payment gateways.',
        bidFeePaid: 500,
        paymentStatus: 'succeeded',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        contactDetails: {
          bidderContact: { name: freelancers[0].name, email: freelancers[0].email, phone: freelancers[0].phone },
          posterContact: { name: adminUser.name, email: adminUser.email, phone: adminUser.phone }
        }
      },
      {
        gigId: jobs[9]._id,
        userId: freelancers[7]._id,
        quotation: 'Custom Shopify theme for ₹35,000',
        proposal: 'Experienced in Shopify theme development with custom Liquid templates.',
        bidFeePaid: 500,
        paymentStatus: 'pending',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        contactDetails: {
          bidderContact: { name: freelancers[7].name, email: freelancers[7].email, phone: freelancers[7].phone },
          posterContact: { name: adminUser.name, email: adminUser.email, phone: adminUser.phone }
        }
      },
      {
        gigId: jobs[10]._id,
        userId: freelancers[0]._id,
        quotation: 'Mobile-first redesign for ₹55,000',
        proposal: 'Focus on mobile UX with progressive enhancement approach.',
        bidFeePaid: 500,
        paymentStatus: 'succeeded',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        contactDetails: {
          bidderContact: { name: freelancers[0].name, email: freelancers[0].email, phone: freelancers[0].phone },
          posterContact: { name: adminUser.name, email: adminUser.email, phone: adminUser.phone }
        }
      },
      {
        gigId: jobs[11]._id,
        userId: freelancers[1]._id,
        quotation: 'Complete brand identity for ₹40,000',
        proposal: 'Full brand package with logo, colors, typography, and comprehensive guidelines.',
        bidFeePaid: 500,
        paymentStatus: 'succeeded',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        contactDetails: {
          bidderContact: { name: freelancers[1].name, email: freelancers[1].email, phone: freelancers[1].phone },
          posterContact: { name: adminUser.name, email: adminUser.email, phone: adminUser.phone }
        }
      },
      {
        gigId: jobs[12]._id,
        userId: freelancers[1]._id,
        quotation: 'Social media graphics package for ₹18,000',
        proposal: 'Create template library for consistent brand presence across platforms.',
        bidFeePaid: 500,
        paymentStatus: 'pending',
        createdAt: new Date(),
        contactDetails: {
          bidderContact: { name: freelancers[1].name, email: freelancers[1].email, phone: freelancers[1].phone },
          posterContact: { name: adminUser.name, email: adminUser.email, phone: adminUser.phone }
        }
      },
      {
        gigId: jobs[13]._id,
        userId: freelancers[2]._id,
        quotation: 'Copywriting services for ₹25,000',
        proposal: 'Compelling copy that converts with SEO optimization.',
        bidFeePaid: 500,
        paymentStatus: 'succeeded',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        contactDetails: {
          bidderContact: { name: freelancers[2].name, email: freelancers[2].email, phone: freelancers[2].phone },
          posterContact: { name: adminUser.name, email: adminUser.email, phone: adminUser.phone }
        }
      },
      {
        gigId: jobs[14]._id,
        userId: freelancers[3]._id,
        quotation: 'LinkedIn strategy for ₹35,000',
        proposal: 'B2B content strategy with engagement optimization.',
        bidFeePaid: 500,
        paymentStatus: 'succeeded',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        contactDetails: {
          bidderContact: { name: freelancers[3].name, email: freelancers[3].email, phone: freelancers[3].phone },
          posterContact: { name: adminUser.name, email: adminUser.email, phone: adminUser.phone }
        }
      },
      {
        gigId: jobs[15]._id,
        userId: freelancers[4]._id,
        quotation: 'SEO audit and fixes for ₹28,000',
        proposal: 'Comprehensive technical SEO audit with optimization.',
        bidFeePaid: 500,
        paymentStatus: 'succeeded',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        contactDetails: {
          bidderContact: { name: freelancers[4].name, email: freelancers[4].email, phone: freelancers[4].phone },
          posterContact: { name: adminUser.name, email: adminUser.email, phone: adminUser.phone }
        }
      },
      {
        gigId: jobs[16]._id,
        userId: freelancers[5]._id,
        quotation: 'Cross-platform app for ₹95,000',
        proposal: 'React Native app with shared codebase for iOS and Android.',
        bidFeePaid: 500,
        paymentStatus: 'succeeded',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        contactDetails: {
          bidderContact: { name: freelancers[5].name, email: freelancers[5].email, phone: freelancers[5].phone },
          posterContact: { name: adminUser.name, email: adminUser.email, phone: adminUser.phone }
        }
      }
    ]);
    console.log(`💰 Created ${bids.length} bids`);

    // Create sample orders
    const orders = await Order.insertMany([
      {
        orderNumber: 'ORD-001-SAMPLE',
        serviceId: services[0]._id,
        packageType: 'basic',
        buyerId: employers[0]._id,
        sellerId: freelancers[0]._id,
        contactDetails: {
          bidderContact: { name: employers[0].name, email: employers[0].email, phone: employers[0].phone },
          posterContact: { name: freelancers[0].name, email: freelancers[0].email, phone: freelancers[0].phone }
        },
        packageDetails: {
          title: 'Basic Website',
          description: 'Simple 3-page website with responsive design',
          price: 15000,
          deliveryTime: 7,
          revisions: 2,
          features: ['3 pages', 'Responsive design', 'Basic SEO', 'Contact form']
        },
        totalAmount: 15000,
        sellerEarnings: 13500,
        platformFee: 1500,
        expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
        payment: {
          status: 'held',
          method: 'stripe',
          paidAt: new Date()
        }
      },
      {
        orderNumber: 'ORD-002-SAMPLE',
        serviceId: services[1]._id,
        packageType: 'standard',
        buyerId: employers[1]._id,
        sellerId: freelancers[1]._id,
        contactDetails: {
          bidderContact: { name: employers[1].name, email: employers[1].email, phone: employers[1].phone },
          posterContact: { name: freelancers[1].name, email: freelancers[1].email, phone: freelancers[1].phone }
        },
        packageDetails: {
          title: 'Logo + Brand Colors',
          description: 'Logo design with brand color palette',
          price: 15000,
          deliveryTime: 7,
          revisions: 4,
          features: ['5 logo concepts', 'Color palette', 'Style guide', 'Multiple formats']
        },
        totalAmount: 15000,
        sellerEarnings: 13500,
        platformFee: 1500,
        expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'delivered',
        payment: {
          status: 'held',
          method: 'stripe',
          paidAt: new Date()
        },
        actualDeliveryDate: new Date()
      }
    ]);
    console.log(`📦 Created ${orders.length} orders`);

    // Create sample applications
    const applications = await Application.insertMany([
      {
        job: jobs[0]._id,
        applicant: freelancers[3]._id,
        status: 'pending',
        coverLetter: 'I am very interested in this e-commerce project. I have 4 years of experience building online stores.',
        expectedSalary: { min: 50000, max: 80000, currency: 'INR' },
        availability: 'immediate',
        skills: ['JavaScript', 'React', 'E-commerce'],
        experience: { years: 4, level: 'mid' }
      },
      {
        job: jobs[1]._id,
        applicant: freelancers[4]._id,
        status: 'reviewing',
        coverLetter: 'I would love to help design your brand identity. My portfolio shows similar work.',
        expectedSalary: { min: 20000, max: 35000, currency: 'INR' },
        availability: '1-month',
        skills: ['Graphic Design', 'Branding', 'Adobe Creative Suite'],
        experience: { years: 3, level: 'mid' }
      },
      {
        job: jobs[5]._id,
        applicant: freelancers[5]._id,
        status: 'rejected',
        coverLetter: 'Performed a similar local SEO project for a dental clinic with great results.',
        expectedSalary: { min: 15000, max: 25000, currency: 'INR' },
        availability: '2-weeks',
        skills: ['Local SEO', 'On-page', 'Schema'],
        experience: { years: 2, level: 'junior' }
      },
      {
        job: jobs[6]._id,
        applicant: freelancers[6]._id,
        status: 'accepted',
        coverLetter: 'I can ship an RN MVP quickly with clean architecture.',
        expectedSalary: { min: 100000, max: 180000, currency: 'INR' },
        availability: 'immediate',
        skills: ['React Native', 'Push', 'Auth'],
        experience: { years: 4, level: 'mid' }
      }
    ]);
    console.log(`📝 Created ${applications.length} applications`);

    // Create sample saved jobs (gigs saved by users)
    const savedJobs = await SavedJob.insertMany([
      {
        userId: freelancers[0]._id,
        jobId: jobs[0]._id,
        metadata: { source: 'gigs_listing', category: 'website development', budget: jobs[0].budget }
      },
      {
        userId: freelancers[0]._id,
        jobId: jobs[1]._id,
        metadata: { source: 'gig_detail', category: 'graphic design', budget: jobs[1].budget }
      },
      {
        userId: freelancers[1]._id,
        jobId: jobs[2]._id,
        metadata: { source: 'search_results', category: 'content writing', budget: jobs[2].budget }
      },
      {
        userId: freelancers[2]._id,
        jobId: jobs[3]._id,
        metadata: { source: 'gigs_listing', category: 'social media management', budget: jobs[3].budget }
      },
      {
        userId: employers[0]._id,
        jobId: jobs[4]._id,
        metadata: { source: 'gigs_listing', category: 'SEO', budget: jobs[4].budget }
      }
    ]);
    console.log(`⭐ Created ${savedJobs.length} saved jobs`);

    // Create sample reviews
    const reviews = await Review.insertMany([
      {
        targetType: 'service',
        targetId: services[1]._id,
        reviewerId: employers[1]._id,
        revieweeId: freelancers[1]._id,
        serviceId: services[1]._id,
        orderId: orders[1]._id,
        rating: 5,
        title: 'Excellent logo design!',
        comment: 'Amazing work! The designer understood exactly what I wanted and delivered beyond expectations.',
        aspectRatings: {
          communication: 5,
          serviceAsDescribed: 5,
          recommendToFriend: 5,
          deliveryTime: 5,
          quality: 5
        },
        isVerified: true
      },
      {
        targetType: 'service',
        targetId: services[0]._id,
        reviewerId: employers[2]._id,
        revieweeId: freelancers[0]._id,
        serviceId: services[0]._id,
        orderId: undefined,
        rating: 4,
        title: 'Solid work and timely delivery',
        comment: 'Website performs well; minor communication delays but overall great.',
        aspectRatings: { communication: 4, serviceAsDescribed: 5, recommendToFriend: 4, deliveryTime: 4, quality: 5 },
        isVerified: false
      }
    ]);
    console.log(`⭐ Created ${reviews.length} reviews`);

    // Create sample notifications
    const notifications = await Notification.insertMany([
      {
        user: freelancers[0]._id,
        type: 'new_order',
        title: 'New Order Received',
        message: 'You have received a new order for your website development service.',
        data: { orderId: orders[0]._id }
      },
      {
        user: employers[1]._id,
        type: 'order_delivered',
        title: 'Order Delivered',
        message: 'Your logo design order has been delivered. Please review and approve.',
        data: { orderId: orders[1]._id }
      }
    ]);
    console.log(`🔔 Created ${notifications.length} notifications`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${await User.countDocuments()}`);
    console.log(`   - Jobs: ${await Job.countDocuments()}`);
    console.log(`   - AdminSettings: ${await AdminSettings.countDocuments()}`);
    console.log(`   - Applications: ${await Application.countDocuments()}`);
    console.log(`   - FreelancerProfiles: ${await FreelancerProfile.countDocuments()}`);
    console.log(`   - Services: ${await Service.countDocuments()}`);
    console.log(`   - Bids: ${await Bid.countDocuments()}`);
    console.log(`   - Orders: ${await Order.countDocuments()}`);
    console.log(`   - Reviews: ${await Review.countDocuments()}`);
    console.log(`   - SavedJobs: ${await SavedJob.countDocuments()}`);
    console.log(`   - Notifications: ${await Notification.countDocuments()}`);

    console.log('\n🔐 Sample Login Credentials:');
    console.log('   Admin: admin@gudgig.com / Admin123!');
    console.log('   Freelancers:');
    console.log('     - alice@gudgig.com / Freelancer123!');
    console.log('     - bob@gudgig.com / Freelancer123!');
    console.log('     - carol@gudgig.com / Freelancer123!');
    console.log('   Employers:');
    console.log('     - john@techcorp.com / Employer123!');
    console.log('     - sarah@designagency.com / Employer123!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
