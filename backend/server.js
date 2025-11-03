// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const escrowRoutes = require('./routes/escrow.routes');
const chatRoutes = require('./routes/chat.routes');
const deliveryRoutes = require('./routes/delivery.routes');
const disputeRoutes = require('./routes/dispute.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');
const apiKeyRoutes = require('./routes/apiKey.routes');

// Initialize Express App
const app = express();
app.set('trust proxy', 1); // Trust Render's proxy
app.use(express.json());

// ==================== MIDDLEWARE ====================

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

// Compression
app.use(compression());

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://descrow-5l46.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','x-api-key']
}));

app.options('*', cors());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
else app.use(morgan('combined'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' }
});

// Serve Static Files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== DATABASE CONNECTION ====================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log(`📦 Database: ${mongoose.connection.name}`);
  })
  .catch(error => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// ==================== HEALTH CHECK ====================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Dealcross API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API health check passed',
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ==================== API ROUTES ====================

// Auth routes with stricter rate limit
app.use('/api/auth', authLimiter, authRoutes);

// Other routes
app.use('/api/users', userRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/api-keys', apiKeyRoutes);

// ==================== ERROR HANDLING ====================

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found', path: req.originalUrl, method: req.method });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error('Error:', error);

  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({ success: false, message: 'Validation Error', errors });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(400).json({ success: false, message: `${field} already exists` });
  }

  if (error.name === 'JsonWebTokenError') return res.status(401).json({ success: false, message: 'Invalid token' });
  if (error.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Token expired' });
  if (error.name === 'MulterError') return res.status(400).json({ success: false, message: `File upload error: ${error.message}` });

  res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error', ...(process.env.NODE_ENV === 'development' && { stack: error.stack }) });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('🚀 ================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`✅ Allowed Origins:`, allowedOrigins);
  console.log('🚀 ================================');
});

// ==================== GRACEFUL SHUTDOWN ====================
process.on('unhandledRejection', error => {
  console.error('❌ Unhandled Rejection:', error);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', error => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('💤 Server closed');
    mongoose.connection.close(false, () => {
      console.log('📦 MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('💤 Server closed');
    mongoose.connection.close(false, () => {
      console.log('📦 MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;