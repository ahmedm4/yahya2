require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const { testConnection } = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// Security & Middleware
// ============================================

// Helmet for security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    message_ar: 'عدد كبير جداً من الطلبات، يرجى المحاولة لاحقاً'
  }
});

app.use('/api/', limiter);

// ============================================
// Routes
// ============================================

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Bakery Management System API',
    message_ar: 'مرحباً بك في نظام إدارة المخابز',
    version: '1.0.0',
    docs: '/api/v1/health',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      branches: '/api/v1/branches',
      users: '/api/v1/users',
      meals: '/api/v1/meals',
      products: '/api/v1/products',
      orders: '/api/v1/orders',
      inventory: '/api/v1/inventory',
      transfers: '/api/v1/transfers',
      production: '/api/v1/production',
      dashboard: '/api/v1/dashboard'
    }
  });
});

// Mount all routes
app.use(routes);

// ============================================
// Error Handling
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================
// Server Startup
// ============================================

const startServer = async () => {
  try {
    // Test database connection
    console.log('🔍 Testing database connection...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('❌ Database connection failed. Please check your configuration.');
      process.exit(1);
    }

    // Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🍞 Bakery Management System API');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ API URL: http://localhost:${PORT}`);
      console.log(`✓ Health Check: http://localhost:${PORT}/health`);
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
      console.log('📚 API Endpoints:');
      console.log(`   - Authentication: http://localhost:${PORT}/api/v1/auth`);
      console.log(`   - Branches:       http://localhost:${PORT}/api/v1/branches`);
      console.log(`   - Products:       http://localhost:${PORT}/api/v1/products`);
      console.log(`   - Orders:         http://localhost:${PORT}/api/v1/orders`);
      console.log(`   - Dashboard:      http://localhost:${PORT}/api/v1/dashboard`);
      console.log('');
      console.log('🚀 Ready to accept requests!');
      console.log('');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
