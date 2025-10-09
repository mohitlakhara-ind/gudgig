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
import Conversation from '../models/Conversation.js';
import Notification from '../models/Notification.js';

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
      Conversation.deleteMany({}),
      Notification.deleteMany({})
    ]);
    console.log('🗑️ Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@gigsmint.com',
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
      { name: 'Alice Cooper', email: 'alice@gigsmint.com', password: 'Freelancer123!', role: 'freelancer', isEmailVerified: true, phone: '+1-111-111-1111', location: 'San Francisco', avatar: '' },
      { name: 'Bob Wilson', email: 'bob@gigsmint.com', password: 'Freelancer123!', role: 'freelancer', isEmailVerified: true, phone: '+1-222-222-2222', location: 'Los Angeles', avatar: '' },
      { name: 'Carol Davis', email: 'carol@gigsmint.com', password: 'Freelancer123!', role: 'freelancer', isEmailVerified: true, phone: '+1-333-333-3333', location: 'New York', avatar: '' },
      { name: 'Daniel Lee', email: 'daniel@gigsmint.com', password: 'Freelancer123!', role: 'freelancer', isEmailVerified: true, phone: '+1-444-444-4444', location: 'Austin', avatar: '' },
      { name: 'Emily Garcia', email: 'emily@gigsmint.com', password: 'Freelancer123!', role: 'freelancer', isEmailVerified: true, phone: '+1-555-555-5555', location: 'Seattle', avatar: '' },
      { name: 'Frank Miller', email: 'frank@gigsmint.com', password: 'Freelancer123!', role: 'freelancer', isEmailVerified: true, phone: '+1-666-666-6666', location: 'Chicago', avatar: '' },
      { name: 'Grace Hopper', email: 'grace@gigsmint.com', password: 'Freelancer123!', role: 'freelancer', isEmailVerified: true, phone: '+1-777-777-7777', location: 'Boston', avatar: '' },
      { name: 'Henry Ford', email: 'henry@gigsmint.com', password: 'Freelancer123!', role: 'freelancer', isEmailVerified: true, phone: '+1-888-888-8888', location: 'Miami', avatar: '' },
      { name: 'Ivy Nguyen', email: 'ivy@gigsmint.com', password: 'Freelancer123!', role: 'freelancer', isEmailVerified: true, phone: '+1-999-999-9999', location: 'Denver', avatar: '' }
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
    const settings = await AdminSettings.create({ key: 'gm-config', bidFeeOptions: [1, 5, 10, 20], currentBidFee: 5 });
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
      { title: 'Level Design for Puzzle Game', description: 'Design 50 levels with increasing difficulty.', category: 'game development', requirements: ['Level design', 'Balancing'] }
    ];
    const jobs = await Job.insertMany(
      [...sampleJobs, ...extraJobs].map(j => ({
        ...j,
        createdBy: adminUser._id,
        budget: Math.floor(200 + Math.random() * 1500),
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
        hourlyRate: { min: 30, max: 50, currency: 'USD' },
        location: { country: 'USA', city: 'San Francisco', timezone: 'PST' },
        languages: [{ language: 'English', proficiency: 'native' }]
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
        hourlyRate: { min: 25, max: 40, currency: 'USD' },
        location: { country: 'USA', city: 'Los Angeles', timezone: 'PST' }
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
        hourlyRate: { min: 20, max: 35, currency: 'USD' },
        location: { country: 'USA', city: 'New York', timezone: 'EST' }
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
            price: 300,
            deliveryTime: 7,
            revisions: 2,
            features: ['3 pages', 'Responsive design', 'Basic SEO', 'Contact form']
          },
          standard: {
            name: 'standard',
            title: 'Standard Website',
            description: 'Professional website with admin panel',
            price: 600,
            deliveryTime: 14,
            revisions: 3,
            features: ['Up to 7 pages', 'Admin panel', 'Database integration', 'Advanced SEO']
          },
          premium: {
            name: 'premium',
            title: 'Premium Website',
            description: 'Full-featured web application with custom features',
            price: 1200,
            deliveryTime: 21,
            revisions: 5,
            features: ['Unlimited pages', 'Custom features', 'API integration', 'Performance optimization']
          }
        },
        createdBy: freelancers[0]._id,
        status: 'active',
        startingPrice: 300
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
            price: 150,
            deliveryTime: 5,
            revisions: 3,
            features: ['3 logo concepts', 'High-res files', 'Commercial license']
          },
          standard: {
            name: 'standard',
            title: 'Logo + Brand Colors',
            description: 'Logo design with brand color palette',
            price: 300,
            deliveryTime: 7,
            revisions: 4,
            features: ['5 logo concepts', 'Color palette', 'Style guide', 'Multiple formats']
          },
          premium: {
            name: 'premium',
            title: 'Complete Brand Identity',
            description: 'Full brand identity package with guidelines',
            price: 500,
            deliveryTime: 10,
            revisions: 5,
            features: ['Complete brand identity', 'Business card design', 'Letterhead', 'Brand guidelines']
          }
        },
        createdBy: freelancers[1]._id,
        status: 'active',
        startingPrice: 150
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
            price: 50,
            deliveryTime: 3,
            revisions: 2,
            features: ['500 words', 'Keyword research', 'SEO optimization', 'Engaging content']
          },
          standard: {
            name: 'standard',
            title: '3 Articles (500 words each)',
            description: 'Three SEO-optimized articles with images',
            price: 120,
            deliveryTime: 7,
            revisions: 2,
            features: ['1500 words total', 'Meta descriptions', 'Image suggestions', 'Content calendar']
          },
          premium: {
            name: 'premium',
            title: '5 Articles + Content Strategy',
            description: 'Five articles with complete content strategy',
            price: 200,
            deliveryTime: 10,
            revisions: 3,
            features: ['2500 words total', 'Content strategy', 'Competitor analysis', 'Performance tracking']
          }
        },
        createdBy: freelancers[2]._id,
        status: 'active',
        startingPrice: 50
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
        startingPrice: 120
      }
    ]);
    console.log(`🛍️ Created ${services.length} services`);

    // Create bids on jobs with varied payment statuses and dates
    const startOfThisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 15);
    const twoMonthsAgo = new Date(new Date().getFullYear(), new Date().getMonth() - 2, 10);

    const bids = await Bid.insertMany([
      {
        jobId: jobs[0]._id,
        userId: freelancers[0]._id,
        quotation: 'I can deliver this project in 2 weeks for $800',
        proposal: 'I have extensive experience in e-commerce development and can create exactly what you need.',
        attachments: [],
        bidFeePaid: 5,
        paymentStatus: 'succeeded',
        createdAt: lastMonth
      },
      {
        jobId: jobs[1]._id,
        userId: freelancers[1]._id,
        quotation: 'Professional logo design for $300',
        proposal: 'I specialize in brand identity and will create a memorable logo for your startup.',
        bidFeePaid: 5,
        paymentStatus: 'pending',
        createdAt: startOfThisMonth
      },
      {
        jobId: jobs[2]._id,
        userId: freelancers[2]._id,
        quotation: 'SEO content package for $400',
        proposal: 'I will write engaging, SEO-optimized content that ranks well and converts readers.',
        bidFeePaid: 5,
        paymentStatus: 'failed',
        createdAt: twoMonthsAgo
      },
      {
        jobId: jobs[3]._id,
        userId: freelancers[3]._id,
        quotation: 'Social media monthly management for $500',
        proposal: 'End-to-end content planning, posting, and engagement with analytics reports.',
        bidFeePaid: 5,
        paymentStatus: 'succeeded',
        createdAt: new Date()
      }
      ,
      {
        jobId: jobs[4]._id,
        userId: freelancers[4]._id,
        quotation: 'I can grow followers by 20% this month for $400',
        proposal: 'Content calendar, reels, and community management to drive growth.',
        bidFeePaid: 5,
        paymentStatus: 'pending',
        createdAt: startOfThisMonth
      },
      {
        jobId: jobs[7]._id,
        userId: freelancers[7]._id,
        quotation: 'Balanced puzzle levels in 7 days for $350',
        proposal: 'Experienced in level design and difficulty curves.',
        bidFeePaid: 5,
        paymentStatus: 'succeeded',
        createdAt: new Date()
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
        packageDetails: {
          title: 'Basic Website',
          description: 'Simple 3-page website with responsive design',
          price: 300,
          deliveryTime: 7,
          revisions: 2,
          features: ['3 pages', 'Responsive design', 'Basic SEO', 'Contact form']
        },
        totalAmount: 300,
        sellerEarnings: 270,
        platformFee: 30,
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
        packageDetails: {
          title: 'Logo + Brand Colors',
          description: 'Logo design with brand color palette',
          price: 300,
          deliveryTime: 7,
          revisions: 4,
          features: ['5 logo concepts', 'Color palette', 'Style guide', 'Multiple formats']
        },
        totalAmount: 300,
        sellerEarnings: 270,
        platformFee: 30,
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
        expectedSalary: { min: 700, max: 900, currency: 'USD' },
        availability: 'immediate',
        skills: ['JavaScript', 'React', 'E-commerce'],
        experience: { years: 4, level: 'mid' }
      },
      {
        job: jobs[1]._id,
        applicant: freelancers[4]._id,
        status: 'reviewing',
        coverLetter: 'I would love to help design your brand identity. My portfolio shows similar work.',
        expectedSalary: { min: 250, max: 400, currency: 'USD' },
        availability: '1-month',
        skills: ['Graphic Design', 'Branding', 'Adobe Creative Suite'],
        experience: { years: 3, level: 'mid' }
      },
      {
        job: jobs[5]._id,
        applicant: freelancers[5]._id,
        status: 'rejected',
        coverLetter: 'Performed a similar local SEO project for a dental clinic with great results.',
        expectedSalary: { min: 300, max: 450, currency: 'USD' },
        availability: '2-weeks',
        skills: ['Local SEO', 'On-page', 'Schema'],
        experience: { years: 2, level: 'junior' }
      },
      {
        job: jobs[6]._id,
        applicant: freelancers[6]._id,
        status: 'accepted',
        coverLetter: 'I can ship an RN MVP quickly with clean architecture.',
        expectedSalary: { min: 1500, max: 2200, currency: 'USD' },
        availability: 'immediate',
        skills: ['React Native', 'Push', 'Auth'],
        experience: { years: 4, level: 'mid' }
      }
    ]);
    console.log(`📝 Created ${applications.length} applications`);

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

    // Create sample conversations
    const conversations = await Conversation.insertMany([
      {
        participants: [employers[0]._id, freelancers[0]._id],
        order: orders[0]._id,
        messages: [
          {
            sender: employers[0]._id,
            content: 'Hi! I\'m excited to work with you on this project. When can we start?'
          },
          {
            sender: freelancers[0]._id,
            content: 'Hello! I can start immediately. Let me know if you have any specific requirements.'
          }
        ]
      }
    ]);
    console.log(`💬 Created ${conversations.length} conversations`);

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
    console.log(`   - Conversations: ${await Conversation.countDocuments()}`);
    console.log(`   - Notifications: ${await Notification.countDocuments()}`);

    console.log('\n🔐 Sample Login Credentials:');
    console.log('   Admin: admin@gigsmint.com / Admin123!');
    console.log('   Freelancers:');
    console.log('     - alice@gigsmint.com / Freelancer123!');
    console.log('     - bob@gigsmint.com / Freelancer123!');
    console.log('     - carol@gigsmint.com / Freelancer123!');
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
