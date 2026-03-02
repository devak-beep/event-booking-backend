const Alert = require('../models/Alert');

class AlertRepository {
  async create(alertData) {
    return await Alert.create(alertData);
  }

  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const total = await Alert.countDocuments(filters);
    const data = await Alert.find(filters).populate('assetId').sort('-createdAt').skip(skip).limit(limit);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async findById(id) {
    return await Alert.findById(id).populate('assetId');
  }

  async update(id, updateData) {
    return await Alert.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteByAssetAndType(assetId, type) {
    return await Alert.deleteMany({ assetId, type, status: 'active' });
  }
}

module.exports = new AlertRepository();
