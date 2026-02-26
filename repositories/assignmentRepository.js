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

  async findByAsset(assetId) {
    return await Assignment.find({ assetId })
      .populate('assetId')
      .populate('userId')
      .sort('-assignedDate');
  }

  async update(id, updateData) {
    return await Assignment.findByIdAndUpdate(id, updateData, { new: true });
  }
}

module.exports = new AssignmentRepository();
