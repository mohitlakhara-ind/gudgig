import mongoose from 'mongoose';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Company from '../models/Company.js';
import Application from '../models/Application.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Company.deleteMany({});
    await Application.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@jobportal.com',
      password: 'Admin123!',
      role: 'admin',
      isEmailVerified: true,
      bio: 'System Administrator',
      location: 'New York, NY'
    });
    console.log('👤 Created admin user');

    // Create sample companies
    const companies = await Company.insertMany([
      {
        name: 'Tech Solutions Inc.',
        slug: 'tech-solutions-inc',
        description: 'Leading technology solutions provider specializing in web development, mobile apps, and cloud services.',
        website: 'https://techsolutions.com',
        industry: 'Technology',
        size: '51-200',
        founded: 2015,
        headquarters: 'San Francisco, CA',
        locations: [
          { city: 'San Francisco', state: 'CA', country: 'USA' },
          { city: 'New York', state: 'NY', country: 'USA' }
        ],
        socialLinks: {
          linkedin: 'https://linkedin.com/company/techsolutions',
          twitter: 'https://twitter.com/techsolutions',
          website: 'https://techsolutions.com'
        },
        verificationStatus: 'verified',
        verifiedDate: new Date()
      },
      {
        name: 'Global Marketing Agency',
        slug: 'global-marketing-agency',
        description: 'Full-service digital marketing agency helping businesses grow their online presence.',
        website: 'https://globalmarketing.com',
        industry: 'Marketing',
        size: '11-50',
        founded: 2018,
        headquarters: 'Los Angeles, CA',
        locations: [
          { city: 'Los Angeles', state: 'CA', country: 'USA' }
        ],
        socialLinks: {
          linkedin: 'https://linkedin.com/company/globalmarketing',
          website: 'https://globalmarketing.com'
        },
        verificationStatus: 'verified',
        verifiedDate: new Date()
      },
      {
        name: 'Finance Corp',
        slug: 'finance-corp',
        description: 'Financial services company providing investment and wealth management solutions.',
        website: 'https://financecorp.com',
        industry: 'Finance',
        size: '201-500',
        founded: 2010,
        headquarters: 'New York, NY',
        locations: [
          { city: 'New York', state: 'NY', country: 'USA' },
          { city: 'Chicago', state: 'IL', country: 'USA' }
        ],
        socialLinks: {
          linkedin: 'https://linkedin.com/company/financecorp',
          website: 'https://financecorp.com'
        },
        verificationStatus: 'unverified'
      }
    ]);
    console.log('🏢 Created sample companies');

    // Create employer users
    const employer1 = await User.create({
      name: 'John Smith',
      email: 'john@techsolutions.com',
      password: 'Employer123!',
      role: 'employer',
      isEmailVerified: true,
      company: companies[0]._id,
      bio: 'Senior Software Engineer and Team Lead',
      location: 'San Francisco, CA',
      skills: [
        { name: 'JavaScript' },
        { name: 'React' },
        { name: 'Node.js' },
        { name: 'Python' }
      ],
      experienceLevel: '5-10 years'
    });
    const employer2 = await User.create({
      name: 'Sarah Johnson',
      email: 'sarah@globalmarketing.com',
      password: 'Employer123!',
      role: 'employer',
      isEmailVerified: true,
      company: companies[1]._id,
      bio: 'Marketing Director with 10+ years of experience',
      location: 'Los Angeles, CA',
      skills: [
        { name: 'Digital Marketing' },
        { name: 'SEO' },
        { name: 'Content Strategy' },
        { name: 'Analytics' }
      ],
      experienceLevel: '10+ years'
    });
    const employers = [employer1, employer2];
    console.log('👔 Created employer users');

    // Create jobseeker users
    const jobseeker1 = await User.create({
      name: 'Alice Cooper',
      email: 'alice@example.com',
      password: 'Jobseeker123!',
      role: 'jobseeker',
      isEmailVerified: true,
      bio: 'Full-stack developer passionate about creating amazing user experiences',
      location: 'San Francisco, CA',
      skills: [
        { name: 'JavaScript' },
        { name: 'React' },
        { name: 'Node.js' },
        { name: 'TypeScript' },
        { name: 'PostgreSQL' }
      ],
      experienceLevel: '3-5 years',
      resume: { url: 'alice-cooper-resume.pdf', uploadedAt: new Date(), originalName: 'alice-cooper-resume.pdf' }
    });
    const jobseeker2 = await User.create({
      name: 'Bob Wilson',
      email: 'bob@example.com',
      password: 'Jobseeker123!',
      role: 'jobseeker',
      isEmailVerified: true,
      bio: 'Digital marketing specialist with expertise in SEO and social media',
      location: 'Los Angeles, CA',
      skills: [
        { name: 'SEO' },
        { name: 'Google Analytics' },
        { name: 'Social Media Marketing' },
        { name: 'Content Creation' }
      ],
      experienceLevel: '3-5 years'
    });
    const jobseeker3 = await User.create({
      name: 'Carol Davis',
      email: 'carol@example.com',
      password: 'Jobseeker123!',
      role: 'jobseeker',
      isEmailVerified: true,
      bio: 'Financial analyst with strong analytical and problem-solving skills',
      location: 'New York, NY',
      skills: [
        { name: 'Financial Analysis' },
        { name: 'Excel' },
        { name: 'SQL' },
        { name: 'Risk Management' }
      ],
      experienceLevel: '5-10 years'
    });
    const jobseekers = [jobseeker1, jobseeker2, jobseeker3];
    console.log('👨‍💼 Created jobseeker users');

    // Create sample jobs
    const jobs = await Job.insertMany([
      {
        title: 'Senior React Developer',
        slug: 'senior-react-developer',
        description: `
We are looking for a Senior React Developer to join our growing team.

Responsibilities:
- Develop and maintain React applications
- Collaborate with design and backend teams
- Write clean, maintainable code
- Participate in code reviews
- Mentor junior developers

Requirements:
- 5+ years of React experience
- Strong JavaScript/TypeScript skills
- Experience with Redux or Context API
- Knowledge of modern CSS frameworks
- Experience with testing (Jest, React Testing Library)
        `,
        type: 'full-time',
        category: 'Technology',
        location: 'San Francisco, CA',
        experience: '5-10 years',
        employer: employers[0]._id,
        salary: {
          min: 120000,
          max: 160000,
          currency: 'USD'
        },
        requirements: [
          '5+ years of React experience',
          'Strong JavaScript/TypeScript skills',
          'Experience with Redux or Context API',
          'Knowledge of modern CSS frameworks',
          'Experience with testing'
        ],
        benefits: [
          'Competitive salary',
          'Health insurance',
          '401k matching',
          'Flexible work hours',
          'Professional development budget'
        ],
        company: companies[0]._id,
        status: 'active',
        featured: true,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      {
        title: 'Digital Marketing Specialist',
        slug: 'digital-marketing-specialist',
        description: `
Join our marketing team as a Digital Marketing Specialist.

Responsibilities:
- Develop and execute digital marketing campaigns
- Manage social media presence
- Optimize website for SEO
- Analyze campaign performance
- Create engaging content

Requirements:
- 3+ years of digital marketing experience
- Strong SEO knowledge
- Experience with Google Analytics
- Social media marketing experience
- Content creation skills
        `,
        type: 'full-time',
        category: 'Marketing',
        location: 'Los Angeles, CA',
        experience: '3-5 years',
        employer: employers[1]._id,
        salary: {
          min: 60000,
          max: 80000,
          currency: 'USD'
        },
        requirements: [
          '3+ years of digital marketing experience',
          'Strong SEO knowledge',
          'Experience with Google Analytics',
          'Social media marketing experience',
          'Content creation skills'
        ],
        benefits: [
          'Competitive salary',
          'Health insurance',
          'Remote work options',
          'Marketing conference attendance',
          'Creative freedom'
        ],
        company: companies[1]._id,
        status: 'active',
        featured: false,
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) // 20 days from now
      },
      {
        title: 'Financial Analyst',
        slug: 'financial-analyst',
        description: `
We are seeking a Financial Analyst to join our finance team.

Responsibilities:
- Analyze financial data and trends
- Prepare financial reports
- Support budgeting and forecasting
- Conduct financial modeling
- Present findings to management

Requirements:
- Bachelor's degree in Finance or related field
- 4+ years of financial analysis experience
- Strong Excel and SQL skills
- Knowledge of financial software
- Excellent analytical skills
        `,
        type: 'full-time',
        category: 'Finance',
        location: 'New York, NY',
        experience: '3-5 years',
        employer: adminUser._id,
        salary: {
          min: 80000,
          max: 110000,
          currency: 'USD'
        },
        requirements: [
          'Bachelor\'s degree in Finance or related field',
          '4+ years of financial analysis experience',
          'Strong Excel and SQL skills',
          'Knowledge of financial software',
          'Excellent analytical skills'
        ],
        benefits: [
          'Competitive salary',
          'Health insurance',
          'Retirement plan',
          'Professional development',
          'Work-life balance'
        ],
        company: companies[2]._id,
        status: 'active',
        featured: true,
        applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days from now
      }
    ]);
    console.log('💼 Created sample jobs');

    // Create sample applications - FIXED: Added missing employer field
    const applications = await Application.insertMany([
      {
        job: jobs[0]._id,
        applicant: jobseekers[0]._id,
        employer: jobs[0].employer, // FIXED: Added employer field from job
        coverLetter: 'I am excited to apply for the Senior React Developer position. With 5 years of experience in React development, I believe I would be a great fit for your team.',
        status: 'pending',
        appliedAt: new Date()
      },
      {
        job: jobs[1]._id,
        applicant: jobseekers[1]._id,
        employer: jobs[1].employer, // FIXED: Added employer field from job
        coverLetter: 'I am very interested in the Digital Marketing Specialist position. My experience in SEO and social media marketing makes me a perfect candidate.',
        status: 'reviewing',
        appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    ]);
    console.log('📝 Created sample applications');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${await User.countDocuments()}`);
    console.log(`   - Companies: ${await Company.countDocuments()}`);
    console.log(`   - Jobs: ${await Job.countDocuments()}`);
    console.log(`   - Applications: ${await Application.countDocuments()}`);

    console.log('\n🔐 Sample Login Credentials:');
    console.log('   Admin: admin@jobportal.com / Admin123!');
    console.log('   Employer: john@techsolutions.com / Employer123!');
    console.log('   Jobseeker: alice@example.com / Jobseeker123!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
