import mongoose from 'mongoose';
import User from './src/models/User.js';
import Job from './src/models/Job.js';
import Company from './src/models/Company.js';
import Application from './src/models/Application.js';
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
      },
      {
        name: 'HealthTech Innovations',
        slug: 'healthtech-innovations',
        description: 'Revolutionary healthcare technology company developing AI-powered diagnostic tools and telemedicine solutions.',
        website: 'https://healthtech.com',
        industry: 'Healthcare',
        size: '51-200',
        founded: 2019,
        headquarters: 'Austin, TX',
        locations: [
          { city: 'Austin', state: 'TX', country: 'USA' },
          { city: 'Boston', state: 'MA', country: 'USA' }
        ],
        socialLinks: {
          linkedin: 'https://linkedin.com/company/healthtech',
          twitter: 'https://twitter.com/healthtech',
          website: 'https://healthtech.com'
        },
        verificationStatus: 'verified',
        verifiedDate: new Date()
      },
      {
        name: 'Green Energy Solutions',
        slug: 'green-energy-solutions',
        description: 'Sustainable energy company specializing in solar and wind power solutions for residential and commercial clients.',
        website: 'https://greenenergy.com',
        industry: 'Energy',
        size: '101-500',
        founded: 2012,
        headquarters: 'Denver, CO',
        locations: [
          { city: 'Denver', state: 'CO', country: 'USA' },
          { city: 'Phoenix', state: 'AZ', country: 'USA' },
          { city: 'Seattle', state: 'WA', country: 'USA' }
        ],
        socialLinks: {
          linkedin: 'https://linkedin.com/company/greenenergy',
          website: 'https://greenenergy.com'
        },
        verificationStatus: 'verified',
        verifiedDate: new Date()
      },
      {
        name: 'EduLearn Platform',
        slug: 'edulearn-platform',
        description: 'Online education platform providing interactive courses and certifications in technology and business skills.',
        website: 'https://edulearn.com',
        industry: 'Education',
        size: '11-50',
        founded: 2020,
        headquarters: 'Remote',
        locations: [
          { city: 'Remote', state: '', country: 'USA' }
        ],
        socialLinks: {
          linkedin: 'https://linkedin.com/company/edulearn',
          twitter: 'https://twitter.com/edulearn',
          website: 'https://edulearn.com'
        },
        verificationStatus: 'unverified'
      },
      {
        name: 'RetailPlus',
        slug: 'retailplus',
        description: 'E-commerce platform and retail solutions provider helping businesses establish and grow their online presence.',
        website: 'https://retailplus.com',
        industry: 'Retail',
        size: '51-200',
        founded: 2016,
        headquarters: 'Miami, FL',
        locations: [
          { city: 'Miami', state: 'FL', country: 'USA' },
          { city: 'Atlanta', state: 'GA', country: 'USA' }
        ],
        socialLinks: {
          linkedin: 'https://linkedin.com/company/retailplus',
          website: 'https://retailplus.com'
        },
        verificationStatus: 'verified',
        verifiedDate: new Date()
      }
    ]);
    console.log('🏢 Created sample companies');

    // Create employer users
    const employers = await User.insertMany([
      {
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
      },
      {
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
      },
      {
        name: 'Michael Chen',
        email: 'michael@healthtech.com',
        password: 'Employer123!',
        role: 'employer',
        isEmailVerified: true,
        company: companies[3]._id,
        bio: 'Healthcare technology innovator and CTO',
        location: 'Austin, TX',
        skills: [
          { name: 'AI/ML' },
          { name: 'Healthcare IT' },
          { name: 'Python' },
          { name: 'TensorFlow' }
        ],
        experienceLevel: '10+ years'
      },
      {
        name: 'Emma Rodriguez',
        email: 'emma@greenenergy.com',
        password: 'Employer123!',
        role: 'employer',
        isEmailVerified: true,
        company: companies[4]._id,
        bio: 'Sustainability expert and Operations Manager',
        location: 'Denver, CO',
        skills: [
          { name: 'Renewable Energy' },
          { name: 'Project Management' },
          { name: 'Sustainability' },
          { name: 'Engineering' }
        ],
        experienceLevel: '5-10 years'
      },
      {
        name: 'David Kim',
        email: 'david@edulearn.com',
        password: 'Employer123!',
        role: 'employer',
        isEmailVerified: true,
        company: companies[5]._id,
        bio: 'Education technology entrepreneur and CEO',
        location: 'Remote',
        skills: [
          { name: 'EdTech' },
          { name: 'Product Management' },
          { name: 'Education' },
          { name: 'Content Strategy' }
        ],
        experienceLevel: '5-10 years'
      },
      {
        name: 'Lisa Thompson',
        email: 'lisa@retailplus.com',
        password: 'Employer123!',
        role: 'employer',
        isEmailVerified: true,
        company: companies[6]._id,
        bio: 'E-commerce specialist and Business Development Manager',
        location: 'Miami, FL',
        skills: [
          { name: 'E-commerce' },
          { name: 'Business Development' },
          { name: 'Digital Strategy' },
          { name: 'Analytics' }
        ],
        experienceLevel: '5-10 years'
      },
      {
        name: 'Priya Patel',
        email: 'priya@techsolutions.com',
        password: 'Employer123!',
        role: 'employer',
        isEmailVerified: true,
        company: companies[0]._id,
        bio: 'Director of Engineering with focus on scalable systems',
        location: 'San Francisco, CA',
        skills: [
          { name: 'System Design' },
          { name: 'Cloud Architecture' },
          { name: 'Kubernetes' }
        ],
        experienceLevel: '5-10 years'
      },
      {
        name: 'Ahmed Khan',
        email: 'ahmed@globalmarketing.com',
        password: 'Employer123!',
        role: 'employer',
        isEmailVerified: true,
        company: companies[1]._id,
        bio: 'Performance marketing lead optimizing ROI across channels',
        location: 'Los Angeles, CA',
        skills: [
          { name: 'PPC' },
          { name: 'Attribution' },
          { name: 'Analytics' }
        ],
        experienceLevel: '3-5 years'
      },
      {
        name: 'Sofia Martinez',
        email: 'sofia@healthtech.com',
        password: 'Employer123!',
        role: 'employer',
        isEmailVerified: true,
        company: companies[3]._id,
        bio: 'Head of Data Science for clinical AI products',
        location: 'Austin, TX',
        skills: [
          { name: 'Machine Learning' },
          { name: 'NLP' },
          { name: 'MLOps' }
        ],
        experienceLevel: '5-10 years'
      },
      {
        name: 'Noah Williams',
        email: 'noah@greenenergy.com',
        password: 'Employer123!',
        role: 'employer',
        isEmailVerified: true,
        company: companies[4]._id,
        bio: 'Program manager delivering multi-site renewable projects',
        location: 'Denver, CO',
        skills: [
          { name: 'Program Management' },
          { name: 'Energy Markets' },
          { name: 'Stakeholder Management' }
        ],
        experienceLevel: '5-10 years'
      }
    ]);
    console.log('👔 Created employer users');

    // Create jobseeker users
    const jobseekers = await User.insertMany([
      {
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
      },
      {
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
      },
      {
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
      },
      {
        name: 'Daniel Lee',
        email: 'daniel@example.com',
        password: 'Jobseeker123!',
        role: 'jobseeker',
        isEmailVerified: true,
        bio: 'AI/ML engineer specializing in healthcare applications and computer vision',
        location: 'Austin, TX',
        skills: [
          { name: 'Python' },
          { name: 'TensorFlow' },
          { name: 'PyTorch' },
          { name: 'Computer Vision' },
          { name: 'Healthcare IT' }
        ],
        experienceLevel: '5-10 years',
        resume: { url: 'daniel-lee-resume.pdf', uploadedAt: new Date(), originalName: 'daniel-lee-resume.pdf' }
      },
      {
        name: 'Emily Garcia',
        email: 'emily@example.com',
        password: 'Jobseeker123!',
        role: 'jobseeker',
        isEmailVerified: true,
        bio: 'Renewable energy consultant passionate about sustainable solutions',
        location: 'Denver, CO',
        skills: [
          { name: 'Solar Energy' },
          { name: 'Wind Power' },
          { name: 'Sustainability' },
          { name: 'Project Management' }
        ],
        experienceLevel: '5-10 years'
      },
      {
        name: 'Frank Miller',
        email: 'frank@example.com',
        password: 'Jobseeker123!',
        role: 'jobseeker',
        isEmailVerified: true,
        bio: 'Experienced educator and curriculum developer for online learning platforms',
        location: 'Remote',
        skills: [
          { name: 'Online Education' },
          { name: 'Curriculum Development' },
          { name: 'Instructional Design' },
          { name: 'E-learning' }
        ],
        experienceLevel: '10+ years'
      },
      {
        name: 'Grace Taylor',
        email: 'grace@example.com',
        password: 'Jobseeker123!',
        role: 'jobseeker',
        isEmailVerified: true,
        bio: 'E-commerce specialist with expertise in digital retail and customer experience',
        location: 'Miami, FL',
        skills: [
          { name: 'E-commerce' },
          { name: 'Digital Marketing' },
          { name: 'Customer Experience' },
          { name: 'Analytics' }
        ],
        experienceLevel: '3-5 years'
      },
      {
        name: 'Henry Brown',
        email: 'henry@example.com',
        password: 'Jobseeker123!',
        role: 'jobseeker',
        isEmailVerified: true,
        bio: 'UX/UI designer creating intuitive and beautiful digital experiences',
        location: 'Seattle, WA',
        skills: [
          { name: 'UI/UX Design' },
          { name: 'Figma' },
          { name: 'Adobe Creative Suite' },
          { name: 'Prototyping' },
          { name: 'User Research' }
        ],
        experienceLevel: '5-10 years'
      },
      {
        name: 'Isabella Nguyen',
        email: 'isabella@example.com',
        password: 'Jobseeker123!',
        role: 'jobseeker',
        isEmailVerified: true,
        bio: 'Backend engineer focusing on distributed systems',
        location: 'Chicago, IL',
        skills: [
          { name: 'Go' },
          { name: 'Microservices' },
          { name: 'Docker' }
        ],
        experienceLevel: '3-5 years'
      },
      {
        name: 'James Anderson',
        email: 'james@example.com',
        password: 'Jobseeker123!',
        role: 'jobseeker',
        isEmailVerified: true,
        bio: 'Data analyst skilled in storytelling with data',
        location: 'New York, NY',
        skills: [
          { name: 'SQL' },
          { name: 'Tableau' },
          { name: 'Python' }
        ],
        experienceLevel: '1-2 years'
      },
      {
        name: 'Maria Lopez',
        email: 'maria@example.com',
        password: 'Jobseeker123!',
        role: 'jobseeker',
        isEmailVerified: true,
        bio: 'Product designer with a love for accessibility',
        location: 'Remote',
        skills: [
          { name: 'Accessibility' },
          { name: 'Design Systems' },
          { name: 'Prototyping' }
        ],
        experienceLevel: '3-5 years'
      },
      {
        name: 'Omar Farooq',
        email: 'omar@example.com',
        password: 'Jobseeker123!',
        role: 'jobseeker',
        isEmailVerified: true,
        bio: 'Mobile developer building delightful Android apps',
        location: 'Seattle, WA',
        skills: [
          { name: 'Kotlin' },
          { name: 'Android' },
          { name: 'Jetpack Compose' }
        ],
        experienceLevel: '3-5 years'
      }
    ]);
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
        salaryDisclosure: {
          required: true,
          min: 120000,
          max: 160000,
          currency: 'USD',
          period: 'yearly',
          isNegotiable: false
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
        salaryDisclosure: {
          required: true,
          min: 80000,
          max: 110000,
          currency: 'USD',
          period: 'yearly',
          isNegotiable: false
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
      },
      {
        title: 'AI/ML Engineer - Healthcare',
        slug: 'ai-ml-engineer-healthcare',
        description: `
Join our innovative healthcare technology team as an AI/ML Engineer.

Responsibilities:
- Develop machine learning models for medical diagnostics
- Work with healthcare data and ensure privacy compliance
- Collaborate with medical professionals and data scientists
- Implement AI solutions for telemedicine platforms
- Research and prototype new AI applications

Requirements:
- 4+ years of experience in machine learning
- Strong Python programming skills
- Experience with TensorFlow or PyTorch
- Knowledge of healthcare regulations (HIPAA)
- Background in computer vision or NLP preferred
        `,
        type: 'full-time',
        category: 'Healthcare',
        location: 'Austin, TX',
        experience: '3-5 years',
        employer: employers[2]._id,
        salary: {
          min: 130000,
          max: 170000,
          currency: 'USD'
        },
        requirements: [
          '4+ years of experience in machine learning',
          'Strong Python programming skills',
          'Experience with TensorFlow or PyTorch',
          'Knowledge of healthcare regulations (HIPAA)',
          'Background in computer vision or NLP preferred'
        ],
        benefits: [
          'Competitive salary',
          'Health insurance',
          'Stock options',
          'Research budget',
          'Flexible work arrangements'
        ],
        company: companies[3]._id,
        status: 'active',
        featured: true,
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000) // 25 days from now
      },
      {
        title: 'Solar Energy Project Manager',
        slug: 'solar-energy-project-manager',
        description: `
Lead solar energy installation projects and drive sustainable energy solutions.

Responsibilities:
- Manage solar panel installation projects from planning to completion
- Coordinate with engineering and construction teams
- Ensure compliance with safety and environmental regulations
- Oversee project budgets and timelines
- Client relationship management

Requirements:
- 5+ years of project management experience
- Experience in renewable energy or construction
- PMP certification preferred
- Strong leadership and communication skills
- Knowledge of solar energy systems
        `,
        type: 'full-time',
        category: 'Energy',
        location: 'Denver, CO',
        experience: '5-10 years',
        employer: employers[3]._id,
        salary: {
          min: 90000,
          max: 120000,
          currency: 'USD'
        },
        requirements: [
          '5+ years of project management experience',
          'Experience in renewable energy or construction',
          'PMP certification preferred',
          'Strong leadership and communication skills',
          'Knowledge of solar energy systems'
        ],
        benefits: [
          'Competitive salary',
          'Health insurance',
          'Retirement plan',
          'Paid time off',
          'Professional development'
        ],
        company: companies[4]._id,
        status: 'active',
        featured: false,
        applicationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000) // 35 days from now
      },
      {
        title: 'Senior Instructional Designer',
        slug: 'senior-instructional-designer',
        description: `
Create engaging online learning experiences for our e-learning platform.

Responsibilities:
- Design and develop interactive online courses
- Collaborate with subject matter experts
- Create multimedia learning materials
- Implement assessment strategies
- Analyze learning effectiveness and iterate

Requirements:
- 4+ years of instructional design experience
- Experience with e-learning platforms
- Strong skills in multimedia production
- Knowledge of learning theories and methodologies
- Excellent project management skills
        `,
        type: 'full-time',
        category: 'Education',
        location: 'Remote',
        experience: '3-5 years',
        employer: employers[4]._id,
        salary: {
          min: 75000,
          max: 95000,
          currency: 'USD'
        },
        requirements: [
          '4+ years of instructional design experience',
          'Experience with e-learning platforms',
          'Strong skills in multimedia production',
          'Knowledge of learning theories and methodologies',
          'Excellent project management skills'
        ],
        benefits: [
          'Competitive salary',
          'Health insurance',
          'Remote work',
          'Education stipend',
          'Flexible hours'
        ],
        company: companies[5]._id,
        status: 'active',
        featured: false,
        applicationDeadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000) // 28 days from now
      },
      {
        title: 'E-commerce Manager',
        slug: 'e-commerce-manager',
        description: `
Drive online retail growth and optimize e-commerce operations.

Responsibilities:
- Manage e-commerce platform operations
- Develop and execute digital marketing strategies
- Optimize conversion rates and user experience
- Analyze sales data and customer behavior
- Coordinate with suppliers and logistics teams

Requirements:
- 3+ years of e-commerce experience
- Experience with Shopify or similar platforms
- Strong analytical and marketing skills
- Knowledge of digital marketing channels
- Excellent communication skills
        `,
        type: 'full-time',
        category: 'Retail',
        location: 'Miami, FL',
        experience: '3-5 years',
        employer: employers[5]._id,
        salary: {
          min: 65000,
          max: 85000,
          currency: 'USD'
        },
        requirements: [
          '3+ years of e-commerce experience',
          'Experience with Shopify or similar platforms',
          'Strong analytical and marketing skills',
          'Knowledge of digital marketing channels',
          'Excellent communication skills'
        ],
        benefits: [
          'Competitive salary',
          'Health insurance',
          'Performance bonuses',
          'Professional development',
          'Team outings'
        ],
        company: companies[6]._id,
        status: 'active',
        featured: false,
        applicationDeadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000) // 22 days from now
      },
      {
        title: 'UX/UI Designer',
        slug: 'ux-ui-designer',
        description: `
Create beautiful and intuitive user experiences for our web and mobile applications.

Responsibilities:
- Design user interfaces for web and mobile platforms
- Conduct user research and usability testing
- Create wireframes, prototypes, and design systems
- Collaborate with product and development teams
- Ensure design consistency across products

Requirements:
- 3+ years of UX/UI design experience
- Proficiency in Figma, Sketch, or Adobe XD
- Strong portfolio demonstrating design skills
- Experience with user research methods
- Knowledge of design systems and accessibility
        `,
        type: 'full-time',
        category: 'Design',
        location: 'Seattle, WA',
        experience: '3-5 years',
        employer: employers[0]._id,
        salary: {
          min: 85000,
          max: 110000,
          currency: 'USD'
        },
        requirements: [
          '3+ years of UX/UI design experience',
          'Proficiency in Figma, Sketch, or Adobe XD',
          'Strong portfolio demonstrating design skills',
          'Experience with user research methods',
          'Knowledge of design systems and accessibility'
        ],
        benefits: [
          'Competitive salary',
          'Health insurance',
          'Design conference budget',
          'Creative work environment',
          'Flexible work hours'
        ],
        company: companies[0]._id,
        status: 'active',
        featured: false,
        applicationDeadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000) // 18 days from now
      }
    ]);
    console.log('💼 Created sample jobs');

    // Create sample applications
    const applications = await Application.insertMany([
      {
        job: jobs[0]._id,
        applicant: jobseekers[0]._id,
        employer: employers[0]._id,
        resume: 'alice-cooper-resume.pdf',
        coverLetter: 'I am excited to apply for the Senior React Developer position. With 5 years of experience in React development, I believe I would be a great fit for your team.',
        status: 'pending',
        appliedAt: new Date()
      },
      {
        job: jobs[1]._id,
        applicant: jobseekers[1]._id,
        employer: employers[1]._id,
        resume: 'bob-wilson-resume.pdf',
        coverLetter: 'I am very interested in the Digital Marketing Specialist position. My experience in SEO and social media marketing makes me a perfect candidate.',
        status: 'reviewing',
        appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        job: jobs[2]._id,
        applicant: jobseekers[2]._id,
        employer: adminUser._id,
        resume: 'carol-davis-resume.pdf',
        coverLetter: 'I am eager to bring my financial analysis expertise to your team. My 6 years of experience in financial modeling and reporting would be valuable for this role.',
        status: 'interviewed',
        appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        job: jobs[3]._id,
        applicant: jobseekers[3]._id,
        employer: employers[2]._id,
        resume: 'daniel-lee-resume.pdf',
        coverLetter: 'As an AI/ML engineer with healthcare experience, I am passionate about developing technology that improves patient outcomes. I would love to contribute to your innovative projects.',
        status: 'pending',
        appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        job: jobs[4]._id,
        applicant: jobseekers[4]._id,
        employer: employers[3]._id,
        resume: 'emily-garcia-resume.pdf',
        coverLetter: 'My background in renewable energy and project management aligns perfectly with this solar energy project manager role. I am committed to advancing sustainable energy solutions.',
        status: 'reviewing',
        appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        job: jobs[5]._id,
        applicant: jobseekers[5]._id,
        employer: employers[4]._id,
        resume: 'frank-miller-resume.pdf',
        coverLetter: 'With 10 years in education and curriculum development, I am excited about the opportunity to create engaging online learning experiences for EduLearn Platform.',
        status: 'pending',
        appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      },
      {
        job: jobs[6]._id,
        applicant: jobseekers[6]._id,
        employer: employers[5]._id,
        resume: 'grace-taylor-resume.pdf',
        coverLetter: 'My e-commerce experience and passion for digital retail make me an ideal candidate for the E-commerce Manager position at RetailPlus.',
        status: 'accepted',
        appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        job: jobs[7]._id,
        applicant: jobseekers[7]._id,
        employer: employers[0]._id,
        resume: 'henry-brown-resume.pdf',
        coverLetter: 'I am passionate about creating intuitive user experiences. My UX/UI design skills and experience would allow me to contribute significantly to Tech Solutions Inc.',
        status: 'pending',
        appliedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
      },
      {
        job: jobs[0]._id,
        applicant: jobseekers[7]._id,
        employer: employers[0]._id,
        resume: 'henry-brown-resume.pdf',
        coverLetter: 'Although my primary background is in design, I have strong development skills and would love to work on the Senior React Developer position.',
        status: 'rejected',
        appliedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
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
    console.log('   Employers (password: Employer123!):');
    console.log('     - john@techsolutions.com');
    console.log('     - sarah@globalmarketing.com');
    console.log('     - michael@healthtech.com');
    console.log('     - emma@greenenergy.com');
    console.log('     - david@edulearn.com');
    console.log('     - lisa@retailplus.com');
    console.log('     - priya@techsolutions.com');
    console.log('     - ahmed@globalmarketing.com');
    console.log('     - sofia@healthtech.com');
    console.log('     - noah@greenenergy.com');
    console.log('   Jobseekers (password: Jobseeker123!):');
    console.log('     - alice@example.com');
    console.log('     - bob@example.com');
    console.log('     - carol@example.com');
    console.log('     - daniel@example.com');
    console.log('     - emily@example.com');
    console.log('     - frank@example.com');
    console.log('     - grace@example.com');
    console.log('     - henry@example.com');
    console.log('     - isabella@example.com');
    console.log('     - james@example.com');
    console.log('     - maria@example.com');
    console.log('     - omar@example.com');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
