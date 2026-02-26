const Alert = require('../models/Alert');

class AlertRepository {
  async create(alertData) {
    return await Alert.create(alertData);
  }

  async findAll(filters = {}) {
    return await Alert.find(filters).populate('assetId').sort('-createdAt');
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
