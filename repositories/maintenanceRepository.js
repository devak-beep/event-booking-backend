const Maintenance = require('../models/Maintenance');

class MaintenanceRepository {
  async create(maintenanceData) {
    return await Maintenance.create(maintenanceData);
  }

  async findById(id) {
    return await Maintenance.findById(id).populate('assetId');
  }

  async findAll(filters = {}) {
    return await Maintenance.find(filters).populate('assetId').sort('-nextDate');
  }

  async update(id, updateData) {
    return await Maintenance.findByIdAndUpdate(id, updateData, { new: true });
  }

  async findOverdue() {
    return await Maintenance.find({
      nextDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    }).populate('assetId');
  }
}

module.exports = new MaintenanceRepository();
