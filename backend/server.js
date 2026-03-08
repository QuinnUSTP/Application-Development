/**
 * Express Server
 * Main entry point for the backend API
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/redstore',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('\n⚠️ Make sure MongoDB is running!');
    console.log('\nTo start MongoDB, open a new terminal and run:');
    console.log('   mongod');
    console.log('\nThen restart this backend server.');
    process.exit(1);
  }
};

connectDB().catch(err => {
  console.error('❌ Fatal Error in connectDB:', err);
  process.exit(1);
});

console.log('📍 Routes being loaded...');

// Routes
app.use('/api/products', require('./routes/products'));
console.log('✓ Products route registered');

app.use('/api/categories', require('./routes/categories'));
console.log('✓ Categories route registered');

app.use('/api/users', require('./routes/users'));
console.log('✓ Users route registered');

app.use('/api/orders', require('./routes/orders'));
console.log('✓ Orders route registered');

console.log('📍 All routes registered');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});

module.exports = app;
