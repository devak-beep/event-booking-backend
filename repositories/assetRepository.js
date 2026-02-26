const MasterData = require('../models/MasterData');

class AssetRepository {
  async create(assetData) {
    return await MasterData.create(assetData);
  }

  async findById(id) {
    return await MasterData.findById(id);
  }

  async findBySerialNumber(serialNumber) {
    return await MasterData.findOne({ serialNumber });
  }

  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;

    const query = MasterData.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const assets = await query;
    const total = await MasterData.countDocuments(filters);

    return {
      assets,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async update(id, updateData) {
    return await MasterData.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return await MasterData.findByIdAndDelete(id);
  }
}

module.exports = new AssetRepository();
