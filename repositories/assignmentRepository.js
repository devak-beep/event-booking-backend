const Assignment = require('../models/Assignment');

class AssignmentRepository {
  async create(assignmentData) {
    return await Assignment.create(assignmentData);
  }

  async findActiveByAsset(assetId) {
    return await Assignment.findOne({ assetId, status: 'active' });
  }

  async findById(id) {
    return await Assignment.findById(id)
      .populate('assetId')
      .populate('userId');
  }

  async findByAsset(assetId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const total = await Assignment.countDocuments({ assetId });
    const data = await Assignment.find({ assetId })
      .populate('assetId')
      .populate('userId')
      .sort('-assignedDate')
      .skip(skip)
      .limit(limit);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async update(id, updateData) {
    return await Assignment.findByIdAndUpdate(id, updateData, { new: true });
  }
}

module.exports = new AssignmentRepository();
