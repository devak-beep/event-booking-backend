const Maintenance = require('../models/Maintenance');

class MaintenanceRepository {
  async create(maintenanceData) {
    const maintenance = await Maintenance.create(maintenanceData);
    await maintenance.populate('assetId');
    return maintenance;
  }

  async findById(id) {
    return await Maintenance.findById(id).populate('assetId');
  }

  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const total = await Maintenance.countDocuments(filters);
    const data = await Maintenance.find(filters).populate('assetId').sort('-nextDate').skip(skip).limit(limit);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async update(id, updateData) {
    return await Maintenance.findByIdAndUpdate(id, updateData, { new: true }).populate('assetId');
  }

  async findOverdue() {
    return await Maintenance.find({
      nextDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    }).populate('assetId');
  }
}

module.exports = new MaintenanceRepository();
