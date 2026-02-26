const MasterData = require('../models/MasterData');
const Asset = require('../models/Asset');
const { AppError } = require('../middleware/errorHandler');

class MasterDataService {
  async getMasterData(filters, options) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const data = await MasterData.find(filters)
      .populate('vendor', 'name company city')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await MasterData.countDocuments(filters);

    return {
      masterData: data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async exportMasterData() {
    const data = await MasterData.find()
      .populate('vendor', 'name company city')
      .populate('assignedTo', 'name email')
      .sort({ assetId: 1 });

    return data;
  }

  async syncFromAssets() {
    const assets = await Asset.find().populate('vendor').populate('assignedTo');
    
    let synced = 0;
    let updated = 0;

    for (const asset of assets) {
      const existing = await MasterData.findOne({ assetId: asset.assetId });
      
      const masterDataObj = {
        assetId: asset.assetId,
        name: asset.name,
        assetType: asset.assetType,
        category: asset.category,
        brand: asset.brand,
        model: asset.model,
        serialNumber: asset.serialNumber,
        purchaseDate: asset.purchaseDate,
        purchaseCost: asset.purchaseCost,
        vendor: asset.vendor,
        location: asset.location,
        condition: asset.condition,
        status: asset.status,
        warrantyExpiryDate: asset.warrantyExpiryDate,
        amcExpiryDate: asset.amcExpiryDate,
        nextMaintenanceDate: asset.nextMaintenanceDate,
        assignedTo: asset.assignedTo
      };

      if (existing) {
        await MasterData.findByIdAndUpdate(existing._id, masterDataObj);
        updated++;
      } else {
        await MasterData.create(masterDataObj);
        synced++;
      }
    }

    return { synced, updated, total: synced + updated };
  }
}

module.exports = new MasterDataService();
