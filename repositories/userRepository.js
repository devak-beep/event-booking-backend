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

  async findByIdWithPassword(id) {
    return await User.findById(id);
  }

  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const total = await User.countDocuments(filters);
    const data = await User.find(filters).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }
}

module.exports = new UserRepository();
