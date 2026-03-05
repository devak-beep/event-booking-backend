const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
require('express-async-errors');

const correlationMiddleware = require('./middlewares/correlation.middleware');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// CORS - restrict to frontend only
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://eventix-frontend-8v2j.vercel.app',
  credentials: true
}));

app.use(correlationMiddleware);
app.use(express.json({ limit: '10mb' })); // Payload size limit

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { success: false, message: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Hard guarantee: every request waits for DB
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    next();
  } catch (err) {
    return res.status(503).json({
      success: false,
      message: 'Database not ready',
      error: err.message,
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Internal health check only - remove in production or add auth
app.get('/health/db', (req, res) => {
  // TODO: Add authentication or remove this endpoint
  res.json({ 
    success: true, 
    readyState: mongoose.connection.readyState,
    env: process.env.NODE_ENV 
  });
});

// Routes
app.use('/api/users', authLimiter, require('./routes/user.routes')); // Rate limit auth
app.use('/api/events', require('./routes/event.routes'));
app.use('/api/locks', require('./routes/lock.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/jobs', require('./routes/job.routes'));
app.use('/api/audit', require('./routes/audit.routes'));
app.use('/api/reports', require('./routes/reports.routes'));
app.use('/api/cancellations', require('./routes/cancellation.routes'));

// Error handling - sanitize errors in production
app.use((err, req, res, next) => {
  const correlationId = req.correlationId || 'unknown';
  console.error(`[${correlationId}] Error:`, err.message);
  
  const isDev = process.env.NODE_ENV !== 'production';
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    correlationId,
    ...(isDev && { stack: err.stack }) // Only show stack in dev
  });
});

app.use(errorMiddleware);

module.exports = app;
