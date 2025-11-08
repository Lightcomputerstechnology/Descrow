require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// ==================== IMPORT ROUTES ====================
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const profileRoutes = require('./routes/profile.routes'); // ✅ NEW
const securityRoutes = require('./routes/security.routes'); // ✅ NEW
const escrowRoutes = require('./routes/escrow.routes');
const chatRoutes = require('./routes/chat.routes');
const deliveryRoutes = require('./routes/delivery.routes');
const disputeRoutes = require('./routes/dispute.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');
const apiKeyRoutes = require('./routes/apiKey.routes');
const verifyRoutes = require('./routes/verify.routes');
const notificationRoutes = require('./routes/notification.routes'); // ✅
const platformSettingsRoutes = require('./routes/platformSettings.routes');

const app = express();
app.set('trust proxy', 1);

// ==================== MIDDLEWARE ====================

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Compression
app.use(compression());

// CORS - allow dealcross.net and localhost
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://descrow-5l46.onrender.com',
  'https://dealcross.net',
  'https://www.dealcross.net',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.log('❌ Blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
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
app.use(process.env.NODE_ENV === 'development' ? morgan('dev') : morgan('combined'));

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, try again later.' }
});

app.use('/api/', generalLimiter);

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== DATABASE ====================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log(`✅ MongoDB Connected: ${mongoose.connection.name}`))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// ==================== HEALTH CHECK ====================
app.get('/', (req, res) => res.json({ 
  success: true, 
  message: 'Dealcross API running', 
  version: '1.0.0', 
  timestamp: new Date() 
}));

app.get('/api/health', (req, res) => res.json({
  success: true,
  status: 'healthy',
  uptime: process.uptime(),
  database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  timestamp: new Date()
}));

// ==================== API ROUTES ====================
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes); // ✅ NEW
app.use('/api/security', securityRoutes); // ✅ NEW
app.use('/api/escrow', escrowRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/verify-email', verifyRoutes);
app.use('/api/platform', platformSettingsRoutes);

// ==================== ERROR HANDLING ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: 'Validation Error', errors });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ success: false, message: `${field} already exists` });
  }

  if (['JsonWebTokenError', 'TokenExpiredError', 'MulterError'].includes(err.name)) {
    return res.status(401).json({ success: false, message: err.message });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`✅ Allowed Origins:`, allowedOrigins);
});

// ==================== GRACEFUL SHUTDOWN ====================
['SIGINT','SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    console.log(`👋 ${signal} received. Shutting down...`);
    server.close(() => {
      console.log('💤 Server closed');
      mongoose.connection.close(false, () => {
        console.log('📦 MongoDB connection closed');
        process.exit(0);
      });
    });
  });
});

process.on('unhandledRejection', error => {
  console.error('❌ Unhandled Rejection:', error);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', error => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app;
