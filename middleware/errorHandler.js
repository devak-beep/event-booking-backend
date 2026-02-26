const config = require('../config/env');
const errorLogService = require('../services/errorLogService');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Log error
  if (err.statusCode >= 500) {
    errorLogService.log(err, req).catch(e => console.error('Error logging failed:', e.message));
  }

  const response = {
    success: false,
    message: err.message
  };

  if (config.env === 'development') {
    response.stack = err.stack;
  }

  res.status(err.statusCode).json(response);
};

const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

module.exports = { AppError, errorHandler, notFound };
