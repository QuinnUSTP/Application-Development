/**
 * Express Server
 * Main entry point for the backend API
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const logger = require('./utils/logger');

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
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.info(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    logger.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (String(process.env.NODE_ENV || '').toLowerCase() !== 'production') {
      logger.info('\n⚠️ Make sure MongoDB is running!');
      logger.info('\nTo start MongoDB, open a new terminal and run:');
      logger.info('   mongod');
      logger.info('\nThen restart this backend server.');
    }
    process.exit(1);
  }
};

connectDB().catch(err => {
  logger.error('❌ Fatal Error in connectDB:', err);
  process.exit(1);
});

logger.info('📍 Routes being loaded...');

// Routes
app.use('/api/products', require('./routes/products'));
logger.info('✓ Products route registered');

app.use('/api/categories', require('./routes/categories'));
logger.info('✓ Categories route registered');

app.use('/api/users', require('./routes/users'));
logger.info('✓ Users route registered');

app.use('/api/orders', require('./routes/orders'));
logger.info('✓ Orders route registered');

logger.info('📍 All routes registered');

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
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('❌ Uncaught Exception:', err.message);
  logger.error(err.stack);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('❌ Unhandled Rejection:', err);
});

module.exports = app;
