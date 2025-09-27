# Job Portal Backend API

A comprehensive Node.js + Express backend API for a job portal application with MongoDB, JWT authentication, and payment integration.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Support for job seekers, employers, and administrators
- **Job Management**: Complete CRUD operations for job postings
- **Company Profiles**: Company management with verification system
- **Job Applications**: Application tracking and management
- **Payment Integration**: Stripe and Razorpay integration for premium features
- **File Uploads**: Resume and document upload with Cloudinary integration
- **Email Notifications**: Automated email system for notifications
- **Real-time Features**: Socket.io integration for real-time updates
- **Rate Limiting**: Built-in rate limiting for API protection
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Centralized error handling middleware
- **Security**: Helmet, CORS, and security best practices

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/jobportal
   JWT_SECRET=your-super-secret-jwt-key-here
   CLIENT_URL=http://localhost:3000
   ```

4. **Start MongoDB** (if using local MongoDB)
   ```bash
   mongod
   ```

5. **Seed the database** (optional)
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update user profile

### Jobs
- `GET /api/jobs` - Get all jobs (with filtering)
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job (employers only)
- `PUT /api/jobs/:id` - Update job (job owner only)
- `DELETE /api/jobs/:id` - Delete job (job owner only)

### Applications
- `GET /api/applications` - Get user applications
- `POST /api/applications` - Apply for job
- `PUT /api/applications/:id` - Update application status
- `DELETE /api/applications/:id` - Withdraw application

### Companies
- `GET /api/companies` - Get all companies
- `GET /api/companies/:id` - Get single company
- `POST /api/companies` - Create company (employers only)
- `PUT /api/companies/:id` - Update company

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (admin only)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── environment.js       # Environment configuration
│   ├── controllers/             # Route controllers
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── userController.js
│   │   └── companyController.js
│   ├── middleware/              # Custom middleware
│   │   ├── auth.js             # Authentication middleware
│   │   ├── validation.js       # Request validation
│   │   └── errorHandler.js     # Error handling
│   ├── models/                  # MongoDB models
│   │   ├── User.js
│   │   ├── Job.js
│   │   ├── Company.js
│   │   └── Application.js
│   ├── routes/                  # API routes
│   │   ├── auth.js
│   │   ├── jobs.js
│   │   ├── users.js
│   │   └── companies.js
│   ├── services/                # Business logic services
│   │   ├── emailService.js
│   │   ├── paymentService.js
│   │   └── notificationService.js
│   ├── utils/                   # Utility functions
│   │   ├── jwt.js
│   │   ├── validators.js
│   │   └── constants.js
│   ├── seeders/                 # Database seeders
│   │   └── seedDatabase.js
│   ├── app.js                   # Express app configuration
│   └── server.js                # Server entry point
├── tests/                       # Test files
├── uploads/                     # File uploads directory
├── .env.example                 # Environment variables template
├── package.json
└── README.md
```

## 🗄️ Database Models

### User Model
- Personal information (name, email, password)
- Role-based access (jobseeker, employer, admin)
- Profile information (bio, skills, experience)
- Company association (for employers)

### Job Model
- Job details (title, description, requirements)
- Company information
- Salary range and benefits
- Application deadline
- Status tracking

### Company Model
- Company information (name, description, industry)
- Verification status
- Location and contact details
- Social media links

### Application Model
- Job and applicant references
- Application status tracking
- Cover letter and resume
- Timeline management

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run seed` - Seed database with sample data

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 📧 Email Configuration

Configure email service in `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 💳 Payment Integration

### Stripe Configuration
```env
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs per plan and billing cycle
STRIPE_PRICE_PRO_MONTHLY=price_pro_monthly_id
STRIPE_PRICE_PRO_QUARTERLY=price_pro_quarterly_id
STRIPE_PRICE_PRO_YEARLY=price_pro_yearly_id
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_enterprise_monthly_id
STRIPE_PRICE_ENTERPRISE_QUARTERLY=price_enterprise_quarterly_id
STRIPE_PRICE_ENTERPRISE_YEARLY=price_enterprise_yearly_id

# Promotion one-time prices
STRIPE_PRICE_FEATURE=price_feature_id
STRIPE_PRICE_URGENT=price_urgent_id
STRIPE_PRICE_HIGHLIGHT=price_highlight_id
STRIPE_PRICE_BOOST=price_boost_id
```

### Razorpay Configuration
```env
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

### PayPal Configuration
```env
PAYPAL_CLIENT_ID=paypal_client_id
PAYPAL_SECRET=paypal_secret
```

## 📤 File Uploads

- Resume uploads supported
- Cloudinary integration for cloud storage
- File size limits and validation
- Secure file handling

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting
- Input validation and sanitization
- CORS configuration
- Helmet security headers
- SQL injection protection via Mongoose

## 📱 Real-time Features

- Socket.io integration for real-time updates
- Live application status updates
- Real-time notifications
- Chat functionality (extensible)

## 🚀 Deployment

1. **Set environment to production**
   ```env
   NODE_ENV=production
   ```

2. **Update MongoDB URI for production**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobportal
   ```

3. **Build and start**
   ```bash
   npm run build  # if applicable
   npm start
   ```

## 📊 Sample Data

After setting up, you can seed the database with sample data:

```bash
npm run seed
```

This creates:
- Sample users (admin, employers, job seekers)
- Sample companies
- Sample job postings
- Sample applications

## 🔗 API Documentation

For detailed API documentation, visit:
`http://localhost:5000/api/docs` (when implemented)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

---

**Happy coding!** 🎉
