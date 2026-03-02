const userRepository = require('../repositories/userRepository');
const { generateToken } = require('../utils/jwt');
const { AppError } = require('../middleware/errorHandler');

class AuthService {
  async register(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const user = await userRepository.create(userData);
    const token = generateToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = generateToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  async changeEmail(userId, newEmail, password) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Password is incorrect', 401);
    }

    const existingUser = await userRepository.findByEmail(newEmail);
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    user.email = newEmail;
    await user.save();

    return { message: 'Email changed successfully' };
  }
}

module.exports = new AuthService();
