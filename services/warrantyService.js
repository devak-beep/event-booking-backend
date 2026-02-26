const warrantyRepository = require('../repositories/warrantyRepository');
const assetRepository = require('../repositories/assetRepository');
const { AppError } = require('../middleware/errorHandler');

class WarrantyService {
  async createWarranty(warrantyData) {
    const asset = await assetRepository.findById(warrantyData.assetId);
    if (!asset) {
      throw new AppError('Asset not found', 404);
    }

    const existing = await warrantyRepository.findByAsset(warrantyData.assetId);
    if (existing) {
      throw new AppError('Warranty already exists for this asset', 400);
    }

    return await warrantyRepository.create(warrantyData);
  }

  async updateWarranty(id, updateData) {
    const warranty = await warrantyRepository.update(id, updateData);
    if (!warranty) {
      throw new AppError('Warranty not found', 404);
    }
    await warranty.save();
    return warranty;
  }

  async getAllWarranties() {
    return await warrantyRepository.findAll();
  }

  async getExpiringWarranties(days = 30) {
    return await warrantyRepository.findExpiring(days);
  }
}

module.exports = new WarrantyService();
