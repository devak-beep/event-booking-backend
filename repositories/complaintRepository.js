const Complaint = require('../models/Complaint');

class ComplaintRepository {
  async create(data) {
    return await Complaint.create(data);
  }

  async findAll(filters = {}) {
    return await Complaint.find(filters).populate('assetId userId resolvedBy').sort({ createdAt: -1 });
  }

  async findById(id) {
    return await Complaint.findById(id).populate('assetId userId resolvedBy');
  }

  async findByUser(userId) {
    return await Complaint.find({ userId }).populate('assetId').sort({ createdAt: -1 });
  }

  async update(id, data) {
    return await Complaint.findByIdAndUpdate(id, data, { new: true }).populate('assetId userId resolvedBy');
  }
}

module.exports = new ComplaintRepository();
