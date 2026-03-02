const MasterData = require('../models/MasterData');
const Asset = require('../models/Asset');

class AssetRepository {
  async create(assetData) {
    // Save to MasterData first (primary storage for frontend)
    const masterData = await MasterData.create(assetData);
    
    // Save to Asset collection with SAME _id (for relationships)
    const assetCopy = { ...masterData.toObject() };
    await Asset.create(assetCopy);
    
    return masterData;
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
    // Update both collections
    const masterData = await MasterData.findByIdAndUpdate(id, updateData, { new: true });
    await Asset.findByIdAndUpdate(id, updateData, { new: true });
    return masterData;
  }

  async delete(id) {
    // Delete from both collections
    await Asset.findByIdAndDelete(id);
    return await MasterData.findByIdAndDelete(id);
  }
}

module.exports = new AssetRepository();
