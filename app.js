const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/assets', require('./routes/assetRoutes'));
app.use('/assignments', require('./routes/assignmentRoutes'));
app.use('/maintenance', require('./routes/maintenanceRoutes'));
app.use('/warranty', require('./routes/warrantyRoutes'));
app.use('/alerts', require('./routes/alertRoutes'));
app.use('/logs', require('./routes/logRoutes'));
app.use('/dashboard', require('./routes/dashboardRoutes'));
app.use('/complaints', require('./routes/complaintRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/invoices', require('./routes/invoiceRoutes'));
app.use('/vendors', require('./routes/vendorRoutes'));
app.use('/master-data', require('./routes/masterDataRoutes'));

// Error handling
app.use(notFound);
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});

module.exports = app;
