const { verifyToken } = require('../utils/jwt');
const userRepository = require('../repositories/userRepository');
const { AppError } = require('./errorHandler');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new AppError('No token provided', 401);
    }

    const decoded = verifyToken(token);
    const user = await userRepository.findById(decoded.id);

    if (!user) {
      throw new AppError('User not found', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Unauthorized', 401));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access denied', 403));
    }
    next();
  };
};

module.exports = { authenticate, authorize };
