const User = require('../models/User');

class UserRepository {
  async create(userData) {
    return await User.create(userData);
  }

  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async findById(id) {
    return await User.findById(id).select('-password');
  }

  async findAll(filters = {}) {
    return await User.find(filters).select('-password').sort({ createdAt: -1 });
  }
}

module.exports = new UserRepository();
