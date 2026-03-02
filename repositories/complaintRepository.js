const Complaint = require('../models/Complaint');

class ComplaintRepository {
  async create(data) {
    return await Complaint.create(data);
  }

  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const total = await Complaint.countDocuments(filters);
    const data = await Complaint.find(filters).populate('assetId userId resolvedBy').sort({ createdAt: -1 }).skip(skip).limit(limit);
    return { data, total, page, pages: Math.ceil(total / limit) };
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
