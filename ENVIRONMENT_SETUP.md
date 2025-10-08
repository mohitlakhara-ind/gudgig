# Environment Setup Guide

This guide explains how to configure environment variables for both the frontend and backend.

## Frontend Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# === REQUIRED FOR BACKEND INTEGRATION ===
# The backend API base URL (default: http://localhost:5000/api)
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api



# The SOCKET_URL should point to the backend server for WebSocket connections
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# === APPLICATION METADATA ===
NEXT_PUBLIC_APP_NAME=Gigs Mint
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Production Frontend Configuration

For production deployment, update these to your deployed backend URLs:

```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com/api
NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.com
```

**Important Notes:**
- The `/api` suffix is important for the API_URL
- These variables are exposed to the browser (NEXT_PUBLIC_ prefix)
- In production, ensure your backend CORS is configured for your frontend domain
- The Next.js rewrite proxy in `next.config.ts` routes `/api/*` to the backend

## Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```bash
# ⚠️ SECURITY WARNING:
# Replace JWT_SECRET and REFRESH_TOKEN_SECRET with strong random values
# Generate using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# === REQUIRED FOR BASIC FUNCTIONALITY ===

# Server configuration
PORT=5000
NODE_ENV=development

# Frontend URL for CORS configuration
CLIENT_URL=http://localhost:3000

# Database connection
MONGODB_URI=mongodb://localhost:27017/job-portal
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/job-portal

# JWT Authentication (⚠️ CHANGE THESE IN PRODUCTION)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-change-this-in-production
REFRESH_TOKEN_EXPIRES_IN=30d

# Password hashing rounds (higher = more secure but slower)
BCRYPT_ROUNDS=12

# Rate limiting configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# === OPTIONAL FEATURES ===

# Email configuration (for OTP, password reset, notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@gigsmint.com
FROM_NAME=Gigs Mint

# File upload configuration (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Payment providers (if implementing payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Admin user seeding (optional)
ADMIN_EMAIL=admin@gigsmint.com
ADMIN_PASSWORD=admin123456
```

### Production Backend Configuration

For production deployment, ensure:

1. **Strong JWT secrets** (64+ character random strings)
2. **Secure MONGODB_URI** with authentication
3. **Valid SMTP credentials** for email functionality
4. **Proper CLIENT_URL** for CORS
5. **Set NODE_ENV=production**

### Generating Secure Secrets

Use this command to generate secure JWT secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Quick Setup

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   cd backend && npm install
   ```
3. **Create environment files**:
   - Frontend: Create `.env.local` in project root
   - Backend: Create `.env` in `backend/` directory
4. **Configure MongoDB**:
   - Local: Install MongoDB or use Docker
   - Cloud: Set up MongoDB Atlas cluster
5. **Start the servers**:
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   npm run dev
   ```

## Verification

### Backend Health Check
Visit: `http://localhost:5000/health`

### Frontend Integration
1. Open: `http://localhost:3000`
2. Test authentication flow
3. Verify admin features work (if you have admin credentials)

## Common Issues

- **CORS errors**: Check `CLIENT_URL` in backend `.env`
- **API not found**: Verify `NEXT_PUBLIC_BACKEND_URL` in frontend `.env.local`
- **Socket.io issues**: Check `NEXT_PUBLIC_SOCKET_URL` configuration
- **Database connection**: Verify `MONGODB_URI` is correct
- **Email not working**: Check SMTP configuration and credentials

## Security Checklist

- [ ] JWT secrets are strong random strings (64+ characters)
- [ ] Database credentials are secure
- [ ] SMTP credentials are valid
- [ ] CORS is configured for your domain only
- [ ] Rate limiting is enabled
- [ ] Environment files are in `.gitignore`
- [ ] Production uses HTTPS
- [ ] Database uses authentication in production

