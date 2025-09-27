#!/bin/bash

echo "🚀 Setting up Job Portal Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) is installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) is installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your actual values."
    echo "⚠️  IMPORTANT: Update the following in your .env file:"
    echo "   - MONGODB_URI (your MongoDB connection string)"
    echo "   - JWT_SECRET (a secure random string)"
    echo "   - Email configuration (Gmail or other SMTP)"
    echo "   - Payment gateway keys (Stripe/Razorpay)"
else
    echo "✅ .env file already exists"
fi

# Create upload directories
echo "📁 Creating upload directories..."
mkdir -p uploads/resumes
mkdir -p uploads/logos
echo "✅ Upload directories created"

# Check if MongoDB is running (optional)
if command -v mongod &> /dev/null; then
    if pgrep mongod > /dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. Please start MongoDB or use MongoDB Atlas."
    fi
else
    echo "⚠️  MongoDB not found locally. Consider using MongoDB Atlas for production."
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with actual values"
echo "2. Start the development server: npm run dev"
echo "3. Test the API: curl http://localhost:5000/health"
echo ""
echo "📚 Available scripts:"
echo "   npm run dev      - Start development server"
echo "   npm start        - Start production server"
echo "   npm test         - Run tests"
echo "   npm run test:watch - Run tests in watch mode"
echo ""
echo "📖 API Documentation will be available at:"
echo "   http://localhost:5000/health"
echo ""
echo "🔗 Connect your frontend to:"
echo "   http://localhost:5000/api"
