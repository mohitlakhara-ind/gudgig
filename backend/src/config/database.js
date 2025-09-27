import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Modern Mongoose doesn't need these options, but keeping for compatibility
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('📊 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📊 Mongoose disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📊 Mongoose connection closed due to application termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
