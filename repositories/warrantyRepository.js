const Warranty = require('../models/Warranty');

class WarrantyRepository {
  async create(warrantyData) {
    return await Warranty.create(warrantyData);
  }

  async findById(id) {
    return await Warranty.findById(id).populate('assetId');
  }

  async findByAsset(assetId) {
    return await Warranty.findOne({ assetId }).populate('assetId');
  }

  async findAll(options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const total = await Warranty.countDocuments();
    const data = await Warranty.find().populate('assetId').skip(skip).limit(limit);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async update(id, updateData) {
    return await Warranty.findByIdAndUpdate(id, updateData, { new: true });
  }

  async findExpiring(days = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return await Warranty.find({
      $or: [
        { warrantyExpiry: { $lte: futureDate, $gte: new Date() } },
        { amcExpiry: { $lte: futureDate, $gte: new Date() } }
      ]
    }).populate('assetId');
  }
}

module.exports = new WarrantyRepository();
